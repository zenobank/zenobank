'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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
  const form = useForm<WalletForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: currentWallet || '',
    },
  })

  const onSubmit = (values: WalletForm) => {
    toast.success('Wallet changed successfully!')
    form.reset()
    onOpenChange(false)
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
          <DialogTitle>Change Payment Wallet</DialogTitle>
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
          <Button type='submit' form='wallet-form'>
            Change Wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
