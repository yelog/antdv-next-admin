import { message } from 'antdv-next';
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { refreshToken as refreshTokenApi } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import { usePermissionStore } from '@/stores/permission';
import { useTabsStore } from '@/stores/tabs';
import { request, service } from '@/utils/request';

const { push, resetRouter } = vi.hoisted(() => ({
  push: vi.fn(),
  resetRouter: vi.fn(),
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
  resetRouter,
}));

const originalAdapter = service.defaults.adapter;
const adapter = vi.fn<AxiosAdapter>();
const refreshPath = '/auth/refresh';
const initialSession = { token: 'fixture-access-initial', refreshToken: 'fixture-refresh-initial' };
const renewedSession = { token: 'fixture-access-renewed', refreshToken: 'fixture-refresh-renewed' };
const replacementSession = {
  token: 'fixture-access-replacement',
  refreshToken: 'fixture-refresh-replacement',
};
const successBody = { code: 200, data: { id: 1 } };

const unauthorizedKinds = ['http', 'business'] as const;
type UnauthorizedKind = (typeof unauthorizedKinds)[number];

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { config, data, status, statusText: '', headers: {} };
}

function unauthorized(config: InternalAxiosRequestConfig, kind: UnauthorizedKind): AxiosResponse {
  const data = { code: 401, message: 'Unauthorized' };
  if (kind === 'http') {
    throw new AxiosError(data.message, undefined, config, undefined, response(config, data, 401));
  }
  return response(config, data);
}

function callsTo(path: string): InternalAxiosRequestConfig[] {
  return adapter.mock.calls.map(([config]) => config).filter((config) => config.url === path);
}

function usedToken(config: InternalAxiosRequestConfig, token: string): boolean {
  return config.headers.get('Authorization') === `Bearer ${token}`;
}

function gate(): { promise: Promise<void>; open: () => void } {
  let open!: () => void;
  const promise = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { promise, open };
}

function expectClearedSession(): void {
  expect(useAuthStore().token).toBeNull();
  expect(useAuthStore().refreshTokenValue).toBeNull();
  expect(useAuthStore().user).toBeNull();
  expect(usePermissionStore().isRoutesGenerated).toBe(false);
  expect(useTabsStore().tabs).toEqual([]);
  expect(JSON.parse(localStorage.getItem('app-tabs-state') ?? '{"tabs":[]}').tabs).toEqual([]);
  expect(resetRouter).toHaveBeenCalledOnce();
}

