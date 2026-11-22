# Operation log filter intent

`POST /api/log/operation/filter-intent` takes a JSON object with `prompt` and `locale`. The prompt is limited to 300 characters. Supported locales are `zh-CN`, `en-US`, `ja-JP`, and `ko-KR`.

An example request and successful project envelope follow.

```json
{"prompt":"Show failed deletions in user management.","locale":"en-US"}
```

```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": {
    "filters": {"module":"userManagement","action":"delete","status":"fail"},
    "source": "rules"
  }
}
```

The response proposes filters for the existing `GET /api/log/operation/list` endpoint. Supported fields are `module`, `action`, and `status`, with one value per field from the shared enum. A valid request without supported filters returns `filters: null`. The model path returns `source: "model"`. An invalid request returns envelope code `400`. Authentication and permission failures return `401` and `403` on both routes. The model path reports invalid output and upstream failures as `502` and timeouts as `504`.

## Development and static demo

Both mocks use the demo login fixtures and the operation log read permission `system.log.view`. Mock bearer tokens are predictable fixture credentials. In the static demo, filtering always uses local rules. The Vite development server also defaults to rules.

To opt the development server into Ollama, run a local Ollama instance with cloud features disabled and install a model that supports structured output. Set `LOG_FILTER_OLLAMA_MODEL` in the environment of the dev server to the installed model tag. [Ollama local configuration](https://docs.ollama.com/faq)

```sh
LOG_FILTER_OLLAMA_MODEL="<installed-model-tag>" pnpm dev
```

The server posts to `http://127.0.0.1:11434/api/chat` with a JSON schema and an eight-second timeout. It sends the prompt with fixed server instructions and the filter schema. Authentication headers, client IP, locale, and operation log rows stay within the application. [Ollama chat API](https://docs.ollama.com/api/chat) · [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs)

## Production integration

Mount both routes on your real API server. Inject a session verifier that validates the request's credentials and loads effective permissions from a trusted server-side source. The verifier returns `null` for an invalid or missing session. The list dependency can call the existing validated query and retain its row-level access rules.

For example, add this wiring to an Express API server. Have the application's error middleware format JSON parser and list failures with the project envelope.

```ts
import express, { type Express, type Request, type RequestHandler } from 'express';

import { createOperationLogHandlers } from './server/logFilterIntent';
import { createOllamaLogFilterModel } from './server/ollamaLogFilter';
import type { OperationLogPrincipal } from './server/operationLogAccess';
import type { ApiResponse, PageResult } from './src/types/api';
import type { OperationLog } from './src/types/log';

export function mountOperationLogRoutes(
  app: Express,
  verifySession: (request: Request) => Promise<OperationLogPrincipal | null>,
  queryOperationLogs: (request: Request) => Promise<PageResult<OperationLog>>,
): void {
  const modelName = process.env.LOG_FILTER_OLLAMA_MODEL?.trim();
  const logs = createOperationLogHandlers({
    authenticate: verifySession,
    readBody: (request) => request.body,
    list: async (request) => ({
      code: 200,
      message: 'success',
      success: true,
      data: await queryOperationLogs(request),
    }),
    model: modelName ? createOllamaLogFilterModel({ model: modelName }) : undefined,
  });

  function replyWith(handler: (request: Request) => Promise<ApiResponse>): RequestHandler {
    return async (request, response, next) => {
      try {
        const result = await handler(request);
        response.status(result.code).json(result);
      } catch (error) {
        next(error);
      }
    };
  }

  app.get('/api/log/operation/list', replyWith(logs.list));
  app.post(
    '/api/log/operation/filter-intent',
    express.json({ limit: '4kb' }),
    replyWith(logs.filterIntent),
  );
}
```

The Ollama adapter accepts a fixed loopback HTTP origin and rejects redirects. Bind Ollama to loopback and configure `OLLAMA_NO_CLOUD=1` on the Ollama process. Keep the model selection in the server process environment. Vite exposes `VITE_` settings to browser code, so keep provider configuration out of those settings. [Ollama local configuration](https://docs.ollama.com/faq)
