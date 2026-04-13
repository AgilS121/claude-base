# Skills (Slash Commands)

Daftar slash commands yang tersedia setelah install. Setiap skill adalah satu file markdown
di folder ini, dan otomatis di-invoke saat user mengetik `/<nama-skill>` di Claude Code.

**Catatan lokasi**: Di setup Claude Code yang sebenarnya, skill disimpan di `~/.claude/commands/`
(bukan `~/.claude/skills/`). Installer akan copy dari repo ini ke folder tersebut.

## Available Skills

| Skill | File | Kapan Pakai |
|---|---|---|
| `/task` | [task.md](task.md) | Catat & track task ke file (WAJIB setiap tugas) |
| `/brainstorm` | [brainstorm.md](brainstorm.md) | Explore requirements sebelum coding |
| `/write-plan` | [write-plan.md](write-plan.md) | Buat implementation plan |
| `/execute-plan` | [execute-plan.md](execute-plan.md) | Eksekusi plan yang sudah di-approve |
| `/debug` | [debug.md](debug.md) | Debugging systematic + rubber duck |
| `/code-review` | [code-review.md](code-review.md) | Review code + security audit |
| `/qa-tester` | [qa-tester.md](qa-tester.md) | Generate test scenarios |
| `/tdd` | [tdd.md](tdd.md) | Test-Driven Development workflow |
| `/capture-decision` | [capture-decision.md](capture-decision.md) | Catat keputusan teknis/arsitektur |
| `/idea-stress-test` | [idea-stress-test.md](idea-stress-test.md) | Stress test ide dari 4 perspektif |
| `/project-context` | [project-context.md](project-context.md) | Quick overview project aktif |
| `/developer-fatigue` | [developer-fatigue.md](developer-fatigue.md) | Energy check & safe mode |
| `/stack-aware` | [stack-aware.md](stack-aware.md) | Load & enforce stack profile |
| `/living-docs` | [living-docs.md](living-docs.md) | Auto-update dokumentasi |

## Cara Tambah Skill Baru

1. Buat file `{nama}.md` di folder ini
2. Isi deskripsi, trigger, steps, output format, examples
3. Tambah row di tabel "Available Skills" di README ini
4. Test dengan `claude` → `/nama` → pastikan respons sesuai
5. Commit + PR

## Content

Semua skill di folder ini adalah **konten real** dari setup working ASAP (AGILS121).
Bukan skeleton.
