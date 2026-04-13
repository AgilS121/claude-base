# How to Add a Project

Panduan menambah project baru ke Claude Code registry setelah onboarding.

## Kapan Perlu

- Kamu mulai kerja di project baru (baru di-assign)
- Ada project lama yang belum pernah terdaftar
- Kamu pindah project dari tim lain

## Step 1: Buka Claude Code di Folder Project

```powershell
cd d:/path/to/new-project
claude
```

## Step 2: Minta Claude Daftarkan

```
daftarkan project ini ke registry
```

Claude akan ikuti Pattern 4 (Add Project) dari `agent-identity-protocol.md`:

1. Tanya slug unik (misal `ppic-fe`)
2. Tanya nama human-readable (misal `PPIC Frontend`)
3. Auto-detect stack dari file yang ada:
   - `composer.json` → `php-laravel-or-yii`
   - `package.json` + `next` → `next-js`
   - `package.json` + `react` → `react-ts`
   - `package.json` tanpa framework → `node-express`
4. Konfirmasi stack
5. Append ke `~/.claude/project-registry.json`
6. Create `~/.claude/project-docs/{slug}/` dari template
7. Tanya: switch fokus ke project baru sekarang?

## Step 3: Manual Edit (Alternative)

Kalau mau manual, edit `~/.claude/project-registry.json`:

```json
{
  "version": "2.0",
  "developer": "your-username",
  "projects": [
    {
      "slug": "ppic-fe",
      "name": "PPIC Frontend",
      "path": "d:/HSD/ppic-fe",
      "stack_profile": "laravel-8",
      "os_user": "your-username",
      "status": "active",
      "repo_claude_md": true
    }
  ]
}
```

Lalu create folder project-docs:

```powershell
mkdir ~/.claude/project-docs/ppic-fe
copy templates\project-docs\*.tpl ~/.claude/project-docs/ppic-fe/
# rename .tpl → .md manual
```

## Step 4: Create Project CLAUDE.md (Opsional tapi Direkomendasikan)

Kalau project punya convention spesifik, tulis `CLAUDE.md` di **root repo project**
(bukan di `~/.claude/project-docs/`). Ini akan di-commit ke Git supaya semua developer
yang clone repo langsung dapat.

Template: `templates/project-docs/CLAUDE.md.tpl`

Set flag `repo_claude_md: true` di registry → Claude akan baca dari repo, bukan dari
`~/.claude/project-docs/`.

## Step 5: Test

```
project context
```

Claude harus return summary project baru. Kalau nggak, cek:
- `project-registry.json` valid JSON
- Stack profile `{stack_profile}` ada di `~/.claude/stack-profiles/`
- `project-docs/{slug}/CURRENT_STATE.md` ada

## Catatan

- **Slug harus unik** across semua project kamu
- **Path harus absolute**, bukan relative
- **Stack profile harus ada** di `~/.claude/stack-profiles/{name}.md` — kalau belum,
  lihat [how-to-add-stack.md](how-to-add-stack.md)
