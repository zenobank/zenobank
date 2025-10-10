'use client'

import { useMemo, useState } from 'react'
import {
  IconWallet,
  IconDownload,
  IconKey,
  IconCopy,
} from '@tabler/icons-react'
import { CheckCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useActiveStore } from '@/lib/state/store/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TiendaNubeIntegrationDialog({ open, onOpenChange }: Props) {
  const [apiKey] = useState('zeno_sk_live_tiendanube_1234567890abcdef')
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
  const { activeStore } = useActiveStore()
  const paymentWallet = useMemo(() => {
    return activeStore?.wallets[0] || null
  }, [activeStore])

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API key copied!')
  }

  const downloadPlugin = () => {
    toast.success('Tienda Nube app download started!')
  }

  const addWallet = () => {
    setIsWalletDialogOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Tienda Nube Integration</DialogTitle>
            <DialogDescription>
              Follow these steps to integrate crypto payments with Tienda Nube
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Step 1: Wallet */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <IconWallet className='h-5 w-5' />
                  1. Setup Payment Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentWallet ? (
                  <div className='flex items-center gap-2'>
                    <CheckCircleIcon className='h-5 w-5 text-green-500' />
                    <span className='text-sm'>
                      Wallet configured: {paymentWallet.address.slice(0, 6)}...
                      {paymentWallet.address.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>
                      You need a payment wallet to receive crypto payments
                    </p>
                    <Button onClick={addWallet} size='sm'>
                      Add Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Download App */}
            {paymentWallet && (
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <IconDownload className='h-5 w-5' />
                    2. Install Tienda Nube App
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground mb-3 text-sm'>
                    Install the ZenoBank app in your Tienda Nube store
                  </p>
                  <Button onClick={downloadPlugin} size='sm'>
                    Install App
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: API Key */}
            {paymentWallet && (
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <IconKey className='h-5 w-5' />
                    3. Configure API Key
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground mb-3 text-sm'>
                    Copy this API key to your Tienda Nube app settings
                  </p>
                  <div className='flex items-center gap-2'>
                    <div className='bg-muted flex-1 rounded-md border px-3 py-2 font-mono text-sm'>
                      {apiKey}
                    </div>
                    <Button variant='outline' size='sm' onClick={copyApiKey}>
                      <IconCopy className='h-4 w-4' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
