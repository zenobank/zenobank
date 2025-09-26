'use client'

import { useState } from 'react'
import {
  IconWallet,
  IconDownload,
  IconKey,
  IconCopy,
} from '@tabler/icons-react'
import { toast } from 'sonner'
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
  hasWallet?: boolean
}

export function WordPressIntegrationDialog({
  open,
  onOpenChange,
  hasWallet = false,
}: Props) {
  const [apiKey] = useState('zeno_sk_live_1234567890abcdef')

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API key copied!')
  }

  const downloadPlugin = () => {
    toast.success('Plugin download started!')
  }

  const createWallet = () => {
    toast.success('Wallet created!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>WordPress Integration</DialogTitle>
          <DialogDescription>
            Follow these steps to integrate crypto payments
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Step 1: Wallet */}
          {!hasWallet && (
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <IconWallet className='h-5 w-5' />
                  1. Connect Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground mb-3 text-sm'>
                  Connect your wallet to receive crypto payments
                </p>
                <Button onClick={createWallet} size='sm'>
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Download Plugin */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <IconDownload className='h-5 w-5' />
                2. Download Plugin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground mb-3 text-sm'>
                Download and install the WordPress plugin
              </p>
              <Button onClick={downloadPlugin} size='sm'>
                Download Plugin
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: API Key */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <IconKey className='h-5 w-5' />
                3. Configure API Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground mb-3 text-sm'>
                Copy this API key to your WordPress plugin settings
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
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
