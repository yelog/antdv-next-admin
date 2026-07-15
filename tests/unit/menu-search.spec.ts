import { describe, expect, it } from 'vitest';

import { searchMenuItems, type MenuSearchItem } from '@/utils/menuSearch';

function item(title: string, path: string, leafTitle = title): MenuSearchItem {
  return { title, path, leafTitle };
}

describe('menu search ranking', () => {
  it('ranks the longer continuous run before a scattered match', () => {
    const results = searchMenuItems(
      [item('Use Orm', '/use-orm'), item('User Mgmt', '/user-mgmt')],
      'user',
    );

    expect(results.map((result) => result.title)).toEqual(['User Mgmt', 'Use Orm']);
  });

  it('prefers leaf-title matches over breadcrumb and path matches', () => {
    const results = searchMenuItems(
      [
        item('User > Audit', '/audit', 'Audit'),
        item('System > Profile', '/system/user', 'Profile'),
        item('System > User', '/system/member', 'User'),
      ],
      'user',
    );

    expect(results.map((result) => result.leafTitle)).toEqual(['User', 'Audit', 'Profile']);
  });

  it('prefers exact, prefix and earlier continuous matches in that order', () => {
    const results = searchMenuItems(
      [item('My User', '/my-user'), item('Users', '/users'), item('User', '/user')],
      'user',
    );

    expect(results.map((result) => result.title)).toEqual(['User', 'Users', 'My User']);
  });

  it('keeps pinyin matching without admitting unrelated initials', () => {
    const results = searchMenuItems(
      [item('用例设置', '/cases'), item('用户设置', '/users')],
      'yhsz',
    );

    expect(results.map((result) => result.title)).toEqual(['用户设置']);
  });

  it('keeps source order when match quality is identical', () => {
    const results = searchMenuItems(
      [item('User Alpha', '/alpha'), item('User Bravo', '/bravo')],
      'user',
    );

    expect(results.map((result) => result.path)).toEqual(['/alpha', '/bravo']);
  });

  it('normalizes whitespace and limits results after ranking', () => {
    const results = searchMenuItems(
      [item('Use Orm', '/use-orm'), item('User Mgmt', '/user-mgmt')],
      '  USER  ',
      1,
    );

    expect(results.map((result) => result.title)).toEqual(['User Mgmt']);
    expect(searchMenuItems([item('User', '/user')], '   ')).toEqual([]);
  });
});
