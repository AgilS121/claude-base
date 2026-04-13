# TDD — Test-Driven Development Workflow

Enforce test-first development: tulis test dulu, baru implementasi.

## Instructions

### Cycle: RED → GREEN → REFACTOR

#### 1. RED — Tulis Test Dulu
```
Sebelum menulis code apapun:
1. Tentukan behaviour yang diinginkan
2. Tulis test yang mengekspresikan behaviour tersebut
3. Jalankan test → HARUS FAIL (RED)
4. Jika test langsung PASS → test salah, revisi test
```

#### 2. GREEN — Implementasi Minimal
```
1. Tulis code MINIMAL agar test pass
2. Jangan over-engineer — just make it work
3. Jalankan test → HARUS PASS (GREEN)
4. Jika masih FAIL → fix code, bukan test
```

#### 3. REFACTOR — Clean Up
```
1. Refactor code tanpa mengubah behaviour
2. Jalankan test → HARUS tetap PASS
3. Jika test FAIL setelah refactor → undo refactor, coba lagi
```

### Stack-Specific Test Patterns

#### Laravel (PHPUnit)
```php
// Feature Test
class OrderTest extends TestCase
{
    public function test_can_create_order()
    {
        $response = $this->postJson('/api/order/add', [
            'customer_id' => 1,
            'items' => [...]
        ]);
        $response->assertStatus(200);
        $response->assertJson(['success' => 1]);
    }

    public function test_cannot_create_order_without_customer()
    {
        $response = $this->postJson('/api/order/add', []);
        $response->assertStatus(422);
    }
}
```

Run: `php artisan test --filter=OrderTest`

#### Yii 1
Yii 1 project mungkin tidak punya test suite.
Jika tidak ada → skip TDD, pakai manual verification.
Jangan setup testing framework baru tanpa konfirmasi developer.

### Rules
- JANGAN menulis implementasi sebelum test ada
- Jika Claude menulis code sebelum test → HAPUS code, tulis test dulu
- Setiap test harus punya nama deskriptif: `test_[behaviour]`
- Satu test = satu assertion (idealnya)
- Test HARUS bisa jalan independent (tidak depend on test lain)
