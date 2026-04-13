# Python Stack Profile

> Berlaku untuk: future projects

## Sumber Referensi
- PEP 8 Style Guide
- Google Python Style Guide

---

## Conventions

### Naming
| Entity | Convention | Contoh |
|---|---|---|
| Module/file | snake_case | `order_service.py` |
| Class | PascalCase | `OrderService` |
| Function/method | snake_case | `calculate_total()` |
| Variable | snake_case | `order_count` |
| Constant | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Private | _prefix | `_internal_method()` |

### Type Hints (WAJIB untuk code baru)
```python
def calculate_total(items: list[dict], discount: float = 0.0) -> float:
    ...
```

### Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

---

## Anti-Patterns

| Salah | Benar | Alasan |
|---|---|---|
| `import *` | Explicit imports | Namespace pollution |
| Bare `except:` | `except SpecificError:` | Silent bugs |
| Mutable default args `def f(x=[])` | `def f(x=None): x = x or []` | Shared state bug |
| Global variables untuk state | Class atau function params | Maintainability |
| `print()` untuk logging | `logging` module | Configurable, leveled |

---

## Security
- Input validation: selalu sanitize user input
- SQL: pakai ORM (SQLAlchemy, Django ORM) — jangan raw SQL
- Secrets: pakai environment variables, bukan hardcode
- Dependencies: `pip audit` untuk vulnerability check
