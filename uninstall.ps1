# claude-base-dtit uninstaller
# Usage: ./uninstall.ps1
#
# This removes files installed by install.ps1 but PRESERVES your personal state:
# - project-docs/ (your CURRENT_STATE, AUDIT_LOG, MISTAKES)
# - current-focus.json
# - backup-* folders
#
# To fully wipe, use -HardReset

param(
    [switch]$HardReset
)

$ClaudeHome = Join-Path $env:USERPROFILE ".claude"

Write-Host "=== claude-base-dtit uninstaller ===" -ForegroundColor Magenta
Write-Host "Claude home: $ClaudeHome"

if (-not (Test-Path $ClaudeHome)) {
    Write-Host "Nothing to remove — $ClaudeHome does not exist"
    exit 0
}

# Remove framework files (protocol, skills, stack profiles)
$itemsToRemove = @(
    "CLAUDE.md",
    "agent-identity.json",
    "agent-identity-protocol.md",
    "skills",
    "stack-profiles"
)

foreach ($item in $itemsToRemove) {
    $path = Join-Path $ClaudeHome $item
    if (Test-Path $path) {
        Write-Host "Removing: $item" -ForegroundColor Yellow
        Remove-Item $path -Recurse -Force
    }
}

if ($HardReset) {
    Write-Host "HARD RESET — also removing personal state" -ForegroundColor Red
    $personalItems = @("project-docs", "project-registry.json", "current-focus.json")
    foreach ($item in $personalItems) {
        $path = Join-Path $ClaudeHome $item
        if (Test-Path $path) {
            Write-Host "Removing: $item" -ForegroundColor Red
            Remove-Item $path -Recurse -Force
        }
    }
}

Write-Host "Uninstall complete" -ForegroundColor Green
Write-Host "Note: backup-* folders preserved for safety"
