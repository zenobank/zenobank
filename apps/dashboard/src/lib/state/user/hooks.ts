import { useUsersControllerGetMeV1 } from '@/lib/generated/api-client'

export function useUser() {
  const { data: { data: user } = {}, isLoading } = useUsersControllerGetMeV1({
    axios: {
      withCredentials: true,
    },
  })
  return { user, isLoading }
}
