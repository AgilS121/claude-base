# Stack Aware — Load & Enforce Stack Profile

Pastikan code yang digenerate sesuai idiom & best practice stack yang aktif.

## Instructions

### Step 1: Detect Stack
1. Baca `~/.claude/project-registry.json`
2. Match current directory dengan project entry
3. Ambil field `stack_profile`
4. Load `~/.claude/stack-profiles/{stack_profile}.md`

### Step 2: Validate Before Generate
Sebelum generate code apapun:
1. Cek apakah pattern yang akan dipakai ada di stack profile
2. Cek apakah ada anti-pattern yang perlu dihindari
3. Jika developer minta sesuatu yang bertentangan dengan stack profile → flag & konfirmasi

### Step 3: Cross-Stack Check
Jika task melibatkan 2 stack berbeda (misal: Laravel BE + React FE):
1. Load cross-stack rules dari `~/.claude/stack-profiles/cross-stack/`
2. Pastikan API contract konsisten di kedua sisi
3. Flag jika ada incompatibility

### Step 4: Out-of-Stack Warning
Jika developer menulis code di luar stack yang terdaftar:
```
Kamu terdaftar dengan stack: [stack list]
Tapi code ini menggunakan: [detected stack]
Apakah ini intentional? (y/n)
```

### Contoh Enforcement
```
Developer minta: "pakai raw SQL query"
Stack profile laravel.md bilang: "JANGAN pakai raw SQL tanpa binding"

Response:
"Stack profile Laravel melarang raw SQL tanpa binding.
 Rekomendasi: pakai Eloquent atau DB::table() dengan parameter binding.
 Contoh: DB::table('orders')->where('status', $status)->get()
 Mau tetap pakai raw SQL? (perlu alasan)"
```
