# Alpine.js Stack Profile

> Berlaku untuk: ppic-fe (coexist dengan jQuery + Tailwind + DaisyUI)

## Sumber Referensi
- Alpine.js v3 docs (alpinejs.dev)
- DaisyUI docs (daisyui.com)
- Tailwind CSS docs (tailwindcss.com)

---

## Core Directives

```html
<!-- Reactive data -->
<div x-data="{ open: false, count: 0 }">

  <!-- Show/hide -->
  <div x-show="open">Content</div>

  <!-- Toggle -->
  <button x-on:click="open = !open">Toggle</button>
  <button @click="open = !open">Toggle (shorthand)</button>

  <!-- Bind attribute -->
  <div x-bind:class="{ 'active': open }">...</div>
  <div :class="{ 'active': open }">...</div>

  <!-- Two-way binding -->
  <input x-model="count" type="number">

  <!-- Loop -->
  <template x-for="item in items" :key="item.id">
    <div x-text="item.name"></div>
  </template>

  <!-- Conditional -->
  <template x-if="count > 0">
    <span x-text="count"></span>
  </template>

  <!-- Text & HTML -->
  <span x-text="count"></span>
  <div x-html="htmlContent"></div>

  <!-- Init -->
  <div x-data x-init="fetchData()">...</div>

  <!-- Transition -->
  <div x-show="open" x-transition>Animated</div>
</div>
```

---

## Integration dengan Laravel Blade

```php
{{-- Blade template dengan Alpine --}}
<div x-data="orderForm()">
    <form @submit.prevent="submitForm">
        @csrf
        <input x-model="form.name" type="text" class="input input-bordered">
        <span x-show="errors.name" x-text="errors.name" class="text-error"></span>

        <button type="submit" class="btn btn-primary"
                :disabled="loading"
                x-text="loading ? 'Saving...' : 'Save'">
        </button>
    </form>
</div>

<script>
function orderForm() {
    return {
        form: { name: '' },
        errors: {},
        loading: false,
        async submitForm() {
            this.loading = true;
            try {
                const resp = await axios.post('{{ route("order.store") }}', this.form);
                // handle success
            } catch (err) {
                this.errors = err.response?.data?.errors || {};
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>
```

---

## Coexistence dengan jQuery

ppic-fe pakai Alpine.js DAN jQuery bersamaan. Rules:
- **Alpine** untuk reactive UI (show/hide, forms, toggles)
- **jQuery** untuk legacy interactions (AJAX, DOM manipulation yang sudah ada)
- **JANGAN** mix keduanya di satu komponen — pilih satu
- Jika harus interop: jQuery trigger event, Alpine listen via `@custom-event`

```html
<!-- jQuery trigger → Alpine listen -->
<div x-data="{ value: '' }" @update-value.window="value = $event.detail">
    <span x-text="value"></span>
</div>

<script>
// jQuery side
$(document).trigger('update-value', { detail: 'new value' });
// Atau pakai CustomEvent:
window.dispatchEvent(new CustomEvent('update-value', { detail: 'new value' }));
</script>
```

---

## DaisyUI + Tailwind Components

```html
<!-- Button -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary btn-sm">Small Secondary</button>

<!-- Modal -->
<dialog id="my_modal" class="modal">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Title</h3>
        <p class="py-4">Content</p>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn">Close</button>
            </form>
        </div>
    </div>
</dialog>

<!-- Table -->
<div class="overflow-x-auto">
    <table class="table table-zebra">
        <thead><tr><th>Name</th><th>Status</th></tr></thead>
        <tbody>
            <template x-for="item in items">
                <tr><td x-text="item.name"></td><td x-text="item.status"></td></tr>
            </template>
        </tbody>
    </table>
</div>

<!-- Alert -->
<div class="alert alert-warning">
    <span>Warning message</span>
</div>
```

---

## Anti-Patterns

| Salah | Benar | Alasan |
|---|---|---|
| jQuery `.show()/.hide()` untuk reactive UI | `x-show` Alpine directive | Consistency, reactivity |
| `x-data` di `<body>` (global) | `x-data` di komponen spesifik | Performance, scope isolation |
| Fetch data di `x-init` tanpa error handling | Try/catch + loading state | UX |
| Mix jQuery DOM manipulation dengan Alpine reactive | Pilih satu per komponen | State conflict |
| Inline complex logic di directive | Extract ke function | Readability |

---

## Business-Specific Rules (ppic-fe)

- Gunakan DaisyUI components untuk UI baru (bukan raw Tailwind)
- Form validation: client-side via Alpine, server-side via Laravel
- AJAX calls: prefer `axios` (sudah ada) daripada `$.ajax`
- Loading states: selalu tampilkan feedback ke user saat async operation
