# Write Plan — Buat Implementation Plan

Buat implementation plan yang detail sebelum mulai coding.

## Instructions

### Step 1: Analisis Task
1. Baca context project aktif (CLAUDE.md, CURRENT_STATE.md)
2. Identifikasi scope: file apa saja yang terpengaruh
3. Identifikasi dependency: module/service lain yang terkait

### Step 2: Breakdown
Pecah task menjadi sub-tasks yang masing-masing bisa diselesaikan dalam 5-10 menit:
- Setiap sub-task harus spesifik dan actionable
- Include file path yang akan diubah
- Include function/method yang akan dimodifikasi

### Step 3: Risk Assessment
Untuk setiap sub-task, identifikasi:
- Apakah menyentuh shared code?
- Apakah ada side effects ke modul lain?
- Apakah perlu migration DB?
- Apakah perlu update test?

### Step 4: Output Format
```
## Plan: [Nama Task]
Tanggal: [hari ini]
Project: [project aktif]

### Prerequisites:
- [ ] ...

### Steps:
1. [ ] [Deskripsi] — File: `path/to/file.php` — Risiko: rendah/sedang/tinggi
2. [ ] [Deskripsi] — File: `path/to/file.php` — Risiko: rendah/sedang/tinggi
3. [ ] ...

### Files yang Akan Diubah:
- `path/to/file1.php` — alasan
- `path/to/file2.php` — alasan

### Risiko & Mitigasi:
- Risiko: ... → Mitigasi: ...

### Test Plan:
- [ ] ...

### Definition of Done:
- [ ] Semua step selesai
- [ ] Test pass
- [ ] No regression
- [ ] CURRENT_STATE.md updated
```

### Step 5: Tunggu Approval
Tampilkan plan → tunggu developer approve atau revise.
Setelah approve → sarankan `/execute-plan` untuk mulai eksekusi.
