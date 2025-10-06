'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useActiveStore,
  useCreateBinancePayCredential,
} from '@/lib/state/store/hooks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  binanceId: z.string().min(1, 'Binance ID is required'),
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
})

type BinanceForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBinanceId?: string
}

export function ChangeBinanceIdDialog({
  open,
  onOpenChange,
  currentBinanceId: _currentBinanceId,
}: Props) {
  const { activeStore } = useActiveStore()
  const { createBinancePayCredential } = useCreateBinancePayCredential()
  const [loading, setLoading] = useState(false)
  const { binancePayCredential } = activeStore || {}

  const form = useForm<BinanceForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      binanceId: binancePayCredential?.accountId || '',
      apiKey: binancePayCredential?.apiKey || '',
      apiSecret: '',
    },
  })

  const onSubmit = async (values: BinanceForm) => {
    if (!activeStore) {
      toast.error('No active store found!')
      return
    }
    setLoading(true)
    try {
      await createBinancePayCredential({
        apiKey: values.apiKey,
        apiSecret: values.apiSecret,
        accountId: values.binanceId,
      })

      toast.success('Binance credentials updated successfully!')
      form.reset()
      onOpenChange(false)
    } catch (_error) {
      toast.error('Failed to update Binance credentials!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Update Binance Credentials</DialogTitle>
          <DialogDescription>
            Enter your Binance Pay credentials to receive payments.
          </DialogDescription>
          <DialogDescription className='pt-2'>
            Need help?{' '}
            <a
              href='https://www.binance.com/en/support/faq/how-to-create-api-360002502072'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:text-primary/80 underline'
            >
              Learn how to create API keys
            </a>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='binance-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='binanceId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Binance Pay ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='123456789'
                      className='font-mono'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='apiKey'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      placeholder='Your Binance API Key'
                      className='font-mono text-xs'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='apiSecret'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Your Binance API Secret'
                      className='font-mono text-xs'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='binance-form' disabled={loading}>
            {loading ? (
              <Loader2 className='h-6 w-6 animate-spin' />
            ) : (
              'Save Credentials'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
