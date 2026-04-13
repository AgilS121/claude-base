# Cross-Stack: Laravel Backend → React Frontend

> Migration guide untuk SIMLab v2: dari Laravel Blade proxy ke React SPA
> Detail endpoint mapping: `d:\HSD\SIMLAB\old-simlab-v2-fe\REACT_MIGRATION_CONTEXT.md`

---

## Architecture Shift

```
SEBELUM (Blade Proxy):
Browser → FE Laravel (port 8000) → Utility::HttpRequest() → BE API (port 8001) → MySQL

SESUDAH (React SPA):
Browser → React App (Vite dev/static) → axios → BE API (port 8001) → MySQL
```

FE Laravel layer dihilangkan — React langsung ke BE API.

---

## Auth Flow Migration

### Sebelum (Blade)
1. User login → FE Laravel → BE API → return JWT token
2. Token disimpan di PHP session
3. Setiap request: FE Laravel ambil token dari session → kirim ke BE via GuzzleHttp

### Sesudah (React)
1. User login → React → BE API → return JWT token
2. Token disimpan di httpOnly cookie (recommended) atau memory
3. Setiap request: axios interceptor auto-attach Bearer token
4. Refresh token flow: handle 401 → refresh → retry

---

## Mapping Patterns

| Laravel Blade | React Equivalent |
|---|---|
| `Controller@action` | React Router page component |
| `*.blade.php` view | `.tsx` component |
| `_partial.blade.php` | Reusable React component |
| `Utility::HttpRequest()` | `axios.get/post()` |
| `Cache::remember()` | React Query / SWR cache |
| `@csrf` | Not needed (JWT stateless) |
| `$request->session()` | React state / localStorage |
| Server-side form validation | Client-side + API validation |

---

## Migration Strategy (Phased)

### Phase A: Setup
- Scaffold React app (Vite + TypeScript)
- Setup axios client pointing to BE API
- Implement JWT auth flow
- Setup React Router matching existing URL structure

### Phase B: Migrate Read-Only Pages First
- Dashboard, list views, detail views
- Mapping: CGridView equivalent → React table component
- Data fetching: React Query for caching

### Phase C: Migrate Forms & Write Operations
- CRUD forms with validation
- ETag handling for optimistic locking
- File upload components

### Phase D: Migrate Complex Modules
- Order module (largest, most complex)
- Quotation module (pricing logic, caching)
- QC module (verification flows)

---

## API Endpoint Reference

BE API sudah siap — semua endpoint sudah REST.
Lihat `REACT_MIGRATION_CONTEXT.md` untuk daftar 100+ endpoints dengan:
- Method, path, params
- Response format
- Role-based access (19 roles)

---

## Rules
- JANGAN ubah BE API untuk accommodate React — React harus adapt ke existing API
- Kecuali: jika BE response format benar-benar tidak compatible → diskusikan dulu
- Maintain URL structure agar bookmarks/links tetap jalan
- Role-based access harus identik dengan Blade version
