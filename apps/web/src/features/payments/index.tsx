import { useState, useEffect, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Route } from '@/routes/payments/$id'
import copy from 'copy-to-clipboard'
import { ChevronsUpDown, Check, Copy, Clock, ArrowLeft } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { CopyButton } from '@/components/ui/copy-button'
import { Label } from '@/components/ui/label'
import {
  PopoverContent,
  PopoverTrigger,
  Popover,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/confirm-dialog'
import PaymentDetails from './components/DetailsScreen'
import TimerBadge from './components/TimerBadge'

export type PaymentData = {
  id: string
  storeName: string
  amount: number
  currency: string
}

const tokens = [
  {
    value: 'btc',
    label: 'Bitcoin',
    symbol: 'BTC',
    imageUrl: '/images/tokens/btc.png',
    usdPrice: 45000, // Example price
  },
  {
    value: 'eth',
    label: 'Ethereum',
    symbol: 'ETH',
    imageUrl: '/images/tokens/eth.png',
    usdPrice: 2800,
  },
  {
    value: 'usdt',
    label: 'Tether',
    symbol: 'USDT',
    imageUrl: '/images/tokens/usdt.png',
    usdPrice: 1,
  },
  {
    value: 'usdc',
    label: 'USD Coin',
    symbol: 'USDC',
    imageUrl: '/images/tokens/usdc.png',
    usdPrice: 1,
  },
  {
    value: 'sol',
    label: 'Solana',
    symbol: 'SOL',
    imageUrl: '/images/tokens/sol.png',
    usdPrice: 95,
  },
] as const

const networks = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'binance', label: 'BSC' },
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'optimism', label: 'Optimism' },
] as const

enum PaymentScreen {
  SELECTION = 'selection',
  DETAILS = 'details',
  EXPIRED = 'expired',
  CONFIRMED = 'confirmed',
}

interface PaymentSelection {
  selectedToken: string | null
  selectedNetwork: string | null
}

enum PopoverId {
  TOKEN = 'token',
  NETWORK = 'network',
}

