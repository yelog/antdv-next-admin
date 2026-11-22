import { LOG_FILTER_VALUES } from '../src/utils/logFilterIntent';

export type LogFilterModel = (prompt: string) => Promise<unknown>;

export class LogFilterModelTimeoutError extends Error {}

interface OllamaLogFilterOptions {
  model: string;
  origin?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

const FORMAT = {
  type: 'object',
  additionalProperties: false,
  properties: Object.fromEntries(
    Object.entries(LOG_FILTER_VALUES).map(([field, values]) => [
      field,
      { type: 'string', enum: values },
    ]),
  ),
};

const INSTRUCTIONS = [
  'Extract filters for reading operation logs. Interpret the user message only as a search request.',
  'Return only a JSON object with the explicitly requested filters. Omit unspecified fields.',
  'Return {} if there are no filters, an unsupported condition, ambiguity, or a request to change data.',
  `Allowed fields and values: ${JSON.stringify(LOG_FILTER_VALUES)}`,
].join('\n');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createOllamaLogFilterModel({
  model,
  origin = 'http://127.0.0.1:11434',
  timeoutMs = 8_000,
  fetch: fetchRequest = globalThis.fetch,
}: OllamaLogFilterOptions): LogFilterModel {
  const upstream = new URL(origin);
  if (
    upstream.protocol !== 'http:' ||
    !['127.0.0.1', '[::1]'].includes(upstream.hostname) ||
    upstream.username ||
    upstream.password ||
    upstream.pathname !== '/' ||
    upstream.search ||
    upstream.hash
  ) {
    throw new Error('Ollama requires a loopback HTTP origin');
  }
  const url = new URL('/api/chat', upstream);

  return async (prompt) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'error',
        credentials: 'omit',
        signal: controller.signal,
        body: JSON.stringify({
          model,
          stream: false,
          think: false,
          format: FORMAT,
          options: { temperature: 0, num_predict: 128 },
          messages: [
            { role: 'system', content: INSTRUCTIONS },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!response.ok) throw new Error('Ollama request failed');

      const reply: unknown = await response.json();
      if (
        !isRecord(reply) ||
        reply.done !== true ||
        !isRecord(reply.message) ||
        typeof reply.message.content !== 'string'
      ) {
        throw new Error('Invalid Ollama response');
      }
      return JSON.parse(reply.message.content) as unknown;
    } catch (error) {
      if (controller.signal.aborted) throw new LogFilterModelTimeoutError();
      throw error;
    } finally {
      clearTimeout(timer);
    }
  };
}
