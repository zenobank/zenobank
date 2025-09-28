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
  const queryClient = useQueryClient()

  const activeStore = useMemo(() => {
    return user?.stores[0] || null
  }, [user?.stores])

  const invalidateUser = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: getUsersControllerGetMeV1QueryKey(),
    })
  }, [queryClient])

  return { activeStore, invalidateUser, isLoading }
}

export function useRegisterExternalWallet() {
  const { mutateAsync: mutateRegisterExternalWallet } =
    useWalletControllerRegisterExternalWalletV1()
  const queryClient = useQueryClient()

  const registerExternalWallet = useCallback(
    async ({ address, storeId }: { address: string; storeId: string }) => {
      await mutateRegisterExternalWallet({
        data: {
          address,
          storeId,
        },
      }).then(() => {
        queryClient.invalidateQueries({
          queryKey: getUsersControllerGetMeV1QueryKey(),
        })
      })
    },
    [mutateRegisterExternalWallet, queryClient]
  )

  return { registerExternalWallet }
}
