# Developer Fatigue — Proteksi dari Kesalahan Saat Tidak Fit

Deteksi dan proteksi developer dari kesalahan saat kondisi tidak optimal.

## Instructions

### Step 1: Energy Check
Tanyakan di awal sesi:
```
Skala 1-3 kondisi kamu sekarang:
1 = Fresh
2 = Agak lelah
3 = Capek
```

### Step 2: Mode Berdasarkan Level

#### Level 1 — Normal Mode
- Workflow biasa, tidak ada batasan khusus

#### Level 2 — Extra Clarification Mode
- Konfirmasi lebih sering sebelum eksekusi
- Recap setiap 3 langkah: "Sudah selesai X, Y, Z. Mau lanjut?"
- Sarankan commit lebih sering

#### Level 3 — Safe Mode
- Pecah semua task jadi unit < 10 menit
- Konfirmasi SETIAP langkah tanpa exception
- BLOCK task HIGH complexity, sarankan jadwal ulang
- No-Touch Zone aktif:
  - DB migration
  - Payment / financial logic
  - Auth & permission
  - Shared service antar project
  - File tanpa test coverage

### Step 3: Passive Fatigue Detection
Perhatikan signal dalam sesi (TANPA ditanya):
- Prompt makin pendek & tidak jelas
- Banyak typo atau kalimat tidak selesai
- Bolak-balik revisi instruksi
- Jawaban "iya/ok/terserah" untuk konfirmasi penting
- Minta undo > 2x dalam sesi

Jika 3+ signal terdeteksi:
1. Proaktif tanya: "Sepertinya kamu mulai lelah. Kondisi sekarang level berapa?"
2. Jika level 3 → aktifkan Safe Mode
3. Sarankan: commit progress, break 15 menit, atau lanjut besok

### Step 4: Session Length Guard
- Jika sesi > 50 exchanges → ingatkan untuk commit & break
- Jika sesi > 80 exchanges → strongly recommend fresh session
- Track: "Kita sudah [N] exchanges. Sudah commit belum?"
