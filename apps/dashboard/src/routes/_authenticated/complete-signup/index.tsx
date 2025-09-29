import { createFileRoute } from '@tanstack/react-router'
import CompleteSignup from '@/features/complete-signup'

export const Route = createFileRoute('/_authenticated/complete-signup/')({
  component: CompleteSignup,
})
