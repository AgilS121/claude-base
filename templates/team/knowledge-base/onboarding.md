# Onboarding Guide — TUV Nord DTIT Development

## Environment Setup

### Prerequisites
- **OS**: Windows 10/11
- **PHP**: 7.4+ (untuk Yii 1), 8.0+ (untuk Laravel 8)
- **MySQL**: 5.7+ atau 8.0
- **Node.js**: 18+ (untuk frontend tooling)
- **Git**: Latest
- **Laragon**: Local development server (Apache + MySQL + PHP)
- **VS Code**: IDE utama + Claude Code extension
- **Claude Code CLI**: `npm install -g @anthropic-ai/claude-code`

### Local Development URLs (Laragon)
- SIMLab TUV V1: `http://simlab-tuv-v1.test`
- SIMLab Enviro: `http://simlab-enviro-tuv-v1.test`
- SIMLab v2 BE: `http://localhost:8001`
- SIMLab v2 FE: `http://localhost:8000`
- PPIC BE: check `.env` for port
- PPIC FE: check `.env` for port

### Project Locations
```
c:\laragon\www\hsd\SIMLab-TUV-V1          — Yii 1 (maintenance)
c:\laragon\www\hsd\SIMLab-Enviro-TUV-V1   — Yii 1 (active)
d:\HSD\SIMLAB\old-simlab-v2-be            — Laravel 8 BE
d:\HSD\SIMLAB\old-simlab-v2-fe            — Laravel 8 FE
d:\HSD\PPIC\ppic-be                        — Laravel 8 BE
d:\HSD\PPIC\ppic-fe                        — Laravel 8 FE
```

## Agent System

### Quick Start
1. Buka terminal di project directory
2. Jalankan `claude` untuk start Claude Code
3. Global orchestrator (`~/.claude/CLAUDE.md`) auto-loaded
4. Gunakan `/project-context` untuk overview project aktif

### Available Commands
| Command | Fungsi |
|---|---|
| `/project-context` | Overview project aktif |
| `/brainstorm` | Explore requirements |
| `/write-plan` | Buat implementation plan |
| `/execute-plan` | Eksekusi plan |
| `/debug` | Systematic debugging |
| `/code-review` | Code review + security audit |
| `/qa-tester` | Generate test scenarios |
| `/tdd` | Test-driven development |
| `/capture-decision` | Catat keputusan teknis |
| `/idea-stress-test` | Stress test ide dari 4 perspektif |

### Key Files
- `~/.claude/CLAUDE.md` — Global orchestrator rules
- `~/.claude/project-registry.json` — Project & developer registry
- `~/.claude/stack-profiles/` — Best practices per stack
- `~/.claude/project-docs/{slug}/` — Per-project state & history

## First Day Checklist
- [ ] Clone semua repository
- [ ] Setup Laragon + database
- [ ] Copy `.env.example` ke `.env` di setiap project
- [ ] Run `composer install` di setiap PHP project
- [ ] Run `npm install` di project yang pakai Node
- [ ] Test akses setiap project di browser
- [ ] Jalankan `/project-context` di setiap project untuk familiarisasi
