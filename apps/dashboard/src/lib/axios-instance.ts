import axios from 'axios'

export const customAxios = axios.create({
  withCredentials: true,
})

customAxios.interceptors.request.use((config) => {
  return config
})
