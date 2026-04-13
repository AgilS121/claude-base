# Multi-Stack Developer

Kalau kamu fullstack (touch PHP + JS / atau lebih), ini cara optimal pakai setup ini.

## Masalah

Developer fullstack sering switch antar project dengan stack berbeda. Risiko:
- Claude bingung antara idiom PHP vs JS
- Stack profile yang "salah" ke-load untuk project yang "benar"
- Task di project A bocor konteks ke project B

## Solusi: Focus-Based Context

Setup ini pakai `current-focus.json` untuk menentukan **project aktif** (bukan cuma `pwd`).
Jadi kamu bisa work di folder apa saja, Claude tetap tahu konteks dari focus.

## Pattern Kerja

### Pattern 1: Fokus Single Project
```
saya mau fokus di simlab-v2-fe hari ini
```

Claude switch fokus → hanya load 1 project. Stack profile = `laravel-8`.

### Pattern 2: Fokus Multi-Project (FE + BE)
```
saya mau fokus di simlab-v2 (fe + be)
```

Claude switch fokus ke **2 project sekaligus** (`simlab-v2-fe` + `simlab-v2-be`).
Cara kerjanya:
- Load 2 stack profile (mungkin sama: `laravel-8`)
- Load 2 CURRENT_STATE.md
- Gabungkan task history dari 2 AUDIT_LOG.md
- Klo task menyentuh file di BE, Claude tahu itu masih in-scope

Di `current-focus.json`:
```json
{
  "mode": "focused",
  "focus_label": "SIMLab v2 (FE + BE)",
  "active_projects": ["simlab-v2-fe", "simlab-v2-be"]
}
```

### Pattern 3: Cross-Stack Fullstack Project
```
saya mau fokus ke project dashboard (next.js + node-express API)
```

Meski 1 project, kamu touch 2 stack. Claude load `next-js.md` + `node-express.md`
bersamaan.

### Pattern 4: Mode General
Kalau kamu kerja sporadic ke banyak project berbeda dalam 1 hari:
```
mode general
```

Claude akan derive project context dari `pwd` per-perintah. Lebih fleksibel tapi
context per-task tidak persistent.

## Switching Context

```
fokus ke ppic
```

Claude check `available_focus_profiles` di `current-focus.json` → switch.

Kalau profile tidak ada:
```
profil fokus 'ppic' tidak terdaftar. Mau saya buat? (y/n)
```

## Naming Identity

Kalau kamu primary PHP tapi kadang JS:
- Primary: `agent-identity.json` = PHP (dari install)
- Kalau task berat di JS, kamu bisa **override** sementara:
  ```
  load identity JS
  ```
  Claude baca `~/.claude/agent-identities/js.json` dan pakai untuk sesi ini
- Atau edit `agent-identity.json` manual — tidak direkomendasikan kalau sering switch

Alternative: buat symlink / wrapper script yang copy identity sesuai env var.

## Stack Profile Conflict

Kadang 2 stack punya rule konflik:
- Laravel: "semua route di `routes/web.php`"
- Express: "route di `src/routes/{module}.route.ts`"

Claude resolusi konflik:
1. Project aktif → stack profile project aktif menang
2. Kalau ambigu → tanya: "Apakah ini untuk sisi FE atau BE?"
3. Cross-stack principle (`stack-profiles/cross-stack/*.md`) → applicable ke keduanya

## Tips

### Bikin Focus Profile Baru
Edit `~/.claude/current-focus.json` section `available_focus_profiles`:
```json
{
  "dashboard-fullstack": {
    "label": "Dashboard (Next + Node API)",
    "active_projects": ["dashboard-fe", "dashboard-api"]
  }
}
```

Lalu switch:
```
fokus ke dashboard-fullstack
```

### Parallel Work (FE + BE Bersamaan)
Untuk task yang butuh ubah FE + BE:
```
saya akan tambah endpoint baru di BE lalu panggil dari FE. fokus ke simlab-v2
```

Claude breakdown per-project:
1. BE: tambah route + controller method
2. FE: tambah Utility::HttpRequest call
3. Test end-to-end

### Commit Cross-Project
Commit PHP (BE) dan PHP (FE) ke 2 repo berbeda. Jangan mix di 1 commit.
Di AUDIT_LOG, tulis task ID yang sama di kedua repo:
```
# simlab-v2-be/AUDIT_LOG.md
2026-04-11 | SIMLAB-V2-260411-005 (BE part) Add /orders/recalc endpoint | ... | done

# simlab-v2-fe/AUDIT_LOG.md
2026-04-11 | SIMLAB-V2-260411-005 (FE part) Call /orders/recalc | ... | done
```

Ini membuat traceability lintas repo.

## Anti-pattern

- ❌ **Copy-paste idiom PHP ke JS**: misal naming `$camelCase` di TypeScript
- ❌ **Pindah fokus tanpa commit**: task in-progress di project A hilang konteks
- ❌ **Ignore focus, rely pwd**: Claude nggak tahu konteks project lain
- ❌ **1 repo untuk FE + BE**: split per-concern lebih baik untuk tracking
