import { Clock, RefreshCw, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ExpiredScreen({
  tokenAmount,
  tokenSymbol,
  networkName,
  onRetry,
  onBack,
}: {
  tokenAmount: string
  tokenSymbol: string
  networkName: string
  onRetry: () => void
  onBack: () => void
}) {
  return (
    <div className='space-y-6'>
      {/* Expired Icon and Message */}
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20'>
          <Clock className='h-8 w-8 text-orange-600 dark:text-orange-400' />
        </div>
        <h3 className='mb-2 text-xl font-semibold text-orange-600 dark:text-orange-400'>
          Payment Expired
        </h3>
        <p className='text-muted-foreground'>
          The payment session has expired. Please try again or start a new
          payment.
        </p>
      </div>

      {/* Payment Summary */}
      <div className='bg-muted/50 space-y-4 rounded-lg border p-4'>
        <h4 className='font-medium'>Payment Summary</h4>

        <div className='space-y-3 text-sm'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Amount:</span>
            <span className='font-medium'>
              {tokenAmount} {tokenSymbol}
            </span>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Network:</span>
            <Badge variant='secondary'>{networkName}</Badge>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Status:</span>
            <Badge variant='destructive'>Expired</Badge>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='space-y-3'>
        <Button className='w-full' onClick={onRetry}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Try Again
        </Button>

        <Button className='w-full' variant='outline' onClick={onBack}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Selection
        </Button>
      </div>

      {/* Additional Info */}
      <div className='rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'>
        <p className='mb-1 font-medium'>Why did this happen?</p>
        <p className='text-blue-700 dark:text-blue-300'>
          Payment sessions expire after a certain time to ensure security. If
          you've already sent the payment, please wait for confirmation or
          contact support if needed.
        </p>
      </div>
    </div>
  )
}
