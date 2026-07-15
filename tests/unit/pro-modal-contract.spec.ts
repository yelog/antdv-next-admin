import { describe, expect, it } from 'vitest';

import { PRO_MODAL_DEFAULTS } from '../../src/components/Pro/ProModal/modalContract';

describe('ProModal default contract', () => {
  it('keeps standard modal dismissal interactions enabled', () => {
    expect(PRO_MODAL_DEFAULTS.closable).toBe(true);
    expect(PRO_MODAL_DEFAULTS.mask).toBe(true);
    expect(PRO_MODAL_DEFAULTS.keyboard).toBe(true);
  });

  it('uses top-aligned placement unless centered is explicitly enabled', () => {
    expect(PRO_MODAL_DEFAULTS.centered).toBe(false);
  });
});
