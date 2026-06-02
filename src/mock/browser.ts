import type { Permission, User } from "@/types/auth";
import type { DictData } from "@/types/dict";
import type { AxiosInstance } from "axios";

import AxiosMockAdapter from "axios-mock-adapter";

import {
  mockActivities,
  mockChartData,
  mockSalesTrend,
  mockStats,
  mockUserDistribution,
} from "../../mock/data/dashboard.data";
import { dictData } from "../../mock/data/dict.data";
import { mockPermissions } from "../../mock/data/permissions.data";

const SUCCESS_MESSAGE = "success";
const DEMO_CREATED_AT = "2023-01-01T00:00:00.000Z";
const DEMO_UPDATED_AT = "2023-01-01T00:00:00.000Z";

const adminUser: User = {
  id: "1",
  username: "admin",
  email: "admin@example.com",
  realName: "Administrator",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  phone: "13800138000",
  gender: "male",
  birthDate: "1990-01-01",
  bio: "System Administrator",
  status: "active",
  createdAt: DEMO_CREATED_AT,
  updatedAt: DEMO_UPDATED_AT,
  roles: [
    {
      id: "1",
      name: "Administrator",
      code: "admin",
      description: "System Administrator",
      permissions: [],
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_UPDATED_AT,
    },
  ],
  permissions: [
    {
      id: "1",
      name: "All Permissions",
      code: "*",
      description: "Has all permissions",
      resource: "*",
      action: "*",
      type: "api",
    },
  ],
};

const regularUser: User = {
  id: "2",
  username: "user",
  email: "user@example.com",
  realName: "Regular User",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
  phone: "13800138001",
  gender: "female",
  birthDate: "1995-05-15",
  bio: "Regular User",
  status: "active",
  createdAt: DEMO_CREATED_AT,
  updatedAt: DEMO_UPDATED_AT,
  roles: [
    {
      id: "2",
      name: "User",
      code: "user",
      description: "Regular User",
      permissions: [],
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_UPDATED_AT,
    },
  ],
  permissions: [
    {
      id: "2",
      name: "View Dashboard",
      code: "dashboard.view",
      description: "Can view dashboard",
      resource: "dashboard",
      action: "view",
      type: "menu",
    },
  ],
};

function successResponse<T>(data: T) {
  return {
    code: 200,
    message: SUCCESS_MESSAGE,
    success: true,
    data,
  };
}

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

  const record = headers as Record<string, string | undefined>;
  const value = record.Authorization || record.authorization;
  return value?.replace("Bearer ", "");
}

function parseJsonBody<T>(data: unknown, fallback: T): T {
  if (typeof data !== "string") return fallback;

  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export function setupBrowserMock(service: AxiosInstance): AxiosMockAdapter {
  const mock = new AxiosMockAdapter(service, { delayResponse: 250 });

  mock.onGet(/\/api\/__mock_health$|\/__mock_health$/).reply(200, {
    code: 200,
    message: SUCCESS_MESSAGE,
    success: true,
    data: { enabled: true },
  });

  mock.onPost(/\/api\/auth\/login$|\/auth\/login$/).reply((config) => {
    const body = parseJsonBody<{ password?: string; username?: string }>(
      config.data,
      {},
    );
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
      return [
        200,
        { code: 401, message: "Unauthorized", success: false, data: null },
      ];
    }

    return [200, successResponse(userId === "1" ? adminUser : regularUser)];
  });

  mock.onPost(/\/api\/auth\/refresh$|\/auth\/refresh$/).reply((config) => {
    const body = parseJsonBody<{ refreshToken?: string }>(config.data, {});
    const userId = resolveMockUserIdFromToken(body.refreshToken);
    if (!userId) {
      return [
        200,
        {
          code: 401,
          message: "Invalid refresh token",
          success: false,
          data: null,
        },
      ];
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

  mock
    .onGet(/\/api\/dict\/data\/all$|\/dict\/data\/all$/)
    .reply(200, successResponse(cloneData<DictData[]>(dictData)));

  mock
    .onGet(/\/api\/dashboard\/stats$|\/dashboard\/stats$/)
    .reply(200, successResponse(mockStats));
  mock
    .onGet(/\/api\/dashboard\/sales-trend$|\/dashboard\/sales-trend$/)
    .reply(200, successResponse(mockSalesTrend));
  mock
    .onGet(/\/api\/dashboard\/user-distribution$|\/dashboard\/user-distribution$/)
    .reply(200, successResponse(mockUserDistribution));
  mock
    .onGet(/\/api\/dashboard\/activities$|\/dashboard\/activities$/)
    .reply(200, successResponse(mockActivities));
  mock
    .onGet(/\/api\/dashboard\/chart-data$|\/dashboard\/chart-data$/)
    .reply(200, successResponse(mockChartData));

  mock
    .onGet(/\/api\/permissions$|\/permissions$/)
    .reply(200, successResponse(cloneData<Permission[]>(mockPermissions)));
  mock
    .onGet(/\/api\/permissions\/tree$|\/permissions\/tree$/)
    .reply(200, successResponse(cloneData<Permission[]>(mockPermissions)));

  mock.onAny().passThrough();

  return mock;
}

export { successResponse };
