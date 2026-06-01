import type {
  HeaderFilterMode,
  ProTableColumn,
  ProTableHeaderFilter,
  ProTableHeaderFilterConfig,
} from "@/types/pro";

export type TableFilterValue = (string | number | boolean)[] | null;

export interface HeaderFilterEntry {
  key: string;
  column: ProTableColumn;
  headerFilter: ProTableHeaderFilter;
}

export function normalizeHeaderFilterMode(
  mode: HeaderFilterMode | undefined,
  defaultMode: HeaderFilterMode | undefined,
): HeaderFilterMode {
  return mode ?? defaultMode ?? "server";
}

export function isClientHeaderFilterMode(mode: HeaderFilterMode) {
  return mode === "client" || mode === "hybrid";
}

export function isServerHeaderFilterMode(mode: HeaderFilterMode) {
  return mode === "server" || mode === "hybrid";
}

export function normalizeSelectedFilterValues(
  value: unknown,
): (string | number | boolean)[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string | number | boolean =>
        item !== undefined && item !== null && item !== "",
    );
  }
  if (value === undefined || value === null || value === "") {
    return [];
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return [value];
  }
  return [];
}

export function normalizeTableFilters(filters: Record<string, unknown> | undefined) {
  const normalized: Record<string, TableFilterValue> = {};
  if (!filters || typeof filters !== "object") {
    return normalized;
  }

  Object.keys(filters).forEach((key) => {
    const values = normalizeSelectedFilterValues(filters[key]);
    normalized[key] = values.length > 0 ? values : null;
  });

  return normalized;
}

export function splitKeywordTerms(keyword: string) {
  return keyword
    .trim()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getColumnCellValue(
  record: Record<string, unknown>,
  column: ProTableColumn,
) {
  return record?.[String(column.dataIndex)];
}

export function applyKeywordClientFilter(
  value: unknown,
  record: Record<string, unknown>,
  column: ProTableColumn,
  headerFilter: ProTableHeaderFilter,
) {
  if (typeof headerFilter.clientFilter === "function") {
    return headerFilter.clientFilter(value, record, column);
  }

  const keyword = String(value ?? "").trim();
  if (!keyword) {
    return true;
  }

  const rawText = String(getColumnCellValue(record, column) ?? "");
  const caseSensitive = Boolean(headerFilter.caseSensitive);
  const normalizedText = caseSensitive ? rawText : rawText.toLowerCase();
  const terms = splitKeywordTerms(keyword).map((item) =>
    caseSensitive ? item : item.toLowerCase(),
  );

  if (terms.length === 0) {
    return true;
  }

  const matchAll = headerFilter.matchAllKeywords !== false;
  if (matchAll) {
    return terms.every((term) => normalizedText.includes(term));
  }

  return terms.some((term) => normalizedText.includes(term));
}

export function applySelectClientFilter(
  value: unknown,
  record: Record<string, unknown>,
  column: ProTableColumn,
  headerFilter: ProTableHeaderFilter,
) {
  if (typeof headerFilter.clientFilter === "function") {
    return headerFilter.clientFilter(value, record, column);
  }

  const cellValue = getColumnCellValue(record, column);
  if (Array.isArray(cellValue)) {
    return cellValue.map((item) => String(item)).includes(String(value));
  }

  return String(cellValue ?? "") === String(value ?? "");
}

export function buildHeaderFilterRequestParams(options: {
  filters: Record<string, TableFilterValue>;
  entries: Map<string, HeaderFilterEntry>;
  config?: ProTableHeaderFilterConfig;
}) {
  const payloadMode = options.config?.requestPayload ?? "flat";
  const nestedKey = options.config?.nestedKey || "filters";
  const defaultMode = options.config?.defaultMode;
  const flatParams: Record<string, unknown> = {};
  const nestedParams: Record<string, unknown> = {};

  Object.keys(options.filters).forEach((tableFilterKey) => {
    const selectedValues = normalizeSelectedFilterValues(
      options.filters[tableFilterKey],
    );
    if (selectedValues.length === 0) {
      return;
    }

    const entry = options.entries.get(tableFilterKey);
    if (!entry) {
      return;
    }

    const mode = normalizeHeaderFilterMode(entry.headerFilter.mode, defaultMode);
    if (!isServerHeaderFilterMode(mode)) {
      return;
    }

    const paramKey = entry.headerFilter.paramKey || String(entry.column.dataIndex);
    const isMultiple = Boolean(entry.headerFilter.multiple);
    let requestValue: unknown;

    if (entry.headerFilter.type === "keyword") {
      requestValue = String(selectedValues[0] ?? "");
    } else {
      requestValue = isMultiple ? selectedValues : selectedValues[0];
    }

    if (typeof entry.headerFilter.transformRequestValue === "function") {
      requestValue = entry.headerFilter.transformRequestValue(
        requestValue,
        selectedValues,
      );
    }

    if (
      requestValue === undefined ||
      requestValue === null ||
      requestValue === "" ||
      (Array.isArray(requestValue) && requestValue.length === 0)
    ) {
      return;
    }

    if (payloadMode === "nested") {
      nestedParams[paramKey] = requestValue;
      return;
    }

    flatParams[paramKey] = requestValue;
  });

  if (payloadMode === "nested") {
    if (Object.keys(nestedParams).length === 0) {
      return {};
    }
    return {
      [nestedKey]: nestedParams,
    };
  }

  return flatParams;
}
