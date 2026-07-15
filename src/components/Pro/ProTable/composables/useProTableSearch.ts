import type { ProTableColumn, ProTableSearch } from '@/types/pro';

type SearchBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const DEFAULT_SEARCH_RESPONSIVE_COLUMNS: Record<SearchBreakpoint, number> = {
  xs: 1,
  sm: 2,
  md: 2,
  lg: 3,
  xl: 3,
};

function normalizeColumnCount(value: unknown, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.floor(value));
}

export function getSearchColumnsPerRow(
  viewportWidth: number,
  config?: ProTableSearch['columnsPerRow'],
) {
  if (typeof config === 'number' && Number.isFinite(config)) {
    return Math.max(1, Math.floor(config));
  }

  if (config && typeof config === 'object') {
    if (viewportWidth >= 1200 && config.xl) return config.xl;
    if (viewportWidth >= 992 && config.lg) return config.lg;
    if (viewportWidth >= 768 && config.md) return config.md;
    if (viewportWidth >= 576 && config.sm) return config.sm;
    if (config.xs) return config.xs;
  }

  if (viewportWidth >= 992) {
    return 3;
  }
  if (viewportWidth >= 576) {
    return 2;
  }
  return 1;
}

export function getSearchResponsiveColumns(config?: ProTableSearch['columnsPerRow']) {
  if (typeof config === 'number') {
    const columns = normalizeColumnCount(config, DEFAULT_SEARCH_RESPONSIVE_COLUMNS.lg);
    return {
      xs: 1,
      sm: columns,
      md: columns,
      lg: columns,
      xl: columns,
    };
  }

  if (!config || typeof config !== 'object') {
    return { ...DEFAULT_SEARCH_RESPONSIVE_COLUMNS };
  }

  const next = { ...DEFAULT_SEARCH_RESPONSIVE_COLUMNS };
  (Object.keys(next) as SearchBreakpoint[]).forEach((key) => {
    next[key] = normalizeColumnCount(config[key], next[key]);
  });

  if (!config.md && config.sm) {
    next.md = next.sm;
  }
  if (!config.lg && config.md) {
    next.lg = next.md;
  }
  if (!config.xl && config.lg) {
    next.xl = next.lg;
  }

  return next;
}

export function getSearchColBindings(columns: Partial<Record<SearchBreakpoint, number>>) {
  const normalizedColumns = getSearchResponsiveColumns(columns);
  return {
    xs: Math.floor(24 / normalizedColumns.xs),
    sm: Math.floor(24 / normalizedColumns.sm),
    md: Math.floor(24 / normalizedColumns.md),
    lg: Math.floor(24 / normalizedColumns.lg),
    xl: Math.floor(24 / normalizedColumns.xl),
  };
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
  if (typeof label === 'function') return '';
  return String(label ?? '');
}

export function resolveValueEnum(col: ProTableColumn) {
  if (col.valueEnum) return col.valueEnum;
  if (col.options) {
    const enumMap: Record<string, { text: string; status?: string; color?: string }> = {};
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
