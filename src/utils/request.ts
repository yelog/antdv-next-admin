import {
  CanceledError,
  create,
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { message } from "antdv-next";

import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { clearSessionState } from "@/utils/session";

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorMessage?: boolean;
  skipAuthRefresh?: boolean;
  skipRedirect?: boolean;
}

type RetriableRequestConfig = InternalAxiosRequestConfig &
  RequestConfig & {
    authSession?: { id: number; tokenRevision: number };
    retriedAfterRefresh?: boolean;
  };

export const service: AxiosInstance = create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

async function handleUnauthorized(
  error: Error,
  config?: RetriableRequestConfig,
): Promise<AxiosResponse> {
  const session = config?.authSession;
  if (!config || !session || config.skipAuth || config.skipAuthRefresh) {
    throw error;
  }

  const authStore = useAuthStore();
  if (session.id !== authStore.session.id) {
    throw error;
  }

  let failure: unknown = error;
  if (!config.retriedAfterRefresh) {
    try {
      await authStore.refreshToken(session.tokenRevision);
      if (session.id === authStore.session.id) {
        config.retriedAfterRefresh = true;
        return service(config);
      }
    } catch (refreshError) {
      failure = refreshError;
    }
  }

  const currentSession = authStore.session;
  if (
    session.id === currentSession.id &&
    (!config.retriedAfterRefresh || session.tokenRevision === currentSession.tokenRevision)
  ) {
    clearSessionState(router);
    if (!config.skipErrorMessage) {
      message.error("登录已过期，请重新登录");
    }
    if (!config.skipRedirect) {
      void router.push("/login");
    }
  }
  throw failure;
}

service.interceptors.request.use(
  (config) => {
    const requestConfig = config as RetriableRequestConfig;
    if (requestConfig.skipAuth) {
      return config;
    }

    const authStore = useAuthStore();
    if (
      requestConfig.retriedAfterRefresh &&
      requestConfig.authSession?.id !== authStore.session.id
    ) {
      throw new CanceledError("Session changed before retry", config);
    }

    if (authStore.token) {
      config.headers.set("Authorization", `Bearer ${authStore.token}`, true);
      requestConfig.authSession = authStore.session;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request error:", error.message);
    if (!(error.config as RequestConfig | undefined)?.skipErrorMessage) {
      message.error("请求发送失败");
    }
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    const requestConfig = response.config as RetriableRequestConfig;

    if (res.code !== undefined && res.code !== 200) {
      if (res.code === 401) {
        return handleUnauthorized(new Error(res.message || "Unauthorized"), requestConfig);
      } else if (res.code === 403) {
        console.error("No permission:", res.message);
        if (!requestConfig.skipErrorMessage) {
          message.error(res.message || "没有访问权限");
        }
      } else if (!requestConfig.skipErrorMessage) {
        message.error(res.message || "请求失败");
      }

      return Promise.reject(new Error(res.message || "Error"));
    }

    return res;
  },
  (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status === 401) {
      return handleUnauthorized(error, originalRequest);
    }

    if (error instanceof CanceledError && originalRequest?.retriedAfterRefresh) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status } = error.response;
      const requestConfig = originalRequest;

      switch (status) {
        case 403:
          console.error("Access forbidden");
          if (!requestConfig?.skipErrorMessage) {
            message.error("没有访问权限");
          }
          if (!requestConfig?.skipRedirect) {
            router.push("/403");
          }
          break;
        case 404:
          console.error("Resource not found");
          if (!requestConfig?.skipErrorMessage) {
            message.error("请求的资源不存在");
          }
          break;
        case 500:
          console.error("Server error");
          if (!requestConfig?.skipErrorMessage) {
            message.error("服务器错误，请稍后重试");
          }
          if (!requestConfig?.skipRedirect) {
            router.push("/500");
          }
          break;
        default:
          console.error(`Error ${status}:`, error.message);
          if (!requestConfig?.skipErrorMessage) {
            message.error(error.message || "请求失败");
          }
      }
    } else if (error.request) {
      console.error("No response received");
      if (!originalRequest?.skipErrorMessage) {
        message.error("网络连接失败，请检查网络");
      }
    } else {
      console.error("Request setup error:", error.message);
      if (!originalRequest?.skipErrorMessage) {
        message.error("请求配置错误");
      }
    }

    return Promise.reject(error);
  },
);

export const request = {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return service.get<unknown, unknown>(url, config) as Promise<T>;
  },

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return service.post<unknown, unknown>(url, data, config) as Promise<T>;
  },

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return service.put<unknown, unknown>(url, data, config) as Promise<T>;
  },

  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return service.delete<unknown, unknown>(url, config) as Promise<T>;
  },

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return service.patch<unknown, unknown>(url, data, config) as Promise<T>;
  },
};

export default service;
