import type { ApiResponse } from '../src/types/api';
import type { LogFilterResult } from '../src/utils/logFilterIntent';
import type { LogFilterModel } from './ollamaLogFilter';
import type { OperationLogPrincipal } from './operationLogAccess';

import {
  parseDemoLogFilters,
  readLogFilterIntent,
  readLogFilterRequest,
} from '../src/utils/logFilterIntent';
import { LogFilterModelTimeoutError } from './ollamaLogFilter';
import { operationLogAccessError } from './operationLogAccess';

type Awaitable<Value> = Value | Promise<Value>;

interface OperationLogHandlersOptions<Request, Page> {
  authenticate: (request: Request) => Awaitable<OperationLogPrincipal | null>;
  readBody: (request: Request) => Awaitable<unknown>;
  list: (request: Request) => Awaitable<ApiResponse<Page>>;
  model?: LogFilterModel;
}

interface OperationLogHandlers<Request, Page> {
  list: (request: Request) => Promise<ApiResponse<Page | null>>;
  filterIntent: (request: Request) => Promise<ApiResponse<LogFilterResult | null>>;
}

function failure(code: number, message: string): ApiResponse<null> {
  return { code, message, success: false, data: null };
}

function success(data: LogFilterResult): ApiResponse<LogFilterResult> {
  return { code: 200, message: 'success', success: true, data };
}

function isEmptyJsonObject(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Reflect.ownKeys(value).length === 0
  );
}

export function createOperationLogHandlers<Request, Page>({
  authenticate,
  readBody,
  list,
  model,
}: OperationLogHandlersOptions<Request, Page>): OperationLogHandlers<Request, Page> {
  function withReadAccess<Data>(
    handle: (request: Request) => Awaitable<ApiResponse<Data>>,
  ): (request: Request) => Promise<ApiResponse<Data | null>> {
    return async (request) => {
      let accessError: ApiResponse<null> | null;
      try {
        accessError = operationLogAccessError(await authenticate(request));
      } catch {
        return failure(503, 'Operation log authorization unavailable');
      }
      return accessError ?? handle(request);
    };
  }

  return {
    list: withReadAccess(list),
    filterIntent: withReadAccess(async (request) => {
      let input: ReturnType<typeof readLogFilterRequest>;
      try {
        input = readLogFilterRequest(await readBody(request));
      } catch {
        input = null;
      }
      if (!input) return failure(400, 'Invalid log filter request');

      if (!model) {
        return success({
          filters: parseDemoLogFilters(input.prompt, input.locale),
          source: 'rules',
        });
      }

      try {
        const value = await model(input.prompt);
        if (isEmptyJsonObject(value)) return success({ filters: null, source: 'model' });

        const filters = readLogFilterIntent(value);
        if (!filters) return failure(502, 'Invalid log filter model result');
        return success({ filters, source: 'model' });
      } catch (error) {
        if (error instanceof LogFilterModelTimeoutError) {
          return failure(504, 'Log filter model timed out');
        }
        return failure(502, 'Log filter model unavailable');
      }
    }),
  };
}
