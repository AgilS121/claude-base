# Coding Standards — TUV Nord Indonesia DTIT

## PHP (Laravel 7-8)
- Follow PSR-12 where possible
- Respect existing project conventions even if legacy (e.g., `array()` in Yii 1)
- Type hints di method signatures untuk code baru
- Avoid `$request->all()` — selalu `$request->only()` atau `$request->validated()`
- Soft delete: cek per project (`trash` column atau `deleted_at`)

## PHP (Yii 1)
- Follow existing patterns di project — jangan introduce pattern baru
- `array()` syntax (bukan `[]`) untuk konsistensi dengan codebase existing
- Parameter binding WAJIB di semua query

## JavaScript
- ES6+ untuk code baru (let/const, arrow functions, template literals)
- Avoid global variables
- Error handling di semua async operations

## Alpine.js
- `x-data` scope per komponen, bukan global
- Extract complex logic ke named functions
- Jangan mix Alpine reactive dengan jQuery DOM manipulation di satu element

## CSS / Tailwind
- Prefer utility classes (Tailwind/DaisyUI) daripada custom CSS
- Jika custom CSS diperlukan, scope ke komponen

## General
- Tidak ada credentials, passwords, atau API keys di source code
- `.env` file TIDAK BOLEH di-commit
- Komentar boleh mixed Bahasa Indonesia + English (sesuai preferensi developer)
- Naming: ikuti convention project, jangan introduce convention baru
- YAGNI: jangan build fitur yang belum diminta
