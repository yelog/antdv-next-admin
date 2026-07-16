import type { VNode, VNodeProps } from 'vue';

import { h } from 'vue';

import IconView from '@/components/Icon/index.vue';
import { parseIconName } from '@/utils/iconName';

type IconProps = VNodeProps & Record<string, unknown>;

export function renderIcon(name?: string, props: IconProps = {}): VNode | undefined {
  const iconName = name?.trim();
  if (!iconName || !parseIconName(iconName)) {
    return undefined;
  }

  return h(IconView, {
    ...props,
    icon: iconName,
  });
}
