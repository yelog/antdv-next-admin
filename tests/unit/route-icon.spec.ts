import { describe, expect, it } from 'vitest';

import { parseIconName } from '@/utils/iconName';

describe('route icon protocol', () => {
  it('keeps legacy bare Antdv icon names compatible', () => {
    expect(parseIconName('DashboardOutlined')).toEqual({
      kind: 'antdv-next',
      value: 'DashboardOutlined',
    });
    expect(parseIconName('StarFilled')).toEqual({
      kind: 'antdv-next',
      value: 'StarFilled',
    });
    expect(parseIconName('SmileTwoTone')).toEqual({
      kind: 'antdv-next',
      value: 'SmileTwoTone',
    });
  });

  it('normalizes explicit Antdv, Iconify and SVG prefixes', () => {
    expect(parseIconName('antdv-next:HomeOutlined')).toEqual({
      kind: 'antdv-next',
      value: 'HomeOutlined',
    });
    expect(parseIconName('antd:SettingOutlined')).toEqual({
      kind: 'antdv-next',
      value: 'SettingOutlined',
    });
    expect(parseIconName('iconify:ion:apps-outline')).toEqual({
      kind: 'iconify',
      value: 'ion:apps-outline',
    });
    expect(parseIconName('mdi:account-circle-outline')).toEqual({
      kind: 'iconify',
      value: 'mdi:account-circle-outline',
    });
    expect(parseIconName('svg:custom-menu-icon')).toEqual({
      kind: 'svg',
      value: 'custom-menu-icon',
    });
  });

  it('rejects empty icon values', () => {
    expect(parseIconName()).toBeUndefined();
    expect(parseIconName('   ')).toBeUndefined();
    expect(parseIconName('svg:')).toBeUndefined();
    expect(parseIconName('antdv-next:')).toBeUndefined();
  });
});
