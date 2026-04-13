# Task — Catat & Track Task ke File

Setiap tugas WAJIB dicatat ke file agar memory stabil dan hemat token.
Jangan andalkan context/memory — tulis ke file.

## Instructions

### Saat Menerima Task Baru
1. Baca `~/.claude/project-docs/{slug}/NEXT_TASKS.md` untuk context
2. Catat task baru ke `~/.claude/project-docs/{slug}/CURRENT_STATE.md`:

```markdown
## Task Aktif
### [TASK-ID] [Judul singkat]
- **Status**: in-progress
- **Mulai**: [tanggal jam]
- **Deskripsi**: [apa yang diminta developer]
- **Project**: [project-id]
- **Files terlibat**: [list file yang akan diubah]
- **Token usage (est.)**: start=[N] tokens   _(diisi saat task dimulai)_
- **Plan**:
  1. [ ] Step 1
  2. [ ] Step 2
  3. [ ] Step 3
```

### Saat Progress
Update checklist di CURRENT_STATE.md:
```
  1. [x] Step 1 — selesai [jam]
  2. [ ] Step 2 — sedang dikerjakan
  3. [ ] Step 3
```

### Saat Selesai
1. Update CURRENT_STATE.md:
```markdown
## Task Aktif
(kosong)

## Terakhir Selesai
### [TASK-ID] [Judul]
- **Status**: done
- **Selesai**: [tanggal jam]
- **Files diubah**: [list]
- **Summary**: [apa yang dilakukan]
- **Token usage (est.)**: start=[N] → end=[M] → delta=[M-N] tokens
```

2. Append ke AUDIT_LOG.md (format dengan kolom token):
```
[tanggal jam] | [task-id] [judul] | [files] | [tokens delta] | done
```
Contoh:
```
2026-04-11 14:30 | SIMLAB-V2-FE-260411-001 Message Board filter | read.blade.php | ~8.5k | done
```

3. Jika ada follow-up task → tambahkan ke NEXT_TASKS.md

### Saat Sesi Baru (Resume)
1. Baca CURRENT_STATE.md → cek apakah ada task yang belum selesai
2. Jika ada → tanya developer: "Ada task [ID] yang belum selesai. Mau lanjut atau abandon?"
3. Jika tidak ada → tanya: "Mau kerjakan apa?"

### Task ID Format
```
[PROJECT]-[YYMMDD]-[SEQ]
Contoh: PPIC-BE-260410-001
```

### Graph-first Navigation (WAJIB — hemat token)

Prinsip: kalau user merujuk **satu fungsi / satu lokasi**, jangan baca file
utuh. Lompat langsung ke lokasi itu. Bayangkan codebase sebagai graph dan
kamu query 1 node, bukan Read 1 file.

**Aturan**:

1. **Punya symbol index di project CLAUDE.md?** → baca index, lompat langsung.
   Tidak perlu trace ulang. Kalau perlu verifikasi line number geser, pakai
   Grep dengan nama fungsi (bukan line number).

2. **Tidak ada di index?** → pakai tool dengan urutan ini (dari paling hemat):

   **a. Grep dengan context flag** (~0.3-0.8k per call):
   ```
   Grep pattern="function fetchDataReview" -A 25 -n
   ```
   Cocok untuk: fetch 1 method kecil-medium, tahu nama persisnya.

   **b. Grep 2-step** (~0.5k total):
   ```
   Step 1: Grep "fetchDataReview" -n       → dapat line N
   Step 2: Read file offset=N limit=25     → baca tepat 25 baris
   ```
   Cocok untuk: fetch tepat 1 method tanpa noise, perlu presisi lines.

   **c. Read dengan offset+limit** (~1-2k):
   ```
   Read file offset=540 limit=30
   ```
   Cocok untuk: sudah tahu range lines dari index/grep sebelumnya.

   **d. Subagent Explore** (~1-2k karena subagent-nya di-compress):
   Cocok untuk: scope investigasi belum jelas, perlu cari di banyak file,
   atau grep saja tidak cukup. Subagent return summary, bukan raw dump.

   **e. Read tanpa limit** (~3-15k — PALING BOROS, hindari):
   HANYA boleh kalau: file kecil (<100 baris), atau memang perlu seluruh file.

3. **Wajib update symbol index** di project CLAUDE.md setelah trace selesai
   → section `## Symbol Index` dengan format:
   ```
   - **Nama step/flow**: `file/path.ext:line` `functionName()` — deskripsi singkat
   ```
   Anchor pakai nama fungsi, bukan line number (line geser seiring waktu).

4. **JANGAN Read range besar "biar aman"**. Kalau ragu mana yang perlu,
   Grep dulu untuk narrow down, baru Read targeted.

