import { createClerkClient } from '@clerk/backend';
import { env } from 'src/lib/utils/env';
import { CLERK_CLIENT } from './auth.constants';

export const ClerkClientProvider = {
  provide: CLERK_CLIENT,
  useFactory: () => {
    return createClerkClient({
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
      secretKey: env.CLERK_SECRET_KEY,
    });
  },
  inject: [],
};
