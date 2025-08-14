import { createFileRoute } from '@tanstack/react-router'
import Otp from '@/features/auth/otp'

export const Route = createFileRoute('/(auth)2/otp')({
  component: Otp,
})
