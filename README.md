# Antdv Next Admin

[![CI/CD](https://github.com/yelog/antdv-next-admin/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yelog/antdv-next-admin/actions/workflows/ci-cd.yml)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js->=18-green.svg)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.4-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**[English](README.md)** | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [한국어](README.ko-KR.md)

A modern, feature-rich admin dashboard scaffold built with Vue 3 + TypeScript + Ant Design Vue.

## Preview

**Live Demo:** [https://antdv-next-admin.yelog.org/dashboard](https://antdv-next-admin.yelog.org/dashboard)

![Screenshot](docs/images/screenshot.png)

> Default credentials: admin / 123456 or user / 123456

## Features

### Core Features
- Modern tech stack: Vue 3 + Vite + TypeScript + Pinia
- UI Components: Ant Design Vue (antdv-next)
- Layout System: Responsive layout with vertical/horizontal modes
- Multi-tab: KeepAlive-based tab system with pin, refresh, and context menu
- Theme System: Light/dark/auto modes with system preference support
- i18n: Complete Chinese/English switching with runtime support
- Permission System: RBAC with dynamic routes, button-level permissions, and directives
- Mock Data: Complete mock data support for development

### Advanced Features
- Preferences:
  - 6 preset theme colors (Dawn Blue, Aurora Green, Purple, Dusk Red, Sunset Orange, Cyan)
  - Sidebar theme switching (dark/light)
  - Layout mode switching (vertical/horizontal)
  - 5 page transition animations
  - Gray mode / Color weakness mode

- Refined Design:
  - Smooth animations
  - Delicate interaction feedback
  - Responsive design
  - Consistent design language

### Pro Components
- ProTable: Advanced table component
  - Auto-generated search forms
  - Configurable columns (show/hide, sort, fixed)
  - Built-in pagination, refresh, density toggle
  - Multiple value type rendering (date, tag, progress, etc.)

- ProForm: Advanced form component
  - Configuration-based form generation
  - Auto layout and validation
  - Multiple form types support
  - Built-in submit/reset logic

- ProModal: Advanced modal component
  - Draggable and fullscreen support
  - Auto form integration
  - Unified confirm/cancel logic

### Business Components
- Rich Text Editor: Based on TipTap with image, link, and formatting support
- Captcha Components: Slider, Puzzle, Point-click, Rotate
- Icon Picker: Iconify library search and selection
- Watermark: Text/image watermark with configurable opacity and angle

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Default Credentials

```
Admin account:
Username: admin
Password: 123456

User account:
Username: user
Password: 123456
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
antdv-next-admin/
├── public/                     # Static assets
├── src/
│   ├── api/                    # API interfaces
│   ├── assets/                 # Asset files
│   │   └── styles/             # Global styles
│   ├── components/             # Components
│   │   ├── Layout/             # Layout components
│   │   ├── Pro/                # Pro components
│   │   ├── Permission/         # Permission components
│   │   ├── Editor/             # Rich text editor
│   │   ├── Captcha/            # Captcha components
│   │   └── IconPicker/         # Icon picker
│   ├── composables/            # Composable functions
│   ├── directives/             # Custom directives
│   ├── locales/                # i18n files
│   ├── router/                 # Router configuration
│   ├── stores/                 # Pinia stores
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   └── views/                  # Page views
├── mock/                       # Mock data
├── docs/                       # Documentation
└── ...config files
```

## Tech Stack

### Core Framework
- Vue 3.4+ - Progressive JavaScript framework
- TypeScript 5+ - JavaScript superset
- Vite 5+ - Next-generation frontend build tool

### UI & Styling
- Ant Design Vue - Enterprise UI component library
- CSS Variables - Modern theme system
- SCSS - CSS preprocessor

### State & Routing
- Pinia 2+ - Vue official state management
- Vue Router 4+ - Vue official router

### Utilities
- vue-i18n - Internationalization
- Axios - HTTP client
- dayjs - Date handling
- lodash-es - Utility library

### Dev Tools
- vite-plugin-mock-dev-server - Mock server
- ESLint - Code linting
- Prettier - Code formatting

## Development Guide

### Requirements

- Node.js >= 18
- npm >= 8 or pnpm >= 8

### Environment Variables

**Development (.env.development):**
```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=/api
```

**Production (.env.production):**
```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Permission Usage

**Directive:**
```vue
<a-button v-permission="'user.create'">Create User</a-button>
<a-button v-permission="['user.edit', 'user.delete']">Actions</a-button>
<a-button v-permission.all="['user.edit', 'user.approve']">Approve</a-button>
```

**Composable:**
```ts
const { can, canAll } = usePermission()

if (can('user.create')) {
  // Has create permission
}

if (canAll(['user.edit', 'user.approve'])) {
  // Has both permissions
}
```

**Component:**
```vue
<PermissionButton permission="user.create">
  <a-button>Create User</a-button>
</PermissionButton>
```

## Mock APIs

The project includes a complete mock data system, automatically enabled in development.

### Available Mock APIs

- **Authentication**
  - POST `/api/auth/login` - Login
  - POST `/api/auth/logout` - Logout
  - GET `/api/auth/info` - Get user info

- **User Management**
  - GET `/api/users` - User list (pagination, search)
  - POST `/api/users` - Create user
  - PUT `/api/users/:id` - Update user
  - DELETE `/api/users/:id` - Delete user

- **Role, Permission, Dept, Dict, Config, File, Log Management** - Full CRUD support

- **Dashboard**
  - GET `/api/dashboard/stats` - Statistics
  - GET `/api/dashboard/chart-data` - Chart data

## Highlights

### Multi-theme Support
6 preset colors × 3 modes (light/dark/auto) = 18 theme combinations

### Flexible Layout
- Vertical layout (sidebar on left)
- Horizontal layout (menu on top)
- Responsive mobile adaptation

### Multi-tab System
- Tab caching (KeepAlive)
- Pinned tabs (affix)
- Context menu (refresh, pin, close, close others, close left/right, close all)
- Persistent storage

### Global Search
Keyboard shortcut `Ctrl/Cmd + K` to open global menu search.

### Internationalization
Complete Chinese/English translations with runtime switching.

## Contributing

Issues and Pull Requests are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License

## Acknowledgments

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design Vue](https://antdv.com/)
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- [Ant Design Pro Vue](https://pro.antdv.com/)

---

Made with ❤️ by Yelog