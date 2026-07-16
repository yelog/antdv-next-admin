export type AppIconKind = 'antdv-next' | 'iconify' | 'svg';

export interface ParsedIconName {
  kind: AppIconKind;
  value: string;
}

const ANTDV_ICON_SUFFIX = /(Outlined|Filled|TwoTone)$/;

export function parseIconName(name?: string): ParsedIconName | undefined {
  const iconName = name?.trim();
  if (!iconName) {
    return undefined;
  }

  if (iconName.startsWith('antdv-next:')) {
    return createParsedIcon('antdv-next', iconName.slice('antdv-next:'.length));
  }

  if (iconName.startsWith('antd:')) {
    return createParsedIcon('antdv-next', iconName.slice('antd:'.length));
  }

  if (iconName.startsWith('svg:')) {
    return createParsedIcon('svg', iconName.slice('svg:'.length));
  }

  if (iconName.startsWith('iconify:')) {
    return createParsedIcon('iconify', iconName.slice('iconify:'.length));
  }

  if (ANTDV_ICON_SUFFIX.test(iconName)) {
    return { kind: 'antdv-next', value: iconName };
  }

  return { kind: 'iconify', value: iconName };
}

function createParsedIcon(kind: AppIconKind, value: string): ParsedIconName | undefined {
  const normalizedValue = value.trim();
  return normalizedValue ? { kind, value: normalizedValue } : undefined;
}
