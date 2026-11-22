import type { ApiResponse } from '@/types/api';
import type { LoginResult } from '@/types/auth';
import type { MockOptions, MockRequest } from 'vite-plugin-mock-dev-server';

import { create } from 'axios';
import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { setupBrowserMock } from '@/mock/browser';

const listUrl = '/log/operation/list';
const intentUrl = '/log/operation/filter-intent';
const input = {
  prompt: '找出用户管理模块里删除失败的操作',
  locale: 'zh-CN',
};
const filters = { module: 'userManagement', action: 'delete', status: 'fail' };
const matchingRow = { id: '1', ...filters, method: 'DELETE', url: '/api/users/demo-user' };

interface MockCall {
  method: 'GET' | 'POST';
  url: string;
  body?: unknown;
  query?: Record<string, string | number>;
  authorization?: string;
}

function createBrowserCall(): (call: MockCall) => Promise<unknown> {
  const browser = create({
    baseURL: '/api',
    adapter: async () => {
      throw new Error('Unexpected browser mock network call');
    },
  });
  setupBrowserMock(browser);

  return async ({ method, url, body, query, authorization }) => {
    const { data } = await browser.request({
      method,
      url,
      data: body,
      params: query,
      headers: { Authorization: authorization },
    });
    return data as unknown;
  };
}

async function createDevCall(ollamaModel?: string): Promise<(call: MockCall) => Promise<unknown>> {
  vi.resetModules();
  vi.stubEnv('LOG_FILTER_OLLAMA_MODEL', ollamaModel);
  const authMocks = (await import('../../mock/handlers/auth.mock')).default;
  const logMocks = (await import('../../mock/handlers/log.mock')).default;
  const mocks: MockOptions = [...authMocks, ...logMocks];

  return async ({ method, url, body, query = {}, authorization }) => {
    const mock = mocks.find(
      (route) => !route.ws && route.method === method && route.url === `/api${url}`,
    );
    if (!mock || !('body' in mock) || typeof mock.body !== 'function') {
      throw new Error(`Missing development mock for ${method} ${url}`);
    }

    const request = Object.assign(new IncomingMessage(new Socket()), {
      headers: authorization ? { authorization } : {},
      query,
      body,
    }) as MockRequest;
    return mock.body(request) as unknown;
  };
}

async function login(
  call: (request: MockCall) => Promise<unknown>,
  username: 'admin' | 'user',
): Promise<LoginResult> {
  const response = (await call({
    method: 'POST',
    url: '/auth/login',
    body: { username, password: '123456' },
  })) as ApiResponse<LoginResult>;
  expect(response.code).toBe(200);
  return response.data;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe.each([
  { name: 'browser', createCall: createBrowserCall },
  { name: 'development', createCall: createDevCall },
])('$name log mock', ({ createCall }) => {
  it('requires fixture log-read permissions for list and intent', async () => {
    const call = await createCall();
    const user = await login(call, 'user');

    const checks = [
      { code: 401 },
      { authorization: `Bearer ${user.refreshToken}`, code: 401 },
      { authorization: `Bearer ${user.token}`, code: 403 },
    ];
    await Promise.all(
      checks.map(async ({ authorization, code }) => {
        const results = await Promise.all([
          call({ method: 'GET', url: listUrl, query: { permissions: '*' }, authorization }),
          call({
            method: 'POST',
            url: intentUrl,
            body: { ...input, permissions: '*' },
            authorization,
          }),
        ]);
        for (const result of results) {
          expect(result).toMatchObject({ code, success: false, data: null });
        }
      }),
    );
  });

  it('serves the named rules result and its stable matching row to an administrator', async () => {
    const call = await createCall();
    const { token } = await login(call, 'admin');
    const authorization = `Bearer ${token}`;
    const [intent, list, filtered, invalid] = await Promise.all([
      call({ method: 'POST', url: intentUrl, body: input, authorization }),
      call({ method: 'GET', url: listUrl, authorization }),
      call({ method: 'GET', url: listUrl, query: { ...filters, pageSize: 80 }, authorization }),
      call({ method: 'POST', url: intentUrl, body: { ...input, rows: [] }, authorization }),
    ]);

    expect(intent).toMatchObject({ code: 200, data: { source: 'rules', filters } });
    expect(list).toMatchObject({ code: 200, data: { total: 80 } });
    expect(filtered).toMatchObject({
      code: 200,
      data: { list: expect.arrayContaining([expect.objectContaining(matchingRow)]) },
    });
    expect(invalid).toMatchObject({ code: 400, success: false, data: null });
  });
});

it('opts the development mock into the model while the browser stays on rules', async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(
      Response.json({ done: true, message: { content: JSON.stringify(filters) } }),
    );
  vi.stubGlobal('fetch', fetch);
  const dev = await createDevCall('model-for-test');
  const browser = createBrowserCall();
  const [devAdmin, browserAdmin] = await Promise.all([
    login(dev, 'admin'),
    login(browser, 'admin'),
  ]);

  expect(await dev({ method: 'POST', url: intentUrl, body: input })).toMatchObject({ code: 401 });
  expect(fetch).not.toHaveBeenCalled();
  expect(
    await browser({
      method: 'POST',
      url: intentUrl,
      body: input,
      authorization: `Bearer ${browserAdmin.token}`,
    }),
  ).toMatchObject({ data: { source: 'rules', filters } });
  expect(fetch).not.toHaveBeenCalled();
  expect(
    await dev({
      method: 'POST',
      url: intentUrl,
      body: input,
      authorization: `Bearer ${devAdmin.token}`,
    }),
  ).toMatchObject({ data: { source: 'model', filters } });
  expect(fetch).toHaveBeenCalledTimes(1);
});
