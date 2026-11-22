import type { OperationLog, OperationLogQueryParams } from '@/types/log';

import { describe, expect, it, vi } from 'vitest';

import {
  buildActivityDays,
  readActivityOverview,
  workspaceLinks,
} from '@/views/dashboard/overview';

describe('workspace overview', () => {
  it('uses seven local calendar dates, including zero days and excluding outside records', () => {
    const days = buildActivityDays(new Date(2026, 2, 3, 15), [
      '2026-02-24',
      '2026-02-25',
      '2026-03-01',
      '2026-03-01',
      '2026-03-03',
      '2026-03-04',
    ]);
    expect(days.map((day) => day.date)).toEqual([
      '2026-02-25',
      '2026-02-26',
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
      '2026-03-03',
    ]);
    expect(days.map((day) => day.value)).toEqual([1, 0, 0, 0, 2, 0, 1]);
  });

  it('only links to accessible internal pages and gives favorites priority without duplicates', () => {
    const menus = [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/organization/user', label: 'Users' },
      { path: 'https://example.com', label: 'External' },
      { path: '/examples/table', label: 'Table' },
    ];
    const links = workspaceLinks(
      menus,
      ['/system/log', '/dashboard', '/examples/table'],
      ['/examples/table', 'https://example.com', '/organization/user'],
    );
    expect(links.map(({ path, origin }) => [path, origin])).toEqual([
      ['/examples/table', 'favorite'],
      ['/organization/user', 'recent'],
    ]);
    expect(workspaceLinks(menus, [], []).map(({ path }) => path)).toEqual([
      '/organization/user',
      '/examples/table',
    ]);
  });

  it('uses daily totals when a busy week exceeds the first page', async () => {
    const now = new Date(2026, 10, 22, 14, 30);
    const readLogs = vi.fn(async (params: OperationLogQueryParams) => ({
      data: { list: [], total: params.pageSize === 1 ? 10 : 70 },
    }));
    const overview = await readActivityOverview(now, readLogs);
    expect(overview.total).toBe(70);
    expect(overview.days.map(({ value }) => value)).toEqual([10, 10, 10, 10, 10, 10, 10]);
    expect(readLogs).toHaveBeenCalledTimes(8);
    expect(readLogs.mock.lastCall?.[0]).toMatchObject({
      startTime: '2026-11-22 00:00:00',
      endTime: '2026-11-22 14:30:00',
    });
  });

  it('derives both panels from one request when the complete week fits on one page', async () => {
    const record: OperationLog = {
      id: '1',
      username: 'tester',
      module: 'profile',
      action: 'update',
      description: 'Edit profile',
      method: 'PUT',
      url: '/profile',
      ip: '',
      browser: '',
      os: '',
      status: 'success',
      duration: 12,
      createTime: '2026-11-16 09:30:00',
    };
    const newer = { ...record, id: '2', createTime: '2026-11-17 17:00:00' };
    const readLogs = vi.fn(async () => ({ data: { list: [record, newer], total: 2 } }));
    const overview = await readActivityOverview(new Date(2026, 10, 22, 14), readLogs);
    expect(overview.days.map(({ value }) => value)).toEqual([1, 1, 0, 0, 0, 0, 0]);
    expect(overview.recent).toEqual([newer, record]);
    expect(readLogs).toHaveBeenCalledTimes(1);
  });
});
