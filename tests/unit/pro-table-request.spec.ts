import { describe, expect, it, vi } from "vitest";

import {
  buildSorterRequestParams,
  useProTableRemoteData,
} from "@/components/Pro/ProTable/composables/useProTableRequest";

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

describe("ProTable remote data", () => {
  const firstPage = { success: true, data: [{ page: 1 }], total: 20 };
  const secondPage = { success: true, data: [{ page: 2 }], total: 18 };

  it("ignores older rows and totals that arrive after the latest page", async () => {
    const table = useProTableRemoteData();
    const first = Promise.withResolvers<typeof firstPage>();
    const second = Promise.withResolvers<typeof secondPage>();
    const onData = vi.fn();
    const onError = vi.fn();

    const firstLoad = table.load(() => first.promise, onData, onError);
    const secondLoad = table.load(() => second.promise, onData, onError);
    second.resolve(secondPage);
    await secondLoad;
    first.resolve(firstPage);
    await firstLoad;

    expect(table.remoteDataSource.value).toEqual(secondPage.data);
    expect(table.total.value).toBe(secondPage.total);
    expect(table.loading.value).toBe(false);
    expect(onData).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });

  it("keeps loading and suppresses errors from a superseded query", async () => {
    const table = useProTableRemoteData();
    const first = Promise.withResolvers<typeof firstPage>();
    const second = Promise.withResolvers<typeof secondPage>();
    const onData = vi.fn();
    const onError = vi.fn();

    const firstLoad = table.load(() => first.promise, onData, onError);
    const secondLoad = table.load(() => second.promise, onData, onError);
    first.reject(new Error("old query"));
    await firstLoad;

    expect(table.loading.value).toBe(true);
    expect(onError).not.toHaveBeenCalled();

    const error = new Error("current query");
    second.reject(error);
    await secondLoad;

    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
    expect(table.loading.value).toBe(false);
  });

  it("discards a pending result after invalidation", async () => {
    const table = useProTableRemoteData();
    const pending = Promise.withResolvers<typeof firstPage>();
    const onData = vi.fn();
    const load = table.load(() => pending.promise, onData, vi.fn());

    table.invalidate();
    pending.resolve(firstPage);
    await load;

    expect(table.loading.value).toBe(false);
    expect(table.remoteDataSource.value).toEqual([]);
    expect(table.total.value).toBe(0);
    expect(onData).not.toHaveBeenCalled();
  });
});
