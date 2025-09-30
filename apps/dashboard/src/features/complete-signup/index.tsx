import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useUsersControllerBootstrapV1 } from '@repo/api-client'

export default function CompleteSignup() {
  const router = useRouter()
  const { mutateAsync: mutateBootstrap } = useUsersControllerBootstrapV1()
  useEffect(() => {
    mutateBootstrap().then(() => {
      router.navigate({ to: '/' })
    })
  }, [mutateBootstrap, router])
  return <div>Creating your account...</div>
}
