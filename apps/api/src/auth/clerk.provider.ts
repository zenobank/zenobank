import { createClerkClient } from '@clerk/backend';
import { Env, getEnv } from 'src/lib/utils/env';
import { CLERK_CLIENT } from './auth.constants';

export const ClerkClientProvider = {
  provide: CLERK_CLIENT,
  useFactory: () => {
    return createClerkClient({
      publishableKey: getEnv(Env.CLERK_PUBLISHABLE_KEY),
      secretKey: getEnv(Env.CLERK_SECRET_KEY),
    });
  },
  inject: [],
};
