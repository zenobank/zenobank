import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ClerkProvider } from '@clerk/clerk-react'
import { shadcn } from '@clerk/themes'
import * as Sentry from '@sentry/react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { handleServerError } from '@/utils/handle-server-error'
import { FontProvider } from './context/font-context'
import { ThemeProvider } from './context/theme-context'
import './index.css'
// Generated Routes
import { routeTree } from './routeTree.gen'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Initialize Sentry
Sentry.init({
  dsn:
    import.meta.env.VITE_SENTRY_DSN ||
    'https://323d1d9fea9b11db0a5b0445cca1c837@o4510152870068224.ingest.de.sentry.io/4510153604202576',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Mask all text content and user input
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  // Session Replay
  replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: async (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().auth.reset()
          const _redirect = `${router.history.location.href}`
          // router.navigate({ to: '/sign-in', search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          router.navigate({ to: '/500' })
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Import your Publishable Key

// Render the app
const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Sentry.ErrorBoundary
        fallback={({ resetError }) => (
          <div className='flex min-h-screen flex-col items-center justify-center p-4'>
            <h1 className='mb-4 text-2xl font-bold text-red-600'>
              Something went wrong
            </h1>
            <p className='mb-4 text-gray-600'>
              We've been notified and are working on a fix.
            </p>
            <button
              onClick={resetError}
              className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
            >
              Try again
            </button>
          </div>
        )}
      >
        <ClerkProvider
          publishableKey={PUBLISHABLE_KEY}
          domain={'https://ddf.com'}
          isSatellite={false}
          afterSignOutUrl='/sign-in'
          signInUrl='/sign-in'
          signUpUrl='/sign-up'
          signUpForceRedirectUrl='/complete-signup'
          appearance={{
            theme: shadcn,
          }}
        >
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
              <FontProvider>
                <RouterProvider router={router} />
              </FontProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ClerkProvider>
      </Sentry.ErrorBoundary>
    </StrictMode>
  )
}
