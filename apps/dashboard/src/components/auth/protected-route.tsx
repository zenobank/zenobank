import { Navigate } from '@tanstack/react-router'
import { useAuth, useUser } from '@clerk/clerk-react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

interface ProtectedRouteProps {
  children?: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900'></div>
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn || !user) {
    return <Navigate to='/sign-in' replace />
  }

  // Render authenticated layout if user is signed in
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
