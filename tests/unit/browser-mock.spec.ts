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
});
