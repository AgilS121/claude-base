# Knowledge Capture

Panduan pakai `AUDIT_LOG.md`, `MISTAKES.md`, dan `CURRENT_STATE.md` sebagai sistem
knowledge management.

## Filosofi

**"Yang tidak tertulis akan terlupakan"** — setiap sesi kerja menghasilkan insight.
Kalau tidak di-capture, insight itu hilang saat sesi berikutnya atau saat orang lain
take over project.

3 jenis knowledge yang wajib di-capture:

1. **Apa yang sudah dilakukan** → `AUDIT_LOG.md`
2. **Apa yang sedang dikerjakan** → `CURRENT_STATE.md`
3. **Bug/gotcha yang ditemukan** → `MISTAKES.md`

## CURRENT_STATE.md

**Tujuan**: snapshot keadaan project saat ini — task aktif, task paused, blockers.

**Kapan di-update**:
- Saat mulai task baru (via `/task`)
- Saat task paused / diundur
- Saat task selesai
- Saat ada blocker baru

**Format**:
```markdown
# Current State — {project}
Last Updated: YYYY-MM-DD

## Task Aktif
### {TASK-ID} {judul}
- **Status**: in-progress / paused / done
- **Started**: YYYY-MM-DD
- **Files diubah**: [list]
- **Summary**: [1-2 paragraf]

## Terakhir Selesai
[task sebelumnya]

## Blockers
[kalau ada]

## Keputusan Penting
[decisions yang relevan]
```

**Prinsip**:
- **Append new**, **update existing** — jangan delete history mentah
- Task yang sudah done bisa di-archive ke section "Sudah Selesai"
- Max 5 task di "Terakhir Selesai" — older entries move to AUDIT_LOG

## AUDIT_LOG.md

**Tujuan**: append-only log setiap task yang selesai. Format minimal supaya mudah di-parse.

**Format**:
```
YYYY-MM-DD | {TASK-ID or action} | {files touched} | {result}
```

Contoh:
```
2026-04-11 | SIMLAB-V2-FE-260411-003 Format tanggal live preview | review-order/read.blade.php | done
2026-04-11 | SIMLAB-V2-FE-260411-002 Fix COA Release Date di live preview | ReviewOrderController.php, review-order/read.blade.php | done
```

**Prinsip**:
- **Append only** — jangan edit entry lama
- **1 line per task** — detail panjang di CURRENT_STATE.md, bukan di sini
- **Sort desc** (baru di atas) — biar cari latest gampang

## MISTAKES.md

**Tujuan**: capture bug / gotcha / anti-pattern supaya tidak repeat.

**Format**:
```markdown
## YYYY-MM-DD — [judul singkat]

- **Ditemukan saat**: [trace/debug/review/scan]
- **File**: `path/to/file:line`
- **Root cause**: [penjelasan teknis]
- **Fix**: [diff / langkah / "workaround"]
- **Impact**: low / medium / high
- **Related projects**: [project lain yang mungkin kena]
```

**Kapan di-isi**:
- Setelah debug bug yang non-trivial
- Saat review kode dan nemu anti-pattern
- Saat migrate/refactor dan nemu hidden behavior
- **Bukan** untuk bug trivial (typo, syntax error) yang langsung fix

**Prinsip cross-project**:
Setiap entry di MISTAKES.md WAJIB di-evaluasi: **apakah bug yang sama bisa ada di
project lain yang pakai stack sama?**

Kalau ya → tambah field `Related projects` + notify developer project lain.
Kalau tidak yakin → tanya Claude: "cek apakah pattern X ada di project Y"

## Cara Claude Pakai File-file Ini

Di `CLAUDE.md` global, ada protocol:
> Auto-Capture Knowledge (WAJIB — jangan tunggu disuruh)

Saat Claude nemu bug/gotcha, dia harus **LANGSUNG** tulis ke file — tanpa user minta.
User hanya review hasilnya.

Contoh flow:
1. User: "debug kenapa filter tanggal nggak jalan"
2. Claude: investigate → find root cause
3. Claude: tulis entry ke `MISTAKES.md`
4. Claude: apply fix
5. Claude: update `CURRENT_STATE.md` (status task)
6. Claude: append ke `AUDIT_LOG.md` (setelah user confirm done)

## Tips

### Bikin Task ID Bermakna
Format: `{PROJECT-SLUG}-{YYMMDD}-{NNN}`
- `SIMLAB-V2-FE-260411-003` → project simlab-v2-fe, tanggal 2026-04-11, task #3 hari itu

### Summary Ringkas
Di `CURRENT_STATE.md`, summary = max 3-5 kalimat. Detail teknis yang panjang simpan
di commit message atau PR description.

### Link ke Commit
Kalau task sudah commit, tambahkan hash di summary:
```
- **Commit**: 509e67ca fix: matrix in order
```

### Jangan Over-capture
Bug yang langsung obvious (typo, missing import) **tidak perlu** di `MISTAKES.md`.
Fokus ke bug yang **surprising** atau **membutuhkan insight**.

### Review Weekly
Sekali seminggu, buka `MISTAKES.md` dan `AUDIT_LOG.md` — cari pattern, identifikasi
area yang butuh refactor atau training tim.

## Integration dengan MCP

MCP orchestrator punya tool:
- `get_current_state({slug})` — baca CURRENT_STATE.md
- `list_recent_tasks({slug, limit})` — parse AUDIT_LOG.md
- `get_mistakes({slug})` — baca MISTAKES.md

Ini dipakai Claude di Session Start Protocol untuk load context tanpa rebuild dari nol.
