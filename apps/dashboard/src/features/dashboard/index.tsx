import { useMemo, useState } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import {
  usersControllerGetMeV1,
  useUsersControllerGetMeV1,
} from '@repo/api-client'
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
  const { data: { data: userData } = {}, isLoading: isUserDataLoading } =
    useUsersControllerGetMeV1()

  // a esto le falta la base
  const currentStore = useMemo(() => {
    return userData?.stores[0] || null
  }, [userData?.stores])

  const paymentWallet = useMemo(() => {
    return currentStore?.wallets[0] || null
  }, [currentStore])

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
                    Add
                  </Button> */}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-2'>
                  <code className='text-md font-mono break-all'>
                    {paymentWallet?.address}
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
          </div>
        </div>
      </Main>

      <ChangeWalletDialog
        open={isWalletDialogOpen}
        onOpenChange={setIsWalletDialogOpen}
        currentWallet={''}
      />
    </>
  )
}
