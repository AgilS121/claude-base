# Code Review — Review + Security Audit

Review code changes dengan fokus pada kebenaran, keamanan, dan pattern compliance.

## Instructions

### Step 1: Scope
Identifikasi apa yang di-review:
- Specific files yang ditunjuk developer, ATAU
- `git diff` untuk melihat semua perubahan, ATAU
- Seluruh modul/feature tertentu

### Step 2: Functional Review
Untuk setiap file/perubahan:
- Apakah logic benar? Trace input → output
- Apakah handle edge cases? (null, empty, duplicate, max length)
- Apakah error handling memadai?
- Apakah naming konsisten dengan project conventions?
- Apakah ada dead code atau commented-out code?

### Step 3: Security Checklist (WAJIB)

Scan untuk:
- [ ] **SQL Injection**: raw query tanpa parameter binding?
- [ ] **XSS**: user input di-render tanpa escape/sanitize?
- [ ] **CSRF**: form POST/PUT/DELETE tanpa CSRF protection?
- [ ] **Auth Bypass**: endpoint tanpa middleware auth?
- [ ] **Mass Assignment**: `$request->all()` tanpa filter?
- [ ] **Exposed Credentials**: password, API key, token di code/comment?
- [ ] **Hardcoded Config**: value yang seharusnya di `.env`?
- [ ] **Unvalidated Input**: user input tanpa validation rules?
- [ ] **File Upload**: tanpa validasi extension/size/mime?
- [ ] **Sensitive Data in Log**: password, token, PII di log output?
- [ ] **Logic Flaw**: business rules kritis (payment, discount, access) ada celah?

### Step 4: Pattern Compliance
- Apakah ikuti architecture pattern project? (MVC, Repository, Service layer)
- Apakah ikuti naming convention? (lihat stack profile)
- Apakah cache invalidation dihandle? (jika ubah data)
- Apakah consistent dengan code existing di sekitarnya?

### Step 5: Output Format
```
## Code Review: [scope]
Tanggal: [hari ini]

### CRITICAL (BLOCK — harus fix sebelum merge)
1. [file:line] — [issue] — [kenapa critical]

### WARNING (sebaiknya fix, boleh lanjut dengan catatan)
1. [file:line] — [issue] — [rekomendasi]

### SUGGESTION (nice to have)
1. [file:line] — [saran improvement]

### Security Audit
- SQL Injection: PASS/FAIL
- XSS: PASS/FAIL
- Auth: PASS/FAIL
- [dst...]

### Summary
- Total issues: [N critical, N warning, N suggestion]
- Recommendation: APPROVE / APPROVE WITH NOTES / REQUEST CHANGES
```

Jika ada CRITICAL issue → BLOCK, jangan approve.
