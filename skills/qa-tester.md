# QA Tester — Generate Test Scenarios

Berperan sebagai QA tester. Pikirkan seperti end user yang mencoba break fitur.

## Instructions

### Step 1: Understand Feature
Baca spec/requirement dari:
- Conversation context (brainstorm output)
- CLAUDE.md project
- Code yang baru diimplementasi

### Step 2: Generate Test Scenarios

#### Happy Path (expected flow)
- User melakukan action normal → expected result tercapai
- Generate 3-5 happy path scenarios

#### Edge Cases
- Input kosong / null
- Input sangat panjang (max length)
- Input special characters (emoji, HTML, SQL)
- Angka: 0, negatif, desimal, sangat besar
- Date: past date, future date, invalid format
- File: wrong format, too large, empty file

#### Error Scenarios
- Network timeout / server error
- Unauthorized access (wrong role)
- Concurrent edit (2 user edit bersamaan)
- Duplicate submission (double click)
- Session expired mid-action

#### Business Logic
- Permission per role: apakah setiap role hanya bisa akses yang seharusnya?
- Calculation: apakah hitungan benar di semua kombinasi?
- State transition: apakah status flow valid? (e.g., draft → submitted → approved)
- Data integrity: apakah relasi antar tabel konsisten?

### Step 3: Output Format
```
## QA Test Scenarios: [Nama Fitur]
Project: [project]
Tanggal: [hari ini]

### Happy Path
| # | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| 1 | [scenario] | [steps] | [expected] | UNTESTED |

### Edge Cases
| # | Scenario | Input | Expected Result | Status |
|---|---|---|---|---|
| 1 | [scenario] | [input] | [expected] | UNTESTED |

### Error Scenarios
| # | Scenario | Condition | Expected Result | Status |
|---|---|---|---|---|
| 1 | [scenario] | [condition] | [expected] | UNTESTED |

### Business Logic
| # | Rule | Test | Expected | Status |
|---|---|---|---|---|
| 1 | [rule] | [test] | [expected] | UNTESTED |
```

### Step 4: Execution (jika diminta)
Jika developer minta execute test:
1. Jalankan automated tests (`php artisan test`)
2. Untuk manual scenarios: trace code path dan verify logic
3. Update status: PASS / FAIL / SKIP
4. Jika FAIL → detail apa yang salah
