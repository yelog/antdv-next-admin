import type { ProTableRequestResult } from "@/types/pro";

import { ref } from "vue";

export function useProTableRemoteData() {
  const remoteDataSource = ref<Record<string, unknown>[]>([]);
  const total = ref(0);
  const loading = ref(false);
  let requestVersion = 0;

  async function load(
    request: () => Promise<ProTableRequestResult>,
    onData: () => void,
    onError: (error: unknown) => void,
  ): Promise<void> {
    const version = ++requestVersion;
    loading.value = true;

    try {
      const result = await request();
      if (version !== requestVersion || !result.success) return;

      remoteDataSource.value = result.data as Record<string, unknown>[];
      total.value = result.total ?? result.data.length;
      onData();
    } catch (error: unknown) {
      if (version === requestVersion) onError(error);
    } finally {
      if (version === requestVersion) loading.value = false;
    }
  }

  function invalidate(): void {
    requestVersion++;
    loading.value = false;
  }

  return { remoteDataSource, total, loading, load, invalidate };
}

export interface TableSorterItem {
  field?: string;
  order?: "ascend" | "descend";
}

export function buildSorterRequestParams(
  sorter: TableSorterItem | TableSorterItem[] | null,
) {
  if (!sorter) {
    return {};
  }

  if (Array.isArray(sorter)) {
    const activeSorters = sorter.filter((item) => item?.field && item?.order);
    if (activeSorters.length === 0) {
      return {};
    }
    return {
      sorter: activeSorters.map((item) => ({
        field: item.field,
        order: item.order,
      })),
    };
  }

  if (sorter.field && sorter.order) {
    return {
      sorter: {
        field: sorter.field,
        order: sorter.order,
      },
    };
  }

  return {};
}
