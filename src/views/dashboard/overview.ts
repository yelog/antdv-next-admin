import type { OperationLog, OperationLogQueryParams } from '@/types/log';

import dayjs from 'dayjs';

import { selectMenuItemsByPaths } from '@/utils/menuPreferences';

interface ActivityDay {
  date: string;
  value: number;
}

type LinkOrigin = 'favorite' | 'recent' | 'suggested';

export function buildActivityDays(now: Date, dates: readonly string[]): ActivityDay[] {
  const today = dayjs(now);
  const days = Array.from({ length: 7 }, (_, index) => ({
    date: today.subtract(6 - index, 'day').format('YYYY-MM-DD'),
    value: 0,
  }));
  const byDate = new Map(days.map((day) => [day.date, day]));
  for (const date of dates) {
    const day = byDate.get(date);
    if (day) day.value += 1;
  }
  return days;
}

export interface ActivityOverview {
  days: ActivityDay[];
  total: number;
  recent: OperationLog[];
}

type ReadLogs = (params: OperationLogQueryParams) => Promise<{
  data: { list: OperationLog[]; total: number };
}>;

export async function readActivityOverview(
  now: Date,
  readLogs: ReadLogs,
): Promise<ActivityOverview> {
  const endTime = dayjs(now).format('YYYY-MM-DD HH:mm:ss');
  const week = buildActivityDays(now, []);
  const { data } = await readLogs({
    startTime: `${week[0].date} 00:00:00`,
    endTime,
    page: 1,
    pageSize: 64,
  });
  const recent = [...data.list]
    .sort((left, right) => right.createTime.localeCompare(left.createTime))
    .slice(0, 5);
  if (data.total <= data.list.length) {
    return {
      recent,
      total: data.total,
      days: buildActivityDays(
        now,
        data.list.map((log) => dayjs(log.createTime).format('YYYY-MM-DD')),
      ),
    };
  }
  const days = await Promise.all(
    week.map(async ({ date }, index) => {
      const response = await readLogs({
        startTime: `${date} 00:00:00`,
        endTime: index === 6 ? endTime : `${date} 23:59:59`,
        page: 1,
        pageSize: 1,
      });
      return { date, value: response.data.total };
    }),
  );
  return { recent, total: days.reduce((sum, day) => sum + day.value, 0), days };
}

export function workspaceLinks<Item extends { path: string }>(
  destinations: readonly Item[],
  favoritePaths: readonly string[],
  recentPaths: readonly string[],
): (Item & { origin: LinkOrigin })[] {
  const available = destinations.filter(
    (item) =>
      item.path.startsWith('/') && !item.path.startsWith('//') && item.path !== '/dashboard',
  );
  const favorites = new Set(favoritePaths);
  const recent = new Set(recentPaths);
  const selected = selectMenuItemsByPaths(available, [...favorites, ...recent]);
  const items = selected.length
    ? selected
    : selectMenuItemsByPaths(available, [
        '/organization/user',
        '/organization/role',
        '/system/log',
        '/examples/sales',
        ...available.map((item) => item.path),
      ]);
  return items.slice(0, 4).map((item) => ({
    ...item,
    origin: favorites.has(item.path) ? 'favorite' : recent.has(item.path) ? 'recent' : 'suggested',
  }));
}
