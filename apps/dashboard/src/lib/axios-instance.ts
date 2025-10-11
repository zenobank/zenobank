// src/lib/axios-instance.ts  (o la ruta que pusiste en orval.config.ts)
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

// puedes conservar una instancia interna si quieres interceptores, baseURL, etc.
const instance = axios.create({
  withCredentials: true,
  // baseURL: process.env.NEXT_PUBLIC_API_URL, // si te sirve
})

// interceptores opcionales
instance.interceptors.request.use((config) => {
  // ej: añadir api-key, logs, etc.
  return config
})

// 🔥 ESTA es la función que Orval espera (el nombre debe coincidir con `name`)
export const customAxios = <T = unknown>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return instance.request<T>({ ...config, ...options })
}
