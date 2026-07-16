import { describe, expect, it } from 'vitest';

import { shouldRecoverDynamicRoute } from '@/router/routeRecovery';

describe('not found route recovery', () => {
  it('retries a catch-all match after login before dynamic routes are generated', () => {
    expect(shouldRecoverDynamicRoute('NotFoundCatchAll', true, false)).toBe(true);
  });

  it('does not retry a confirmed unknown route after dynamic routes are generated', () => {
    expect(shouldRecoverDynamicRoute('NotFoundCatchAll', true, true)).toBe(false);
  });

  it('does not treat public unknown URLs as protected routes', () => {
    expect(shouldRecoverDynamicRoute('NotFoundCatchAll', false, false)).toBe(false);
  });

  it('does not retry an ordinary matched route', () => {
    expect(shouldRecoverDynamicRoute('Dashboard', true, false)).toBe(false);
  });
});
