import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useUsersControllerBootstrapV1 } from '@repo/api-client'

export default function CompleteSignup() {
  const router = useRouter()
  const { mutateAsync: mutateBootstrap } = useUsersControllerBootstrapV1()
  useEffect(() => {
    mutateBootstrap()
      .then(() => {
        router.navigate({ to: '/' })
      })
      .catch((error) => {
        console.error(error)
      })
  }, [mutateBootstrap, router])
  return <div>Redirecting to dashboard...</div>
}
