# MCP Servers — Agent Fullstack PHP

3 MCP server untuk workflow Claude Code. **Read + Write** — bisa baca codebase,
catat task, record bug, dan analisis history lintas project.

## Struktur

```
~/.claude/mcp/
├── orchestrator/     → identity, focus, task status global, cross-project analysis
├── simlab-v2/        → SIMLab v2 Frontend (server name: "simlab-v2-fe")
│                       symbol lookup, routes, docs, mistakes, task tracking
│                       NOTE: folder bernama "simlab-v2" (legacy). Server name: "simlab-v2-fe".
└── simlab-v2-be/     → SIMLab v2 Backend (Laravel API)
                        symbol lookup, routes, docs, mistakes, task tracking
```

## Prerequisite

- **Node.js ≥ 18** (cek: `node --version`)
- **npm** (ikut Node.js)
- Tidak perlu admin rights

## Step 1 — Install dependencies & build

Buka **CMD** atau **PowerShell**, build 3 server:

```cmd
cd C:\Users\Lenovo\.claude\mcp\orchestrator
npm install
npm run build

cd C:\Users\Lenovo\.claude\mcp\simlab-v2
npm install
npm run build

cd C:\Users\Lenovo\.claude\mcp\simlab-v2-be
npm install
npm run build
```

Setiap `npm install` download `@modelcontextprotocol/sdk` dan TypeScript (~30-50 MB per server, sekali saja).
Setiap `npm run build` compile TypeScript → folder `dist/`.

**Sukses**: tidak ada error merah, folder `dist/index.js` muncul di masing-masing server.

## Step 2 — Test MCP manual (opsional tapi dianjurkan)

```cmd
cd C:\Users\Lenovo\.claude\mcp\orchestrator
node dist/index.js
```

Kamu akan lihat:
```
[orchestrator-mcp] connected. CLAUDE_HOME=C:\Users\Lenovo/.claude
```

Server hidup, menunggu input stdio. Tekan `Ctrl+C` untuk keluar.

## Step 3 — Daftarkan ke Claude Code (sudah otomatis)

File `.mcp.json` di root project mendaftarkan MCP server. `enabledMcpjsonServers` di `settings.json` auto-approve.

**Jangan commit `.mcp.json`** — berisi absolute path. Tambahkan ke `.gitignore`.

### Restart Claude Code

- **CMD/PowerShell**: keluar (Ctrl+D), ketik `claude` lagi
- **VS Code**: `Ctrl+Shift+P` → `Developer: Reload Window`

## Step 4 — Verifikasi

```
pakai tool orchestrator get_identity, balikin hasilnya apa
```

Harus muncul hasil dari `mcp__orchestrator__get_identity`.

---

## Tools — Orchestrator (10 tools)

### Read (Mata)

| Tool | Kegunaan |
|---|---|
| `get_identity` | Nama agent, author, spesialisasi |
| `get_current_focus` | Mode + project aktif |
| `list_projects` | Semua project di registry |
| `get_project_status` | Task aktif + terakhir selesai per project |
| `list_recent_tasks` | Audit log gabungan (semua project atau 1 slug) |

### Write (Tangan)

| Tool | Kegunaan |
|---|---|
| `switch_focus` | Ganti focus profile aktif (simlab-v2, ppic, general, dll) |
| `log_insight` | Catat insight lintas project (pattern, feedback, gotcha, workflow) → INSIGHTS.md |

### Sensor

| Tool | Kegunaan |
|---|---|
| `check_energy` | Cek jam kerja developer (WIB). Warning kalau di luar 08:00-17:00 Senin-Jumat |
| `aggregate_patterns` | Scan MISTAKES.md semua project, deteksi cross-project bug pattern |

### Otak (Analisis)

| Tool | Kegunaan |
|---|---|
| `analyze_history` | Analisis AUDIT_LOG + MISTAKES semua project → hotspot files, repeat bugs, warnings, suggestions |

---

## Tools — simlab-v2-fe & simlab-v2-be (10 tools masing-masing)

### Read (Mata)

| Tool | Kegunaan | Catatan |
|---|---|---|
| `get_claude_md` | Isi CLAUDE.md project (dari project-docs/) | |
| `get_current_state` | Task aktif + yang baru selesai | |
| `get_mistakes` | MISTAKES.md dengan optional topic filter | |
| `find_symbol` | Cari function/method/class | **Auto-rebuild** jika tidak ketemu (detect file baru) |
| `get_symbol_body` | Body 80 baris dari lokasi simbol | **Auto-rebuild** jika tidak ketemu |
| `list_routes` | Parse routes file | FE: `web.php`, BE: `api.php` |

