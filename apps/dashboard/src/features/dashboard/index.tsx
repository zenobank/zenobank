import { useState } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { Copy, Edit3, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { userListSchema } from '../transactions/data/schema'
import { users } from '../transactions/data/users'
import { ChangeWalletDialog } from '../wallets/components/change-wallet-dialog'

export default function Dashboard() {
  const _userList = userListSchema.parse(users)
  const [copied, setCopied] = useState(false)
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
  const walletAddress = '0xc0ffee254729296a45a3885639AC7E10F9d54979'
  const { getToken } = useAuth()
  getToken().then((_token) => {
    // console.log('token!!!', token)
  })

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
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
          {/* <div className='flex items-center space-x-2'>
            <Button>Download</Button>
          </div> */}
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
                  {/* <Button
                    variant='outline'
                    size='sm'
                    className='gap-2'
                    onClick={() => setIsWalletDialogOpen(true)}
                  >
                    <Edit3 className='h-4 w-4' />
                    Change
                  </Button> */}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-2'>
                  <code className='text-md font-mono break-all'>
                    0xc0ff...54979
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
              </CardContent>
            </Card>

            {/* Wallet Balance Card */}
            {/* <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
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
                    <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                  </svg>
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>$0.00</div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </Main>
      {/* <Main>
        <TransactionsProvider>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Transactions
              </h2>
            </div>
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
            <UsersTable data={userList} columns={columns} />
          </div>
        </TransactionsProvider>
      </Main> */}

      <ChangeWalletDialog
        open={isWalletDialogOpen}
        onOpenChange={setIsWalletDialogOpen}
        currentWallet={''}
      />
    </>
  )
}
