# Brainstorm — Explore Requirements Sebelum Coding

Jalankan brainstorm session untuk explore ide dan requirements sebelum mulai implementasi.

## Instructions

### Step 1: Pahami Tujuan
Tanyakan ke developer:
1. **Apa yang ingin dicapai?** (outcome, bukan cara)
2. **Siapa yang akan pakai fitur ini?** (end user, admin, developer?)
3. **Constraint apa yang sudah diketahui?** (deadline, tech limitation, dependency)

### Step 2: Explore Pendekatan
Generate 3-5 pendekatan berbeda:
- Untuk setiap pendekatan, jelaskan:
  - Cara kerja singkat
  - Pros
  - Cons
  - Effort estimate (low/medium/high)
  - Risiko

### Step 3: Edge Cases
Identifikasi edge cases yang mungkin:
- Null/empty input
- Concurrent access
- Large data volume
- Permission/role variations
- Error scenarios

### Step 4: Output
Format output sebagai spec bullet points:
```
## Brainstorm: [Nama Fitur]

### Tujuan:
- ...

### Pendekatan yang Dipertimbangkan:
1. [Pendekatan A] — Pros: ... | Cons: ... | Effort: ...
2. [Pendekatan B] — Pros: ... | Cons: ... | Effort: ...
3. [Pendekatan C] — Pros: ... | Cons: ... | Effort: ...

### Rekomendasi: [Pendekatan X]
Alasan: ...

### Edge Cases:
- ...

### Open Questions:
- ...
```

### Step 5: Tunggu Approval
JANGAN lanjut ke implementasi sebelum developer approve pendekatan.
Setelah approve → sarankan `/write-plan` untuk buat implementation plan.
