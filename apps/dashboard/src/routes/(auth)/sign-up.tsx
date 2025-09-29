import { createFileRoute } from '@tanstack/react-router'
import { Navigate } from '@tanstack/react-router'
import type { LinkOptions } from '@tanstack/react-router'
import { SignUp } from '@clerk/clerk-react'
import { useAuth } from '@clerk/clerk-react'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: () => {
    const { isLoaded, isSignedIn } = useAuth()

    const afterSignOutUrl: LinkOptions['to'] = '/complete-signup'

    // If user is already signed in, redirect to dashboard
    if (isLoaded && isSignedIn) {
      return <Navigate to='/' replace />
    }

    return (
      <SignUp
        afterSignOutUrl={afterSignOutUrl}
        fallback={<Skeleton className='h-[30rem] w-[25rem]' />}
      />
    )
  },
})