describe('request service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.setToken(initialSession.token, initialSession.refreshToken);
    authStore.setUserInfo({
      id: 'fixture-user',
      username: 'fixture-user',
      email: '',
      realName: '',
      avatar: '',
      phone: '',
      status: 'active',
      createdAt: '',
      updatedAt: '',
      roles: [],
      permissions: [],
    });
    usePermissionStore().isRoutesGenerated = true;
    const tabsStore = useTabsStore();
    tabsStore.tabs = [
      {
        id: '/protected',
        name: 'Protected',
        path: '/protected',
        fullPath: '/protected',
        title: 'Protected',
        closable: true,
      },
    ];
    localStorage.setItem('app-tabs-state', JSON.stringify({ tabs: tabsStore.tabs }));
    adapter.mockReset();
    service.defaults.adapter = adapter;
  });

  afterEach(() => {
    service.defaults.adapter = originalAdapter;
    setActivePinia(undefined);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('exports the axios instance used by request helpers', () => {
    expect(service.defaults.timeout).toBe(15000);
    expect(service.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('returns the response body from every request helper', async () => {
    adapter.mockImplementation(async (config) => response(config, successBody));

    for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
      await expect(request[method]<typeof successBody>('/items/1')).resolves.toEqual(successBody);
    }
  });

  it('shares one refresh between concurrent HTTP and business 401s', async () => {
    const started = gate();
    const finish = gate();
    adapter.mockImplementation(async (config) => {
      if (config.url === refreshPath) {
        started.open();
        await finish.promise;
        return response(config, { code: 200, data: renewedSession });
      }
      if (usedToken(config, renewedSession.token)) {
        return response(config, successBody);
      }
      return unauthorized(config, config.url === '/http' ? 'http' : 'business');
    });

    const results = Promise.allSettled([request.get('/http'), request.get('/business')]);
    await Promise.race([started.promise, results]);
    finish.open();

    expect((await results).map(({ status }) => status)).toEqual(['fulfilled', 'fulfilled']);
    expect(callsTo(refreshPath)).toHaveLength(1);
    for (const path of ['/http', '/business']) {
      expect(callsTo(path).map((config) => usedToken(config, renewedSession.token))).toEqual([
        false,
        true,
      ]);
    }
  });

  it.each(['rotated', 'unchanged'])(
    'uses the completed refresh for a late 401 when the access token is %s',
    async (rotation) => {
      const late401 = gate();
      const result =
        rotation === 'rotated'
          ? renewedSession
          : { ...renewedSession, token: initialSession.token };
      adapter.mockImplementation(async (config) => {
        if (config.url === refreshPath) {
          return response(config, { code: 200, data: result });
        }
        if (config.url && callsTo(config.url).length === 1) {
          if (config.url === '/late') {
            await late401.promise;
            return unauthorized(config, 'http');
          }
          return unauthorized(config, 'business');
        }
        return response(config, successBody);
      });

      const late = request.get('/late');
      const early = request.get('/early').finally(late401.open);
      const results = await Promise.allSettled([early, late]);

      expect(results.map(({ status }) => status)).toEqual(['fulfilled', 'fulfilled']);
      expect(callsTo(refreshPath)).toHaveLength(1);
      expect(
        callsTo('/late').map((config, index) =>
          usedToken(config, index === 0 ? initialSession.token : result.token),
        ),
      ).toEqual([true, true]);
    },
  );

  it.each([
    { kind: 'http', skipErrorMessage: false, skipRedirect: true },
    { kind: 'business', skipErrorMessage: true, skipRedirect: false },
    { kind: 'server', skipErrorMessage: true, skipRedirect: true },
  ] as const)(
    'clears the session once on a shared $kind refresh failure and honors request options',
    async ({ kind, skipErrorMessage, skipRedirect }) => {
      adapter.mockImplementation(async (config) => {
        if (config.url !== refreshPath) {
          return unauthorized(config, 'http');
        }
        if (kind === 'server') {
          throw new AxiosError(
            'Server error',
            undefined,
            config,
            undefined,
            response(config, {}, 500),
          );
        }
        return unauthorized(config, kind);
      });

      const options = { skipErrorMessage, skipRedirect };
      const results = await Promise.allSettled([
        request.get('/protected', options),
        request.get('/another', options),
      ]);

      expect(results.map(({ status }) => status)).toEqual(['rejected', 'rejected']);
      expect(callsTo(refreshPath)).toHaveLength(1);
      expect(callsTo('/protected')).toHaveLength(1);
      expect(callsTo('/another')).toHaveLength(1);
      expectClearedSession();
      expect(vi.mocked(message.error).mock.calls).toEqual(
        skipErrorMessage ? [] : [['登录已过期，请重新登录']],
      );
      expect(push.mock.calls).toEqual(skipRedirect ? [] : [['/login']]);
    },
  );

  it('can refresh again after a failed session is cleared and replaced', async () => {
    adapter.mockImplementation(async (config) => {
      if (config.url === refreshPath) {
        if (callsTo(refreshPath).length === 1) {
          return unauthorized(config, 'business');
        }
        return response(config, { code: 200, data: renewedSession });
      }
      return usedToken(config, renewedSession.token)
        ? response(config, successBody)
        : unauthorized(config, 'http');
    });

    await expect(request.get('/protected')).rejects.toThrow('Unauthorized');
    expectClearedSession();

    useAuthStore().setToken(initialSession.token, initialSession.refreshToken);
    await expect(request.get('/protected')).resolves.toEqual(successBody);
    expect(callsTo(refreshPath)).toHaveLength(2);
    expect(useAuthStore().token === renewedSession.token).toBe(true);
  });

  it('releases a failed refresh promise before the next refresh attempt', async () => {
    adapter.mockImplementation(async (config) => {
      if (config.url === refreshPath) {
        return callsTo(refreshPath).length === 1
          ? unauthorized(config, 'http')
          : response(config, { code: 200, data: renewedSession });
      }
      return response(config, successBody);
    });

    const authStore = useAuthStore();
    await expect(authStore.refreshToken()).rejects.toThrow('Unauthorized');
    await expect(authStore.refreshToken()).resolves.toBe(renewedSession.token);

    expect(callsTo(refreshPath)).toHaveLength(2);
    expect(authStore.token === renewedSession.token).toBe(true);
    expect(resetRouter).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it.each(unauthorizedKinds)(
    'clears the session when the sole retry also returns a %s 401',
    async (kind) => {
      adapter.mockImplementation(async (config) => {
        if (config.url === refreshPath) {
          return response(config, { code: 200, data: renewedSession });
        }
        const firstKind = kind === 'http' ? 'business' : 'http';
        return unauthorized(config, usedToken(config, renewedSession.token) ? kind : firstKind);
      });

      await expect(request.get('/protected')).rejects.toThrow('Unauthorized');

      expect(callsTo(refreshPath)).toHaveLength(1);
      expect(
        callsTo('/protected').map((config) => usedToken(config, renewedSession.token)),
      ).toEqual([false, true]);
      expectClearedSession();
      expect(message.error).toHaveBeenCalledExactlyOnceWith('登录已过期，请重新登录');
      expect(push).toHaveBeenCalledWith('/login');
    },
  );

  it.each(unauthorizedKinds)(
    'rejects a %s 401 from public, opted-out, and refresh requests independently',
    async (kind) => {
      adapter.mockImplementation(async (config) => unauthorized(config, kind));

      await expect(request.get('/public', { skipAuth: true })).rejects.toThrow('Unauthorized');
      await expect(
        request.get('/opt-out', { skipAuthRefresh: true, skipErrorMessage: true }),
      ).rejects.toThrow('Unauthorized');
      expect(callsTo(refreshPath)).toHaveLength(0);
      await expect(refreshTokenApi(initialSession.refreshToken)).rejects.toThrow('Unauthorized');

      expect(callsTo('/public').every((config) => !config.headers.has('Authorization'))).toBe(true);
      expect(callsTo(refreshPath)).toHaveLength(1);
      expect(callsTo(refreshPath).every((config) => !config.headers.has('Authorization'))).toBe(
        true,
      );
      expect(useAuthStore().token === initialSession.token).toBe(true);
      expect(resetRouter).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    },
  );

  it.each(['logout', 'replacement'])('discards a successful refresh after %s', async (change) => {
    const started = gate();
    const finish = gate();
    adapter.mockImplementation(async (config) => {
      if (config.url === refreshPath) {
        started.open();
        await finish.promise;
        return response(config, { code: 200, data: renewedSession });
      }
      return unauthorized(config, 'http');
    });

    const outcome = Promise.allSettled([request.get('/protected')]);
    await Promise.race([started.promise, outcome]);
    const authStore = useAuthStore();
    authStore.logout();
    if (change === 'replacement') {
      authStore.setToken(replacementSession.token, replacementSession.refreshToken);
    }
    finish.open();

    expect((await outcome)[0]?.status).toBe('rejected');
    expect(callsTo('/protected')).toHaveLength(1);
    expect(authStore.token === (change === 'logout' ? null : replacementSession.token)).toBe(true);
    expect(
      authStore.refreshTokenValue ===
        (change === 'logout' ? null : replacementSession.refreshToken),
    ).toBe(true);
    expect(resetRouter).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(message.error).not.toHaveBeenCalled();
  });

  it('lets a new session refresh while the previous refresh is pending and rejects later', async () => {
    const oldStarted = gate();
    const finishOld = gate();
    adapter.mockImplementation(async (config) => {
      if (config.url === refreshPath) {
        if (callsTo(refreshPath).length === 1) {
          oldStarted.open();
          await finishOld.promise;
          return unauthorized(config, 'http');
        }
        return response(config, { code: 200, data: renewedSession });
      }
      if (usedToken(config, renewedSession.token)) {
        return response(config, successBody);
      }
      return unauthorized(config, 'http');
    });

    const old = Promise.allSettled([request.get('/old')]);
    await Promise.race([oldStarted.promise, old]);
    useAuthStore().setToken(replacementSession.token, replacementSession.refreshToken);
    const current = Promise.allSettled([request.get('/current')]);
    try {
      await vi.waitFor(() => expect(callsTo(refreshPath)).toHaveLength(2));
    } finally {
      finishOld.open();
      await Promise.all([old, current]);
    }

    expect((await old)[0]?.status).toBe('rejected');
    expect((await current)[0]?.status).toBe('fulfilled');
    expect(callsTo('/old')).toHaveLength(1);
    expect(useAuthStore().token === renewedSession.token).toBe(true);
    expect(resetRouter).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(message.error).not.toHaveBeenCalled();
  });

  it.each(['original', 'retry'])(
    'ignores a late 401 from a previous session’s %s request',
    async (attempt) => {
      const started = gate();
      const finish = gate();
      adapter.mockImplementation(async (config) => {
        if (config.url === refreshPath) {
          return response(config, { code: 200, data: renewedSession });
        }
        if (attempt === 'original' || usedToken(config, renewedSession.token)) {
          started.open();
          await finish.promise;
        }
        return unauthorized(config, 'http');
      });

      const outcome = Promise.allSettled([request.get('/protected')]);
      await Promise.race([started.promise, outcome]);
      useAuthStore().setToken(replacementSession.token, replacementSession.refreshToken);
      finish.open();

      expect((await outcome)[0]?.status).toBe('rejected');
      expect(callsTo(refreshPath)).toHaveLength(attempt === 'original' ? 0 : 1);
      expect(callsTo('/protected')).toHaveLength(attempt === 'original' ? 1 : 2);
      expect(useAuthStore().token === replacementSession.token).toBe(true);
      expect(resetRouter).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
      expect(message.error).not.toHaveBeenCalled();
    },
  );

  it.each(unauthorizedKinds)(
    'keeps the latest token when a previous retry returns a late %s 401',
    async (kind) => {
      const retryStarted = gate();
      const finishRetry = gate();
      const latestSession = { ...renewedSession, token: 'fixture-access-latest' };
      adapter.mockImplementation(async (config) => {
        if (config.url === refreshPath) {
          const data = callsTo(refreshPath).length === 1 ? renewedSession : latestSession;
          return response(config, { code: 200, data });
        }
        if (config.url === '/older' && usedToken(config, renewedSession.token)) {
          retryStarted.open();
          await finishRetry.promise;
          return unauthorized(config, kind);
        }
        if (config.url === '/current' && usedToken(config, latestSession.token)) {
          return response(config, successBody);
        }
        return unauthorized(config, 'http');
      });

      const older = Promise.allSettled([request.get('/older')]);
      await Promise.race([retryStarted.promise, older]);
      const current = request.get('/current').finally(finishRetry.open);
      const [olderResult, currentResult] = await Promise.allSettled([older, current]);

      expect(olderResult).toEqual({
        status: 'fulfilled',
        value: [{ status: 'rejected', reason: expect.any(Error) }],
      });
      expect(currentResult).toEqual({ status: 'fulfilled', value: successBody });
      expect(callsTo(refreshPath)).toHaveLength(2);
      expect(callsTo('/older')).toHaveLength(2);
      expect(useAuthStore().token === latestSession.token).toBe(true);
      expect(resetRouter).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
      expect(message.error).not.toHaveBeenCalled();
    },
  );
});
