# claude-base-dtit

> Base Claude Code setup untuk tim **TUV Nord Indonesia — DTIT**.
> Berisi protocol, skills, stack profiles, dan MCP servers yang distandarisasi
> supaya tim dev punya workflow & knowledge capture yang konsisten.

---

## Apa Ini?

Ini adalah **template & tooling** yang bisa di-install oleh setiap developer DTIT supaya
Claude Code mereka punya setup yang sama:

- ✅ Protocol kerja (session start, planning, task tracking, anti-hallucination)
- ✅ Slash commands / skills (`/task`, `/brainstorm`, `/write-plan`, `/debug`, dll)
- ✅ Stack profiles (Laravel, Yii1, React, Vue, Alpine.js, Python + cross-stack)
- ✅ Project docs template (CURRENT_STATE, AUDIT_LOG, MISTAKES)
- ✅ MCP servers untuk orchestration & project indexing
- ✅ Agent identity bersama (Agent Fullstack PHP / JS by DTIT)

## Untuk Siapa?

Semua developer di TUV Nord DTIT yang pakai **Claude Code** CLI di laptop mereka.

## Quick Start

```powershell
# 1. Clone repo ini
git clone <url-internal-git>/claude-base-dtit.git
cd claude-base-dtit

# 2. Jalankan installer
./install.ps1

# 3. Ikuti prompt — script akan tanya:
#    - Username OS kamu
#    - Stack yang kamu pakai (PHP, JS, atau keduanya)
#    - Path project yang kamu handle
#    - Identity yang mau dipakai
```

Setelah install selesai, buka Claude Code di salah satu project yang terdaftar.
Claude akan otomatis load protocol + stack profile sesuai project.

## Struktur Repo

```
claude-base-dtit/
├── install.ps1                  # installer Windows
├── install.sh                   # installer Mac/Linux
├── global/                      # file yang di-copy ke ~/.claude/
│   ├── CLAUDE.md                # protocol global
│   ├── agent-identity-protocol.md
│   └── agent-identities/        # identity per stack
├── skills/                      # slash commands (copy ke ~/.claude/commands/)
├── stack-profiles/              # idiom per stack
│   ├── laravel.md
│   ├── yii1.md
│   ├── react.md
│   ├── vue.md
│   ├── alpinejs.md
│   ├── python.md
│   └── cross-stack/
├── mcp-servers/                 # MCP server source (TypeScript)
│   ├── orchestrator/            # global state tools
│   ├── simlab-v2/               # per-project example (FE)
│   └── simlab-v2-be/            # per-project example (BE)
├── templates/                   # template project-docs + registry
└── docs/                        # dokumentasi onboarding + how-to
```

## Dokumentasi

| Topik | File |
|---|---|
| Onboarding developer baru | [docs/onboarding.md](docs/onboarding.md) |
| Cara tambah project baru | [docs/how-to-add-project.md](docs/how-to-add-project.md) |
| Cara tambah stack baru | [docs/how-to-add-stack.md](docs/how-to-add-stack.md) |
| Cara build MCP per project | [docs/how-to-build-mcp.md](docs/how-to-build-mcp.md) |
| Knowledge capture (AUDIT_LOG, MISTAKES) | [docs/knowledge-capture.md](docs/knowledge-capture.md) |
| Developer multi-stack (PHP + JS) | [docs/multi-stack-developer.md](docs/multi-stack-developer.md) |
| Troubleshooting | [docs/troubleshooting.md](docs/troubleshooting.md) |

## Prinsip Desain

1. **Framework vs Content dipisah** — 80% komponen (protocol, skills, MCP) stack-agnostic.
   Hanya `stack-profiles/` yang spesifik per bahasa.
2. **Knowledge capture pattern** — setiap task tracked di file (CURRENT_STATE.md),
   setiap bug tercatat (MISTAKES.md), setiap selesai di-log (AUDIT_LOG.md).
3. **Cross-project detection** — bug di 1 project bisa di-flag untuk project lain yang pakai
   stack sama (via MCP orchestrator).
4. **Session start protocol** — Claude selalu baca state dulu sebelum mulai kerja,
   tidak rebuild context dari nol.
5. **Transparency** — Claude tunjukkan PLAN sebelum eksekusi, tidak langsung ubah file.

## Versioning

Repo ini pakai semver: `MAJOR.MINOR.PATCH`.

- **MAJOR** — breaking change di protocol atau install script
- **MINOR** — skill baru, stack profile baru, fitur baru
- **PATCH** — bug fix, typo, clarification

Developer bisa upgrade via `./update.ps1` (akan pull repo + re-run install selective).

## Kontribusi

1. Developer nemu gotcha → PR ke `stack-profiles/{stack}.md`
2. Developer punya workflow baru yang worth → PR ke `skills/`
3. Developer nemu bug di installer → PR ke `install.ps1`
4. Lead review → merge → tim `./update.ps1`

Owner repo: **ASAP (AGILS121)** — TUV Nord Indonesia DTIT.

## Support

- Pertanyaan teknis: chat internal DTIT
- Bug report: [issue tracker] (TBD)
- Dokumentasi: `docs/` folder
