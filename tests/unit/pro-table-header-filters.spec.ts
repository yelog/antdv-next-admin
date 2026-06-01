import { describe, expect, it } from "vitest";

import {
  applyKeywordClientFilter,
  buildHeaderFilterRequestParams,
  normalizeSelectedFilterValues,
  normalizeTableFilters,
  splitKeywordTerms,
  type HeaderFilterEntry,
} from "@/components/Pro/ProTable/composables/useProTableHeaderFilters";

describe("ProTable header filter helpers", () => {
  it("normalizes selected filter values", () => {
    expect(normalizeSelectedFilterValues(["active", "", null, 1, false])).toEqual([
      "active",
      1,
      false,
    ]);
    expect(normalizeSelectedFilterValues("keyword")).toEqual(["keyword"]);
    expect(normalizeSelectedFilterValues(undefined)).toEqual([]);
  });

  it("normalizes table filters", () => {
    expect(normalizeTableFilters({ status: ["active"], empty: [] })).toEqual({
      status: ["active"],
      empty: null,
    });
  });

  it("splits keyword terms", () => {
    expect(splitKeywordTerms("  john   brown ")).toEqual(["john", "brown"]);
  });

  it("matches keyword filters with all terms by default", () => {
    expect(
      applyKeywordClientFilter(
        "john bro",
        { name: "John Brown" },
        { title: "Name", dataIndex: "name" },
        { type: "keyword" },
      ),
    ).toBe(true);
  });

  it("builds flat request params for server filters", () => {
    const entries = new Map<string, HeaderFilterEntry>();
    entries.set("status", {
      key: "status",
      column: { title: "Status", dataIndex: "status" },
      headerFilter: { type: "select" },
    });

    expect(
      buildHeaderFilterRequestParams({
        filters: { status: ["active"] },
        entries,
      }),
    ).toEqual({ status: "active" });
  });

  it("builds nested request params and skips client-only filters", () => {
    const entries = new Map<string, HeaderFilterEntry>();
    entries.set("name", {
      key: "name",
      column: { title: "Name", dataIndex: "name" },
      headerFilter: { type: "keyword", mode: "client" },
    });
    entries.set("status", {
      key: "status",
      column: { title: "Status", dataIndex: "status" },
      headerFilter: { type: "select", multiple: true },
    });

    expect(
      buildHeaderFilterRequestParams({
        filters: { name: ["john"], status: ["active", "inactive"] },
        entries,
        config: { requestPayload: "nested", nestedKey: "where" },
      }),
    ).toEqual({ where: { status: ["active", "inactive"] } });
  });
});
