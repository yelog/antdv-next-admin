# Antdv Next Admin - Agent Guidelines

A Vue 3 + TypeScript + Ant Design Vue admin scaffold with RBAC, theming, i18n (zh-CN/en-US/ja-JP/ko-KR), Tailwind CSS 4, Codemirror 6, and mock APIs.

## Project Structure

```
src/
├── api/              # API layer - organized by domain (auth.ts, user.ts)
├── assets/styles/    # Global styles (variables.css, animations.css, global.css)
├── components/       # Reusable components (Layout/, Permission/, etc.)
├── composables/      # Composition functions (usePermission.ts, useWatermark.ts)
├── directives/       # Custom Vue directives (permission.ts)
├── locales/          # i18n translations (zh-CN.ts, en-US.ts)
├── router/           # Vue Router (routes.ts, guards.ts, utils.ts)
├── stores/           # Pinia stores - one per domain (auth.ts, theme.ts, layout.ts)
├── types/            # TypeScript interfaces/types (auth.ts, api.ts, router.ts)
├── utils/            # Pure utility functions (request.ts, storage.ts, helpers.ts)
└── views/            # Page components (dashboard/, system/, examples/)

mock/
├── data/             # Mock datasets (users.data.ts, roles.data.ts)
└── handlers/         # Mock API handlers (auth.mock.ts, user.mock.ts)

tests/
├── e2e/              # End-to-end tests (*.spec.ts) - templates for future Playwright setup
└── unit/             # Unit tests (*.spec.ts) - templates for future Vitest setup
```

## Build, Test, and Development Commands

### Essential Commands
```bash
npm install              # Install all dependencies
npm run dev              # Start dev server at http://localhost:3000 (with mock APIs)
npm run build            # Production build → dist/
npm run build:check      # vue-tsc type check + production build
npm run build:demo       # Demo build for static hosting (browser-side mock)
npm run preview          # Preview production build locally
npm run type-check       # Run vue-tsc --noEmit (NO auto-fix)

# Testing (Vitest)
npm run test:unit        # Run unit tests in watch mode
npm run test:unit:run    # Run unit tests once

# Linting & Formatting
npm run lint             # Lint with oxlint
npm run lint:fix         # Auto-fix lint issues
npm run format           # Format with oxfmt
npm run format:check     # Check formatting
```

### Pre-commit Requirements
**BEFORE any commit or PR:**
1. Run `npm run type-check` - must exit 0 with no errors
2. Run `npm run lint` - must exit 0 with no errors
3. Run `npm run build` - must complete successfully
4. For RBAC/auth changes: manually verify login with `admin/123456` and `user/123456`

### Testing
- **Vitest** is configured (`vitest.config.ts`): `environment: 'node'`, `globals: false`
- Test files: `tests/unit/**/*.spec.ts` — must import `describe`/`it`/`expect` from vitest
- **Playwright** e2e templates exist in `tests/e2e/` but Playwright is not yet installed

## Code Style Guidelines

### Formatting (EditorConfig)
- **Indentation**: 2 spaces (NO tabs)
- **Line endings**: LF (Unix-style)
- **Encoding**: UTF-8
- **Final newline**: required
- **Trailing whitespace**: trimmed (except in .md files)

### TypeScript
- **Strict mode enabled** (`tsconfig.json`): all strict checks ON
- **Path aliases**: use `@/` for `src/` (e.g., `import { useAuthStore } from '@/stores/auth'`)
- **Type annotations**: explicit return types for public functions/composables
- **Type definitions**: place shared types in `src/types/`, domain-specific types near usage
- **No type suppression**: NEVER use `as any`, `@ts-ignore`, or `@ts-expect-error`

### Vue Component Style
**Component naming:**
- **Files**: PascalCase for reusable components (`NotificationPanel.vue`, `ThemeToggle.vue`)
- **Views**: route-based folders with `index.vue` (`src/views/dashboard/index.vue`)

**Component structure (Composition API only):**
```vue
<template>
  <!-- Template using script setup's reactive state -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/auth'

// Props
interface Props {
  userId: string
  mode?: 'edit' | 'view'
}
const props = withDefaults(defineProps<Props>(), {
  mode: 'view'
})

// Emits
const emit = defineEmits<{
  save: [user: User]
  cancel: []
}>()

// State
const authStore = useAuthStore()
const loading = ref(false)
const user = computed(() => authStore.user)

// Methods (prefer explicit function declarations)
function handleSave() {
  // Implementation
}
</script>

<style scoped>
/* Component-specific styles */
</style>
```

