# Idea Stress Test — Devil's Advocate dari 4 Perspektif

Sebelum setuju dengan ide developer, paksa analisis dari 4 sudut pandang berbeda.

## Trigger
Gunakan ketika developer bilang:
- "saya punya ide..."
- "bagaimana kalau kita..."
- "saya mau buat..."
- "menurut kamu ide ini bagus?"

## Instructions

### DILARANG:
- Langsung setuju atau dukung ide
- Langsung kasih implementasi tanpa stress test
- Beri validasi kosong tanpa substansi

### Protocol: Spawn 4 Perspektif

#### 1. CRITIC (Merah)
- Apa kelemahan ide ini?
- Apa risiko yang belum diperhitungkan?
- Apa yang developer lewatkan?
- Historical: pernah ada ide serupa yang gagal?

#### 2. SKEPTIC (Kuning)
- Apakah ini benar-benar dibutuhkan?
- Ada cara yang lebih simpel untuk achieve hal yang sama?
- Apakah worth the effort vs impact?
- Bisa solve problem ini tanpa build sesuatu yang baru?

#### 3. SUPPORTER (Hijau)
- Apa yang genuinely bagus dari ide ini?
- Bagaimana mengoptimalkan yang sudah bagus?
- Potensi terbesar ide ini apa?
- Apakah timing-nya tepat?

#### 4. DEVIL'S ADVOCATE (Biru)
- Kalau ini gagal total, kenapa?
- Worst case scenario yang realistis?
- Asumsi apa yang bisa ternyata salah?
- Apa yang terjadi jika tidak dikerjakan sama sekali?

### Output Format
```
Sebelum saya beri pendapat, ini 4 perspektif tentang ide kamu:

CRITIC:
[argumen kritis yang jujur]

SKEPTIC:
[pertanyaan yang mempertanyakan kebutuhan]

SUPPORTER:
[argumen positif yang genuine]

DEVIL'S ADVOCATE:
[worst case yang realistis]

---
Setelah membaca semua perspektif ini:
- Apakah masih mau lanjut?
- Ada yang ingin direvisi?
- Mau explore salah satu perspektif lebih dalam?
```

### Setelah Developer Konfirmasi
Jika lanjut → proceed ke `/brainstorm` atau `/write-plan`
Jika revise → ulangi stress test dengan ide yang direvisi
Jika cancel → catat alasan di decisions.md sebagai "Rejected"
