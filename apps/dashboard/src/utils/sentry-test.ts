import * as Sentry from '@sentry/react'

/**
 * Test function to verify Sentry integration is working
 * This will send a test message to Sentry
 */
export const testSentryIntegration = () => {
  Sentry.captureMessage('Sentry integration test - Dashboard app', 'info')
  console.log('Sentry test message sent!')
}

/**
 * Test function to capture an exception
 * This will send a test error to Sentry
 */
export const testSentryError = () => {
  try {
    throw new Error('Test error for Sentry integration')
  } catch (error) {
    Sentry.captureException(error)
    console.log('Sentry test error sent!')
  }
}
