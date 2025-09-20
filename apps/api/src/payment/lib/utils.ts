import { getEnv, Env } from 'src/lib/utils/env';

export function getPaymentUrl(paymentId: string): string {
  return `${getEnv(Env.PAYMENT_FRONTEND_BASE_URL)}/${paymentId}`;
}
