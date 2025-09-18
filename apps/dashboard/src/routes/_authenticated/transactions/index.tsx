import { createFileRoute } from '@tanstack/react-router'
import Transactions from '@/features/transactions'

export const Route = createFileRoute('/_authenticated/transactions/')({
  component: Transactions,
})
