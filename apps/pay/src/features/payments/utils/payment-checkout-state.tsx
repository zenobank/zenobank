import { isAfter } from 'date-fns';
import { CheckoutResponseDto } from '@repo/api-client/model';
import { CheckoutState } from '../types/state';

export const getPaymentCheckoutState = (checkout: CheckoutResponseDto): CheckoutState => {
  // if (checkout.status === CheckoutStatus.COMPLETED) return CheckoutState.COMPLETED;
  // if (checkout.status === CheckoutStatus.CANCELLED) return CheckoutState.EXPIRED;
  // if (
  //   checkout.status === CheckoutStatus.EXPIRED ||
  //   (checkout.expiresAt && isAfter(new Date(), new Date(checkout.expiresAt)))
  // ) {
  //   return CheckoutState.EXPIRED;
  // }
  // // If deposit details are available, we're awaiting deposit
  // // if (checkout.depositWallet) return CheckoutState.AWAITING_DEPOSIT;
  // // Otherwise, we're awaiting selection
  return CheckoutState.AWAITING_SELECTION;
};
