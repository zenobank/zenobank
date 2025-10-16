import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

interface ClerkWindow {
  Clerk?: {
    session?: {
      getToken: (options?: unknown) => Promise<string | null>
    }
  }
}

const instance = axios.create({
  withCredentials: true,
})

instance.interceptors.request.use(async (config) => {
  const token = await (window as ClerkWindow).Clerk?.session?.getToken()

  if (token) {
    config.headers?.set?.('Authorization', `Bearer ${token}`)
  }

  return config
})

export const customAxios = <T = unknown>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return instance.request<T>({ ...config, ...options })
}
