# How to Add a New Stack Profile

Kalau kamu kerja di stack yang belum ada profilenya di `stack-profiles/`,
ini cara tambahnya.

## Kapan Perlu

- Tim mulai pakai stack baru (misal Python Django, Go Fiber)
- Project existing yang pakai stack belum ter-cover
- Kamu mau standarisasi idiom untuk stack tertentu

## Step 1: Copy Template

```powershell
cd claude-base-dtit
copy stack-profiles/_template.md stack-profiles/python-django.md
```

## Step 2: Isi Setiap Section

Ikut template di `_template.md`. Minimum yang harus diisi dengan konten real:

1. **Runtime & Version** — versi spesifik yang dipakai tim
2. **Framework Conventions** — MVC, routing, middleware, dll
3. **Directory Layout** — struktur folder khas
4. **Naming Conventions** — semua naming rule (file, class, route, DB)
5. **Common Gotchas** — **MINIMAL 3 entry** dari pengalaman real
6. **Security Checklist** — minimum 5 item
7. **References** — link docs resmi

Yang optional tapi disarankan:
- Testing Approach
- Performance Notes
- Debugging Tips

## Step 3: Review Ke Lead Stack

Kalau ada lead stack di tim (misal lead backend JS), minta dia review draft kamu.
Tujuan:
- Konsistensi dengan convention yang sudah dipakai
- Tidak ada rekomendasi yang kontradiksi dengan decision lama
- Gotcha yang kamu tambah sudah di-validate (bukan hanya "saya pernah ketemu sekali")

## Step 4: Test Di Project Real

Load stack profile di Claude Code untuk project yang pakai stack ini:

```
/stack-aware
```

Test beberapa task biasa:
- Minta Claude generate controller/component
- Minta Claude review code
- Minta Claude debug bug

Verifikasi Claude memang pakai idiom yang kamu tulis.

## Step 5: PR ke Repo

```bash
git checkout -b stack/add-python-django
git add stack-profiles/python-django.md
git commit -m "feat: add python-django stack profile"
git push -u origin stack/add-python-django
# Create PR → review → merge
```

## Step 6: Update README

Append row baru di `stack-profiles/README.md` → tabel "Available Profiles".

## Step 7: Notify Tim

Di channel DTIT: "Stack profile `{name}` sudah merge. Jalankan `./update.ps1`
untuk dapat stack profile baru."

## Checklist Sebelum Merge

- [ ] Semua section di template terisi (minimal yang required)
- [ ] Common Gotchas ada 3+ entry real (bukan placeholder)
- [ ] Naming convention table lengkap
- [ ] Security checklist minimum 5 item
- [ ] Reference link valid
- [ ] Reviewed by lead stack (atau 1 senior developer)
- [ ] Tested di 1 project real

## Template untuk Gotcha Entry

```markdown
### YYYY-MM-DD — [judul singkat]

- **Konteks**: [kapan bug ini muncul]
- **Gejala**: [apa yang terlihat user/developer]
- **Root cause**: [penjelasan teknis]
- **Solusi**: [cara fix]
- **Prevention**: [cara hindari kedepan]
- **Reporter**: [nama developer yang nemu]
```
