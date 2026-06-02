import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { message } from "antdv-next";

import router from "@/router";
import { useAuthStore } from "@/stores/auth";

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorMessage?: boolean;
  skipAuthRefresh?: boolean;
  skipRedirect?: boolean;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & RequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string> | null = null;

export const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

service.interceptors.request.use(
  (config) => {
    const requestConfig = config as RequestConfig;
    const authStore = useAuthStore();

    if (!requestConfig.skipAuth && authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request error:", error);
    if (!(error.config as RequestConfig | undefined)?.skipErrorMessage) {
      message.error("请求发送失败");
    }
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    const requestConfig = response.config as RequestConfig;

    if (res.code !== undefined && res.code !== 200) {
      if (res.code === 401) {
        return Promise.reject(new Error(res.message || "Unauthorized"));
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
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          const authStore = useAuthStore();

          refreshPromise = authStore.refreshToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return service(originalRequest);
      } catch (refreshError) {
        const authStore = useAuthStore();
        authStore.logout();
        if (!originalRequest.skipErrorMessage) {
          message.error("登录已过期，请重新登录");
        }
        if (!originalRequest.skipRedirect) {
          router.push("/login");
        }
        return Promise.reject(refreshError);
      }
    }

    console.error("Response error:", error);

    if (error.response) {
      const { status } = error.response;
      const requestConfig = originalRequest as RequestConfig | undefined;

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
      console.error("No response received:", error.request);
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
    return service.get(url, config);
  },

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return service.post(url, data, config);
  },

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return service.put(url, data, config);
  },

  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return service.delete(url, config);
  },

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return service.patch(url, data, config);
  },
};

export default service;
