import { getEnv, Env } from 'src/lib/utils/env';

export function getPaymentUrl(paymentId: string): string {
  return `${getEnv(Env.API_BASE_URL)}/payments/${paymentId}`;
}
