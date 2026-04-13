# claude-base-dtit installer for Windows
# Usage: ./install.ps1
#
# This script copies templates from this repo into ~/.claude/ and sets up
# project-docs structure per developer.

param(
    [string]$Username = $env:USERNAME,
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeHome = Join-Path $env:USERPROFILE ".claude"

function Write-Info($msg)    { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)      { Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Write-Warn($msg)    { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)     { Write-Host "[ERR ] $msg" -ForegroundColor Red }
function Write-Section($msg) { Write-Host ""; Write-Host "=== $msg ===" -ForegroundColor Magenta }

Write-Section "claude-base-dtit installer"
Write-Info "Repo root   : $RepoRoot"
Write-Info "Claude home : $ClaudeHome"
Write-Info "Username    : $Username"
Write-Info "Dry run     : $DryRun"

if (-not (Test-Path $ClaudeHome)) {
    Write-Info "Creating $ClaudeHome"
    if (-not $DryRun) { New-Item -ItemType Directory -Path $ClaudeHome | Out-Null }
}

# === Step 1: Backup existing ~/.claude/CLAUDE.md if any ===
Write-Section "Step 1: Backup existing config"
$existingClaudeMd = Join-Path $ClaudeHome "CLAUDE.md"
if (Test-Path $existingClaudeMd) {
    $backupDir = Join-Path $ClaudeHome "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Warn "Existing CLAUDE.md found → backing up to $backupDir"
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
        Copy-Item $existingClaudeMd $backupDir
    }
}

# === Step 2: Copy global files ===
Write-Section "Step 2: Copy global protocol files"
$globalSrc = Join-Path $RepoRoot "global"
Get-ChildItem $globalSrc -File | ForEach-Object {
    $dest = Join-Path $ClaudeHome $_.Name
    Write-Info "Copy: $($_.Name) → $dest"
    if (-not $DryRun) { Copy-Item $_.FullName $dest -Force }
}
Write-Ok "Global files copied"

# === Step 3: Copy stack profiles ===
Write-Section "Step 3: Copy stack profiles"
$stackSrc = Join-Path $RepoRoot "stack-profiles"
$stackDest = Join-Path $ClaudeHome "stack-profiles"
if (-not (Test-Path $stackDest) -and -not $DryRun) {
    New-Item -ItemType Directory -Path $stackDest | Out-Null
}
Copy-Item "$stackSrc\*" $stackDest -Recurse -Force -ErrorAction:$(if ($DryRun) {"SilentlyContinue"} else {"Stop"})
Write-Ok "Stack profiles copied to $stackDest"

# === Step 4: Copy skills (slash commands) ===
# Claude Code menyimpan slash commands di ~/.claude/commands/ (bukan skills/)
Write-Section "Step 4: Copy skills (slash commands)"
$skillsSrc = Join-Path $RepoRoot "skills"
$skillsDest = Join-Path $ClaudeHome "commands"
if (-not (Test-Path $skillsDest) -and -not $DryRun) {
    New-Item -ItemType Directory -Path $skillsDest | Out-Null
}
Get-ChildItem $skillsSrc -Filter "*.md" | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
    $dest = Join-Path $skillsDest $_.Name
    if (-not $DryRun) { Copy-Item $_.FullName $dest -Force }
}
Write-Ok "Skills copied to $skillsDest"

# === Step 5: Pick stack & identity ===
Write-Section "Step 5: Pick your stack"
Write-Host "  [1] PHP (Laravel / Yii / Blade)"
Write-Host "  [2] JavaScript (Node / React / Next)"
Write-Host "  [3] Fullstack (both PHP + JS)"
$stackChoice = Read-Host "Your choice"

$identities = @()
switch ($stackChoice) {
    "1" { $identities = @("php") }
    "2" { $identities = @("js") }
    "3" { $identities = @("php", "js") }
    default {
        Write-Warn "Invalid choice, defaulting to PHP"
        $identities = @("php")
    }
}

# Copy identity file (first one becomes primary agent-identity.json)
$identitySrc = Join-Path $RepoRoot "global\agent-identities\$($identities[0]).json"
$identityDest = Join-Path $ClaudeHome "agent-identity.json"
if (Test-Path $identitySrc) {
    Write-Info "Set primary identity: $($identities[0])"
    if (-not $DryRun) { Copy-Item $identitySrc $identityDest -Force }
}

