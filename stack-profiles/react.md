# React Stack Profile

> Berlaku untuk: future projects (simlab-v2 FE migration planned)
> Reference: `REACT_MIGRATION_CONTEXT.md` di simlab-v2-fe repo

## Sumber Referensi
- React official docs (react.dev)
- Airbnb React Style Guide

---

## Architecture Pattern

```
App → Router → Pages → Components
                    ↘ Hooks → API Client → Backend
                    ↘ Context/Store → Global State
```

---

## Component Pattern (Functional + Hooks)

```tsx
import { useState, useEffect, useCallback } from 'react'

interface Props {
  title: string
  onUpdate: (value: string) => void
}

export function OrderList({ title, onUpdate }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchItems().then(setItems).finally(() => setLoading(false))
  }, [])

  const handleClick = useCallback((id: string) => {
    onUpdate(id)
  }, [onUpdate])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>{title}</h1>
      <ul>
        {items.map(item => (
          <li key={item.id} onClick={() => handleClick(item.id)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Custom Hook Pattern

```tsx
function useOrders(status?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getOrders({ status })
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [status])

  return { orders, loading, error }
}
```

---

## Anti-Patterns

| Salah | Benar | Alasan |
|---|---|---|
| Class components di code baru | Functional components + hooks | Modern React |
| Props drilling 3+ levels | Context atau state management | Maintainability |
| `useEffect` tanpa dependency array | Selalu specify deps | Infinite loop |
| Mutate state langsung | `setX(newValue)` | React state immutability |
| Index sebagai key di dynamic list | Unique ID sebagai key | Reconciliation bugs |

---

## Migration Notes (dari SIMLab v2 Blade)

Ketika migrasi dari Laravel Blade ke React:
1. Setiap Blade view → React component/page
2. `Utility::HttpRequest()` → `axios`/`fetch` ke BE API langsung
3. Session auth → JWT token management di React (localStorage/httpOnly cookie)
4. jQuery interactions → React state + event handlers
5. Server-side rendering → Client-side SPA (atau Next.js jika perlu SSR)

Lihat `d:\HSD\SIMLAB\old-simlab-v2-fe\REACT_MIGRATION_CONTEXT.md` untuk detail endpoint mapping.
