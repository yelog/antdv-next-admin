import type { MockRequest } from 'vite-plugin-mock-dev-server';

import { defineMock } from 'vite-plugin-mock-dev-server';

import { createOperationLogHandlers } from '../../server/logFilterIntent';
import { createOllamaLogFilterModel } from '../../server/ollamaLogFilter';
import { operationLogs, loginLogs } from '../data/log.data';
import { adminUser, regularUser } from '../data/users.data';
import { readMockLogPrincipal } from '../logAccess';

const modelName = process.env.LOG_FILTER_OLLAMA_MODEL?.trim();
const operationLog = createOperationLogHandlers({
  authenticate: (req: MockRequest) => readMockLogPrincipal(req.headers, [adminUser, regularUser]),
  readBody: (req) => req.body,
  model: modelName ? createOllamaLogFilterModel({ model: modelName }) : undefined,
  list: (req) => {
    const {
      username,
      module,
      action,
      status,
      startTime,
      endTime,
      page = 1,
      pageSize = 10,
    } = req.query;

    let filtered = [...operationLogs];

    if (username) {
      filtered = filtered.filter((item) => item.username.includes(username as string));
    }
    if (module) {
      filtered = filtered.filter((item) => item.module === module);
    }
    if (action) {
      filtered = filtered.filter((item) => item.action === action);
    }
    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }
    if (startTime) {
      filtered = filtered.filter((item) => item.createTime >= (startTime as string));
    }
    if (endTime) {
      filtered = filtered.filter((item) => item.createTime <= (endTime as string));
    }

    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const list = filtered.slice(start, end);

    return {
      code: 200,
      message: 'success',
      success: true,
      data: {
        list,
        total: filtered.length,
        current: Number(page),
        pageSize: Number(pageSize),
      },
    };
  },
});

export default defineMock([
  {
    url: '/api/log/operation/list',
    method: 'GET',
    body: operationLog.list,
  },
  {
    url: '/api/log/operation/filter-intent',
    method: 'POST',
    body: operationLog.filterIntent,
  },
  {
    url: '/api/log/login/list',
    method: 'GET',
    body: (req) => {
      const { username, ip, status, startTime, endTime, page = 1, pageSize = 10 } = req.query;

      let filtered = [...loginLogs];

      if (username) {
        filtered = filtered.filter((item) => item.username.includes(username as string));
      }
      if (ip) {
        filtered = filtered.filter((item) => item.ip.includes(ip as string));
      }
      if (status) {
        filtered = filtered.filter((item) => item.status === status);
      }
      if (startTime) {
        filtered = filtered.filter((item) => item.createTime >= (startTime as string));
      }
      if (endTime) {
        filtered = filtered.filter((item) => item.createTime <= (endTime as string));
      }

      const start = (Number(page) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      const list = filtered.slice(start, end);

      return {
        code: 200,
        message: 'success',
        success: true,
        data: {
          list,
          total: filtered.length,
          current: Number(page),
          pageSize: Number(pageSize),
        },
      };
    },
  },

  {
    url: '/api/log/operation/clear',
    method: 'DELETE',
    body: () => {
      operationLogs.length = 0;
      return { code: 200, message: 'success', success: true };
    },
  },

  {
    url: '/api/log/login/clear',
    method: 'DELETE',
    body: () => {
      loginLogs.length = 0;
      return { code: 200, message: 'success', success: true };
    },
  },
]);
