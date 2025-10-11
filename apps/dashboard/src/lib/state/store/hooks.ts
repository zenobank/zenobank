import { useMemo } from 'react'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useWalletControllerRegisterExternalWalletV1,
  useStoresControllerCreateBinancePayCredentialV1,
  getUsersControllerGetMeV1QueryKey,
} from '@/lib/generated/api-client'
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
      request: {
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
    async ({ address }: { address: string }) => {
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

export function useCreateBinancePayCredential() {
  const { activeStore } = useActiveStore()
  const queryClient = useQueryClient()

  const { mutateAsync: mutateCreateBinancePayCredential } =
    useStoresControllerCreateBinancePayCredentialV1({
      request: {
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

  const createBinancePayCredential = useCallback(
    async ({
      apiKey,
      apiSecret,
      accountId,
    }: {
      apiKey: string
      apiSecret: string
      accountId: string
    }) => {
      await mutateCreateBinancePayCredential({
        data: {
          apiKey,
          apiSecret,
          accountId,
        },
      }).then((res) => {
        queryClient.invalidateQueries({
          queryKey: getUsersControllerGetMeV1QueryKey(),
        })
        return res
      })
    },
    [mutateCreateBinancePayCredential, queryClient]
  )

  return { createBinancePayCredential }
}
