import type { ProTableColumn } from "@/types/pro";

export function getSearchColumnsPerRow(viewportWidth: number) {
  if (viewportWidth >= 992) {
    return 3;
  }
  if (viewportWidth >= 576) {
    return 2;
  }
  return 1;
}

export function getCollapsedSearchRows(rows: unknown) {
  const value = Number(rows ?? 1);
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

export function getCollapsedSearchFieldLimit(rows: number, columnsPerRow: number) {
  const totalSlots = rows * columnsPerRow;
  const shouldReserveActionSlot = rows === 1 || rows > 2;
  if (shouldReserveActionSlot) {
    return Math.max(1, totalSlots - 1);
  }
  return Math.max(1, totalSlots);
}

export function normalizeFieldLabel(label: unknown) {
  if (typeof label === "function") return "";
  return String(label ?? "");
}

export function resolveValueEnum(col: ProTableColumn) {
  if (col.valueEnum) return col.valueEnum;
  if (col.options) {
    const enumMap: Record<
      string,
      { text: string; status?: string; color?: string }
    > = {};
    col.options.forEach((option) => {
      enumMap[String(option.value)] = {
        text: option.label,
        status: option.status,
        color: option.color,
      };
    });
    return enumMap;
  }
  return undefined;
}
