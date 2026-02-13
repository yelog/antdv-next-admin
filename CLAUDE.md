# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**antdv-next-admin** is a modern Vue 3 + TypeScript admin scaffold built on:
- **antdv-next** (Ant Design Vue) - UI component library
- **Pinia** - State management
- **Vue Router** - Routing with dynamic route generation
- **vue-i18n** - Internationalization (Chinese/English)
- **Vite** - Build tool
- Full RBAC permission system with dynamic routes
- Mock data system for development

## Environment Requirements

- Node.js >= 16
- npm >= 8

## Common Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Building
npm run build            # Production build
npm run build:check      # Type check before build
npm run preview          # Preview production build

# Type Checking
npm run type-check       # TypeScript type checking
```

**Note**: This project currently has no test or lint scripts configured.

## Architecture

### State Management (Pinia Stores)

All stores use the **setup syntax** pattern. Located in `src/stores/`:

- **auth** - Authentication, user info, roles, permissions. Includes demo mode for development.
- **permission** - Dynamic route generation based on user roles/permissions
- **theme** - Theme mode (light/dark/auto), primary color (6 presets), CSS variable management
- **layout** - Layout mode (vertical/horizontal), sidebar state, mobile detection
- **tabs** - Multi-tab system with KeepAlive caching, affix tabs, right-click menu
- **settings** - User preferences (animations, gray mode, menu theme, etc.)
- **notification** - Notification panel state

**Key Pattern**: Store initialization happens in router guards. Auth store includes both demo mode (mock) and production mode (real API) login flows.

### Routing System

Routes are organized in three categories (`src/router/routes.ts`):

1. **staticRoutes** - No auth required (login, error pages)
2. **basicRoutes** - Require auth (dashboard, profile)
3. **asyncRoutes** - Require specific permissions (system management, etc.)

**Dynamic Route Generation**:
- Routes are generated in `src/router/guards.ts` during navigation
- Permission store (`generateRoutes`) filters async routes based on user roles/permissions
- Routes are added dynamically with `router.addRoute()` after successful login
- First navigation to dynamic route may redirect to 404, then recover by regenerating routes

**Route Meta Fields**:
```typescript
{
  title: string           // i18n key for page title
  icon?: string           // Icon component name (e.g., 'DashboardOutlined')
  requiresAuth?: boolean  // Default true
  requiredPermissions?: string[]  // Permission codes required
  requiredRoles?: string[]        // Role codes required
  hidden?: boolean        // Hide from menu
  affix?: boolean         // Pin tab (can't be closed)
  order?: number          // Menu sort order
}
```

### Permission System

Three ways to check permissions:

1. **Directive** (`src/directives/permission.ts`):
   ```vue
   <a-button v-permission="'user.create'">Create</a-button>
   <a-button v-permission="['user.edit', 'user.delete']">Actions</a-button>
   <a-button v-permission.all="['user.edit', 'user.approve']">Approve</a-button>
   ```

2. **Composable** (`src/composables/usePermission.ts`):
   ```typescript
   const { can, canAll } = usePermission()
   if (can('user.create')) { /* ... */ }
   if (canAll(['user.edit', 'user.approve'])) { /* ... */ }
   ```

3. **Component** (`src/components/Permission/PermissionButton.vue`):
   ```vue
   <PermissionButton permission="user.create">
     <a-button>Create User</a-button>
   </PermissionButton>
   ```

### API & Request Handling

**Base Service**: `src/utils/request.ts` - Axios instance with interceptors

- Auto-adds Bearer token from auth store
- Handles 401 (logout + redirect to login), 403 (forbidden), 404, 500
- Response interceptor checks `res.code` field (expects 200)
- All API calls use the `request` helper with typed responses

**Mock System** (`mock/` directory):
- Enabled via `VITE_USE_MOCK=true` in `.env.development`
- Two-layer structure: `data/` (mock data sources) + `handlers/` (request handlers)
- Available mock APIs: auth, users, roles, permissions, dashboard
- Supports pagination, search, CRUD operations

### Pro Components

**ProTable** (`src/components/Pro/ProTable/`):
- Configuration-based table with search form, toolbar, pagination
- Column types defined via `ProTableColumn` interface (see `src/types/pro.ts`)
- Supports value types: text, date, dateTime, tag, badge, money, percent, avatar, etc.
- Search types: input, select, dateRange, datePicker, etc.
- Built-in features: column resizing, fixed headers, sorting, actions column
- **Important**: Uses CSS variables for scrollbar width alignment (see scrollbar.ts utility)
- Two rendering modes:
  - `scroll-mode`: Table handles its own scrolling
  - `fill-mode`: Parent container scrolls, table fills height with `fixedHeader`

**ProForm** (`src/components/Pro/ProForm/`):
- Configuration-based form with validation
- Form item types: input, password, textarea, number, select, radio, checkbox, switch, datePicker, etc.
- Grid layout support with `colSpan` and responsive `cols`
- Dynamic options via `request` function
- Custom rendering via `render` prop

**Type Definitions**: Always reference `src/types/pro.ts` for column/form configurations.

### Icons

Two icon systems are available:

1. **Ant Design Icons** (`@antdv-next/icons`):
   ```vue
   import { UserOutlined } from '@antdv-next/icons'
   ```

2. **Iconify** (`@iconify/vue`):
   - Component: `src/components/Icon/index.vue`
   - Picker: `src/components/IconPicker/index.vue`
   - Supports online/offline modes with local icon sets (ion, mdi, ri)
   - Use `<Icon icon="mdi:home" />` syntax

### Theme System

Themes use **CSS variables** defined in `src/assets/styles/variables.css`:

- 6 preset primary colors: blue (default), green, purple, red, orange, cyan
- Dark/light/auto modes
- CSS variables follow pattern: `--ant-primary-color`, `--bg-color`, `--text-color`, etc.
- Theme store dynamically updates CSS variables on document root
- Sidebar supports independent dark/light theme (via `--sidebar-bg-color` variables)

### Internationalization

**System**: vue-i18n with locale files in `src/locales/`

- `zh-CN.ts` - Chinese (default)
- `en-US.ts` - English
- Access via `$t('key')` in templates or `t('key')` from `useI18n()`
- Helper: `src/utils/i18n.ts` - `resolveLocaleText()` for dynamic text resolution

### Charts & Visualization

**ECharts Integration**: The project includes `echarts` and `vue-echarts` for data visualization in the dashboard. Use the `<v-chart>` component from `vue-echarts` for rendering charts.

### Keyboard Shortcuts

- `Ctrl/Cmd + K` - Open global menu search

## Development Guidelines

### File Naming & Structure

- Components: **PascalCase** (e.g., `AdminLayout.vue`)
- Files: **kebab-case** (e.g., `use-permission.ts`)
- Path alias: Use `@/` for `src/` (configured in vite.config.ts and tsconfig.json)

### TypeScript

- **Strict mode enabled** - All code must be type-safe
- Types organized in `src/types/`: api.ts, auth.ts, router.ts, layout.ts, pro.ts
- Use `type` for object shapes, `interface` for extensible contracts
- Route type: `AppRouteRecordRaw` (extends Vue Router's `RouteRecordRaw`)
- API responses: `ApiResponse<T>` pattern

### Adding New Pages

1. Create view in `src/views/[module]/`
2. Add route to appropriate category in `src/router/routes.ts`
3. Add i18n keys to `src/locales/zh-CN.ts` and `en-US.ts`
4. If requires permissions, set `meta.requiredPermissions` or `meta.requiredRoles`
5. Router guards will handle dynamic route injection

### Adding New Stores

Follow the **setup syntax** pattern:

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMyStore = defineStore('my-store', () => {
  // State
  const data = ref<MyType | null>(null)

  // Getters
  const processedData = computed(() => /* ... */)

  // Actions
  const fetchData = async () => { /* ... */ }

  return { data, processedData, fetchData }
})
```

