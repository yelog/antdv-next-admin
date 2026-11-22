export const LOG_FILTER_VALUES = {
  module: [
    'userManagement',
    'roleManagement',
    'menuManagement',
    'dictionary',
    'systemLogin',
    'profile',
    'dashboard',
  ],
  action: ['login', 'logout', 'create', 'update', 'delete', 'export'],
  status: ['success', 'fail'],
} as const;

type FilterField = keyof typeof LOG_FILTER_VALUES;
type FilterValue = (typeof LOG_FILTER_VALUES)[FilterField][number];
export type LogFilterIntent = {
  [Field in FilterField]?: (typeof LOG_FILTER_VALUES)[Field][number];
};
export interface LogFilterResult {
  source: 'rules' | 'model';
  filters: LogFilterIntent | null;
}

export const LOG_FILTER_PROMPT_LIMIT = 300;
const LOCALES = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readLogFilterRequest(input: unknown): { prompt: string; locale: string } | null {
  if (
    !isRecord(input) ||
    Object.keys(input).length !== 2 ||
    typeof input.prompt !== 'string' ||
    input.prompt.length > LOG_FILTER_PROMPT_LIMIT ||
    typeof input.locale !== 'string' ||
    !LOCALES.includes(input.locale)
  )
    return null;
  const prompt = input.prompt.trim();
  return prompt ? { prompt, locale: input.locale } : null;
}

export function readLogFilterIntent(value: unknown): LogFilterIntent | null {
  if (!isRecord(value)) return null;
  const entries = Object.entries(value);
  if (!entries.length) return null;
  for (const [field, selected] of entries) {
    if (!Object.hasOwn(LOG_FILTER_VALUES, field) || typeof selected !== 'string') return null;
    const allowed: readonly string[] = LOG_FILTER_VALUES[field as FilterField];
    if (!allowed.includes(selected)) return null;
  }
  return Object.fromEntries(entries) as LogFilterIntent;
}

export function readLogFilterResult(value: unknown): LogFilterResult | null {
  if (!isRecord(value) || (value.source !== 'rules' && value.source !== 'model')) return null;
  if (value.filters === null) return { source: value.source, filters: null };
  const filters = readLogFilterIntent(value.filters);
  return filters ? { source: value.source, filters } : null;
}

const LABEL_PREFIX = { module: 'log.modules.', action: 'log.actionTypes.', status: 'log.' };

export function logFilterLabelKey(field: FilterField, value: FilterValue): string {
  return LABEL_PREFIX[field] + value;
}

type LocalizedTerms = readonly [string, string, string, string];
const TERMS: Record<FilterValue, LocalizedTerms> = {
  userManagement: ['用户管理', 'user management', 'ユーザー管理', '사용자 관리'],
  roleManagement: ['角色管理', 'role management', 'ロール管理', '역할 관리'],
  menuManagement: ['菜单管理', 'menu management', 'メニュー管理', '메뉴 관리'],
  dictionary: ['数据字典|字典', 'dictionary', 'データ辞書|辞書', '데이터 사전|사전'],
  systemLogin: ['系统登录', 'system login', 'システムログイン', '시스템 로그인'],
  profile: ['个人中心', 'profile', 'プロフィール', '프로필|윤곽'],
  dashboard: ['数据看板|仪表盘', 'dashboard', 'ダッシュボード', '대시보드|계기반'],
  login: ['登录', 'login|logins|sign in', 'ログイン', '로그인'],
  logout: ['登出|退出登录', 'logout|logouts|sign out', 'ログアウト', '로그아웃'],
  create: ['新增|创建', 'create|creation|creations', '作成|追加', '생성|만들다'],
  update: ['修改|更新', 'update|updates', '更新|変更', '업데이트|수정'],
  delete: ['删除', 'delete|deletion|deletions', '削除', '삭제'],
  export: ['导出', 'export|exports', 'エクスポート', '내보내기|내보내다'],
  success: ['成功', 'successful|success|succeeded', '成功した|成功', '성공한|성공'],
  fail: ['失败', 'failed|failure|failures', '失敗した|失敗', '실패한|실패'],
};

const CONNECTORS: LocalizedTerms = [
  '找出|查看|筛选|显示|只看|请|模块|操作日志|操作|日志|记录|里|中|的|和',
  'show|find|filter|only|please|in|the|from|for|module|operations|operation|logs|log|records|and',
  '表示|検索|モジュール|操作ログ|操作|ログ|で|の|を|に',
  '찾아줘|보여줘|작업|모듈|로그|에서|의|을|를',
];

export function parseDemoLogFilters(prompt: string, locale: string): LogFilterIntent | null {
  const request = readLogFilterRequest({ prompt, locale });
  if (!request) return null;
  const language = LOCALES.indexOf(locale);
  const tokens: { text: string; field?: FilterField; value?: FilterValue }[] = CONNECTORS[language]
    .split('|')
    .map((text) => ({ text }));
  for (const field of Object.keys(LOG_FILTER_VALUES) as FilterField[]) {
    for (const value of LOG_FILTER_VALUES[field]) {
      for (const text of TERMS[value][language].split('|')) tokens.push({ text, field, value });
    }
  }
  tokens.sort((left, right) => right.text.length - left.text.length);
  let remaining = request.prompt
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s,.!?、。]+/gu, ' ')
    .trim();
  const selections: Partial<Record<FilterField, FilterValue>> = {};
  while (remaining) {
    const token = tokens.find(
      ({ text }) =>
        remaining.startsWith(text) &&
        (locale !== 'en-US' || remaining.length === text.length || remaining[text.length] === ' '),
    );
    if (!token) return null;
    if (token.field && token.value) {
      if (selections[token.field] && selections[token.field] !== token.value) return null;
      selections[token.field] = token.value;
    }
    remaining = remaining.slice(token.text.length).trimStart();
  }
  return readLogFilterIntent(selections);
}
