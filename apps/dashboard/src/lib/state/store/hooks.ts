import { useMemo } from 'react'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useWalletControllerRegisterExternalWalletV1,
  getUsersControllerGetMeV1QueryKey,
} from '@repo/api-client'
import { useUser } from '../user/hooks'

export function useActiveStore() {
  const { user, isLoading } = useUser()
  const activeStore = useMemo(() => {
    return user?.stores[0] || null
  }, [user?.stores])

  return { activeStore, isLoading }
}

export function useRegisterExternalWallet() {
  const { activeStore } = useActiveStore()
  const queryClient = useQueryClient()

  const { mutateAsync: mutateRegisterExternalWallet } =
    useWalletControllerRegisterExternalWalletV1({
      axios: {
        headers: {
          'x-api-key': activeStore?.apiKey || '',
        },
      },

      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getUsersControllerGetMeV1QueryKey(),
          })
        },
      },
    })

  const registerExternalWallet = useCallback(
    async ({ address, storeId }: { address: string; storeId: string }) => {
      await mutateRegisterExternalWallet({
        data: {
          address,
        },
      })
    },
    [mutateRegisterExternalWallet]
  )

  return { registerExternalWallet }
}
