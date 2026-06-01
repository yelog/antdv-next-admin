import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "@/constants/permissions";
import { filterRoutesByPermission } from "@/router/utils";
import type { AppRouteRecordRaw } from "@/types/router";

function createRoutes(): AppRouteRecordRaw[] {
  return [
    {
      path: "/system",
      name: "System",
      redirect: "/system/user",
      meta: { title: "System" },
      children: [
        {
          path: "user",
          name: "User",
          meta: {
            title: "User",
            requiredPermissions: [PERMISSIONS.SYSTEM_USER_VIEW],
          },
        },
        {
          path: "role",
          name: "Role",
          meta: {
            title: "Role",
            requiredPermissions: [PERMISSIONS.SYSTEM_ROLE_VIEW],
          },
        },
      ],
    },
  ];
}

describe("filterRoutesByPermission", () => {
  it("keeps children that match effective permissions", () => {
    const routes = filterRoutesByPermission(createRoutes(), [
      PERMISSIONS.SYSTEM_USER_VIEW,
    ]);

    expect(routes).toHaveLength(1);
    expect(routes[0].children?.map((route) => route.name)).toEqual(["User"]);
  });

  it("removes redirect parents when no children remain", () => {
    const routes = filterRoutesByPermission(createRoutes(), [
      PERMISSIONS.DASHBOARD_VIEW,
    ]);

    expect(routes).toEqual([]);
  });
});
