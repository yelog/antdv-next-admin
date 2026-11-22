import { describe, expect, it } from 'vitest';

import {
  parseDemoLogFilters,
  readLogFilterIntent,
  readLogFilterRequest,
  readLogFilterResult,
} from '@/utils/logFilterIntent';

describe('operation log filter contract', () => {
  const expected = { module: 'userManagement', action: 'delete', status: 'fail' };

  it.each([
    ['zh-CN', '找出用户管理模块里删除失败的操作'],
    ['en-US', 'Show failed deletions in user management.'],
    ['ja-JP', 'ユーザー管理で失敗した削除操作を表示'],
    ['ko-KR', '사용자 관리에서 실패한 삭제 작업을 찾아줘'],
  ])('interprets the complete %s example', (locale, prompt) => {
    expect(parseDemoLogFilters(prompt, locale)).toEqual(expected);
  });

  it('accepts individual conditions and distinguishes a module from its action', () => {
    expect(parseDemoLogFilters('只看失败', 'zh-CN')).toEqual({ status: 'fail' });
    expect(parseDemoLogFilters('系统登录模块里的登录', 'zh-CN')).toEqual({
      module: 'systemLogin',
      action: 'login',
    });
    expect(parseDemoLogFilters('Show exports in role management', 'en-US')).toEqual({
      module: 'roleManagement',
      action: 'export',
    });
  });

  it.each([
    ['昨天删除失败的操作', 'zh-CN'],
    ['排除成功的记录', 'zh-CN'],
    ['查看登录或登出记录', 'zh-CN'],
    ['删除失败并成功的操作', 'zh-CN'],
    ['show successful deletions for Alice', 'en-US'],
    ['show failed or successful updates', 'en-US'],
    ['show failureday', 'en-US'],
    ['show logs', 'en-US'],
    ['失敗した操作を昨日だけ表示', 'ja-JP'],
    ['실패한 작업 제외', 'ko-KR'],
  ])('requests clarification instead of dropping a condition in %s', (prompt, locale) => {
    expect(parseDemoLogFilters(prompt, locale)).toBeNull();
  });

  it('accepts only known filters and values, with no empty mass query', () => {
    expect(readLogFilterIntent(expected)).toEqual(expected);
    for (const value of [
      null,
      {},
      [],
      { module: 'users' },
      { status: 'fail', username: 'admin' },
    ]) {
      expect(readLogFilterIntent(value)).toBeNull();
    }
  });

  it('bounds request text and refuses extra context', () => {
    const request = { prompt: ' find failed logs ', locale: 'en-US' };
    expect(readLogFilterRequest(request)).toEqual({ prompt: 'find failed logs', locale: 'en-US' });
    for (const value of [
      { ...request, prompt: ' ' },
      { ...request, prompt: 'a'.repeat(301) },
      { ...request, locale: 'other' },
      { ...request, rows: [] },
    ]) {
      expect(readLogFilterRequest(value)).toBeNull();
    }
  });

  it('distinguishes a clarification from a malformed service response', () => {
    expect(readLogFilterResult({ source: 'rules', filters: null })).toEqual({
      source: 'rules',
      filters: null,
    });
    expect(readLogFilterResult({ source: 'model', filters: expected })?.filters).toEqual(expected);
    expect(readLogFilterResult({ source: 'model', filters: {} })).toBeNull();
    expect(readLogFilterResult({ source: 'unknown', filters: expected })).toBeNull();
  });
});
