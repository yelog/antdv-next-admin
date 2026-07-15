import type { ProFormItem } from '@/types/pro';

import { describe, expect, it } from 'vitest';

import { buildProFormRules } from '@/components/Pro/ProForm/formRules';

const requiredMessage = (item: ProFormItem) => `请输入${item.label}`;

describe('ProForm rule helpers', () => {
  it('creates a default required rule for the required shorthand', () => {
    const rules = buildProFormRules(
      [{ name: 'realName', label: '姓名', type: 'input', required: true }],
      requiredMessage,
    );

    expect(rules.realName).toEqual([{ required: true, message: '请输入姓名' }]);
  });

  it('prefers a custom required rule instead of adding a duplicate default rule', () => {
    const customRequiredRule = { required: true, message: '用户名不能为空' };
    const lengthRule = { min: 3, max: 20, message: '用户名长度为 3 到 20 个字符' };

    const rules = buildProFormRules(
      [
        {
          name: 'username',
          label: '用户名',
          type: 'input',
          required: true,
          rules: [customRequiredRule, lengthRule],
        },
      ],
      requiredMessage,
    );

    expect(rules.username).toEqual([customRequiredRule, lengthRule]);
  });

  it('keeps the default required rule when custom rules only contain other constraints', () => {
    const emailRule = { type: 'email', message: '邮箱格式不正确' };

    const rules = buildProFormRules(
      [
        {
          name: 'email',
          label: '邮箱',
          type: 'input',
          required: true,
          rules: [emailRule],
        },
      ],
      requiredMessage,
    );

    expect(rules.email).toEqual([{ required: true, message: '请输入邮箱' }, emailRule]);
  });

  it('keeps a custom required rule when the shorthand is not enabled', () => {
    const customRequiredRule = { required: true, message: '请选择角色' };

    const rules = buildProFormRules(
      [
        {
          name: 'roleIds',
          label: '角色',
          type: 'select',
          rules: [customRequiredRule],
        },
      ],
      requiredMessage,
    );

    expect(rules.roleIds).toEqual([customRequiredRule]);
  });
});
