import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)')({
  component: ClerkAuthLayout,
})

function ClerkAuthLayout() {
  return (
    <div className='flex h-svh items-center justify-center'>
      <div className='mx-auto flex w-full flex-col items-center justify-center gap-4'>
        <Outlet />
      </div>
    </div>
  )
}
