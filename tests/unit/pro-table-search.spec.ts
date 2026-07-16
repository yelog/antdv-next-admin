import { describe, expect, it } from 'vitest';

import {
  getCollapsedSearchFieldLimit,
  getCollapsedSearchRows,
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

  it('normalizes responsive search columns', () => {
    expect(getSearchResponsiveColumns(4)).toEqual({
      xs: 1,
      sm: 4,
      md: 4,
      lg: 4,
      xl: 4,
    });
    expect(getSearchResponsiveColumns(5)).toEqual({
      xs: 1,
      sm: 5,
      md: 5,
      lg: 5,
      xl: 5,
    });
  });

  it('calculates collapsed field limit', () => {
    expect(getCollapsedSearchRows('bad')).toBe(1);
    expect(getCollapsedSearchFieldLimit(1, 3)).toBe(2);
    expect(getCollapsedSearchFieldLimit(2, 3)).toBe(6);
    expect(getCollapsedSearchFieldLimit(1, 5)).toBe(4);
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
