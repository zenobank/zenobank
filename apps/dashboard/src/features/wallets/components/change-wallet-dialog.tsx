'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useActiveStore,
  useRegisterExternalWallet,
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
  walletAddress: z
    .string()
    .min(1, 'Wallet address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid wallet address'),
})

type WalletForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentWallet?: string
}

export function ChangeWalletDialog({
  open,
  onOpenChange,
  currentWallet,
}: Props) {
  const { registerExternalWallet } = useRegisterExternalWallet()
  const { activeStore } = useActiveStore()
  const [loading, setLoading] = useState(false)

  const form = useForm<WalletForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: currentWallet || '',
    },
  })

  const onSubmit = async (values: WalletForm) => {
    if (!activeStore) {
      toast.error('No store found!')
      return
    }
    setLoading(true)
    try {
      await registerExternalWallet({
        address: values.walletAddress,
        storeId: activeStore.id,
      })
      toast.success('Wallet changed successfully!')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update wallet!')
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
          <DialogTitle>Update Payment Wallet</DialogTitle>
          <DialogDescription>
            Enter the wallet address you want to set as payment wallet.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='wallet-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='walletAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='0x1234567890123456789012345678901234567890'
                      className='font-mono'
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
          <Button type='submit' form='wallet-form' disabled={loading}>
            {loading ? (
              <Loader2 className='h-6 w-6 animate-spin' />
            ) : (
              'Update Wallet'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
