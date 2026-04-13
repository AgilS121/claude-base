# Stack Profiles

Stack profile = file markdown yang berisi idiom, convention, gotcha, dan best practice
untuk 1 bahasa/framework tertentu. Claude load stack profile sesuai `stack_profile` field
di project-registry.

## Tujuan

- Agent tahu idiom project tanpa harus di-remind tiap sesi
- Developer baru dapat "onboarding" cepat ke stack yang belum familiar
- Cross-project consistency (project Laravel A dan B pakai convention sama)

## Available Profiles

### PHP Stacks
- [laravel.md](laravel.md) — Laravel (semua versi, terutama 8)
- [yii1.md](yii1.md) — Yii Framework 1 (legacy maintenance)

### JS / Frontend Stacks
- [react.md](react.md) — React (hooks, TS)
- [vue.md](vue.md) — Vue.js
- [alpinejs.md](alpinejs.md) — Alpine.js (dipakai di Blade project)

### Other
- [python.md](python.md) — Python (kalau ada project Python)

### Cross-Stack
- [cross-stack/laravel-to-react.md](cross-stack/laravel-to-react.md) — migrasi Blade → React

## Cara Tambah Stack Baru

1. Bikin file `{stack-name}.md` di folder ini (atau `cross-stack/` kalau lintas stack)
2. Isi section yang relevan: Runtime, Conventions, Naming, Gotchas, Security, Performance, Debugging
3. Minimum: **Common Gotchas** 3+ entry dari pengalaman tim
4. Review oleh lead stack
5. PR + merge → tim pull via `./update.ps1`

## Kontribusi Gotcha Baru

Append ke section **Common Gotchas** di file stack yang relevan:

```markdown
### YYYY-MM-DD — [judul]
- **Konteks**: [kapan terjadi]
- **Gejala**: [apa yang terlihat]
- **Root cause**: [penjelasan]
- **Solusi**: [fix]
- **Prevention**: [cara hindari kedepan]
- **Reporter**: [nama developer]
```
