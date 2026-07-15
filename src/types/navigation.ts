export type MenuSearchView = 'recent' | 'favorites';

export interface MenuHistoryItem {
  path: string;
  title: string;
  icon?: string;
  timestamp: number;
}
