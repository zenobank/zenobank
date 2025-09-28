import { useQueryClient } from '@tanstack/react-query'
import {
  useUsersControllerGetMeV1,
  getUsersControllerGetMeV1QueryKey,
} from '@repo/api-client'

export function useUser() {
  const { data: { data: user } = {}, isLoading: isUserDataLoading } =
    useUsersControllerGetMeV1()

  const queryClient = useQueryClient()
  const invalidateUser = () => {
    queryClient.invalidateQueries({
      queryKey: getUsersControllerGetMeV1QueryKey(),
    })
  }

  const isLoading = isUserDataLoading
  return { user, isUserDataLoading, isLoading, invalidateUser }
}