# === Step 6: Register projects ===
Write-Section "Step 6: Register your projects"
Write-Host "Enter project path(s). Leave blank and press Enter to finish."
$projects = @()
while ($true) {
    $path = Read-Host "  Project path"
    if ([string]::IsNullOrWhiteSpace($path)) { break }
    if (-not (Test-Path $path)) {
        Write-Warn "Path does not exist: $path — skipped"
        continue
    }

    # Auto-detect stack
    $detectedStack = "unknown"
    if (Test-Path (Join-Path $path "composer.json"))   {
        $composer = Get-Content (Join-Path $path "composer.json") -Raw
        if ($composer -match "yiisoft/yii\"\s*:\s*\"1") { $detectedStack = "yii1" }
        else                                             { $detectedStack = "laravel" }
    }
    elseif (Test-Path (Join-Path $path "package.json")) {
        $pkgContent = Get-Content (Join-Path $path "package.json") -Raw
        if ($pkgContent -match "\"vue\"")       { $detectedStack = "vue" }
        elseif ($pkgContent -match "\"react\"") { $detectedStack = "react" }
        else                                    { $detectedStack = "react" }
    }
    elseif (Test-Path (Join-Path $path "requirements.txt")) { $detectedStack = "python" }

    $slug = Read-Host "  Slug (unique id, e.g. 'simlab-v2-fe')"
    $name = Read-Host "  Human name (e.g. 'SIMLab v2 Frontend')"
    Write-Info "Detected stack: $detectedStack"
    $stackOk = Read-Host "  Use detected stack? [Y/n]"
    if ($stackOk -eq "n") {
        $detectedStack = Read-Host "  Override stack profile name"
    }

    $projects += [PSCustomObject]@{
        slug          = $slug
        name          = $name
        path          = $path
        stack_profile = $detectedStack
        os_user       = $Username
        status        = "active"
    }
}

# === Step 7: Write project-registry.json ===
Write-Section "Step 7: Generate project-registry.json"
$registryPath = Join-Path $ClaudeHome "project-registry.json"
$registryContent = @{
    version   = "2.0"
    updated   = (Get-Date -Format "yyyy-MM-dd")
    developer = $Username
    projects  = $projects
} | ConvertTo-Json -Depth 5

Write-Info "Registry path: $registryPath"
if (-not $DryRun) { Set-Content -Path $registryPath -Value $registryContent -Encoding UTF8 }
Write-Ok "Registry generated with $($projects.Count) project(s)"

# === Step 8: Generate project-docs structure for each project ===
Write-Section "Step 8: Generate project-docs templates"
$templateSrc = Join-Path $RepoRoot "templates\project-docs"
$projectDocsRoot = Join-Path $ClaudeHome "project-docs"
if (-not (Test-Path $projectDocsRoot) -and -not $DryRun) {
    New-Item -ItemType Directory -Path $projectDocsRoot | Out-Null
}
foreach ($p in $projects) {
    $dest = Join-Path $projectDocsRoot $p.slug
    Write-Info "Project docs: $dest"
    if (-not $DryRun) {
        if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }
        Get-ChildItem $templateSrc -Filter "*.tpl" | ForEach-Object {
            $destFile = Join-Path $dest ($_.Name -replace '\.tpl$', '')
            if (-not (Test-Path $destFile) -or $Force) {
                $tpl = Get-Content $_.FullName -Raw
                $tpl = $tpl.Replace("{{PROJECT_NAME}}", $p.name)
                $tpl = $tpl.Replace("{{PROJECT_SLUG}}", $p.slug)
                $tpl = $tpl.Replace("{{STACK}}", $p.stack_profile)
                $tpl = $tpl.Replace("{{DATE}}", (Get-Date -Format "yyyy-MM-dd"))
                Set-Content -Path $destFile -Value $tpl -Encoding UTF8
            }
        }
    }
}
Write-Ok "Project-docs templates generated"

# === Step 9: Generate current-focus.json ===
Write-Section "Step 9: Generate current-focus.json"
$focusPath = Join-Path $ClaudeHome "current-focus.json"
$focusContent = @{
    version         = "1.0"
    last_updated    = (Get-Date -Format "yyyy-MM-dd")
    mode            = "general"
    focus_label     = "General"
    active_projects = @()
    notes           = "Default focus after install. Change via 'fokus ke <slug>' or manual edit."
} | ConvertTo-Json -Depth 3
if (-not (Test-Path $focusPath) -or $Force) {
    if (-not $DryRun) { Set-Content -Path $focusPath -Value $focusContent -Encoding UTF8 }
    Write-Ok "current-focus.json created"
} else {
    Write-Warn "current-focus.json already exists, skipped (use -Force to overwrite)"
}

# === Step 10: Summary ===
Write-Section "Install complete"
Write-Ok "Copied protocol, skills, stack profiles to $ClaudeHome"
Write-Ok "Registered $($projects.Count) project(s)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review $ClaudeHome\CLAUDE.md"
Write-Host "  2. Review $ClaudeHome\project-registry.json"
Write-Host "  3. Install MCP servers — see mcp-servers/README.md (manual step)"
Write-Host "  4. Open Claude Code in a registered project → verify session start protocol loads correctly"
Write-Host ""
Write-Host "Troubleshooting: see docs/troubleshooting.md"
