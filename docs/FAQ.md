# Frequently Asked Questions (FAQ)

Common questions and answers for working with Antdv Next Admin.

## Table of Contents

- [Getting Started](#getting-started)
- [Backend Integration](#backend-integration)
- [Authentication & Permissions](#authentication--permissions)
- [Routing](#routing)
- [Theming & Styling](#theming--styling)
- [Tabs & Layout](#tabs--layout)
- [Building & Deployment](#building--deployment)
- [Development](#development)

---

## Getting Started

### How do I start the development server?

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev
```

The application will be available at `http://localhost:3000`.

### What are the default login credentials?

- **Admin account**: `admin` / `123456` (full permissions)
- **User account**: `user` / `123456` (limited permissions)

---

## Backend Integration

### How do I switch from Mock to a real backend API?

1. **Update environment variables** in `.env.production`:

```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api-server.com/api
```

2. **Configure Vite proxy** for local development in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://your-backend-server.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

3. **Update API response format** to match your backend. The expected format is:

```typescript
{
  code: 200,        // HTTP status code
  data: any,        // Response data
  message: string,  // Success/error message
  success: boolean  // Success flag
}
```

### How do I customize the API response handling?

Modify `src/utils/request.ts` to adapt to your backend's response format:

```typescript
// Response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data

    // Customize this logic for your backend
    if (res.code !== 200) {
      // Handle business errors
      return Promise.reject(new Error(res.message || 'Error'))
    }

    return res
  }
)
```

---

## Authentication & Permissions

### How do I add a new permission?

Permissions are managed through the role management interface:

1. Navigate to **System Management → Role Management**
2. Click **Edit** on the desired role
3. Assign the required permissions
4. Users with that role will automatically have the new permissions

Alternatively, modify directly in the database if you have backend access.

### How do I use permission checking in components?

**Directive method:**
```vue
<a-button v-permission="'user.create'">Create User</a-button>
<a-button v-permission="['user.edit', 'user.delete']">Actions</a-button>
<a-button v-permission.all="['user.edit', 'user.approve']">Approve</a-button>
```

**Composable method:**
```typescript
import { usePermission } from '@/composables/usePermission'

const { can, canAll, hasRole } = usePermission()

if (can('user.create')) {
  // User has permission
}

if (canAll(['user.edit', 'user.delete'])) {
  // User has all permissions
}

if (hasRole('admin')) {
  // User has admin role
}
```

**Component method:**
```vue
<PermissionButton permission="user.create">
  <a-button>Create User</a-button>
</PermissionButton>
```

### What's the difference between roles and permissions?

- **Roles**: User groups (e.g., `admin`, `editor`, `viewer`)
- **Permissions**: Specific actions (e.g., `user.create`, `user.edit`)

Users can have multiple roles, and roles contain multiple permissions. The wildcard permission `*` grants all permissions.

---

## Routing

### Why does the page show 404 after refreshing on a dynamic route?

This is a known issue with dynamic route registration. The route is registered after login, so a refresh before login completion causes 404.

**Solution:** The application handles this automatically. If you still encounter issues, ensure:

1. The `router.isReady()` promise resolves before navigation
2. Auth state is properly initialized in `main.ts`

### How do I add a new menu/page?

1. **Create the view component** in `src/views/[module]/index.vue`

2. **Add route configuration** in `src/router/routes.ts`:

```typescript
{
  path: '/my-page',
  name: 'MyPage',
  component: () => import('@/views/my-page/index.vue'),
  meta: {
    title: 'route.myPage',  // i18n key
    icon: 'FileOutlined',
    requiredPermissions: ['my-page.view']  // Optional
  }
}
```

3. **Add i18n translations** in `src/locales/zh-CN.ts` and `en-US.ts`:

```typescript
// zh-CN.ts
route: {
  myPage: '我的页面'
}

// en-US.ts
route: {
  myPage: 'My Page'
}
```

### How do I create a route that doesn't require authentication?

Add it to `staticRoutes` in `src/router/routes.ts`:

```typescript
export const staticRoutes: AppRouteRecordRaw[] = [
  {
    path: '/public',
    name: 'Public',
    component: () => import('@/views/public/index.vue'),
    meta: {
      title: 'Public Page',
      requiresAuth: false  // No authentication required
    }
  }
]
```

---

## Theming & Styling

### How do I customize the primary theme color?

**Method 1: Use the settings drawer**

Click the gear icon in the header and select a preset color.

**Method 2: Modify CSS variables**

Edit `src/assets/styles/variables.css`:

```css
:root {
  --ant-primary-color: #1890ff;
  --ant-primary-color-hover: #40a9ff;
  --ant-primary-color-active: #096dd9;
}
```

**Method 3: Programmatically**

```typescript
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
themeStore.setPrimaryColor('#1890ff')
```

### How do I add a custom theme color?

1. Define the color in `src/stores/theme.ts`:

```typescript
const PRESET_COLORS = [
  { name: 'Custom', value: '#ff6b6b' },
  // ... existing colors
]
```

2. Add CSS variables for the new color.

### How does dark mode work?

Dark mode uses CSS variables and Ant Design's `darkAlgorithm`. The theme is toggled by:

```typescript
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
themeStore.setThemeMode('dark')  // 'light' | 'dark' | 'auto'
```

The `auto` mode follows the system preference.

---

## Tabs & Layout

### How do I keep a tab's state when switching between tabs?

The tab system uses `KeepAlive` to cache component state. Configure it in the route meta:

```typescript
{
  path: '/my-page',
  name: 'MyPage',
  component: () => import('@/views/my-page/index.vue'),
  meta: {
    title: 'My Page',
    keepAlive: true  // Enable state caching
  }
}
```

### How do I pin a tab so it can't be closed?

Set `affix: true` in the route meta:

```typescript
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/views/dashboard/index.vue'),
  meta: {
    title: 'Dashboard',
    affix: true  // Tab is pinned
  }
}
```

### How do I change the layout mode?

```typescript
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()

// 'vertical' = sidebar on left
// 'horizontal' = menu at top
layoutStore.setLayoutMode('horizontal')
```

---

## Building & Deployment

### Why does the page show a blank screen after building?

Common causes:

1. **Incorrect base path**: Set `base` in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/',  // Or '/your-subdirectory/' for subdirectory deployment
})
```

2. **Route history mode**: Ensure your server supports SPA routing. For Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

3. **CORS issues**: Ensure your API server allows the production domain.

### How do I analyze the bundle size?

```bash
pnpm run analyze
```

This opens a visual representation of your bundle composition.

### How do I deploy to a subdirectory?

1. Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/admin/',  // Your subdirectory
})
```

2. Update router in `src/router/index.ts`:

```typescript
const router = createRouter({
  history: createWebHistory('/admin/'),  // Match the base path
  routes
})
```

---

## Development

### How do I add a new ProTable column type?

1. Define the column in your component:

```typescript
const columns: ProTableColumn[] = [
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

2. For custom value types, extend `ProTable` component.

### How do I use the code generator?

The project includes a code generator for creating new pages:

```bash
# Generate a new page
pnpm run generate:page

# Generate a new component
pnpm run generate:component
```

Follow the prompts to create the necessary files.

### How do I add a new language?

1. Create a new locale file `src/locales/xx-XX.ts`:

```typescript
export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    // ... translations
  },
  // ... other sections
}
```

2. Register it in `src/locales/index.ts`:

```typescript
import xxXX from './xx-XX'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'xx-XX': xxXX
  }
})
```

3. Add a language switcher option in the header.

---

## Still have questions?

If your question isn't answered here:

1. Check the [Documentation](./CLAUDE.md)
2. Search [Existing Issues](https://github.com/yelog/antdv-next-admin/issues)
3. Ask in [Discussions](https://github.com/yelog/antdv-next-admin/discussions)
4. Create a [New Issue](https://github.com/yelog/antdv-next-admin/issues/new)