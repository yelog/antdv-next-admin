import type { PageResult } from "@/types/api";
import type { Permission, Role, User } from "@/types/auth";
import type { SysConfig } from "@/types/config";
import type { Department } from "@/types/dept";
import type { DictData, DictType } from "@/types/dict";
import type { SysFile } from "@/types/file";
import type { LoginLog, OperationLog } from "@/types/log";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

import AxiosMockAdapter from "axios-mock-adapter";

import avatarImg from "@/assets/images/avatar-256.png";
import { parseDemoLogFilters, readLogFilterRequest } from "@/utils/logFilterIntent";

import {
  mockActivities,
  mockChartData,
  mockSalesTrend,
  mockStats,
  mockUserDistribution,
} from "../../mock/data/dashboard.data";
import { sysConfigs } from "../../mock/data/config.data";
import { departments, buildDeptTree } from "../../mock/data/dept.data";
import { dictTypes, dictData } from "../../mock/data/dict.data";
import { sysFiles } from "../../mock/data/file.data";
import { operationLogs, loginLogs } from "../../mock/data/log.data";
import { mockPermissions } from "../../mock/data/permissions.data";
import { mockRoles } from "../../mock/data/roles.data";
import { readMockLogPrincipal } from "../../mock/logAccess";
import { operationLogAccessError } from "../../server/operationLogAccess";

const SUCCESS_MESSAGE = "success";
const DEMO_CREATED_AT = "2023-01-01T00:00:00.000Z";
const DEMO_UPDATED_AT = "2023-01-01T00:00:00.000Z";

