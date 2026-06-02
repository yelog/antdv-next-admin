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

  it("handles paginated config list endpoints", async () => {
    const client = axios.create({ baseURL: "/api" });
    setupBrowserMock(client);

    const all = await client.get("/config/list?page=1&pageSize=100");
    const basic = await client.get("/config/list?group=basic&page=1&pageSize=10");

    expect(all.data.code).toBe(200);
    expect(all.data.data.total).toBeGreaterThan(0);
    expect(basic.data.code).toBe(200);
    expect(basic.data.data.list.every((item: { group: string }) => item.group === "basic")).toBe(true);
  });

  it("handles paginated user and role list endpoints", async () => {
    const client = axios.create({ baseURL: "/api" });
    setupBrowserMock(client);

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
    const client = axios.create({ baseURL: "/api" });
    setupBrowserMock(client);

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
    const client = axios.create({ baseURL: "/api" });
    setupBrowserMock(client);

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
});
