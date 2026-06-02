# Browser Mock GitHub Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the production GitHub Pages demo work without a backend server by intercepting API requests in the browser when `VITE_USE_MOCK=true`.

**Architecture:** Keep the existing Vite dev-server mock system for local development, and add an Axios browser mock layer for static production demos. Production builds use `VITE_API_BASE_URL=/api`, so API paths remain consistent across development and production while the browser mock prevents GitHub Pages from receiving missing `/api/*` requests.

**Tech Stack:** Vue 3, TypeScript, Vite, Pinia, Axios, axios-mock-adapter, vite-plugin-mock-dev-server, Vitest, GitHub Pages.

---

### Task 1: Install Browser Mock Dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Install dependency**

Run from `antdv-next-admin/`:

```bash
npm install axios-mock-adapter --save-dev
```

Expected:

```text
package.json and package-lock.json include axios-mock-adapter
```

**Step 2: Verify dependency is present**

Run:

```bash
npm ls axios-mock-adapter
```

Expected:

```text
axios-mock-adapter@...
```

**Step 3: Commit**

Only commit if explicitly requested by the user.

---

### Task 2: Export Axios Service for Mock Registration

**Files:**
- Modify: `src/utils/request.ts:27-28`
- Test: `tests/unit/request-service.spec.ts`

**Step 1: Write the failing test**

Create `tests/unit/request-service.spec.ts`:

```ts
import { describe, expect, it } from "vitest";

import { service } from "@/utils/request";

describe("request service", () => {
  it("exports the axios instance used by request helpers", () => {
    expect(service.defaults.timeout).toBe(15000);
    expect(service.defaults.headers["Content-Type"]).toBe("application/json");
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit:run -- tests/unit/request-service.spec.ts
```

Expected:

```text
FAIL because src/utils/request.ts does not export service
```

**Step 3: Write minimal implementation**

Modify `src/utils/request.ts`:

```ts
export const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

Replace the existing private `const service` declaration. Do not change interceptor or helper behavior.

**Step 4: Run test to verify it passes**

Run:

```bash
npm run test:unit:run -- tests/unit/request-service.spec.ts
```

Expected:

```text
PASS tests/unit/request-service.spec.ts
```

**Step 5: Commit**

Only commit if explicitly requested by the user.

---

### Task 3: Add Browser Mock Bootstrap

**Files:**
- Create: `src/mock/browser.ts`
- Modify: `src/main.ts:17-28`
- Test: `tests/unit/browser-mock.spec.ts`

**Step 1: Write the failing test**

Create `tests/unit/browser-mock.spec.ts`:

```ts
import axios from "axios";
import { describe, expect, it } from "vitest";

import { setupBrowserMock } from "@/mock/browser";