const adminUser: User = {
  id: "1",
  username: "admin",
  email: "admin@example.com",
  realName: "Administrator",
  avatar: avatarImg,
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
  avatar: avatarImg,
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

const demoUsers: User[] = [
  adminUser,
  regularUser,
  {
    id: "3",
    username: "manager",
    email: "manager@example.com",
    realName: "Demo Manager",
    avatar: avatarImg,
    phone: "13800138002",
    gender: "male",
    birthDate: "1992-08-12",
    bio: "Demo Manager",
    status: "active",
    createdAt: DEMO_CREATED_AT,
    updatedAt: DEMO_UPDATED_AT,
    roles: [mockRoles[1]],
    permissions: [],
  },
  {
    id: "4",
    username: "guest",
    email: "guest@example.com",
    realName: "Demo Guest",
    avatar: avatarImg,
    phone: "13800138003",
    gender: "female",
    birthDate: "1998-03-20",
    bio: "Demo Guest",
    status: "inactive",
    createdAt: DEMO_CREATED_AT,
    updatedAt: DEMO_UPDATED_AT,
    roles: [mockRoles[3]],
    permissions: [],
  },
];

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

type DemoReply = [status: number, data: unknown];

function replyWithData<T>(data: T): DemoReply {
  return [200, successResponse(cloneData(data))];
}

function replyWithError(code: number, message: string): DemoReply {
  return [200, { code, message, success: false, data: null }];
}

function replyWithOperationLogAccess(
  config: AxiosRequestConfig,
  reply: () => DemoReply,
): DemoReply {
  const error = operationLogAccessError(
    readMockLogPrincipal(config.headers, [adminUser, regularUser]),
  );
  return error ? [200, error] : reply();
}

function replyWithItem<T>(item: T | undefined, entity: string): DemoReply {
  return item ? replyWithData(item) : replyWithError(404, `${entity} not found`);
}

function route(path: string, detail = false): RegExp {
  return new RegExp(`^[^?#]*${path}${detail ? "/[^/?#]+" : ""}(?:[?#].*)?$`);
}

function pathValue(config: AxiosRequestConfig): string {
  const { pathname } = new URL(config.url || "", "https://mock.local");
  const segment = pathname.slice(pathname.lastIndexOf("/") + 1);
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function readBody<Item>(config: AxiosRequestConfig): Partial<Item> {
  return parseJsonBody<Partial<Item> | null>(config.data, null) ?? {};
}

function removeItem<Item extends { id: string }>(
  items: Item[],
  id: string,
  entity: string,
  deleteError?: (item: Item) => string | undefined,
): DemoReply {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return replyWithError(404, `${entity} not found`);
  const error = deleteError?.(items[index]);
  if (error) return replyWithError(400, error);

  items.splice(index, 1);
  return replyWithData(null);
}

function registerCrud<Item extends { id: string }>(
  mock: AxiosMockAdapter,
  path: string,
  items: Item[],
  entity: string,
  create: (body: Partial<Item>) => Item,
  updatedFields: () => Partial<Item>,
  deleteError?: (item: Item) => string | undefined,
): void {
  const detailRoute = route(path, true);
  mock.onPost(route(path)).reply((config) => {
    const item = create(readBody<Item>(config));
    items.push(item);
    return replyWithData(item);
  });
  mock.onPut(detailRoute).reply((config) => {
    const id = pathValue(config);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return replyWithError(404, `${entity} not found`);

    const item = { ...items[index], ...readBody<Item>(config), ...updatedFields(), id };
    items[index] = item;
    return replyWithData(item);
  });
  mock
    .onDelete(detailRoute)
    .reply((config) => removeItem(items, pathValue(config), entity, deleteError));
}

function dateTime(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function pageNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function paginate<Item>(
  items: Item[],
  query: URLSearchParams,
  pageKey: "current" | "page" = "current",
  defaultPageSize = 10,
): PageResult<Item> {
  const otherPageKey = pageKey === "current" ? "page" : "current";
  const current = pageNumber(query.get(pageKey) || query.get(otherPageKey), 1);
  const pageSize = pageNumber(query.get("pageSize"), defaultPageSize);
  const start = (current - 1) * pageSize;
  return { list: items.slice(start, start + pageSize), total: items.length, current, pageSize };
}

function getConfigList(items: SysConfig[], query: URLSearchParams) {
  const name = query.get("name");
  const key = query.get("key");
  const group = query.get("group");
  const filtered = items.filter(
    (item) =>
      (!name || item.name.includes(name)) &&
      (!key || item.key.includes(key)) &&
      (!group || item.group === group),
  );
  filtered.sort((first, second) => first.sort - second.sort);
  return paginate(filtered, query, "page", 20);
}

function getDictTypeList(items: DictType[], query: URLSearchParams) {
  const name = query.get("name");
  const code = query.get("code");
  const status = query.get("status");
  const filtered = items.filter(
    (item) =>
      (!name || item.name.includes(name)) &&
      (!code || item.code.includes(code)) &&
      (!status || item.status === status),
  );
  return paginate(filtered, query, "page");
}

function getDictDataList(items: DictData[], query: URLSearchParams) {
  const typeCode = query.get("typeCode");
  const label = query.get("label");
  const value = query.get("value");
  const status = query.get("status");
  const filtered = items.filter(
    (item) =>
      (!typeCode || item.typeCode === typeCode) &&
      (!label || item.label.includes(label)) &&
      (!value || item.value.includes(value)) &&
      (!status || item.status === status),
  );
  return paginate(filtered, query, "page");
}

function deptMatches(query: URLSearchParams): (item: Department) => boolean {
  const name = query.get("name");
  const status = query.get("status");
  return (item) => (!name || item.name.includes(name)) && (!status || item.status === status);
}

function getFileList(items: SysFile[], query: URLSearchParams) {
  const name = query.get("name");
  const ext = query.get("ext");
  const storage = query.get("storage");
  const filtered = items.filter(
    (item) =>
      (!name || item.originalName.includes(name)) &&
      (!ext || item.ext === ext) &&
      (!storage || item.storage === storage),
  );
  return paginate(filtered, query, "page", 20);
}

function logMatches(query: URLSearchParams): (item: OperationLog | LoginLog) => boolean {
  const username = query.get("username");
  const status = query.get("status");
  const startTime = query.get("startTime");
  const endTime = query.get("endTime");
  return (item) =>
    (!username || item.username.includes(username)) &&
    (!status || item.status === status) &&
    (!startTime || item.createTime >= startTime) &&
    (!endTime || item.createTime <= endTime);
}

function getOperationLogList(items: OperationLog[], query: URLSearchParams) {
  const module = query.get("module");
  const action = query.get("action");
  const matchesLog = logMatches(query);
  const filtered = items.filter(
    (item) =>
      matchesLog(item) && (!module || item.module === module) && (!action || item.action === action),
  );
  return paginate(filtered, query, "page");
}

function getLoginLogList(items: LoginLog[], query: URLSearchParams) {
  const ip = query.get("ip");
  const matchesLog = logMatches(query);
  const filtered = items.filter((item) => matchesLog(item) && (!ip || item.ip.includes(ip)));
  return paginate(filtered, query, "page");
}

function filterTree<Item extends { children?: Item[] }>(
  items: Item[],
  matches: (item: Item) => boolean,
): Item[] {
  const result: Item[] = [];
  for (const item of items) {
    const children = item.children && filterTree(item.children, matches);
    if (matches(item) || children?.length) result.push({ ...item, children });
  }
  return result;
}

function getPermissionList(items: Permission[], query: URLSearchParams): Permission[] {
  const keyword = query.get("keyword")?.trim().toLowerCase();
  const type = query.get("type");
  const status = query.get("status");
  return filterTree(items, (item) => {
    const name = typeof item.name === "string" ? item.name : Object.values(item.name).join(" ");
    return (
      (!keyword ||
        name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        (item.path ?? "").toLowerCase().includes(keyword)) &&
      (!type || item.type === type) &&
      (!status || (item.status ?? "active") === status)
    );
  });
}

interface PermissionLocation {
  item: Permission;
  siblings: Permission[];
  parent?: Permission;
}

function findPermission(
  list: Permission[],
  id: string,
  parent?: Permission,
): PermissionLocation | undefined {
  for (const item of list) {
    if (item.id === id) return { item, siblings: list, parent };
    const child = item.children && findPermission(item.children, id, item);
    if (child) return child;
  }
}

function removePermission({ item, siblings, parent }: PermissionLocation): void {
  siblings.splice(siblings.indexOf(item), 1);
  if (parent && !siblings.length) delete parent.children;
}

function getPaginatedUsers(items: User[], query: URLSearchParams) {
  const username = query.get("username")?.toLowerCase();
  const email = query.get("email")?.toLowerCase();
  const status = query.get("status");
  const genders = [...query]
    .filter(([key]) => key === "gender" || /^gender\[\d*\]$/.test(key))
    .flatMap(([, value]) => value.split(",").map((gender) => gender.trim()))
    .filter(Boolean);
  const filtered = items.filter(
    (item) =>
      (!username || item.username.toLowerCase().includes(username)) &&
      (!email || item.email.toLowerCase().includes(email)) &&
      (!status || item.status === status) &&
      (!genders.length || (item.gender && genders.includes(item.gender))),
  );
  return paginate(filtered, query);
}

function getPaginatedRoles(items: Role[], query: URLSearchParams) {
  const name = query.get("name")?.toLowerCase();
  const code = query.get("code")?.toLowerCase();
  const filtered = items.filter(
    (item) =>
      (!name || item.name.toLowerCase().includes(name)) &&
      (!code || item.code.toLowerCase().includes(code)),
  );
  return paginate(filtered, query);
}

function fallbackDemoResponse(config: AxiosRequestConfig, url: URL) {
  const method = config.method?.toLowerCase() || "get";
  const query = url.searchParams;

  if (
    method === "get" &&
    (url.pathname.endsWith("/list") || ["current", "page", "pageSize"].some((key) => query.has(key)))
  ) {
    return successResponse(paginate([], query));
  }

  if (method === "post" || method === "put" || method === "patch") {
    return successResponse(parseJsonBody(config.data, null));
  }

  return successResponse(null);
}

export function setupBrowserMock(service: AxiosInstance): AxiosMockAdapter {
  const mock = new AxiosMockAdapter(service, { delayResponse: 250 });
  const state = cloneData({
    users: demoUsers,
    roles: mockRoles,
    permissions: mockPermissions,
    departments,
    dictTypes,
    dictData,
    configs: sysConfigs,
    files: sysFiles,
    operationLogs,
    loginLogs,
  });
  let nextId = Date.now();
  const createId = (): string => String(nextId++);
  const requestUrl = (config: AxiosRequestConfig): URL =>
    new URL(service.getUri(config), "https://mock.local");
  const query = (config: AxiosRequestConfig): URLSearchParams => requestUrl(config).searchParams;

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

  mock.onGet(route("/dict/types")).reply(() => replyWithData(state.dictTypes));
  mock
    .onGet(route("/dict/type/list"))
    .reply((config) => replyWithData(getDictTypeList(state.dictTypes, query(config))));
  registerCrud(
    mock,
    "/dict/type",
    state.dictTypes,
    "Dictionary type",
    (body): DictType => {
      const id = createId();
      const time = new Date().toISOString();
      return {
        name: "Custom Dictionary",
        code: `dict_${id}`,
        status: "enabled",
        ...body,
        id,
        createTime: time,
        updateTime: time,
      };
    },
    () => ({ updateTime: new Date().toISOString() }),
  );

  mock.onGet(route("/dict/data/all")).reply(() => replyWithData(state.dictData));
  mock
    .onGet(route("/dict/data/list"))
    .reply((config) => replyWithData(getDictDataList(state.dictData, query(config))));
  mock.onGet(route("/dict/data", true)).reply((config) => {
    const typeCode = pathValue(config);
    return replyWithData(
      state.dictData.filter((item) => item.typeCode === typeCode && item.status === "enabled"),
    );
  });
  registerCrud(
    mock,
    "/dict/data",
    state.dictData,
    "Dictionary entry",
    (body): DictData => {
      const time = new Date().toISOString();
      return {
        typeCode: "",
        label: "",
        value: "",
        sort: 0,
        status: "enabled",
        ...body,
        id: createId(),
        createTime: time,
        updateTime: time,
      };
    },
    () => ({ updateTime: new Date().toISOString() }),
  );

  mock.onGet(route("/dept/tree")).reply((config) =>
    replyWithData(filterTree(buildDeptTree(state.departments), deptMatches(query(config)))),
  );
  mock.onGet(route("/dept/list")).reply((config) => {
    const items = state.departments.filter(deptMatches(query(config)));
    items.sort((first, second) => first.sort - second.sort);
    return replyWithData(items);
  });
  registerCrud(
    mock,
    "/dept",
    state.departments,
    "Department",
    (body): Department => {
      const time = dateTime();
      return {
        name: "Custom Department",
        parentId: null,
        sort: 0,
        status: "enabled",
        ...body,
        id: createId(),
        createTime: time,
        updateTime: time,
        children: undefined,
      };
    },
    () => ({ updateTime: dateTime(), children: undefined }),
    (item) =>
      state.departments.some((department) => department.parentId === item.id)
        ? "Department has children"
        : undefined,
  );

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
    .onGet(route("/permissions"))
    .reply((config) => replyWithData(getPermissionList(state.permissions, query(config))));
  mock.onGet(route("/permissions/tree")).reply(() => replyWithData(state.permissions));
  mock
    .onGet(/\/api\/permissions\/user$|\/permissions\/user$/)
    .reply(200, successResponse(cloneData<Permission[]>(adminUser.permissions)));
  const permissionDetail = route("/permissions", true);
  mock.onGet(permissionDetail).reply((config) =>
    replyWithItem(findPermission(state.permissions, pathValue(config))?.item, "Permission"),
  );
  mock.onPost(route("/permissions")).reply((config) => {
    const body = readBody<Permission>(config);
    const parentId = body.parentId || undefined;
    const parent = parentId ? findPermission(state.permissions, parentId)?.item : undefined;
    if (parentId && !parent) return replyWithError(400, "Parent permission not found");

    const id = createId();
    const code = body.code || `permission_${id}`;
    const type = body.type || "menu";
    const item: Permission = {
      name: "Custom Permission",
      description: "",
      sort: 0,
      status: "active",
      visible: true,
      ...body,
      id,
      code,
      type,
      parentId,
      resource: body.resource || body.path || code,
      action: body.action || (type === "menu" ? "view" : "*"),
      children: undefined,
    };
    const siblings = parent ? (parent.children ??= []) : state.permissions;
    siblings.push(item);
    return replyWithData(item);
  });
  mock.onPut(permissionDetail).reply((config) => {
    const id = pathValue(config);
    const location = findPermission(state.permissions, id);
    if (!location) return replyWithError(404, "Permission not found");

    const { item, siblings } = location;
    const body = readBody<Permission>(config);
    const parentId = body.parentId === undefined ? item.parentId : body.parentId || undefined;
    const updated = { ...item, ...body, id, parentId, children: item.children };
    if (parentId === item.parentId) {
      siblings[siblings.indexOf(item)] = updated;
    } else {
      const parent = parentId ? findPermission(state.permissions, parentId)?.item : undefined;
      if (parentId && !parent) return replyWithError(400, "Parent permission not found");
      if (parentId && (id === parentId || findPermission(item.children ?? [], parentId))) {
        return replyWithError(400, "Invalid parent permission");
      }

      removePermission(location);
      const target = parent ? (parent.children ??= []) : state.permissions;
      target.push(updated);
    }
    return replyWithData(updated);
  });
  mock.onDelete(permissionDetail).reply((config) => {
    const location = findPermission(state.permissions, pathValue(config));
    if (!location) return replyWithError(404, "Permission not found");
    removePermission(location);
    return replyWithData(null);
  });

  mock
    .onGet(route("/file/list"))
    .reply((config) => replyWithData(getFileList(state.files, query(config))));
  mock.onDelete(route("/file", true)).reply((config) =>
    removeItem(state.files, pathValue(config), "File"),
  );

  mock.onGet(route("/log/operation/list")).reply((config) =>
    replyWithOperationLogAccess(config, () =>
      replyWithData(getOperationLogList(state.operationLogs, query(config))),
    ),
  );
  mock.onPost(route("/log/operation/filter-intent")).reply((config) =>
    replyWithOperationLogAccess(config, () => {
      const input = readLogFilterRequest(parseJsonBody<unknown>(config.data, null));
      if (!input) return replyWithError(400, "Invalid log filter request");

      return replyWithData({
        filters: parseDemoLogFilters(input.prompt, input.locale),
        source: "rules",
      });
    }),
  );
  mock
    .onGet(route("/log/login/list"))
    .reply((config) => replyWithData(getLoginLogList(state.loginLogs, query(config))));
  mock.onDelete(route("/log/operation/clear")).reply(() => {
    state.operationLogs.length = 0;
    return replyWithData(null);
  });
  mock.onDelete(route("/log/login/clear")).reply(() => {
    state.loginLogs.length = 0;
    return replyWithData(null);
  });

  mock
    .onGet(route("/users"))
    .reply((config) => replyWithData(getPaginatedUsers(state.users, query(config))));
  mock.onGet(route("/users", true)).reply((config) => {
    const id = pathValue(config);
    return replyWithItem(state.users.find((item) => item.id === id), "User");
  });
  registerCrud(
    mock,
    "/users",
    state.users,
    "User",
    (body) => {
      const id = createId();
      const time = new Date().toISOString();
      return {
        ...regularUser,
        ...body,
        id,
        username: body.username || `user_${id}`,
        email: body.email || "user@example.com",
        realName: body.realName || "Demo User",
        avatar: body.avatar || avatarImg,
        roles: body.roles ?? [],
        permissions: body.permissions ?? [],
        createdAt: time,
        updatedAt: time,
      };
    },
    () => ({ updatedAt: new Date().toISOString() }),
  );
  mock.onPost(/\/api\/users\/change-password$|\/users\/change-password$/).reply(200, successResponse(null));

  mock
    .onGet(route("/roles"))
    .reply((config) => replyWithData(getPaginatedRoles(state.roles, query(config))));
  mock.onGet(route("/roles", true)).reply((config) => {
    const id = pathValue(config);
    return replyWithItem(state.roles.find((item) => item.id === id), "Role");
  });
  registerCrud(
    mock,
    "/roles",
    state.roles,
    "Role",
    (body) => {
      const id = createId();
      const time = new Date().toISOString();
      return {
        id,
        name: body.name || "Custom Role",
        code: body.code || `role_${id}`,
        description: body.description || "",
        permissions: body.permissions ?? [],
        createdAt: time,
        updatedAt: time,
      };
    },
    () => ({ updatedAt: new Date().toISOString() }),
  );

  mock
    .onGet(route("/config/list"))
    .reply((config) => replyWithData(getConfigList(state.configs, query(config))));
  mock.onGet(route("/config/key", true)).reply((config) => {
    const key = pathValue(config);
    return replyWithItem(state.configs.find((item) => item.key === key), "Config");
  });
  registerCrud(
    mock,
    "/config",
    state.configs,
    "Config",
    (body) => {
      const id = createId();
      const time = dateTime();
      return {
        id,
        name: body.name || "Custom Config",
        key: body.key || `custom.${id}`,
        value: body.value ?? "",
        valueType: body.valueType || "string",
        group: body.group || "basic",
        description: body.description || "",
        builtIn: false,
        sort: body.sort ?? 100,
        createTime: time,
        updateTime: time,
      };
    },
    () => ({ updateTime: dateTime() }),
    (item) => (item.builtIn ? "Built-in config cannot be deleted" : undefined),
  );

  mock
    .onAny(/^\/|\/api\//)
    .reply((config) => [200, fallbackDemoResponse(config, requestUrl(config))]);

  mock.onAny().passThrough();

  return mock;
}

export { successResponse };
