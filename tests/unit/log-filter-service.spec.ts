import type { LogFilterModel } from '../../server/ollamaLogFilter';

import { describe, expect, it, vi } from 'vitest';

import { LOG_FILTER_VALUES } from '@/utils/logFilterIntent';

import { createOperationLogHandlers } from '../../server/logFilterIntent';
import { createOllamaLogFilterModel } from '../../server/ollamaLogFilter';

const prompt = 'Show failed deletions in user management.';
const filters = { module: 'userManagement', action: 'delete', status: 'fail' };
const request = {
  body: { prompt, locale: 'en-US' },
  headers: { authorization: 'test-session-token' },
  ip: '192.0.2.5',
};
const page = {
  code: 200,
  message: 'success',
  success: true,
  data: { list: [{ description: 'Test row' }], total: 1, current: 1, pageSize: 10 },
};

function createTestHandlers({
  permissions = ['system.log.view'],
  model,
}: { permissions?: string[] | null; model?: LogFilterModel } = {}) {
  const authenticate = vi.fn(async () => (permissions ? { permissions } : null));
  const readBody = vi.fn((input: { body: unknown }) => input.body);
  const list = vi.fn(() => page);
  const handlers = createOperationLogHandlers({ authenticate, readBody, list, model });
  return { ...handlers, authenticate, readBody, readList: list };
}

function ollamaReply(content: string): Response {
  return Response.json({ done: true, message: { role: 'assistant', content } });
}

describe('operation log backend', () => {
  it.each([
    { permissions: null, code: 401 },
    { permissions: ['system.log.clear', 'dashboard.view'], code: 403 },
  ])('returns $code before reading the list, body, or model', async ({ permissions, code }) => {
    const model = vi.fn(async () => filters);
    const { list, filterIntent, readList, readBody } = createTestHandlers({ permissions, model });

    expect(await list(request)).toMatchObject({ code, success: false, data: null });
    expect(await filterIntent(request)).toMatchObject({ code, success: false, data: null });
    expect(readList).not.toHaveBeenCalled();
    expect(readBody).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it('fails closed if authorization is unavailable', async () => {
    const model = vi.fn(async () => filters);
    const { list, filterIntent, authenticate, readList, readBody } = createTestHandlers({ model });
    authenticate.mockRejectedValue(new Error('internal authentication detail'));

    expect(await list(request)).toMatchObject({ code: 503, data: null });
    expect(await filterIntent(request)).toEqual({
      code: 503,
      message: 'Operation log authorization unavailable',
      success: false,
      data: null,
    });
    expect(readList).not.toHaveBeenCalled();
    expect(readBody).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it('runs the existing list for a reader and parses the named example with rules', async () => {
    const { list, filterIntent, readList } = createTestHandlers();

    expect(await list(request)).toBe(page);
    expect(readList).toHaveBeenCalledWith(request);
    expect(await filterIntent(request)).toEqual({
      code: 200,
      message: 'success',
      success: true,
      data: { source: 'rules', filters },
    });
    expect(
      await filterIntent({ body: { prompt: 'Show logs from yesterday.', locale: 'en-US' } }),
    ).toMatchObject({ data: { source: 'rules', filters: null } });
  });

  it.each([
    { ...request.body, rows: page.data.list },
    { ...request.body, prompt: 'x'.repeat(301) },
    { ...request.body, locale: 'unknown' },
  ])('rejects invalid or extra request data before using the model', async (body) => {
    const model = vi.fn(async () => filters);
    const { filterIntent } = createTestHandlers({ permissions: ['*'], model });

    expect(await filterIntent({ body })).toMatchObject({ code: 400, success: false, data: null });
    expect(model).not.toHaveBeenCalled();
  });

  it.each([
    [{ ...filters, username: 'admin' }],
    [{ ...filters, status: 'failed' }],
    [{ module: ['userManagement'] }],
    [[]],
    [null],
    ['delete'],
  ])('rejects out-of-schema model output %#', async (value) => {
    const { filterIntent } = createTestHandlers({ model: async () => value });

    expect(await filterIntent(request)).toMatchObject({ code: 502, success: false, data: null });
  });

  it('returns a clarification for an empty structured model result', async () => {
    const { filterIntent } = createTestHandlers({ model: async () => ({}) });

    expect(await filterIntent(request)).toMatchObject({
      code: 200,
      data: { source: 'model', filters: null },
    });
  });
});

describe('Ollama log filter transport', () => {
  it('uses the enum schema and sends only the prompt with server instructions', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(ollamaReply(JSON.stringify(filters)));
    const model = createOllamaLogFilterModel({ model: 'model-for-test', fetch });
    const { filterIntent, readList } = createTestHandlers({ model });

    expect(await filterIntent(request)).toMatchObject({ data: { source: 'model', filters } });
    expect(readList).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(String(url)).toBe('http://127.0.0.1:11434/api/chat');
    expect(options).toEqual({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'error',
      credentials: 'omit',
      signal: expect.any(AbortSignal),
      body: expect.any(String),
    });
    expect(JSON.parse(String(options?.body))).toEqual({
      model: 'model-for-test',
      stream: false,
      think: false,
      format: {
        type: 'object',
        additionalProperties: false,
        properties: {
          module: { type: 'string', enum: LOG_FILTER_VALUES.module },
          action: { type: 'string', enum: LOG_FILTER_VALUES.action },
          status: { type: 'string', enum: LOG_FILTER_VALUES.status },
        },
      },
      options: { temperature: 0, num_predict: 128 },
      messages: [
        { role: 'system', content: expect.any(String) },
        { role: 'user', content: prompt },
      ],
    });
    for (const appData of [
      request.headers.authorization,
      request.ip,
      request.body.locale,
      page.data.list[0].description,
    ]) {
      expect(String(options?.body)).not.toContain(appData);
    }
  });

  it.each([
    'https://example.test',
    'http://127.0.0.1.example.test',
    'http://secret@127.0.0.1:11434',
    'http://127.0.0.1:11434/other',
  ])('rejects an unapproved Ollama origin %s', (origin) => {
    expect(() => createOllamaLogFilterModel({ model: 'test', origin })).toThrow('loopback');
  });

  it.each([
    () => new Response('private upstream details', { status: 503 }),
    () => new Response('private upstream details'),
    () => ollamaReply('unstructured model response'),
    () => Response.json({ done: false, message: { content: JSON.stringify(filters) } }),
  ])('returns a generic failure for an unusable Ollama response %#', async (reply) => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(reply());
    const model = createOllamaLogFilterModel({ model: 'test', fetch });
    const { filterIntent } = createTestHandlers({ model });

    expect(await filterIntent(request)).toEqual({
      code: 502,
      message: 'Log filter model unavailable',
      success: false,
      data: null,
    });
  });

  it('aborts the upstream request at the timeout', async () => {
    vi.useFakeTimers();
    try {
      const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            options?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
          }),
      );
      const model = createOllamaLogFilterModel({ model: 'test', timeoutMs: 100, fetch });
      const { filterIntent } = createTestHandlers({ model });
      const result = filterIntent(request);

      await vi.advanceTimersByTimeAsync(100);
      expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
      expect(await result).toMatchObject({ code: 504, success: false, data: null });
    } finally {
      vi.useRealTimers();
    }
  });
});
