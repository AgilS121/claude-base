# Capture Decision — Catat Keputusan Teknis

Catat setiap keputusan teknis/arsitektur penting sebagai Architectural Decision Record (ADR).

## Instructions

### Kapan Dipakai
- Memilih antara 2+ pendekatan teknis
- Menambah/menghapus dependency
- Mengubah arsitektur atau pattern
- Keputusan yang akan mempengaruhi development ke depan
- Keputusan yang sulit di-reverse

### Step 1: Gather Context
Tanyakan (jika belum jelas):
1. Apa keputusan yang dibuat?
2. Kenapa perlu diputuskan sekarang?
3. Opsi apa saja yang dipertimbangkan?
4. Kenapa opsi ini yang dipilih?
5. Project mana yang terpengaruh?

### Step 2: Record
Append ke 2 tempat:

#### A. Project AUDIT_LOG.md
```
[tanggal] | DECISION | [judul keputusan] | [keputusan singkat]
```

#### B. Team decisions.md
```markdown
## ADR-[nomor] — [Judul Keputusan]
**Tanggal**: [hari ini]
**Status**: Accepted
**Project**: [project yang terpengaruh]
**Diputuskan oleh**: [nama developer]

### Konteks
Kenapa keputusan ini perlu dibuat.

### Opsi yang Dipertimbangkan
1. [Opsi A] — pros: ... | cons: ...
2. [Opsi B] — pros: ... | cons: ...

### Keputusan
[Opsi yang dipilih] karena [alasan utama].

### Konsekuensi
- Positif: ...
- Negatif: ...
- Risiko: ...
```

### Step 3: Konfirmasi
Tampilkan record ke developer untuk validasi sebelum save.
