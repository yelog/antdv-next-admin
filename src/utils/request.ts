import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// Create axios instance
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    // Add token to headers
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // If the custom code is not 200, it is judged as an error
    if (res.code !== undefined && res.code !== 200) {
      // Handle specific error codes
      if (res.code === 401) {
        // Unauthorized - redirect to login
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
      } else if (res.code === 403) {
        // Forbidden - no permission
        console.error('No permission:', res.message)
      }

      return Promise.reject(new Error(res.message || 'Error'))
    }

    return res
  },
  (error: AxiosError) => {
    console.error('Response error:', error)

    if (error.response) {
      const { status } = error.response

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          break
        case 403:
          // Forbidden
          console.error('Access forbidden')
          router.push('/403')
          break
        case 404:
          // Not found
          console.error('Resource not found')
          break
        case 500:
          // Server error
          console.error('Server error')
          router.push('/500')
          break
        default:
          console.error(`Error ${status}:`, error.message)
      }
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Request setup error:', error.message)
    }

    return Promise.reject(error)
  }
)

// Export request methods
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.patch(url, data, config)
  }
}

export default service
