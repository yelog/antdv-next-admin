import { describe, expect, it } from "vitest";

import {
  getCollapsedSearchFieldLimit,
  getCollapsedSearchRows,
  getSearchColumns,
  getSearchColumnsPerRow,
  normalizeFieldLabel,
  resolveSearchOptions,
  resolveSearchType,
  resolveValueEnum,
} from "@/components/Pro/ProTable/composables/useProTableSearch";

describe("ProTable search helpers", () => {
  it("filters searchable columns", () => {
    expect(
      getSearchColumns([
        { title: "Name", dataIndex: "name", search: true },
        { title: "Age", dataIndex: "age" },
      ]).map((column) => column.dataIndex),
    ).toEqual(["name"]);
  });

  it("uses explicit search columns before table columns", () => {
    expect(
      getSearchColumns(
        [
          { title: "Name", dataIndex: "name", search: true },
          { title: "Age", dataIndex: "age" },
        ],
        [
          { title: "Keyword", dataIndex: "keyword", searchType: "input" },
          { title: "Status", dataIndex: "status", searchType: "select" },
        ],
      ).map((column) => column.dataIndex),
    ).toEqual(["keyword", "status"]);
  });

  it("calculates responsive search columns per row", () => {
    expect(getSearchColumnsPerRow(1200)).toBe(3);
    expect(getSearchColumnsPerRow(700)).toBe(2);
    expect(getSearchColumnsPerRow(375)).toBe(1);
  });

  it("calculates collapsed field limit", () => {
    expect(getCollapsedSearchRows("bad")).toBe(1);
    expect(getCollapsedSearchFieldLimit(1, 3)).toBe(2);
    expect(getCollapsedSearchFieldLimit(2, 3)).toBe(6);
  });

  it("resolves search type from value type and options", () => {
    expect(resolveSearchType({ title: "Status", dataIndex: "status", valueType: "badge" })).toBe("select");
    expect(resolveSearchType({ title: "Date", dataIndex: "date", valueType: "dateTime" })).toBe("datePicker");
    expect(resolveSearchType({ title: "Amount", dataIndex: "amount", valueType: "money" })).toBe("number");
    expect(resolveSearchType({ title: "Name", dataIndex: "name" })).toBe("input");
  });

  it("resolves options and value enum", () => {
    const column = {
      title: "Status",
      dataIndex: "status",
      options: [{ label: "Active", value: "active", status: "success" }],
    };

    expect(resolveSearchOptions(column)).toEqual([
      { label: "Active", value: "active" },
    ]);
    expect(resolveValueEnum(column)).toEqual({
      active: { text: "Active", status: "success", color: undefined },
    });
  });

  it("normalizes non-string labels", () => {
    expect(normalizeFieldLabel("Name")).toBe("Name");
    expect(normalizeFieldLabel(() => "Name")).toBe("");
  });
});
