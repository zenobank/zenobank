import { useMemo, useState } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { Copy, Edit3, Check, Loader2 } from 'lucide-react'
import { usePayments } from '@/lib/state/payments/hooks'
import { useActiveStore } from '@/lib/state/store/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from '../transactions/components/users-columns'
import { UsersTable } from '../transactions/components/users-table'
import TransactionsProvider from '../transactions/context/transactions-context'
import { userListSchema } from '../transactions/data/schema'
import { users } from '../transactions/data/users'
import { ChangeWalletDialog } from '../wallets/components/change-wallet-dialog'

export default function Dashboard() {
  const userList = userListSchema.parse(users)
  const { payments, isLoading: isPaymentsLoading } = usePayments()
  const { activeStore, isLoading } = useActiveStore()

  const paymentWallet = useMemo(() => {
    return activeStore?.wallets[0] || null
  }, [activeStore])

  const [copied, setCopied] = useState(false)
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
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
          <p className='text-muted-foreground'>Your wallet information</p>

          {/* Cards Grid */}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Wallet Address Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='h-5 w-5'
                    >
                      <rect width='20' height='14' x='2' y='5' rx='2' />
                      <path d='M2 10h20' />
                    </svg>
                    Payment Address
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin' />
                  </div>
                ) : paymentWallet ? (
                  <div className='flex items-center gap-2'>
                    <code className='text-md font-mono break-all'>
                      {paymentWallet.address}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='shrink-0 p-2'
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className='h-4 w-4 text-green-600' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-8 text-center'>
                    <p className='text-muted-foreground mb-4'>
                      No wallet configured
                    </p>
                    <Button
                      variant='outline'
                      className='gap-2'
                      onClick={() => setIsWalletDialogOpen(true)}
                    >
                      <Edit3 className='h-4 w-4' />
                      Add Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
      <Main>
        <TransactionsProvider>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Payments</h2>
              <p className='text-muted-foreground'>
                Showing the last 100 payments
              </p>
            </div>
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
            <UsersTable data={userList} columns={columns} />
          </div>
        </TransactionsProvider>
      </Main>

      <ChangeWalletDialog
        open={isWalletDialogOpen}
        onOpenChange={setIsWalletDialogOpen}
        currentWallet={''}
      />
    </>
  )
}
