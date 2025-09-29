import { useUsersControllerGetMeV1 } from '@repo/api-client'

export function useUser() {
  const { data: { data: user } = {}, isLoading } = useUsersControllerGetMeV1()
  return { user, isLoading }
}