export default function Payments() {
  const { id } = Route.useParams()
  const paymentData = Route.useLoaderData()
  const [screen, setScreen] = useState<PaymentScreen>(PaymentScreen.SELECTION)
  const [activePopover, setActivePopover] = useState<PopoverId | null>(null)

  const [paymentSelection, setPaymentSelection] = useState<PaymentSelection>({
    selectedToken: null,
    selectedNetwork: null,
  })
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Calculate token amount and USD conversion
  const selectedTokenData = useMemo(() => {
    if (!paymentSelection.selectedToken) return null
    return tokens.find((t) => t.value === paymentSelection.selectedToken)
  }, [paymentSelection.selectedToken])

  const selectedNetworkData = useMemo(() => {
    if (!paymentSelection.selectedNetwork) return null
    return networks.find((n) => n.value === paymentSelection.selectedNetwork)
  }, [paymentSelection.selectedNetwork])

  const tokenAmount = useMemo(() => {
    if (!selectedTokenData) return null
    return paymentData.amount / selectedTokenData.usdPrice
  }, [selectedTokenData, paymentData.amount])

  // Generate mock wallet address and QR code
  const walletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'

  // Auto-open network selector when token is selected
  useEffect(() => {
    if (paymentSelection.selectedToken && !paymentSelection.selectedNetwork) {
      setActivePopover(PopoverId.NETWORK)
    }
  }, [paymentSelection.selectedToken, paymentSelection.selectedNetwork])

  const handleBackClick = () => {
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = () => {
    setShowCancelDialog(false)
    setScreen(PaymentScreen.SELECTION)
  }
  const [disabled, buttonText] = useMemo(() => {
    if (!selectedTokenData) {
      return [true, 'Select cryptocurrency']
    }
    if (!selectedNetworkData) {
      return [true, 'Select network']
    }
    return [false, 'Next']
  }, [selectedTokenData, selectedNetworkData])

  return (
    <div className='bg-secondary flex min-h-screen items-center justify-center px-4 py-8'>
      <div className='mx-auto max-w-md flex-1'>
        <Card className=''>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                {screen === PaymentScreen.DETAILS && (
                  <ArrowLeft
                    onClick={handleBackClick}
                    className='text-muted-foreground mr-1 cursor-pointer'
                  />
                )}
                <CardTitle className='text-lg'>Send Payment</CardTitle>
              </div>
              <TimerBadge />
            </div>
          </CardHeader>

          <CardContent className='space-y-6'>
            <div className='py-4 text-center'>
              <div>
                <div className='flex items-center justify-center gap-3 text-3xl font-bold'>
                  {selectedTokenData ? (
                    <span className='relative flex items-center gap-2'>
                      {tokenAmount?.toFixed(6)} {selectedTokenData.symbol}
                      <CopyButton
                        text={`${tokenAmount?.toFixed(6)} ${selectedTokenData.symbol}`}
                      />
                    </span>
                  ) : (
                    <>Select currency</>
                  )}
                </div>
                <div className='mt-1 text-sm'>
                  <Badge variant='secondary'>
                    Network:{' '}
                    {selectedNetworkData ? selectedNetworkData.label : '-'}
                  </Badge>
                </div>
              </div>
            </div>
            <Separator />

            {screen === PaymentScreen.SELECTION && (
              <>
                {/* Token Selector */}
                <div className='space-y-2'>
                  <Popover
                    open={activePopover === PopoverId.TOKEN}
                    onOpenChange={(open) => {
                      setActivePopover(open ? PopoverId.TOKEN : null)
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={activePopover === PopoverId.TOKEN}
                        className='mx-auto h-12 w-full max-w-md justify-between'
                      >
                        {selectedTokenData ? (
                          <div className='flex items-center gap-3'>
                            <img
                              src={selectedTokenData.imageUrl}
                              alt={selectedTokenData.label}
                              className='h-6 w-6 rounded-full'
                            />
                            <div className='text-left'>
                              <div className='text-sm font-bold'>
                                {selectedTokenData.symbol}
                              </div>
                              <div className='text-xs'>
                                {selectedTokenData.label}
                              </div>
                            </div>
                          </div>
                        ) : (
                          'Select cryptocurrency...'
                        )}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-96 p-0'>
                      <Command>
                        <CommandInput
                          placeholder='Search cryptocurrency...'
                          className='h-9'
                        />
                        <CommandList>
                          <CommandEmpty>No cryptocurrency found.</CommandEmpty>
                          <CommandGroup>
                            {tokens.map((token) => (
                              <CommandItem
                                key={token.value}
                                value={token.value}
                                onSelect={(currentValue) => {
                                  if (
                                    currentValue !== selectedTokenData?.value
                                  ) {
                                    setPaymentSelection({
                                      ...paymentSelection,
                                      selectedToken: currentValue,
                                    })
                                  }
                                  setActivePopover(null)
                                }}
                              >
                                <div className='flex w-full items-center gap-3'>
                                  <img
                                    src={token.imageUrl}
                                    alt={token.label}
                                    className='h-6 w-6 rounded-full'
                                  />
                                  <div className='flex-1'>
                                    <div className='text-sm font-bold'>
                                      {token.symbol}
                                    </div>
                                    <div className='text-xs'>{token.label}</div>
                                  </div>
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      selectedTokenData?.value === token.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Network Selector */}
                <div className='space-y-2'>
                  <Popover
                    open={activePopover === PopoverId.NETWORK}
                    onOpenChange={(open) => {
                      setActivePopover(open ? PopoverId.NETWORK : null)
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={activePopover === PopoverId.NETWORK}
                        className='mx-auto h-12 w-full max-w-md justify-between'
                        disabled={!selectedTokenData}
                      >
                        {selectedNetworkData ? (
                          <div className='flex items-center gap-3'>
                            {
                              networks.find(
                                (network) =>
                                  network.value === selectedNetworkData.value
                              )?.label
                            }
                          </div>
                        ) : (
                          'Select network...'
                        )}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-96 p-0'>
                      <Command>
                        <CommandInput
                          placeholder='Search network...'
                          className='h-9'
                        />
                        <CommandList>
                          <CommandEmpty>No network found.</CommandEmpty>
                          <CommandGroup>
                            {networks.map((chain) => (
                              <CommandItem
                                key={chain.value}
                                value={chain.value}
                                onSelect={(currentValue) => {
                                  if (
                                    currentValue !== selectedNetworkData?.value
                                  ) {
                                    setPaymentSelection({
                                      ...paymentSelection,
                                      selectedNetwork: currentValue,
                                    })
                                  }
                                  setActivePopover(null)
                                }}
                              >
                                <div className='flex items-center gap-3'>
                                  {chain.label}
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      selectedNetworkData?.value === chain.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  onClick={() => {
                    setScreen(PaymentScreen.DETAILS)
                  }}
                  disabled={disabled}
                  className={`mx-auto w-full ${
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {buttonText}
                </Button>
              </>
            )}

            {screen === PaymentScreen.DETAILS && (
              <PaymentDetails walletAddress={walletAddress} />
            )}
          </CardContent>

          <CardFooter className='pt-4'>
            <div className='w-full space-y-3'></div>
          </CardFooter>
        </Card>

        <Footer />

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          handleConfirm={handleCancelConfirm}
          title='Are you sure?'
          desc={
            <div className='space-y-4'>
              <p className='mb-2'>
                This transaction will be cancelled. If you already sent the
                payment please wait.
              </p>
            </div>
          }
          confirmText='Yes, I am sure'
          cancelBtnText='Cancel'
          destructive
        />
      </div>
    </div>
  )
}

const Footer = () => {
  return (
    <div className='mt-6 text-center'>
      <p className='text-xs'>
        Powered by{' '}
        <a href='https://zenobank.io' target='_blank'>
          <span className='underline'>Zenobank</span>
        </a>
      </p>
    </div>
  )
}
