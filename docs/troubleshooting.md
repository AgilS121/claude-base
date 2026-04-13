# Troubleshooting

Masalah umum dan solusinya.

---

## Install & Setup

### "install.ps1 tidak bisa dijalankan" (Execution Policy)
```
.\install.ps1 : File cannot be loaded. The file is not digitally signed.
```

**Solusi**:
```powershell
# Set execution policy untuk user saat ini
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Atau bypass sekali untuk script ini:
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

### "`~/.claude/` tidak ter-create"
- Cek permission HOME directory
- Jalankan PowerShell sebagai Administrator (kalau perlu)
- Manual create: `New-Item -ItemType Directory -Path $env:USERPROFILE\.claude`

### "Copy-Item error: path not found"
- Pastikan kamu `cd` ke folder `claude-base-dtit` sebelum run script
- Script pakai relative path dari script location — gunakan `$PSScriptRoot`

---

## Claude Session

### "Claude tidak kenal identity-nya"
Saat tanya "siapa kamu", Claude balas jawaban generic.

**Cek**:
1. `~/.claude/agent-identity.json` exist & valid JSON:
   ```powershell
   cat ~/.claude/agent-identity.json | ConvertFrom-Json
   ```
2. `~/.claude/CLAUDE.md` exist & berisi section `## Identity`
3. `~/.claude/agent-identity-protocol.md` exist

**Solusi**: re-run installer atau copy manual:
```powershell
copy global/agent-identities/php.json ~/.claude/agent-identity.json
copy global/CLAUDE.md ~/.claude/CLAUDE.md
```

### "Claude tidak tahu project sedang di-fokus apa"
**Cek**:
1. `~/.claude/current-focus.json` valid JSON
2. Kalau `mode == "focused"`, `active_projects` tidak kosong
3. Setiap slug di `active_projects` match dengan registry

**Solusi**:
- Reset focus ke general:
  ```
  mode general
  ```
- Atau set manual:
  ```
  fokus ke simlab-v2
  ```

### "Task tidak tercatat di CURRENT_STATE.md"
**Cek**:
1. File `~/.claude/project-docs/{slug}/CURRENT_STATE.md` ada
2. Write permission OK
3. Slug sesuai dengan project yang sedang di-fokus

**Solusi**:
- Manual create dari template:
  ```powershell
  mkdir ~/.claude/project-docs/{slug}
  copy templates/project-docs/CURRENT_STATE.md.tpl ~/.claude/project-docs/{slug}/CURRENT_STATE.md
  ```

---

## Stack Profile

### "Stack profile tidak loaded"
**Gejala**: Claude generate code yang tidak ikut idiom stack (misal pakai `->where()`
di Yii 1 yang seharusnya `CDbCriteria`).

**Cek**:
1. `~/.claude/stack-profiles/{stack}.md` ada
2. Di `project-registry.json`, field `stack_profile` match filename (tanpa `.md`)
3. Claude di-trigger load via `/stack-aware`

**Solusi**: panggil `/stack-aware` untuk force reload.

---

## MCP Server

### "Tool MCP tidak muncul"
```
Tool not available: find_symbol
```

**Cek**:
```bash
claude mcp list
```

Kalau server tidak terdaftar:
```bash
claude mcp add orchestrator node /path/to/orchestrator/dist/server.js
```

### "MCP server crash saat start"
**Cek log**:
```
~/.claude/logs/mcp-{name}.log
```

Common causes:
- Node version terlalu lama (minimal 20)
- Missing dependency (`node_modules` belum `npm install`)
- Source file tidak exist (build belum jalan)

**Solusi**:
```bash
cd mcp-servers/orchestrator
npm install
npm run build
```

### "MCP slow"
- Index file terlalu besar → split per-project
- Adapter parsing error → fallback ke regex mode
- Reduce file watcher scope via `.claudeignore`

---

## Git & Workflow

### "Conflict saat update repo"
```bash
cd claude-base-dtit
git pull
# → conflict di stack-profiles/*.md karena kamu modif lokal
```

**Solusi**:
1. Commit atau stash perubahan lokal dulu
2. Pull
3. Merge / rebase
4. Kalau perubahan lokal generally applicable → PR ke main repo

### "Install script overwrite file custom"
Script backup file lama ke `~/.claude/backup-{timestamp}/`.
Kalau hilang, cek sana dulu.

**Prevention**: run `./install.ps1 -DryRun` dulu untuk lihat apa yang akan di-touch.

---

## Performance

### "Claude lambat di awal sesi"
Session start load banyak file:
- `CLAUDE.md` (~15kb)
- `agent-identity-protocol.md`
- Stack profile per focus project (~10-30kb each)
- `CURRENT_STATE.md` per focus project
- `AUDIT_LOG.md` tail

**Solusi**:
- Cukup normal 1-2 detik load
- Kalau >10 detik: cek file ada yang korup (JSON invalid, markdown rusak)
- Batasi `active_projects` di focus max 3

### "Token usage tinggi"
**Cek**:
- Apakah MCP ter-install? Tanpa MCP, Claude harus Grep manual (boros)
- Apakah `CURRENT_STATE.md` terlalu panjang? Limit max 200 lines
- Apakah `CLAUDE.md` project punya duplikasi dengan stack profile?

**Solusi**:
- Install MCP orchestrator + project-indexer
- Trim `CURRENT_STATE.md` — archive lama ke AUDIT_LOG
- Dedupe project CLAUDE.md

---

## Kalau Masih Stuck

1. Baca log: `~/.claude/logs/` (kalau ada)
2. Reproduce di sesi minimal (clean CURRENT_STATE, etc.)
3. Chat `#claude-code-help` di internal DTIT
4. Tag **ASAP (AGILS121)** untuk issue kritis
