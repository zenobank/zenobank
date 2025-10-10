import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useAuth, UserButton } from '@clerk/clerk-react'
import copy from 'copy-to-clipboard'
import { Copy, Edit3, Check, Loader2 } from 'lucide-react'
import { useUsersControllerBootstrapV1 } from '@/lib/generated/api-client'
// import { usePayments } from '@/lib/state/payments/hooks'
import { useActiveStore } from '@/lib/state/store/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ChangeBinanceIdDialog } from '../funds-reception-methods/dialogs/change-binance-pay-dialog'
import { ChangeWalletDialog } from '../funds-reception-methods/dialogs/change-wallet-dialog'

export default function Dashboard() {
  // const { payments, isLoading: isPaymentsLoading } = usePayments()
  const { activeStore, isLoading } = useActiveStore()
  const { mutateAsync: mutateBootstrap } = useUsersControllerBootstrapV1()
  // const paymentList = useMemo(() => {
  //   if (!payments) return []
  //   return paymentListSchema.parse(payments)
  // }, [payments])

  const paymentWallet = useMemo(() => {
    return activeStore?.wallets[0] || null
  }, [activeStore])

  const [copied, setCopied] = useState(false)
  const [copiedBinance, setCopiedBinance] = useState(false)
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
  const [isBinanceDialogOpen, setIsBinanceDialogOpen] = useState(false)

  const { binancePayCredential } = activeStore || {}
  // TODO: Get this from backend/store

  const { getToken } = useAuth()
  getToken().then((_token) => {
    // console.log('token!!!', token)
  })

  const copyToClipboard = async () => {
    try {
      if (!paymentWallet) {
        return
      }
      await navigator.clipboard.writeText(paymentWallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_err) {
      // Silently handle clipboard error
    }
  }

  const copyBinanceId = async () => {
    try {
      if (!binancePayCredential?.accountId) {
        return
      }
      await copy(binancePayCredential.accountId)
      setCopiedBinance(true)
      setTimeout(() => setCopiedBinance(false), 2000)
    } catch (_err) {
      // Silently handle clipboard error
    }
  }
  useEffect(() => {
    mutateBootstrap()
  }, [])

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <UserButton />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>
        <div className='max-w-4xl space-y-6'>
          <p className='text-muted-foreground'>Funds reception methods</p>

          {/* Cards Grid */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* Wallet Address Card */}
            <Card className='border-border/40'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-sm font-medium'>
                  <div className='flex items-center gap-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='text-muted-foreground h-4 w-4'
                    >
                      <rect width='20' height='14' x='2' y='5' rx='2' />
                      <path d='M2 10h20' />
                    </svg>
                    <span className='text-muted-foreground'>Wallet</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='flex items-center justify-center py-6'>
                    <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />
                  </div>
                ) : paymentWallet ? (
                  <div className='flex items-center gap-2'>
                    <code className='text-foreground font-mono text-sm break-all'>
                      {paymentWallet.address}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-auto shrink-0 p-1.5'
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className='h-3.5 w-3.5 text-green-600' />
                      ) : (
                        <Copy className='text-muted-foreground h-3.5 w-3.5' />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-6 text-center'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-2 text-xs'
                      onClick={() => setIsWalletDialogOpen(true)}
                    >
                      <Edit3 className='h-3 w-3' />
                      Add Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Binance ID Card */}
            <Card className='border-border/40'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-sm font-medium'>
                  <div className='flex items-center gap-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='text-muted-foreground h-4 w-4'
                    >
                      <path d='M12 2L2 7l10 5 10-5-10-5z' />
                      <path d='M2 17l10 5 10-5' />
                      <path d='M2 12l10 5 10-5' />
                    </svg>
                    <span className='text-muted-foreground'>Binance Pay</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='flex items-center justify-center py-6'>
                    <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />
                  </div>
                ) : binancePayCredential ? (
                  <div className='flex items-center gap-2'>
                    <code className='text-foreground font-mono text-sm'>
                      {binancePayCredential.accountId}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-auto shrink-0 p-1.5'
                      onClick={copyBinanceId}
                    >
                      {copiedBinance ? (
                        <Check className='h-3.5 w-3.5 text-green-600' />
                      ) : (
                        <Copy className='text-muted-foreground h-3.5 w-3.5' />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-6 text-center'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-2 text-xs'
                      onClick={() => setIsBinanceDialogOpen(true)}
                    >
                      <Edit3 className='h-3 w-3' />
                      Add Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>

      <ChangeWalletDialog
        open={isWalletDialogOpen}
        onOpenChange={setIsWalletDialogOpen}
        currentWallet={''}
      />

      <ChangeBinanceIdDialog
        open={isBinanceDialogOpen}
        onOpenChange={setIsBinanceDialogOpen}
        currentBinanceId={binancePayCredential?.accountId || ''}
      />
    </>
  )
}
