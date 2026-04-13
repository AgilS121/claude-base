# Laravel 7-8 Stack Profile

> Berlaku untuk: simlab-v2-be, simlab-v2-fe, ppic-be, ppic-fe

## Sumber Referensi
- Laravel 8.x official docs
- Spatie coding guidelines
- Project-specific CLAUDE.md (jika ada di repo)

---

## Architecture Pattern

```
Route → Middleware → Controller → Service → Repository → Model → MySQL
                                         ↘ Utility.php (code gen, HTTP, email)
```

### Variasi per Project:
- **BE projects** (simlab-v2-be, ppic-be): Full stack Controller → Service → Repository → Model
- **FE projects** (simlab-v2-fe, ppic-fe): Controller → Utility::HttpRequest() → BE API (proxy layer, TIDAK akses DB langsung)

---

## Auth Pattern
- JWT via `tymon/jwt-auth`
- Bearer token di header: `Authorization: Bearer {token}`
- FE: token disimpan di session, dikirim ke BE via GuzzleHttp
- Middleware: `auth:api` (BE), `check.login` (FE)

## Response Format (BE)
```php
// BaseController.php
return response()->json([
    'success' => 1, // atau 0
    'message' => '...',
    'data' => $data
]);
```

## GuzzleHttp Proxy Pattern (FE)
```php
Utility::HttpRequest($method, $endpoint, $param, $param_type, $param_value, $customHeaders)
// Base URL dari .env API_URL
// Auto-include JWT Bearer token dari session
```

---

## Naming Conventions

| Entity | Convention | Contoh |
|---|---|---|
| Controller | PascalCase, dalam folder snake_case | `transaction/OrderController.php` |
| Model | PascalCase singular | `Order`, `Customer`, `Sample` |
| Table | snake_case plural (biasanya) | `orders`, `customers` |
| Migration | timestamp_snake_case | `2024_01_01_create_orders_table` |
| Route | kebab-case | `order/list`, `order-new/create` |
| Method | camelCase | `calculateDueDates()`, `getOrderList()` |
| Blade | action.blade.php | `read.blade.php`, `create.blade.php` |
| Blade partial | _name.blade.php | `_form.blade.php`, `_modal.blade.php` |
| Variable | $camelCase | `$queryParam`, `$cacheKey` |

---

## Known Gotchas (WAJIB INGAT)

### Naming Typos di DB
- `standart` (bukan `standard`) → foreign key: `standart_id`, table: `standart`, `standart_detail`
- `sub_total` (kolom DB) vs `subtotal` (Model appended attribute) — inconsistent
- JANGAN koreksi typo ini — sudah jadi foreign key di banyak tempat

### Soft Delete
- Beberapa project pakai kolom `trash = 1` untuk deleted (BUKAN Laravel SoftDeletes)
- Selalu cek model: ada `deleted_at` atau `trash`?
- Query harus filter: `where('trash', 0)` atau `whereNull('deleted_at')`

### Cache & ETag
- `Cache::remember($key, $ttl, fn() => ...)` — TTL 5-30 menit
- ETag untuk optimistic locking (OrderNew, Quotation, QC)
- Jika ubah data → pastikan cache invalidation (cek Observer pattern)
- Observer: OrderObserver, SampleObserver → auto invalidate cache

### Code Generation
- Format: `TYPE.YYMMSEQ` → `OD.2603001`, `SC.2603001`, `QT.2603001`
- Generated di `Utility.php`

---

## Anti-Patterns (JANGAN pakai)

| Salah | Benar | Alasan |
|---|---|---|
| Raw SQL tanpa binding | `DB::table()->where()` atau Eloquent | SQL injection |
| `$request->all()` di create/update | `$request->only([...])` atau `$request->validated()` | Mass assignment |
| Skip middleware di route | Selalu pakai middleware auth | Security bypass |
| Hard-code config value | Pakai `.env` + `config()` | Environment-specific |
| `dd()` di production code | Pakai `Log::info()` | Debug artifact |
| Skip validation di controller | Selalu `$request->validate()` atau FormRequest | Data integrity |

---

## Testing
- PHPUnit via `php artisan test`
- Feature test: `php artisan test --filter=ClassName`
- Pastikan test tidak depend on external service (mock jika perlu)
- Cek test coverage sebelum refactor

---

## Security Checklist
- [ ] SQL injection: semua query pakai binding/Eloquent?
- [ ] Mass assignment: `$fillable` atau `$guarded` di model?
- [ ] Auth: endpoint dilindungi middleware?
- [ ] CSRF: form POST/PUT/DELETE pakai `@csrf`?
- [ ] File upload: validasi extension & size?
- [ ] Sensitive data: tidak ada credentials di code/comment?
- [ ] .env: tidak di-commit ke git?

---

## Business-Specific Rules (Tim DTIT)
- MyISAM tables: **read-first** sebelum write (avoid table lock)
- Respect existing naming convention meskipun ada typo
- Jangan ubah struktur DB tanpa konfirmasi lead
- Utility.php adalah shared library — ubah dengan hati-hati