### Import Ordering
Group imports in this order (blank line between groups):
```ts
// 1. Vue core
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 2. Third-party libraries
import { message } from 'antdv-next'
import dayjs from 'dayjs'

// 3. Project imports (@/ alias)
import { useAuthStore } from '@/stores/auth'
import { login, getUserInfo } from '@/api/auth'
import type { User, LoginParams } from '@/types/auth'
```

### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `NotificationPanel.vue`, `TabBar.vue` |
| Composables | `useXxx.ts` | `usePermission.ts`, `useFullscreen.ts` |
| Stores | Domain-based | `auth.ts`, `permission.ts`, `theme.ts` |
| Types/Interfaces | PascalCase | `User`, `LoginParams`, `ApiResponse<T>` |
| Functions | camelCase | `getUserInfo()`, `checkPermission()` |
| Constants | SCREAMING_SNAKE_CASE | `TOKEN_KEY`, `API_BASE_URL` |

### Error Handling
- **Try/catch**: wrap all async operations with meaningful error messages
- **Axios interceptors**: global error handling in `src/utils/request.ts`
- **User feedback**: use `message.error()` or `notification.error()` from antdv-next
```ts
try {
  const response = await getUserInfo()
  // Success path
} catch (error) {
  console.error('Failed to fetch user info:', error)
  message.error('获取用户信息失败')
}
```

### State Management (Pinia)
- **Setup stores only** (NOT options API)
- **One store per domain** - no god-objects
- **Store structure pattern:**
```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State (ref)
  const token = ref<string | null>(null)
  
  // Getters (computed)
  const isLoggedIn = computed(() => !!token.value)
  
  // Actions (functions)
  const setToken = (newToken: string | null) => {
    token.value = newToken
  }
  
  return { token, isLoggedIn, setToken }
})
```

### Permission System Usage
**Directive (in templates):**
```vue
<!-- Single permission (OR logic by default) -->
<a-button v-permission="'user.create'">Create</a-button>

<!-- Multiple permissions (OR logic) -->
<a-button v-permission="['user.edit', 'user.delete']">Actions</a-button>

<!-- ALL permissions required (AND logic) -->
<a-button v-permission.all="['user.edit', 'user.approve']">Approve</a-button>
```

**Composable (in script):**
```ts
const { can, canAll, hasRole } = usePermission()

if (can('user.create')) {
  // User has permission
}

if (canAll(['user.edit', 'user.approve'])) {
  // User has ALL permissions
}
```

## Configuration & Environment

### Environment Variables
- **Development** (`.env.development`): `VITE_USE_MOCK=true`, `VITE_API_BASE_URL=/api`
- **Production** (`.env.production`): `VITE_USE_MOCK=false`, set real API URL
- **Never commit secrets** - use `.env.local` for sensitive values (gitignored)

### Mock API System
- **Auto-enabled in dev** via `vite-plugin-mock-dev-server`
- **Handlers**: `mock/handlers/*.mock.ts` define endpoints
- **Data**: `mock/data/*.data.ts` contain sample datasets
- **Prefix**: all mock APIs use `/api` prefix (e.g., `/api/auth/login`)

## Common Pitfalls to Avoid

1. **Oxlint** lints `src/` and `mock/` — run `npm run lint` before committing. Oxfmt handles import sorting automatically.
2. **Don't suppress TypeScript errors** - fix the root cause instead
3. **Test files are templates** - don't try to run them without installing test frameworks
4. **Mock users**: `admin/123456` has full permissions, `user/123456` has limited permissions
5. **Dynamic routes**: permissions control route visibility via `src/router/guards.ts`
6. **KeepAlive caching**: managed by `tabs` store - check cached component names

## Commit Guidelines

**Use Conventional Commits:**
```
type(scope): summary

Examples:
feat(auth): add biometric login support
fix(permission): correct role-based route filtering
refactor(layout): extract sidebar menu logic to composable
docs(readme): update installation instructions
```

**Commit types:** `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`

## Pull Request Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Manually tested login flow (if auth-related)
- [ ] Manually verified permissions (if RBAC-related)
- [ ] Screenshots/GIFs included (for UI changes)
- [ ] Commit messages follow Conventional Commits
- [ ] Changes are scoped (no unrelated refactors mixed in)
