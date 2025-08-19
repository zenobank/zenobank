import { createFileRoute } from '@tanstack/react-router'
import Payments from '@/features/payments'
import { paymentControllerGetPaymentV1 } from '../../api-orval/aPIDocs'
import { PaymentResponseDto } from '../../api-orval/model'

export const Route = createFileRoute('/payments/$id')({
  loader: async ({ params }): Promise<PaymentResponseDto> => {
    const { data } = await paymentControllerGetPaymentV1(params.id)
    return data
  },
  component: Payments,
})
