import { Clock } from 'lucide-react'

export default function ExpiredScreen() {
  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20'>
          <Clock className='h-8 w-8 text-orange-600 dark:text-orange-400' />
        </div>
        <h3 className='mb-2 text-xl font-semibold text-orange-600 dark:text-orange-400'>
          Payment Expired
        </h3>
        <p className='text-muted-foreground'>The payment session has expired</p>
      </div>
    </div>
  )
}