describe("setupBrowserMock", () => {
  it("registers a health endpoint without hitting the network", async () => {
    const client = axios.create({ baseURL: "/api" });
    setupBrowserMock(client);

    const response = await client.get("/__mock_health");

    expect(response.data).toEqual({
      code: 200,
      message: "success",
      success: true,
      data: { enabled: true },
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit:run -- tests/unit/browser-mock.spec.ts
```

Expected:

```text
FAIL because src/mock/browser.ts does not exist
```

**Step 3: Write minimal implementation**

Create `src/mock/browser.ts`:

```ts
import type { AxiosInstance } from "axios";

import AxiosMockAdapter from "axios-mock-adapter";

const SUCCESS_MESSAGE = "success";

function successResponse<T>(data: T) {
  return {
    code: 200,
    message: SUCCESS_MESSAGE,
    success: true,
    data,
  };
}

export function setupBrowserMock(service: AxiosInstance): AxiosMockAdapter {
  const mock = new AxiosMockAdapter(service, { delayResponse: 250 });

  mock.onGet(/\/api\/__mock_health$|\/__mock_health$/).reply(200, {
    code: 200,
    message: SUCCESS_MESSAGE,
    success: true,
    data: { enabled: true },
  });

  mock.onAny().passThrough();

  return mock;
}

export { successResponse };
```

**Step 4: Register mock before app mount**

Modify `src/main.ts` so mock registration happens before route guards can trigger API calls:

```ts
import { service } from './utils/request';

if (import.meta.env.VITE_USE_MOCK === 'true') {
  const { setupBrowserMock } = await import('./mock/browser');
  setupBrowserMock(service);
}

const app = createApp(App);
```

Keep existing style imports and plugin registration order unchanged. Use top-level `await`, which is valid for the current Vite/ESNext setup.

**Step 5: Run test to verify it passes**

Run:

```bash
npm run test:unit:run -- tests/unit/browser-mock.spec.ts
```

Expected:

```text
PASS tests/unit/browser-mock.spec.ts
```

**Step 6: Commit**

Only commit if explicitly requested by the user.

---

### Task 4: Implement Auth and Dict Browser Mock Endpoints

**Files:**
- Modify: `src/mock/browser.ts`
- Reference: `mock/data/users.data.ts`
- Reference: `mock/data/dict.data.ts`
- Reference: `mock/handlers/auth.mock.ts`
- Reference: `mock/handlers/dict.mock.ts`
- Test: `tests/unit/browser-mock.spec.ts`

**Step 1: Extend the test**

Add to `tests/unit/browser-mock.spec.ts`:

```ts
it("handles demo login and user info", async () => {
  const client = axios.create({ baseURL: "/api" });
  setupBrowserMock(client);

  const login = await client.post("/auth/login", {
    username: "admin",
    password: "123456",
  });

  expect(login.data.code).toBe(200);
  expect(login.data.data.token).toContain("mock-token-1-");

  const info = await client.get("/auth/info", {
    headers: { Authorization: `Bearer ${login.data.data.token}` },
  });

  expect(info.data.data.username).toBe("admin");
});

it("handles all dictionary data", async () => {
  const client = axios.create({ baseURL: "/api" });
  setupBrowserMock(client);

  const response = await client.get("/dict/data/all");

  expect(response.data.code).toBe(200);
  expect(Array.isArray(response.data.data)).toBe(true);
  expect(response.data.data.length).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit:run -- tests/unit/browser-mock.spec.ts
```

Expected:

```text
FAIL because auth and dict endpoints are not mocked yet
```

**Step 3: Implement auth helpers**

Add to `src/mock/browser.ts`:

```ts
import { adminUser, regularUser } from "../../mock/data/users.data";
import { dictData } from "../../mock/data/dict.data";

function createMockToken(userId: string): string {
  return `mock-token-${userId}-${Date.now()}`;
}

function createMockRefreshToken(userId: string): string {
  return `mock-refresh-token-${userId}-${Date.now()}`;
}

function resolveMockUserIdFromToken(token?: string): string | null {
  if (!token) return null;
  const parts = token.split("-");
  const tokenIndex = parts.indexOf("token");
  const refreshIndex = parts.indexOf("refresh");
  const userIdIndex = tokenIndex !== -1 ? tokenIndex + 1 : refreshIndex + 2;
  const userId = parts[userIdIndex];
  return userId === "1" || userId === "2" ? userId : null;
}

function getAuthorizationToken(headers: unknown): string | undefined {
  if (!headers || typeof headers !== "object") return undefined;
  const value = (headers as Record<string, string | undefined>).Authorization;
  return value?.replace("Bearer ", "");
}
```

Avoid `as any`. Keep helpers local to `browser.ts` unless future reuse is needed.

**Step 4: Register endpoints**

Add inside `setupBrowserMock` before `mock.onAny().passThrough()`:

```ts
mock.onPost(/\/api\/auth\/login$|\/auth\/login$/).reply((config) => {
  const body = JSON.parse(String(config.data || "{}")) as {
    password?: string;
    username?: string;
  };

  const user =
    body.username === "admin" && body.password === "123456"
      ? adminUser
      : body.username === "user" && body.password === "123456"
        ? regularUser
        : null;

  if (!user) {
    return [
      200,
      {
        code: 401,
        message: "Invalid username or password",
        success: false,
        data: null,
      },
    ];
  }

  return [
    200,
    successResponse({
      token: createMockToken(user.id),
      refreshToken: createMockRefreshToken(user.id),
      expiresIn: 7200,
    }),
  ];
});

mock.onGet(/\/api\/auth\/info$|\/auth\/info$/).reply((config) => {
  const token = getAuthorizationToken(config.headers);
  const userId = resolveMockUserIdFromToken(token);
  if (!userId) {
    return [200, { code: 401, message: "Unauthorized", success: false, data: null }];
  }
  return [200, successResponse(userId === "1" ? adminUser : regularUser)];
});

mock.onPost(/\/api\/auth\/refresh$|\/auth\/refresh$/).reply((config) => {
  const body = JSON.parse(String(config.data || "{}")) as { refreshToken?: string };
  const userId = resolveMockUserIdFromToken(body.refreshToken);
  if (!userId) {
    return [200, { code: 401, message: "Invalid refresh token", success: false, data: null }];
  }
  return [
    200,
    successResponse({
      token: createMockToken(userId),
      refreshToken: createMockRefreshToken(userId),
      expiresIn: 7200,
    }),
  ];
});

mock.onPost(/\/api\/auth\/logout$|\/auth\/logout$/).reply(200, successResponse(null));

mock.onGet(/\/api\/dict\/data\/all$|\/dict\/data\/all$/).reply(200, successResponse(dictData));
```

**Step 5: Run tests**

Run:

```bash
npm run test:unit:run -- tests/unit/browser-mock.spec.ts
```

Expected:

```text
PASS tests/unit/browser-mock.spec.ts
```

**Step 6: Commit**

Only commit if explicitly requested by the user.

---

### Task 5: Implement Dashboard and Permission Browser Mock Endpoints

**Files:**
- Modify: `src/mock/browser.ts`
- Reference: `mock/data/dashboard.data.ts`
- Reference: `mock/data/permissions.data.ts`
- Test: `tests/unit/browser-mock.spec.ts`

**Step 1: Extend the test**

Add to `tests/unit/browser-mock.spec.ts`:

```ts
it("handles dashboard endpoints", async () => {
  const client = axios.create({ baseURL: "/api" });
  setupBrowserMock(client);

  const stats = await client.get("/dashboard/stats");
  const chartData = await client.get("/dashboard/chart-data");

  expect(stats.data.code).toBe(200);
  expect(stats.data.data).toBeTruthy();
  expect(chartData.data.code).toBe(200);
  expect(chartData.data.data).toBeTruthy();
});

it("handles permission tree endpoints", async () => {
  const client = axios.create({ baseURL: "/api" });
  setupBrowserMock(client);

  const permissions = await client.get("/permissions");
  const tree = await client.get("/permissions/tree");

  expect(permissions.data.code).toBe(200);
  expect(Array.isArray(permissions.data.data)).toBe(true);
  expect(tree.data.code).toBe(200);
  expect(Array.isArray(tree.data.data)).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit:run -- tests/unit/browser-mock.spec.ts
```

Expected:

```text
FAIL because dashboard and permission endpoints are not mocked yet
```

**Step 3: Implement endpoints**

Import data in `src/mock/browser.ts`:

```ts
import {
  mockActivities,
  mockChartData,
  mockSalesTrend,
  mockStats,
  mockUserDistribution,
} from "../../mock/data/dashboard.data";
import { mockPermissions } from "../../mock/data/permissions.data";
```

Add inside `setupBrowserMock` before pass-through:

```ts
mock.onGet(/\/api\/dashboard\/stats$|\/dashboard\/stats$/).reply(200, successResponse(mockStats));
mock.onGet(/\/api\/dashboard\/sales-trend$|\/dashboard\/sales-trend$/).reply(200, successResponse(mockSalesTrend));
mock.onGet(/\/api\/dashboard\/user-distribution$|\/dashboard\/user-distribution$/).reply(200, successResponse(mockUserDistribution));
mock.onGet(/\/api\/dashboard\/activities$|\/dashboard\/activities$/).reply(200, successResponse(mockActivities));
mock.onGet(/\/api\/dashboard\/chart-data$|\/dashboard\/chart-data$/).reply(200, successResponse(mockChartData));

mock.onGet(/\/api\/permissions$|\/permissions$/).reply(200, successResponse(mockPermissions));
mock.onGet(/\/api\/permissions\/tree$|\/permissions\/tree$/).reply(200, successResponse(mockPermissions));
```

If `mockPermissions` is nested, return it directly for this first production demo pass. Do not duplicate the full dev-server filtering logic unless a test or user-visible issue requires it.

**Step 4: Run tests**

Run:

```bash
npm run test:unit:run -- tests/unit/browser-mock.spec.ts
```

Expected:

```text
PASS tests/unit/browser-mock.spec.ts
```

**Step 5: Commit**

Only commit if explicitly requested by the user.

---

### Task 6: Align Production Environment for Static Demo

**Files:**
- Modify: `.env.production:3-7`
- Modify: `README.md:214-219`

**Step 1: Update production env**

Modify `.env.production`:

```env
# Production Environment

# Enable browser-side mock data for static demo hosting such as GitHub Pages.
VITE_USE_MOCK=true

# Keep /api consistent with development; browser mock intercepts these requests.
VITE_API_BASE_URL=/api
```

**Step 2: Update README production demo text**

Modify `README.md` lines around the production environment section:

```md
生产构建默认用于静态 Demo，因此启用浏览器端 Mock，并保持 `/api` 前缀：

```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=/api
```
```

Also update the mock description:

```md
开发环境通过 `vite-plugin-mock-dev-server` 提供 `/api` 前缀的 Mock 接口。静态 Demo 模式下通过浏览器端 Mock 拦截 `/api` 请求，避免 GitHub Pages 等静态站点请求不存在的后端接口。
```

**Step 3: Run type check**

Run:

```bash
npm run type-check
```

Expected:

```text
vue-tsc --noEmit exits 0
```

**Step 4: Commit**

Only commit if explicitly requested by the user.

---

### Task 7: Restore GitHub Pages SPA Redirects

**Files:**
- Modify: `src/main.ts`
- Existing: `public/404.html`

**Step 1: Add redirect restoration helper**

Add to `src/main.ts` after mock setup and before `app.mount('#app')`:

```ts
function restoreGitHubPagesRedirect() {
  const redirect = sessionStorage.getItem('redirect');
  if (!redirect) return;

  sessionStorage.removeItem('redirect');

  const redirectUrl = new URL(redirect);
  const target = `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (target !== current) {
    window.history.replaceState(null, '', target);
  }
}

restoreGitHubPagesRedirect();
```

This matches `public/404.html`, which writes `sessionStorage.redirect = location.href`.

**Step 2: Run type check**

Run:

```bash
npm run type-check
```

Expected:

```text
vue-tsc --noEmit exits 0
```

**Step 3: Commit**

Only commit if explicitly requested by the user.

---

### Task 8: Production Build Verification

**Files:**
- No direct edits expected

**Step 1: Run unit tests**

Run from `antdv-next-admin/`:

```bash
npm run test:unit:run
```

Expected:

```text
all unit tests pass
```

**Step 2: Run type check and production build**

Run:

```bash
npm run build:check
```

Expected:

```text
vue-tsc passes and vite build completes
```

**Step 3: Preview the production build**

Run:

```bash
npm run preview
```

Expected:

```text
Vite preview server starts
```

**Step 4: Manual browser verification**

Open the preview URL and verify:

```text
admin/123456 can log in
user/123456 can log in
dashboard loads without "请求的资源不存在"
no network request reaches /api/dict/data/all with 404
dictionary data loads without console error
refreshing /dashboard restores the route
```

If an old avatar hash still 404s, clear only auth-related localStorage keys and retry:

```js
localStorage.removeItem("user_info");
localStorage.removeItem("access_token");
localStorage.removeItem("refresh_token");
localStorage.removeItem("token_expires_at");
location.reload();
```

**Step 5: Commit**

Only commit if explicitly requested by the user.

---

### Task 9: Optional Full Mock Coverage Follow-Up

**Files:**
- Modify: `src/mock/browser.ts`
- Reference: `mock/handlers/user.mock.ts`
- Reference: `mock/handlers/role.mock.ts`
- Reference: `mock/handlers/dept.mock.ts`
- Reference: `mock/handlers/config.mock.ts`
- Reference: `mock/handlers/log.mock.ts`
- Reference: `mock/handlers/file.mock.ts`

**Step 1: Verify remaining static-demo gaps**

Use the production preview and visit:

```text
/system/user
/system/role
/organization/dept
/system/dict
/system/config
/monitor/log
```

Expected:

```text
Record any /api/* requests that pass through and 404
```

**Step 2: Add only missing endpoints**

Extend `src/mock/browser.ts` for only endpoints that are needed for the static demo. Prefer read/list endpoints first. Avoid implementing full create/update/delete behavior unless the demo needs it.

**Step 3: Re-run verification**

Run:

```bash
npm run test:unit:run
npm run build:check
```

Expected:

```text
all tests pass and production build succeeds
```

**Step 4: Commit**

Only commit if explicitly requested by the user.
