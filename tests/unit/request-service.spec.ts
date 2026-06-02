import { describe, expect, it, vi } from "vitest";

vi.mock("antdv-next", () => ({
  message: {
    error: vi.fn(),
  },
}));

vi.mock("@/router", () => ({
  default: {
    push: vi.fn(),
  },
}));

import { service } from "@/utils/request";

describe("request service", () => {
  it("exports the axios instance used by request helpers", () => {
    expect(service.defaults.timeout).toBe(15000);
    expect(service.defaults.headers["Content-Type"]).toBe("application/json");
  });
});
