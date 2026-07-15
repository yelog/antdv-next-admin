import { describe, expect, it } from 'vitest';

import {
  createLazyChildren,
  searchRemoteTree,
  searchRemoteUsers,
} from '../../src/views/examples/form/remoteData';

describe('form remote data helpers', () => {
  it('searches users case-insensitively by name or department', () => {
    expect(searchRemoteUsers('LIN')).toEqual([
      {
        label: 'Lin Chen · Engineering',
        value: 'user-1',
      },
    ]);
    expect(searchRemoteUsers('design')).toEqual([
      {
        label: 'Mia Zhou · Design',
        value: 'user-3',
      },
    ]);
  });

  it('keeps matching ancestors when searching the remote tree', () => {
    expect(searchRemoteTree('platform')).toEqual([
      {
        title: 'Product & Technology',
        value: 'product-tech',
        children: [{ title: 'Platform Engineering', value: 'platform-engineering', isLeaf: true }],
      },
    ]);
  });

  it('creates deterministic lazy children for a parent node', () => {
    expect(createLazyChildren('north-region')).toEqual([
      { title: 'North Region / Sales', value: 'north-region-sales', isLeaf: true },
      { title: 'North Region / Service', value: 'north-region-service', isLeaf: true },
    ]);
  });
});
