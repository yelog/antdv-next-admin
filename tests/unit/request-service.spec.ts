import type { AxiosError } from 'axios';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { clearSessionState, push, refreshToken } = vi.hoisted(() => ({
  clearSessionState: vi.fn(),
  push: vi.fn(),
  refreshToken: vi.fn(),
}));

vi.mock('antdv-next', () => ({
  message: {
    error: vi.fn(),
  },
}));

vi.mock('@/router', () => ({
  default: {
    push,
  },
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    refreshToken,
    token: null,
  }),
}));

vi.mock('@/utils/session', () => ({
  clearSessionState,
}));

import { service } from '@/utils/request';

const originalAdapter = service.defaults.adapter;

describe('request service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.defaults.adapter = originalAdapter;
  });

  it('exports the axios instance used by request helpers', () => {
    expect(service.defaults.timeout).toBe(15000);
    expect(service.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('clears the complete session when token refresh fails', async () => {
    const refreshError = new Error('refresh failed');
    refreshToken.mockRejectedValueOnce(refreshError);
    service.defaults.adapter = async (config) => {
      throw {
        config,
        response: { status: 401 },
      } as AxiosError;
    };

    await expect(
      service.get('/protected', {
        skipErrorMessage: true,
      }),
    ).rejects.toBe(refreshError);

    expect(clearSessionState).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith('/login');
  });
});
