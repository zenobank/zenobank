import { Env, getEnv } from 'src/lib/utils/env';

import * as Sentry from '@sentry/nestjs';

// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: getEnv(Env.SENTRY_DSN),
  integrations: [
    // Add our Profiling integration
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
