# Onboarding — Developer Baru DTIT

Panduan step-by-step untuk developer baru yang mau pakai setup Claude Code standar DTIT.
Estimasi waktu: **30-60 menit** untuk developer yang sudah familiar dengan Claude Code,
**1-2 jam** untuk yang baru pertama kali.

---

## Prerequisites

Sebelum mulai, pastikan kamu punya:

- [ ] **Claude Code CLI** sudah terinstall ([install guide](https://docs.anthropic.com/claude-code))
- [ ] **Git** terinstall
- [ ] **Node.js 20+** (untuk MCP servers)
- [ ] **Anthropic API key** (pribadi, ambil dari tim lead)
- [ ] **Akses ke repo internal DTIT** di GitHub/GitLab
- [ ] **Windows 10/11** (primary target) atau Mac/Linux

## Step 1: Clone Repo

```powershell
# Ganti URL sesuai internal DTIT
cd d:\
git clone https://github.com/dtit/claude-base-dtit.git
cd claude-base-dtit
```

## Step 2: Jalankan Installer

### Windows
```powershell
./install.ps1
```

### Mac/Linux
```bash
chmod +x install.sh
./install.sh
```

Installer akan:
1. Backup `~/.claude/CLAUDE.md` lama kamu (kalau ada)
2. Copy protocol + skills + stack profiles ke `~/.claude/`
3. Tanya stack kamu (PHP / JS / Fullstack)
4. Set identity sesuai stack
5. Tanya project yang kamu handle → auto-detect stack dari `composer.json` / `package.json`
6. Generate `project-registry.json` + `project-docs/{slug}/` per project
7. Generate `current-focus.json` default

## Step 3: Verify Install

```powershell
# Cek file yang ter-install
ls ~/.claude/

# Harus ada:
# - CLAUDE.md
# - agent-identity.json
# - agent-identity-protocol.md
# - current-focus.json
# - project-registry.json
# - project-docs/
# - skills/
# - stack-profiles/
```

Buka salah satu file untuk pastikan isinya benar:
```powershell
cat ~/.claude/project-registry.json
```

## Step 4: Install MCP Servers (Optional tapi Direkomendasikan)

MCP server memberi Claude tool tambahan untuk akses project state & symbol index.
Tanpa MCP, Claude masih jalan tapi lebih boros token (harus Grep manual).

**NOTE**: Per 2026-04-11, source code MCP belum di-extract ke repo ini. Ikuti manual
setup dari lead DTIT atau lihat `mcp-servers/README.md` untuk status.

## Step 5: Test Session Pertama

Buka Claude Code di salah satu project yang sudah terdaftar:

```powershell
cd d:/path/to/your/project
claude
```

Prompt pertama, coba:
```
siapa kamu
```

Expected response:
```
Saya Agent Fullstack PHP (atau JS), dibuat oleh ASAP (AGILS121).
- Spesialisasi: ...
- Fokus aktif: ...
```

Kalau response tidak sesuai, ada yang salah di `agent-identity.json` atau `CLAUDE.md`
belum ter-load.

## Step 6: Coba Workflow Normal

```
/task saya mau fix bug di halaman order
```

Claude akan:
1. Generate task ID
2. Append ke `CURRENT_STATE.md`
3. Tanya klarifikasi (bug apa, file mana, dll)

Setelah selesai kerja:
```
/task done
```

Claude akan update `CURRENT_STATE.md` + append ke `AUDIT_LOG.md`.

## Step 7: Register Project Tambahan

Kalau nanti ada project baru yang kamu handle:

```
/help — daftarkan project baru bernama X di path Y
```

Claude akan ikuti Pattern 4 di `agent-identity-protocol.md`.

## Step 8: Baca Dokumentasi Lanjutan

Setelah onboarding, baca:

1. **[how-to-add-project.md](how-to-add-project.md)** — cara tambah project
2. **[how-to-add-stack.md](how-to-add-stack.md)** — kalau stack kamu belum ada
3. **[knowledge-capture.md](knowledge-capture.md)** — cara kerja dengan MISTAKES.md
4. **[multi-stack-developer.md](multi-stack-developer.md)** — kalau kamu fullstack
5. **[troubleshooting.md](troubleshooting.md)** — kalau ada masalah

## Common Issues

### "Agent identity tidak ter-load"
- Cek `~/.claude/agent-identity.json` ada & valid JSON
- Cek `~/.claude/CLAUDE.md` ada
- Restart Claude Code session (clear context)

### "Claude tidak tahu project apa yang sedang di-fokus"
- Cek `~/.claude/current-focus.json`
- Kalau `mode == "general"`, pastikan `pwd` match salah satu project di registry

### "Task tidak tercatat"
- Cek `~/.claude/project-docs/{slug}/CURRENT_STATE.md` ada
- Cek write permission ke folder `~/.claude/`

## Support

- Chat internal DTIT: `#claude-code-help`
- Lead kontak: **ASAP (AGILS121)**
- Issue tracker: [TBD]

---

**Welcome to DTIT Claude Setup!** 🎉
