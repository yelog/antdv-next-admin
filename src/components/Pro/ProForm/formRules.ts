import type { ProFormItem } from '@/types/pro';

type RequiredMessageResolver = (item: ProFormItem) => string;

function isRequiredRule(rule: unknown): boolean {
  return typeof rule === 'object' && rule !== null && 'required' in rule && rule.required === true;
}

export function buildProFormRules(
  formItems: ProFormItem[],
  resolveRequiredMessage: RequiredMessageResolver,
): Record<string, unknown[]> {
  const rules: Record<string, unknown[]> = {};

  formItems.forEach((item) => {
    const customRules = item.rules ?? [];
    const itemRules: unknown[] = [];

    if (item.required && !customRules.some(isRequiredRule)) {
      itemRules.push({
        required: true,
        message: resolveRequiredMessage(item),
      });
    }

    itemRules.push(...customRules);

    if (itemRules.length > 0) {
      rules[item.name] = itemRules;
    }
  });

  return rules;
}
