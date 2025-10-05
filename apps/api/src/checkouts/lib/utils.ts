import { getEnv, Env } from 'src/lib/utils/env';

export function getCheckoutUrl(paymentId: string): string {
  return `${getEnv(Env.PAYMENT_FRONTEND_BASE_URL)}/${paymentId}`;
}
