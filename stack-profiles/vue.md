# Vue 3 Stack Profile

> Berlaku untuk: claude-desk-agent (Tauri app), future projects

## Sumber Referensi
- Vue 3 official docs (vuejs.org)
- Vue 3 Style Guide (vuejs.org/style-guide)
- Pinia docs (pinia.vuejs.org)

---

## Architecture Pattern

```
App.vue → Router → Views → Components
                         ↘ Stores (Pinia) → API/Tauri Commands
```

---

## Component Pattern (Composition API + `<script setup>`)

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores/example'

// Props
const props = defineProps<{
  title: string
  count?: number
}>()

// Emits
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'close'): void
}>()

// Reactive state
const loading = ref(false)
const items = ref<Item[]>([])

// Computed
const total = computed(() => items.value.length)

// Store
const store = useStore()

// Lifecycle
onMounted(async () => {
  loading.value = true
  items.value = await fetchItems()
  loading.value = false
})

// Methods
function handleClick() {
  emit('update', 'new value')
}
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <p v-if="loading">Loading...</p>
    <ul v-else>
      <li v-for="item in items" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
    <button @click="handleClick">Update</button>
  </div>
</template>
```

---

## Pinia Store Pattern

```ts
// stores/developer.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDeveloperStore = defineStore('developer', () => {
  // State
  const name = ref('')
  const stacks = ref<string[]>([])
  const projects = ref<Project[]>([])

  // Getters
  const activeProjects = computed(() =>
    projects.value.filter(p => p.status === 'active')
  )

  // Actions
  async function loadFromRegistry() {
    // Tauri: invoke command
    // Web: fetch API
  }

  return { name, stacks, projects, activeProjects, loadFromRegistry }
})
```

---

## Tailwind Integration

```vue
<template>
  <!-- Utility classes -->
  <div class="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
    <span class="text-sm font-medium text-primary">Label</span>
    <input class="input input-bordered input-sm w-full" v-model="value" />
  </div>

  <!-- Conditional classes -->
  <div :class="[
    'badge',
    status === 'active' ? 'badge-success' : 'badge-ghost'
  ]">
    {{ status }}
  </div>
</template>
```

---

## Anti-Patterns

| Salah | Benar | Alasan |
|---|---|---|
| Options API di project baru | Composition API + `<script setup>` | Modern Vue 3 standard |
| Prop drilling 3+ levels | Pinia store atau provide/inject | Maintainability |
| `v-if` + `v-for` di element yang sama | `v-if` di wrapper `<template>` | Performance |
| Mutate props langsung | Emit event ke parent | One-way data flow |
| Reactive object di `ref()` | `reactive()` untuk objects, `ref()` untuk primitives | Correct API usage |
| `this.$store` (Vuex pattern) | `useStore()` (Pinia) | Pinia is the standard |

---

## File Naming Convention

| Type | Convention | Contoh |
|---|---|---|
| Component | PascalCase.vue | `DeveloperBadge.vue` |
| View | PascalCase.vue | `MainView.vue` |
| Store | camelCase.ts | `developer.ts` |
| Utility | camelCase.ts | `registry.ts` |
| Type/Interface | PascalCase.ts | `types.ts` → `interface Developer` |
