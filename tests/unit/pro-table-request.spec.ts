import { describe, expect, it } from "vitest";

import { buildSorterRequestParams } from "@/components/Pro/ProTable/composables/useProTableRequest";

describe("ProTable request helpers", () => {
  it("returns empty params when sorter is inactive", () => {
    expect(buildSorterRequestParams(null)).toEqual({});
    expect(buildSorterRequestParams({ field: "name" })).toEqual({});
  });

  it("builds single sorter params", () => {
    expect(buildSorterRequestParams({ field: "name", order: "ascend" })).toEqual({
      sorter: { field: "name", order: "ascend" },
    });
  });

  it("builds multiple sorter params", () => {
    expect(
      buildSorterRequestParams([
        { field: "name", order: "ascend" },
        { field: "age" },
        { field: "createdAt", order: "descend" },
      ]),
    ).toEqual({
      sorter: [
        { field: "name", order: "ascend" },
        { field: "createdAt", order: "descend" },
      ],
    });
  });
});
