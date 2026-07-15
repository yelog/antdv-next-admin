import { describe, expect, it } from 'vitest';

import {
  createRemoteOptionsController,
  localFilterOption,
  localFilterTreeNode,
  toTreeSelectData,
} from '@/components/Pro/ProForm/selectSearch';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

describe('ProForm select search helpers', () => {
  it('filters select options by label or value', () => {
    expect(localFilterOption('adm', { label: 'Admin', value: '1' })).toBe(true);
    expect(localFilterOption('1', { label: 'Admin', value: '1' })).toBe(true);
    expect(localFilterOption('guest', { label: 'Admin', value: '1' })).toBe(false);
  });

  it('filters tree nodes by label, title, or value', () => {
    expect(localFilterTreeNode('研发', { title: '研发部', value: 'rd' })).toBe(true);
    expect(localFilterTreeNode('rd', { title: '研发部', value: 'rd' })).toBe(true);
    expect(localFilterTreeNode('sales', { title: '研发部', value: 'rd' })).toBe(false);
  });

  it('maps ProForm option labels to TreeSelect node titles recursively', () => {
    expect(
      toTreeSelectData([
        {
          label: 'Product & Technology',
          value: 'product-tech',
          children: [{ label: 'Platform Engineering', value: 'platform-engineering' }],
        },
      ]),
    ).toEqual([
      {
        title: 'Product & Technology',
        value: 'product-tech',
        children: [{ title: 'Platform Engineering', value: 'platform-engineering' }],
      },
    ]);
  });

  it('marks stale remote search results so older requests cannot overwrite newer options', async () => {
    const controller = createRemoteOptionsController();
    const slow = deferred<Array<{ label: string; value: string }>>();
    const fast = deferred<Array<{ label: string; value: string }>>();

    const slowResult = controller.search('a', () => slow.promise);
    const fastResult = controller.search('ad', () => fast.promise);

    fast.resolve([{ label: 'Admin', value: 'admin' }]);
    slow.resolve([{ label: 'Auditor', value: 'auditor' }]);

    await expect(fastResult).resolves.toEqual({
      status: 'success',
      options: [{ label: 'Admin', value: 'admin' }],
    });
    await expect(slowResult).resolves.toEqual({
      status: 'stale',
      options: null,
    });
  });

  it('clears remote options when keyword becomes empty', async () => {
    const controller = createRemoteOptionsController();

    await expect(controller.search('  ', async () => [])).resolves.toEqual({
      status: 'cleared',
      options: null,
    });
  });
});
