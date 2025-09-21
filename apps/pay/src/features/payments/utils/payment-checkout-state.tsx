import { isAfter } from 'date-fns';
import { PaymentResponseDto, PaymentStatus } from '@/src/lib/requests/api-client/model';
import { CheckoutState } from '@/src/features/payments/types/state';

export const getPaymentCheckoutState = (payment: PaymentResponseDto): CheckoutState => {
  if (!payment.depositDetails) return CheckoutState.AWAITING_SELECTION;
  if (payment.status === PaymentStatus.COMPLETED) return CheckoutState.COMPLETED;
  if (payment.status === PaymentStatus.CANCELLED) return CheckoutState.EXPIRED;
  if (
    payment.status === PaymentStatus.EXPIRED ||
    (payment.expiredAt && isAfter(new Date(), new Date(payment.expiredAt)))
  ) {
    return CheckoutState.EXPIRED;
  }
  return CheckoutState.AWAITING_DEPOSIT;
};
