import { createFileRoute } from '@tanstack/react-router'
import ForgotPassword from '@/features/auth/forgot-password'

export const Route = createFileRoute('/(auth)2/forgot-password')({
  component: ForgotPassword,
})