5. **Bookkeeping update** → pakai `Edit` dengan old_string/new_string yang
   tepat, JANGAN `Write` ulang file CURRENT_STATE/AUDIT_LOG penuh. Write full
   = 2x cost (input + echo).

**Contoh hemat vs boros (real dari sesi sebelumnya)**:
| Skenario | Boros | Hemat |
|---|---|---|
| Cari method `fetchDataReview` | Read file 1-600 (~8k) | Grep -A 25 (~0.5k) |
| Lihat `renderLivePreview` body | Read 657-780 (~3k) | Grep -A 130 -n atau offset+limit 120 baris (~2k kalau memang butuh semua, tapi biasanya cukup 30 baris) |
| Update CURRENT_STATE tambah 1 task | Write full 80 baris (~3k bolak-balik) | Edit 5 baris (~0.3k) |

### Token Usage Audit (WAJIB)

Tujuan: tracking berapa banyak token yang dihabiskan per task agar PM bisa
audit efisiensi & developer sadar biaya. Ini ESTIMASI, bukan angka persis.

**Yang dihitung = DELTA context baru selama task** (bukan total context session):
- **JANGAN** hitung CLAUDE.md global, MEMORY.md, project-docs yang sudah
  loaded di awal sesi — itu sunk cost sesi, bukan biaya task
- **JANGAN** hitung system prompt — konstanta, bukan variable per task
- **HITUNG hanya** apa yang benar-benar masuk context BARU sejak task dimulai:
  tool result (Read/Grep/Bash), assistant output text, user prompt tambahan,
  tool call overhead

**Breakdown by kategori (untuk audit)**:
- **Investigation** (trace, grep, subagent): berapa token dihabiskan untuk
  "mencari tahu"
- **Execution** (Edit, Write file code): berapa token untuk "mengubah"
- **Bookkeeping** (update CURRENT_STATE, AUDIT_LOG): overhead administrasi

Kalau Investigation dominan (>50% total), itu signal: symbol index belum
lengkap / tool call strategy kurang hemat → perbaiki untuk task berikutnya.

**Catatan prompt caching**: angka yang dicatat adalah "context delta", BUKAN
billed tokens. Dengan prompt caching, tool result yang diulang bisa ~90% lebih
murah di level billing. Jadi angka AUDIT_LOG adalah upper bound biaya riil.

**Shortcut estimasi cepat (heuristic ~4 char = 1 token)**:
- Grep `-A N` result ≈ 0.2-0.8k per call (tergantung N)
- Grep `files_with_matches` ≈ <0.2k
- Read offset+limit (20-30 baris) ≈ 0.5-1k
- Read tanpa limit, file medium (200-400 baris) ≈ 2-5k
- Read tanpa limit, file besar (500+ baris) ≈ 5-15k (**hindari**)
- Subagent report ≈ ukuran return text / 4 (biasanya 1-3k, jauh lebih hemat
  dari dump raw file, karena subagent di-compress)
- Edit kecil (1-10 baris diff) ≈ 0.3-0.8k
- Write file penuh (50-100 baris) ≈ 2-4k (input + echo)
- Assistant text output ≈ panjang output text / 4
- Bulatkan ke 0.5k terdekat (contoh: ~8.5k, ~12k, ~3k)

**Target realistis** (pakai graph-first + symbol index):
- Edit kecil, lokasi sudah di-index: **~2-3k**
- Edit medium, fitur baru di 1 file: **~5-8k**
- Bug fix dengan trace terbatas: **~10-15k**
- Investigasi multi-file kompleks: **~20-30k** (unavoidable)
- Kalau angka aktual >2x target → audit tool strategy-nya, kemungkinan
  ada Read tanpa limit yang bisa diganti Grep targeted

**Kalau ragu** → tulis range: `~8-12k` atau `~10k±2k`. Jangan palsukan presisi.

**Contoh entry AUDIT_LOG.md**:
```
2026-04-11 10:15 | SIMLAB-V2-FE-260411-001 Trace message board | read.blade.php | ~6k | done
2026-04-11 14:30 | PPIC-BE-260411-002 Fix invoice calc | InvoiceService.php, tests | ~12k | done
```

**Kalau task dibatalkan / abandoned** → tetap catat dengan status `abandoned`
dan delta token sampai saat abandon, supaya tetap terhitung di audit.

### Kenapa Catat ke File?
- Context window terbatas — file persistent
- Sesi baru tidak perlu re-explain task
- PM bisa review progress tanpa tanya developer
- Audit trail otomatis
- Hemat token karena Claude baca file, bukan recall dari memory
