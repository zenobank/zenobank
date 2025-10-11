import { env } from 'src/lib/utils/env';

export function getCheckoutUrl(paymentId: string): string {
  return `${env.PAYMENT_FRONTEND_BASE_URL}/${paymentId}`;
}
