import type { ProFormOption } from '@/types/pro';

export interface ProFormTreeSelectNode {
  title: string;
  value: ProFormOption['value'];
  disabled?: boolean;
  children?: ProFormTreeSelectNode[];
}

export type RemoteOptionsResult =
  | { status: 'success'; options: ProFormOption[] }
  | { status: 'cleared' | 'error' | 'stale'; options: null };

export function localFilterOption(input: string, option: { label?: unknown; value?: unknown }) {
  const keyword = input.trim().toLowerCase();
  if (!keyword) {
    return true;
  }

  return [option.label, option.value]
    .filter((item) => item != null)
    .some((item) => String(item).toLowerCase().includes(keyword));
}

export function localFilterTreeNode(
  input: string,
  node: { label?: unknown; title?: unknown; value?: unknown },
) {
  const keyword = input.trim().toLowerCase();
  if (!keyword) {
    return true;
  }

  return [node.label, node.title, node.value]
    .filter((item) => item != null)
    .some((item) => String(item).toLowerCase().includes(keyword));
}

export function toTreeSelectData(options: ProFormOption[]): ProFormTreeSelectNode[] {
  return options.map((option) => ({
    title: option.label,
    value: option.value,
    disabled: option.disabled,
    children: option.children ? toTreeSelectData(option.children) : undefined,
  }));
}

export function createRemoteOptionsController() {
  let requestId = 0;

  return {
    reset() {
      requestId += 1;
    },

    async search(
      keyword: string,
      loader: (keyword: string) => Promise<ProFormOption[]>,
    ): Promise<RemoteOptionsResult> {
      const normalizedKeyword = keyword.trim();
      if (!normalizedKeyword) {
        requestId += 1;
        return { status: 'cleared', options: null };
      }

      const currentRequestId = ++requestId;
      try {
        const options = await loader(normalizedKeyword);
        if (currentRequestId !== requestId) {
          return { status: 'stale', options: null };
        }
        return { status: 'success', options };
      } catch {
        if (currentRequestId !== requestId) {
          return { status: 'stale', options: null };
        }
        return { status: 'error', options: null };
      }
    },
  };
}
