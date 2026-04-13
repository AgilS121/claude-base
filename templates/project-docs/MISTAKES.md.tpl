# Mistakes Log — {{PROJECT_NAME}}

> Append-only log untuk bug / gotcha / anti-pattern yang ditemukan. Tujuan:
> sesi berikut (atau developer lain) tidak perlu debug ulang bug yang sama.
>
> **Cross-project**: setiap entry harus di-evaluasi apakah pattern yang sama bisa
> ada di project lain yang pakai stack sama.

---

## Format Entry

```markdown
## {YYYY-MM-DD} — [judul bug/gotcha singkat]

- **Ditemukan saat**: [trace/debug/review/scan/user-report]
- **File**: `path/to/file.ext:line`
- **Root cause**: [penjelasan teknis]
- **Fix**: [diff / langkah / "workaround"]
- **Impact**: [low/medium/high]
- **Related projects**: [project lain yang mungkin punya bug serupa]
```

---

## Entries

_Append di bawah ini setiap kali ketemu bug._
