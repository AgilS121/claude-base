# Living Docs — Auto-Update Documentation

Pastikan dokumentasi selalu sinkron dengan perubahan code.

## Instructions

### Step 1: Detect Documentation Impact
Setiap kali ada perubahan code, identifikasi:
1. Apakah ada file `.md` di project yang membahas area yang berubah?
2. Apakah ada comment/docblock yang perlu diupdate?
3. Apakah CURRENT_STATE.md perlu diupdate?
4. Apakah ada endpoint/API yang berubah signature-nya?

### Step 2: Auto-Update
Jika dokumentasi terpengaruh:
1. Tunjukkan ke developer: "Perubahan ini mempengaruhi dokumentasi di [file]"
2. Propose update documentation
3. Tunggu approval → baru update

### Step 3: Detect Stale Docs
Jika menemukan dokumentasi yang contradicts code:
```
PERINGATAN: Dokumentasi tidak sinkron!

File: [path/to/doc.md]
Isi doc: "[apa yang tertulis]"
Realita code: "[apa yang sebenarnya terjadi]"

Mau saya update dokumentasinya?
```

### Step 4: Documentation Locations
Per project, cek dan update:
- `CLAUDE.md` (in-repo) — architecture, rules, gotchas
- `~/.claude/project-docs/{slug}/CURRENT_STATE.md` — state terkini
- `~/.claude/project-docs/{slug}/MISTAKES.md` — jika fix bug
- `~/.claude/project-docs/{slug}/AUDIT_LOG.md` — log perubahan
- `~/.claude/team/knowledge-base/decisions.md` — jika ada keputusan arsitektur
- README / doc files di dalam repo

### Step 5: New Documentation
Jika area yang diubah BELUM ada dokumentasinya:
1. Buat skeleton dokumentasi baru
2. Minimal: purpose, key files, flow, gotchas
3. Simpan di lokasi yang tepat
4. Update CLAUDE.md project untuk reference file baru