### Write (Tangan)

| Tool | Kegunaan |
|---|---|
| `log_task` | Catat task selesai ke AUDIT_LOG.md |
| `update_state` | Update CURRENT_STATE.md (add/complete/update task) |
| `record_mistake` | Catat bug/gotcha ke MISTAKES.md |

### Refleks

| Tool | Kegunaan |
|---|---|
| `rebuild_index` | Force re-scan semua file PHP. Otomatis dipanggil oleh `find_symbol`/`get_symbol_body` jika symbol tidak ditemukan |

---

## Arsitektur MCP

```
Orchestrator (Ketua RT)
│   Tahu semua project, bisa analisis lintas project,
│   cek jam kerja, ganti focus, catat insight global.
│
├── simlab-v2-fe (RT wilayah FE)
│   Hapal semua symbol/route FE,
│   bisa catat task & bug, auto-detect file baru.
│
└── simlab-v2-be (RT wilayah BE)
    Hapal semua symbol/route BE,
    bisa catat task & bug, auto-detect file baru.
```

### Fitur Kunci

1. **Auto-rebuild index**: Tambah Controller/Model/Service baru → otomatis terdeteksi saat dicari (tidak perlu restart MCP)
2. **Auto-record**: Setelah fix bug, panggil `log_task` + `update_state` — 1 tool call, langsung tercatat
3. **Cross-project analysis**: `analyze_history` scan semua project, deteksi hotspot files & repeat bugs
4. **Energy check**: `check_energy` cek jam kerja WIB, warning kalau di luar jam kerja
5. **Pattern aggregation**: `aggregate_patterns` cari bug yang sama di project lain

### Data yang Dikumpulkan (Makin Banyak = Makin Pintar)

| File | Isi | Diisi oleh |
|---|---|---|
| `AUDIT_LOG.md` | History semua task | `log_task` |
| `CURRENT_STATE.md` | Task aktif & selesai | `update_state` |
| `MISTAKES.md` | Bug & gotcha | `record_mistake` |
| `INSIGHTS.md` | Cross-project pattern | `log_insight` (orchestrator) |

---

## Upgrade History

| Tanggal | Perubahan |
|---|---|
| 2026-04-10 | Initial setup: 3 MCP server (read-only), 5+6+6 tools |
| 2026-04-13 | **v2**: Write tools (log_task, update_state, record_mistake) di FE & BE |
| 2026-04-13 | **v2**: Orchestrator write (switch_focus, log_insight) |
| 2026-04-13 | **v2**: Sensor (check_energy, aggregate_patterns) |
| 2026-04-13 | **v2**: Otak (analyze_history) — hotspot, repeat bugs, warnings, suggestions |
| 2026-04-13 | **v2**: Auto-rebuild index (find_symbol auto-detect file baru) |
| 2026-04-13 | **v2**: Fix BE list_routes baca `api.php` (sebelumnya salah baca `web.php`) |

---

## Batasan Saat Ini

1. **Symbol parser pakai regex** — mungkin miss edge case: trait, magic method, arrow function
2. **In-memory index** — rebuild dari 0 setiap restart (~1-3 detik untuk project medium). Mitigasi: auto-rebuild saat symbol tidak ditemukan
3. **Routes parser simple** — hanya baca 1 file routes, group routing mungkin tidak ter-parse sempurna
4. **analyze_history fuzzy match** — deteksi repeat bug pakai word overlap 50%, bisa false positive/negative
5. **check_energy hardcoded WIB** — kalau developer pindah timezone, perlu ubah manual

## Next Upgrade

- [ ] **Level 4: validate_flow** — review code change sebelum save, cek apakah ikuti pattern project
- [ ] Tree-sitter PHP parser (lebih presisi dari regex)
- [ ] File watcher dengan chokidar (real-time index update)
- [ ] SQLite persistence untuk symbol index
- [ ] Correction learning — auto-record user corrections sebagai rules

## Rollback

Hapus `enabledMcpjsonServers` dari `settings.json` → restart Claude Code.
Workflow lama (Grep/Read manual) kembali jalan. Hapus total:

```cmd
rmdir /s /q C:\Users\Lenovo\.claude\mcp
```

Zero side effect ke file lain.
