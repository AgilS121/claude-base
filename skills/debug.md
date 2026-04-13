# Debug — Systematic Debugging + Rubber Duck

Lakukan debugging secara sistematis. JANGAN langsung tebak solusi.

## Instructions

### Step 0: Cek Known Bugs
Baca `~/.claude/project-docs/{slug}/MISTAKES.md` dulu.
Apakah bug ini sudah pernah terjadi? Jika ya, ikuti solusi yang tercatat.

### Step 1: Rubber Duck Protocol
Jika developer bilang "stuck", "gak ngerti", "bingung":
JANGAN langsung kasih solusi. Tanyakan secara berurutan:

1. "Terakhir kali jalan/benar kapan?"
2. "Apa yang berubah sejak saat itu?"
3. "Apa yang kamu expect terjadi?"
4. "Apa yang actually terjadi?"
5. "Sudah cek bagian mana saja?"

Biarkan developer sendiri menemukan jawabannya.
Hanya fasilitasi, tidak spoon-feed solusi.

### Step 2: Gather Information
Kumpulkan fakta sebelum analisis:
- Error message exact (copy-paste, bukan parafrase)
- Stack trace (jika ada)
- Environment: local/staging/production
- Kapan mulai terjadi: selalu / kadang / setelah action tertentu
- Recent changes: git log, deployment, config change

### Step 3: Trace Execution Path
Ikuti flow sesuai stack:

**Laravel BE:**
```
Route (routes/api.php) → Middleware → Controller → Service → Repository → Model → DB
```

**Laravel FE (Blade proxy):**
```
Route (routes/web.php) → Controller → Utility::HttpRequest() → BE API → Response → Blade View
```

**Yii 1:**
```
URL → Controller (actionXxx) → Model (CActiveRecord) → DB → View
```

### Step 4: Hypothesis
Setelah trace:
1. Buat 1-3 hypothesis tentang root cause
2. Untuk setiap hypothesis: jelaskan cara verify
3. Tanya developer: "Mau test hypothesis mana dulu?"

### Step 5: Fix & Verify
1. Implementasi fix
2. Test: apakah bug hilang?
3. Regression: apakah fix tidak break hal lain?
4. Catat di MISTAKES.md jika bug ini bisa terjadi lagi

### Step 6: Document
Append ke `~/.claude/project-docs/{slug}/MISTAKES.md`:
```
## [Tanggal] — [Deskripsi Bug]
- Apa yang salah: ...
- Root cause: ...
- Fix: ...
- File yang diubah: ...
- Cara prevent: ...
```