Export from `src/stores/index.ts` for centralized access.

### Working with ProTable

Always define columns using the `ProTableColumn` type:

```typescript
import type { ProTableColumn } from '@/types/pro'

const columns: ProTableColumn[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    search: true,           // Enable search
    searchType: 'input',    // Search field type
    valueType: 'text'       // Display type
  },
  {
    title: 'Status',
    dataIndex: 'status',
    valueType: 'tag',
    valueEnum: {
      active: { text: 'Active', status: 'success' },
      inactive: { text: 'Inactive', status: 'default' }
    }
  }
]
```

**Known Issue**: ProTable had scrollbar alignment bugs that were fixed by:
- Using CSS variables for dynamic scrollbar width (`--actual-scrollbar-width`)
- Scrollbar detection utility in `src/utils/scrollbar.ts`
- When modifying table layout, verify scrollbar placeholder alignment

### Authentication Flow

**Demo Mode** (development):
- Credentials: `admin/123456` or `user/123456`
- No real backend, uses mock data from auth store
- Token stored in localStorage

**Production Mode**:
- Set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL` in `.env.production`
- Uses real API calls via `src/api/auth.ts`

### Mock Data Development

To add new mock endpoints:

1. Create data source in `mock/data/[entity].data.ts`
2. Create handler in `mock/handlers/[entity].mock.ts`
3. Mock server auto-reloads, accessible at `/api/*` prefix

## Common Patterns

### Conditional Rendering by Permission

```typescript
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

if (authStore.hasAnyPermission(['user.edit', 'user.delete'])) {
  // Show actions
}
```

### Accessing Current Route in Components

```typescript
import { useRoute } from 'vue-router'
const route = useRoute()
console.log(route.meta.title)
```

### Multi-Tab Operations

```typescript
import { useTabsStore } from '@/stores/tabs'
const tabsStore = useTabsStore()

tabsStore.closeTab(path)        // Close specific tab
tabsStore.closeOtherTabs(path)  // Close all except this
tabsStore.closeAllTabs()        // Close all closeable tabs
tabsStore.refreshTab(path)      // Refresh tab content
```

### Theme Changes

```typescript
import { useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()

themeStore.setThemeMode('dark')           // 'light' | 'dark' | 'auto'
themeStore.setPrimaryColor('#1890ff')     // Any valid color
```

## Important Notes

- **Never commit** environment-specific values to `.env` files
- **Router guards** handle most auth/permission logic - avoid duplicating checks
- **CSS variables** are the preferred method for theming - avoid hardcoded colors
- **ProTable fixedHeader mode** requires parent container with fixed height
- **Dynamic routes** are regenerated on each login - changes to `asyncRoutes` require re-login
- **Tabs state** persists in localStorage via settings store
- **Mock mode** is determined by `VITE_USE_MOCK` env variable, checked at runtime

## Default Accounts

Development mode credentials:

- Admin: `admin / 123456`
- User: `user / 123456`
