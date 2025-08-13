import { Env, getEnv } from 'src/lib/utils/env';

export const TX_MONITOR_WEBHOOK_URL = `${getEnv(Env.API_BASE_URL)}/providers/quicknode/webhook`;
