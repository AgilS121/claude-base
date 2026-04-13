# Git Workflow — TUV Nord Indonesia DTIT

## Branch Naming
- `feature/{deskripsi}` — fitur baru
- `fix/{deskripsi}` — bug fix
- `hotfix/{deskripsi}` — fix urgent di production
- `refactor/{deskripsi}` — refactoring
- `chore/{deskripsi}` — maintenance tasks

## Commit Message Format
```
type: deskripsi singkat

[body opsional: detail perubahan]
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`

Contoh:
```
fix: discount stacking calculation error
feat: add daily analyst export to PDF
refactor: extract order validation to service class
```

## Branch Rules
- `main` / `master` — production-ready, JANGAN force push
- `staging` — testing environment
- `develop` — development integration (jika ada)
- Feature branches → merge ke staging/develop via PR
- JANGAN commit langsung ke main

## Pull Request
- Title: deskriptif, max 70 karakter
- Description: apa yang berubah dan kenapa
- Minimal 1 reviewer sebelum merge
- Semua test harus pass

## Conflict Resolution
- Resolve merge conflicts, jangan discard changes tanpa review
- Jika conflict di area yang tidak kamu pahami → tanya owner area tersebut
