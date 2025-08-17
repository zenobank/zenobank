import { CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'

export default function SuccessScreen({
  walletAddress,
  tokenAmount,
  tokenSymbol,
  networkName,
  transactionHash,
  onBackToSelection,
}: {
  walletAddress: string
  tokenAmount: string
  tokenSymbol: string
  networkName: string
  transactionHash: string
  onBackToSelection?: () => void
}) {
  return (
    <div className='space-y-6'>
      {/* Success Icon and Message */}
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
          <CheckCircle className='h-8 w-8 text-green-600 dark:text-green-400' />
        </div>
        <h3 className='mb-2 text-xl font-semibold text-green-600 dark:text-green-400'>
          Payment Successful!
        </h3>
        <p className='text-muted-foreground'>
          Your payment has been confirmed on the blockchain
        </p>
      </div>

      {/* Transaction Details */}
      <div className='bg-muted/50 space-y-4 rounded-lg border p-4'>
        <h4 className='font-medium'>Transaction Details</h4>

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
            <span className='text-muted-foreground'>To Address:</span>
            <div className='flex items-center gap-2'>
              <span className='font-mono text-xs'>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
              </span>
              <CopyButton text={walletAddress} />
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Transaction Hash:</span>
            <div className='flex items-center gap-2'>
              <span className='font-mono text-xs'>
                {transactionHash.slice(0, 6)}...{transactionHash.slice(-6)}
              </span>
              <CopyButton text={transactionHash} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='space-y-3'>
        <Button
          className='w-full'
          variant='outline'
          onClick={() =>
            window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank')
          }
        >
          <ExternalLink className='mr-2 h-4 w-4' />
          View on Explorer
        </Button>

        <Button className='w-full' onClick={() => (window.location.href = '/')}>
          Back to Home
        </Button>

        <Button
          className='w-full'
          variant='outline'
          onClick={onBackToSelection || (() => window.history.back())}
        >
          Back to Selection
        </Button>
      </div>
    </div>
  )
}
