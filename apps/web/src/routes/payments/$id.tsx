import { createFileRoute } from '@tanstack/react-router'
import Payments from '@/features/payments'

export type PaymentData = {
  id: string
  storeName: string
  amount: number
  currency: string
}

export const Route = createFileRoute('/payments/$id')({
  loader: async ({ params }) => {
    // Simulate payment data - in real app this would come from your API
    const data: PaymentData = {
      id: params.id,
      storeName: 'PayAmazon',
      amount: 3,
      currency: 'USD',
    }
    return data
  },
  component: Payments,
})
