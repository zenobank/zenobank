import { env } from 'src/lib/utils/env';

export function getCheckoutUrl(paymentId: string): string {
  return `${env.FRONTEND_CHECKOUT_BASE_URL}/${paymentId}`;
}
