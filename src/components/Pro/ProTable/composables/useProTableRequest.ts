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
