import { useEffect } from 'react'
import {
  useUsersControllerGetMeV1,
  useUsersControllerBootstrapV1,
} from '@/lib/generated/api-client'

export function useUser() {
  const { mutateAsync: mutateBootstrap } = useUsersControllerBootstrapV1()

  const { data: { data: user } = {}, isLoading } = useUsersControllerGetMeV1({
    axios: {
      withCredentials: true,
    },
  })
  // useEffect(() => {
  //   if (!user || user.stores.length === 0) {
  //     mutateBootstrap().then((data) => {
  //       if (!data.data.alreadyExists) {
  //         window.location.reload()
  //       }
  //     })
  //   }
  // }, [user, mutateBootstrap])
  return { user, isLoading }
}
