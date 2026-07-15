import { describe, expect, it } from 'vitest';

import {
  getCollapsedSearchFieldLimit,
  getCollapsedSearchRows,
  getSearchColBindings,
  getSearchColumnsPerRow,
  getSearchResponsiveColumns,
  normalizeFieldLabel,
  resolveValueEnum,
} from '@/components/Pro/ProTable/composables/useProTableSearch';

describe('ProTable search helpers', () => {
  it('calculates responsive search columns per row', () => {
    expect(getSearchColumnsPerRow(1200)).toBe(3);
    expect(getSearchColumnsPerRow(700)).toBe(2);
    expect(getSearchColumnsPerRow(375)).toBe(1);
  });

  it('honors configured search columns per row', () => {
    expect(getSearchColumnsPerRow(1200, 4)).toBe(4);
    expect(getSearchColumnsPerRow(700, { xs: 1, sm: 2, xl: 5 })).toBe(2);
    expect(getSearchColumnsPerRow(1440, { xs: 1, sm: 2, xl: 5 })).toBe(5);
  });

  it('converts search column config into real grid bindings', () => {
    expect(getSearchResponsiveColumns(4)).toEqual({
      xs: 1,
      sm: 4,
      md: 4,
      lg: 4,
      xl: 4,
    });
    expect(getSearchColBindings({ xs: 1, sm: 2, lg: 4 })).toEqual({
      xs: 24,
      sm: 12,
      md: 12,
      lg: 6,
      xl: 6,
    });
  });

  it('calculates collapsed field limit', () => {
    expect(getCollapsedSearchRows('bad')).toBe(1);
    expect(getCollapsedSearchFieldLimit(1, 3)).toBe(2);
    expect(getCollapsedSearchFieldLimit(2, 3)).toBe(6);
  });

  it('resolves value enum from options', () => {
    const column = {
      title: 'Status',
      dataIndex: 'status',
      options: [{ label: 'Active', value: 'active', status: 'success' }],
    };

    expect(resolveValueEnum(column)).toEqual({
      active: { text: 'Active', status: 'success', color: undefined },
    });
  });

  it('normalizes non-string labels', () => {
    expect(normalizeFieldLabel('Name')).toBe('Name');
    expect(normalizeFieldLabel(() => 'Name')).toBe('');
  });
});
