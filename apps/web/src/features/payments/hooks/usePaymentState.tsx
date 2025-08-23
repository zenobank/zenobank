import { useMemo } from 'react'
import { isAfter } from 'date-fns'
import {
  PaymentResponseDto,
  PaymentStatus,
} from '@/lib/requests/api-client/model'
import { CheckoutState } from '@/features/payments/types/state'

export const getPaymentCheckoutState = (
  payment: PaymentResponseDto
): CheckoutState => {
  if (!payment.depositDetails) return CheckoutState.AWAITING_SELECTION
  if (payment.status === PaymentStatus.SUCCESS) return CheckoutState.SUCCESS
  if (payment.status === PaymentStatus.CANCELLED) return CheckoutState.EXPIRED
  if (
    payment.status === PaymentStatus.EXPIRED ||
    isAfter(new Date(), new Date(payment.expiredAt))
  ) {
    return CheckoutState.EXPIRED
  }
  return CheckoutState.AWAITING_DEPOSIT
}
