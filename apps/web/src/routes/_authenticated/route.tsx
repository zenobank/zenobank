import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/protected-route'

export const Route = createFileRoute('/_authenticated')({
  component: ProtectedRoute,
})
