import type { AxiosInstance } from "axios";

import { create } from "axios";
import { describe, expect, it } from "vitest";

import { setupBrowserMock } from "@/mock/browser";
import type { ApiResponse, PageResult } from "@/types/api";
import type { Permission, Role, User } from "@/types/auth";
import type { SysConfig } from "@/types/config";
import type { Department } from "@/types/dept";
import type { DictData, DictType } from "@/types/dict";
import type { SysFile } from "@/types/file";

function createDemoClient(): AxiosInstance {
  const client = create({
    baseURL: "/api",
    adapter: async () => {
      throw new Error("Unexpected request outside the browser mock");
    },
  });
  setupBrowserMock(client);
  return client;
}

describe("setupBrowserMock", () => {
  it("registers a health endpoint without hitting the network", async () => {
    const client = createDemoClient();

    const response = await client.get("/__mock_health");

    expect(response.data).toEqual({
      code: 200,
      message: "success",
      success: true,
      data: { enabled: true },
    });
  });

  it("handles demo login and user info", async () => {
    const client = createDemoClient();

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
    const client = createDemoClient();

    const response = await client.get("/dict/data/all");

    expect(response.data.code).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBeGreaterThan(0);
  });

  it("handles dashboard endpoints", async () => {
    const client = createDemoClient();

    const stats = await client.get("/dashboard/stats");
    const chartData = await client.get("/dashboard/chart-data");

    expect(stats.data.code).toBe(200);
    expect(stats.data.data).toBeTruthy();
    expect(chartData.data.code).toBe(200);
    expect(chartData.data.data).toBeTruthy();
  });

  it("handles permission tree endpoints", async () => {
    const client = createDemoClient();

    const permissions = await client.get("/permissions");
    const tree = await client.get("/permissions/tree");

    expect(permissions.data.code).toBe(200);
    expect(Array.isArray(permissions.data.data)).toBe(true);
    expect(tree.data.code).toBe(200);
    expect(Array.isArray(tree.data.data)).toBe(true);
  });

  it("handles paginated config list endpoints", async () => {
    const client = createDemoClient();

    const all = await client.get("/config/list?page=1&pageSize=100");
    const basic = await client.get("/config/list?group=basic&page=1&pageSize=10");

    expect(all.data.code).toBe(200);
    expect(all.data.data.total).toBeGreaterThan(0);
    expect(basic.data.code).toBe(200);
    expect(basic.data.data.list.every((item: { group: string }) => item.group === "basic")).toBe(true);
  });

  it("handles paginated user and role list endpoints", async () => {
    const client = createDemoClient();

    const users = await client.get("/users?current=1&pageSize=10");
    const roles = await client.get("/roles?current=1&pageSize=200");

    expect(users.data.code).toBe(200);
    expect(users.data.data.total).toBeGreaterThan(0);
    expect(users.data.data.list[0].username).toBe("admin");
    expect(roles.data.code).toBe(200);
    expect(roles.data.data.total).toBeGreaterThan(0);
    expect(roles.data.data.list[0].code).toBe("admin");
  });

  it("falls back for uncovered demo api list endpoints", async () => {
    const client = createDemoClient();

    const response = await client.get("/new-example/list?current=2&pageSize=15");

    expect(response.data.code).toBe(200);
    expect(response.data.data).toEqual({
      list: [],
      total: 0,
      current: 2,
      pageSize: 15,
    });
  });

  it("handles system demo endpoints with expected data shapes", async () => {
    const client = createDemoClient();

    const [dictTypes, dictData, deptTree, deptList, files, operationLogs, loginLogs, userPermissions] =
      await Promise.all([
        client.get("/dict/types"),
        client.get("/dict/data/gender"),
        client.get("/dept/tree"),
        client.get("/dept/list"),
        client.get("/file/list?page=1&pageSize=10"),
        client.get("/log/operation/list?page=1&pageSize=10"),
        client.get("/log/login/list?page=1&pageSize=10"),
        client.get("/permissions/user"),
      ]);

    expect(Array.isArray(dictTypes.data.data)).toBe(true);
    expect(Array.isArray(dictData.data.data)).toBe(true);
    expect(Array.isArray(deptTree.data.data)).toBe(true);
    expect(Array.isArray(deptList.data.data)).toBe(true);
    expect(files.data.data.total).toBeGreaterThan(0);
    expect(operationLogs.data.data.total).toBeGreaterThan(0);
    expect(loginLogs.data.data.total).toBeGreaterThan(0);
    expect(Array.isArray(userPermissions.data.data)).toBe(true);
  });

  it("pages users from Axios params the same way as a direct query", async () => {
    const client = createDemoClient();
    const [fromParams, fromUrl] = await Promise.all([
      client.get<ApiResponse<PageResult<User>>>("/users", { params: { current: 2, pageSize: 1 } }),
      client.get<ApiResponse<PageResult<User>>>("/users?current=2&pageSize=1"),
    ]);

    expect(fromParams.data.data).toMatchObject({ current: 2, pageSize: 1, total: 4 });
    expect(fromParams.data.data.list.map((user) => user.username)).toEqual(["user"]);
    expect(fromParams.data).toEqual(fromUrl.data);
  });

  it("combines a direct user filter with Axios params and handles array filters", async () => {
    const client = createDemoClient();
    const { data } = await client.get<ApiResponse<PageResult<User>>>("/users?status=active", {
      params: { email: "EXAMPLE.COM", gender: ["female"], pageSize: 1 },
    });

    expect(data.data.total).toBe(1);
    expect(data.data.list.map((user) => user.username)).toEqual(["user"]);
  });

  it.each([
    ["/roles", { name: "no-demo-match", current: 2 }],
    ["/config/list", { group: "no-demo-match", page: 2 }],
    ["/dict/type/list", { code: "no-demo-match", page: 2 }],
    ["/dict/data/list", { typeCode: "no-demo-match", page: 2 }],
    ["/file/list", { ext: "no-demo-match", page: 2 }],
    ["/log/operation/list", { module: "no-demo-match", page: 2 }],
    ["/log/login/list", { ip: "no-demo-match", page: 2 }],
  ])("applies Axios filters before slicing %s", async (url, params) => {
    const client = createDemoClient();
    const { data } = await client.get<ApiResponse<PageResult<unknown>>>(url, {
      params: { ...params, pageSize: 1 },
    });

    expect(data.data.total).toBe(0);
    expect(data.data).toEqual({ list: [], total: 0, current: 2, pageSize: 1 });
  });

  it("uses the serialized query for a compatibility fallback", async () => {
    const client = createDemoClient();
    const [combinedQuery, paramsOnly] = await Promise.all([
      client.get("/new-example?current=3", {
        params: { limit: 5 },
        paramsSerializer: { serialize: (params) => `pageSize=${params.limit}` },
      }),
      client.get("/new-example", { params: { page: 2, pageSize: 3 } }),
    ]);

    expect(combinedQuery.data.data).toEqual({ list: [], total: 0, current: 3, pageSize: 5 });
    expect(paramsOnly.data.data).toEqual({ list: [], total: 0, current: 2, pageSize: 3 });
  });

  it("reads new users by ID, sees updates in filtered lists and removes deleted users", async () => {
    const client = createDemoClient();
    const payload = {
      username: "synthetic-user",
      email: "synthetic-user@example.test",
      roles: [{ id: "synthetic-role", name: "Synthetic Role" }],
    };
    const { data: created } = await client.post<ApiResponse<User>>("/users", payload);
    const url = `/users/${created.data.id}`;
    const { data: detail } = await client.get<ApiResponse<User>>(url);

    expect(detail.code).toBe(200);
    expect(detail.data).toEqual(created.data);
    detail.data.roles[0].name = "Local response edit";

    await client.put(url, { realName: "Synthetic Updated", status: "inactive" });
    const listConfig = { params: { username: payload.username, status: "inactive" } };
    const { data: updated } = await client.get<ApiResponse<PageResult<User>>>("/users", listConfig);
    expect(updated.data.total).toBe(1);
    expect(updated.data.list[0]).toMatchObject({
      id: created.data.id,
      realName: "Synthetic Updated",
      roles: payload.roles,
    });

    await client.delete(url);
    const [deleted, remaining] = await Promise.all([
      client.get(url),
      client.get<ApiResponse<PageResult<User>>>("/users", listConfig),
    ]);
    expect(deleted.data.code).toBe(404);
    expect(remaining.data.data.total).toBe(0);
  });

  it("keeps role updates and removals within the client that made them", async () => {
    const first = createDemoClient();
    const second = createDemoClient();
    const { data: seeded } = await second.get<ApiResponse<PageResult<Role>>>("/roles");
    const roleUrl = `/roles/${seeded.data.list[0].id}`;

    await first.put(roleUrl, { name: "Synthetic Renamed Role" });
    const { data: changed } = await first.get<ApiResponse<Role>>(roleUrl);
    expect(changed.data.name).toBe("Synthetic Renamed Role");
    await first.delete(roleUrl);

    const { data: created } = await first.post<ApiResponse<Role>>("/roles", {
      code: "synthetic-role",
      name: "Synthetic Role",
      permissions: [{ id: "synthetic-permission" }],
    });
    const listConfig = { params: { code: "SYNTHETIC-ROLE" } };
    const [firstList, secondList, freshList] = await Promise.all([
      first.get<ApiResponse<PageResult<Role>>>("/roles", listConfig),
      second.get<ApiResponse<PageResult<Role>>>("/roles"),
      createDemoClient().get<ApiResponse<PageResult<Role>>>("/roles"),
    ]);
    expect(firstList.data.data.list).toEqual([created.data]);
    expect(secondList.data).toEqual(seeded);
    expect(freshList.data).toEqual(seeded);
    expect((await first.get(roleUrl)).data.code).toBe(404);
  });

  it("keeps dictionary type and data reads in sync with writes", async () => {
    const client = createDemoClient();
    const typeCode = "synthetic_status";
    const { data: type } = await client.post<ApiResponse<DictType>>("/dict/type", {
      code: typeCode,
      name: "Synthetic Status",
      status: "enabled",
    });
    const typeUrl = `/dict/type/${type.data.id}`;
    const { data: entry } = await client.post<ApiResponse<DictData>>("/dict/data", {
      typeCode,
      label: "Synthetic Ready",
      value: "ready",
      sort: 1,
      status: "enabled",
    });
    const entryUrl = `/dict/data/${entry.data.id}`;
    const byTypeUrl = `/dict/data/${typeCode}`;
    const { data: enabled } = await client.get<ApiResponse<DictData[]>>(byTypeUrl);
    expect(enabled.data).toEqual([entry.data]);

    await client.put(typeUrl, { name: "Renamed Synthetic Status" });
    await client.put(entryUrl, { status: "disabled" });
    const [types, page, enabledAfter] = await Promise.all([
      client.get<ApiResponse<DictType[]>>("/dict/types"),
      client.get<ApiResponse<PageResult<DictData>>>("/dict/data/list", { params: { typeCode } }),
      client.get<ApiResponse<DictData[]>>(byTypeUrl),
    ]);
    expect(types.data.data.find((item) => item.id === type.data.id)?.name).toBe(
      "Renamed Synthetic Status",
    );
    expect(page.data.data.list).toMatchObject([{ id: entry.data.id, status: "disabled" }]);
    expect(enabledAfter.data.data).toEqual([]);

    await Promise.all([client.delete(entryUrl), client.delete(typeUrl)]);
    const [allData, remainingTypes] = await Promise.all([
      client.get<ApiResponse<DictData[]>>("/dict/data/all"),
      client.get<ApiResponse<DictType[]>>("/dict/types"),
    ]);
    expect(allData.data.data.some((item) => item.id === entry.data.id)).toBe(false);
    expect(remainingTypes.data.data.some((item) => item.id === type.data.id)).toBe(false);
  });

  it("looks up changed config keys and removes deleted custom config", async () => {
    const client = createDemoClient();
    const key = "synthetic.demo.setting";
    const { data: created } = await client.post<ApiResponse<SysConfig>>("/config", {
      key,
      group: "synthetic",
      sort: 0,
    });
    const url = `/config/${created.data.id}`;
    const { data: byKey } = await client.get<ApiResponse<SysConfig>>(`/config/key/${key}`);
    expect(byKey.code).toBe(200);
    expect(byKey.data.sort).toBe(0);

    const newKey = `${key}.updated`;
    await client.put(url, { key: newKey, value: "new-value" });
    const listConfig = { params: { group: "synthetic", key: newKey, page: 1, pageSize: 1 } };
    const { data: page } = await client.get<ApiResponse<PageResult<SysConfig>>>(
      "/config/list",
      listConfig,
    );
    expect(page.data.list).toMatchObject([{ id: created.data.id, key: newKey, value: "new-value" }]);
    expect((await client.get(`/config/key/${key}`)).data.code).toBe(404);

    await client.delete(url);
    const [deleted, remaining] = await Promise.all([
      client.get(`/config/key/${newKey}`),
      client.get<ApiResponse<PageResult<SysConfig>>>("/config/list", listConfig),
    ]);
    expect(deleted.data.code).toBe(404);
    expect(remaining.data.data.total).toBe(0);
  });

  it("shows department writes in both the flat list and the tree", async () => {
    const client = createDemoClient();
    const { data: parent } = await client.post<ApiResponse<Department>>("/dept", {
      name: "Synthetic Parent",
      parentId: null,
    });
    const { data: child } = await client.post<ApiResponse<Department>>("/dept", {
      name: "Synthetic Child",
      parentId: parent.data.id,
    });
    const childUrl = `/dept/${child.data.id}`;
    await client.put(childUrl, { status: "disabled" });

    const filter = { params: { name: "Synthetic Child", status: "disabled" } };
    const [list, tree] = await Promise.all([
      client.get<ApiResponse<Department[]>>("/dept/list", filter),
      client.get<ApiResponse<Department[]>>("/dept/tree", filter),
    ]);
    const match = { id: child.data.id, name: "Synthetic Child", status: "disabled" };
    expect(list.data.data).toMatchObject([match]);
    expect(tree.data.data).toMatchObject([{ id: parent.data.id, children: [match] }]);

    await client.delete(childUrl);
    const { data: remaining } = await client.get<ApiResponse<Department[]>>("/dept/list", filter);
    expect(remaining.data).toEqual([]);
  });

  it("filters localized permission nodes with ancestors and moves and deletes their subtrees", async () => {
    const client = createDemoClient();
    const { data: parent } = await client.post<ApiResponse<Permission>>("/permissions", {
      name: "Synthetic Parent",
      code: "synthetic-parent",
    });
    const { data: child } = await client.post<ApiResponse<Permission>>("/permissions", {
      name: { "zh-CN": "合成权限", "en-US": "Synthetic Child" },
      code: "synthetic-child",
      type: "button",
      status: "inactive",
      parentId: parent.data.id,
    });
    const childUrl = `/permissions/${child.data.id}`;
    const { data: filtered } = await client.get<ApiResponse<Permission[]>>(
      "/permissions?type=button",
      { params: { keyword: "合成权限", status: "inactive" } },
    );
    expect(Array.isArray(filtered.data)).toBe(true);
    expect(filtered.data).toMatchObject([{ id: parent.data.id, children: [{ id: child.data.id }] }]);

    await client.put(childUrl, { parentId: "", status: "active" });
    const { data: tree } = await client.get<ApiResponse<Permission[]>>("/permissions/tree");
    expect(tree.data.find((item) => item.id === child.data.id)?.status).toBe("active");
    expect(tree.data.find((item) => item.id === parent.data.id)?.children ?? []).toEqual([]);
    await client.put(childUrl, { parentId: parent.data.id });
    await client.delete(`/permissions/${parent.data.id}`);
    expect((await client.get(childUrl)).data.code).toBe(404);
  });

  it("removes files and clears both log lists without affecting another mock", async () => {
    const client = createDemoClient();
    const other = createDemoClient();
    const fileListUrl = "/file/list";
    const operationUrl = "/log/operation";
    const loginUrl = "/log/login";
    const [files, operation, login] = await Promise.all([
      client.get<ApiResponse<PageResult<SysFile>>>(fileListUrl),
      client.get<ApiResponse<PageResult<unknown>>>(`${operationUrl}/list`),
      client.get<ApiResponse<PageResult<unknown>>>(`${loginUrl}/list`),
    ]);
    const deletedFile = files.data.data.list[0];
    expect(operation.data.data.total).toBeGreaterThan(0);
    expect(login.data.data.total).toBeGreaterThan(0);

    await Promise.all([
      client.delete(`/file/${deletedFile.id}`),
      client.delete(`${operationUrl}/clear`),
      client.delete(`${loginUrl}/clear`),
    ]);
    const [filesAfter, operationAfter, loginAfter, otherFiles, otherLogs] = await Promise.all([
      client.get<ApiResponse<PageResult<SysFile>>>(fileListUrl),
      client.get<ApiResponse<PageResult<unknown>>>(`${operationUrl}/list`),
      client.get<ApiResponse<PageResult<unknown>>>(`${loginUrl}/list`),
      other.get<ApiResponse<PageResult<SysFile>>>(fileListUrl),
      other.get<ApiResponse<PageResult<unknown>>>(`${loginUrl}/list`),
    ]);
    expect(filesAfter.data.data.total).toBe(files.data.data.total - 1);
    expect(filesAfter.data.data.list.some((file) => file.id === deletedFile.id)).toBe(false);
    expect(operationAfter.data.data.total).toBe(0);
    expect(loginAfter.data.data.total).toBe(0);
    expect(otherFiles.data).toEqual(files.data);
    expect(otherLogs.data).toEqual(login.data);
  });
});
