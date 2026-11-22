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

import { request, service } from '@/utils/request';

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

  it('returns the response body from every request helper', async () => {
    const body = { code: 200, data: { id: 1 } };
    service.defaults.adapter = async (config) => ({
      data: body,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
      await expect(request[method]<typeof body>('/items/1')).resolves.toEqual(body);
    }
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
