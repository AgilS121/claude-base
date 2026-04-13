# Project Context — Quick Overview

Baca context project yang sedang aktif dari registry dan documentation files.

## Instructions

1. Jalankan `pwd` untuk detect direktori aktif
2. Baca `~/.claude/project-registry.json` dan match path dengan project
3. Jika match ditemukan:
   - Baca project entry dari registry (stack, status, group)
   - Jika `repo_claude_md: true` → baca CLAUDE.md di root repo
   - Jika `repo_claude_md: false` → baca `~/.claude/project-docs/{slug}/CLAUDE.md`
   - Baca `~/.claude/project-docs/{slug}/CURRENT_STATE.md` untuk state terakhir
   - Baca `~/.claude/project-docs/{slug}/NEXT_TASKS.md` untuk backlog
   - Load stack profile dari `~/.claude/stack-profiles/{stack_profile}.md`
4. Jika TIDAK match → cari `CLAUDE.md` dan `CONTEXT.md` di root directory
5. Baca file documentation lain yang ada di root (*.md, *.html)

## Output Format

```
## Project: [nama project]
### Registry Info
- Status: [active/maintenance]
- Group: [group name]
- Stack: [stack list]

### Tech Stack: [framework, DB, dll]
### Architecture: [pattern, layers]
### Documentation Files: [list file .md yang ada + isi singkat]
### Available Commands: [list /commands yang tersedia]
### Key Gotchas: [naming issues, soft delete, dll]
### Active Modules: [modul utama]

### Current State (dari CURRENT_STATE.md):
- Working on: ...
- Blockers: ...

### Next Tasks (dari NEXT_TASKS.md):
- Priority High: ...
```

Tujuan: Dalam 30 detik developer bisa paham konteks project yang sedang aktif.
