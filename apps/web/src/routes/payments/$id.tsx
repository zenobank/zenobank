import { useState, useEffect, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import copy from 'copy-to-clipboard'
import {
  ChevronsUpDown,
  Check,
  Copy,
  Clock,
  Info,
  MoveLeft,
  ChevronLeft,
  ArrowLeft,
  ArrowLeftCircle,
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { cn } from '@/lib/utils'
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
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type PaymentData = {
  id: string
  storeName: string
  amount: number
  currency: string
}

export const Route = createFileRoute('/payments/$id')({
  loader: async ({ params }) => {
    // Simulate payment data - in real app this would come from your API
    const data: PaymentData = {
      id: params.id,
      storeName: 'PayAmazon',
      amount: 3,
      currency: 'USD',
    }
    return data
  },
  component: RouteComponent,
})

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

function RouteComponent() {
  const { id } = Route.useParams()
  const paymentData = Route.useLoaderData()
  const [openToken, setOpenToken] = useState(true)
  const [openChain, setOpenChain] = useState(false)
  const [selectedToken, setSelectedToken] = useState('')
  const [selectedChain, setSelectedChain] = useState('')
  const [currentStep, setCurrentStep] = useState(1)

  // Calculate token amount and USD conversion
  const tokenAmount = useMemo(() => {
    if (!selectedToken) return null
    const token = tokens.find((t) => t.value === selectedToken)
    if (!token) return null
    return paymentData.amount / token.usdPrice
  }, [selectedToken, paymentData.amount])

  // Generate mock wallet address and QR code
  const walletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'

  // Auto-open network selector when token is selected
  useEffect(() => {
    if (selectedToken && !selectedChain) {
      setOpenChain(true)
    }
  }, [selectedToken, selectedChain])

  // Auto-advance to next step when both are selected
  // useEffect(() => {
  //   if (selectedToken && selectedChain) {
  //     setCurrentStep(2)
  //   }
  // }, [selectedChain])

  return (
    <div className='bg-secondary flex min-h-screen items-center justify-center px-4 py-8'>
      <div className='mx-auto max-w-md flex-1'>
        <Card className=''>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                {currentStep === 2 && (
                  <ArrowLeft
                    onClick={() => setCurrentStep(1)}
                    className='text-muted-foreground mr-1 cursor-pointer'
                  />
                )}
                <CardTitle className='text-lg'>Send Payment</CardTitle>
              </div>
              <Badge variant='outline'>
                <Clock className='' />
                60:00
              </Badge>
            </div>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Amount Display - Always visible */}
            <div className='py-4 text-center'>
              <div>
                <div className='flex items-center justify-center gap-3 text-3xl font-bold'>
                  {selectedToken ? (
                    <span className='relative flex items-center gap-2'>
                      {tokenAmount?.toFixed(6)}{' '}
                      {tokens.find((t) => t.value === selectedToken)?.symbol}
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          copy(
                            `${tokenAmount?.toFixed(6)} ${tokens.find((t) => t.value === selectedToken)?.symbol}`
                          )
                        }
                        className='absolute top-1 -right-9 h-8 w-8'
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                    </span>
                  ) : (
                    <>Select currency</>
                  )}
                </div>
                <div className='mt-1 text-sm'>
                  <Badge variant='secondary'>
                    Network:{' '}
                    {networks.find((c) => c.value === selectedChain)?.label
                      ? networks.find((c) => c.value === selectedChain)?.label
                      : '-'}
                  </Badge>
                </div>
              </div>
            </div>
            <Separator />

            {/* Step 1: Token and Network Selection */}
            {currentStep === 1 && (
              <>
                {/* Token Selector */}
                <div className='space-y-2'>
                  <Popover open={openToken} onOpenChange={setOpenToken}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={openToken}
                        className='mx-auto h-12 w-full max-w-md justify-between'
                      >
                        {selectedToken ? (
                          <div className='flex items-center gap-3'>
                            <img
                              src={
                                tokens.find(
                                  (token) => token.value === selectedToken
                                )?.imageUrl
                              }
                              alt={
                                tokens.find(
                                  (token) => token.value === selectedToken
                                )?.label
                              }
                              className='h-6 w-6 rounded-full'
                            />
                            <div className='text-left'>
                              <div className='text-sm font-bold'>
                                {
                                  tokens.find(
                                    (token) => token.value === selectedToken
                                  )?.symbol
                                }
                              </div>
                              <div className='text-xs'>
                                {
                                  tokens.find(
                                    (token) => token.value === selectedToken
                                  )?.label
                                }
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
                                  if (currentValue !== selectedToken) {
                                    setSelectedToken(currentValue)
                                  }
                                  setOpenToken(false)
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
                                      selectedToken === token.value
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
                  <Popover open={openChain} onOpenChange={setOpenChain}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={openChain}
                        className='mx-auto h-12 w-full max-w-md justify-between'
                        disabled={!selectedToken}
                      >
                        {selectedChain ? (
                          <div className='flex items-center gap-3'>
                            {
                              networks.find(
                                (chain) => chain.value === selectedChain
                              )?.label
                            }
                          </div>
                        ) : selectedToken ? (
                          'Select network...'
                        ) : (
                          'Select cryptocurrency first'
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
                                  if (currentValue !== selectedChain) {
                                    setSelectedChain(currentValue)
                                  }
                                  setOpenChain(false)
                                }}
                              >
                                <div className='flex items-center gap-3'>
                                  {chain.label}
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      selectedChain === chain.value
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
                    if (selectedToken && selectedChain) {
                      setCurrentStep(2)
                    }
                  }}
                  disabled={!selectedToken || !selectedChain}
                  className={`mx-auto w-full ${
                    selectedToken && selectedChain
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed'
                  }`}
                >
                  Next
                </Button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className='space-y-4'>
                  <div className='mx-auto flex w-full flex-col items-center justify-center'>
                    <Label className='text-muted-foreground'>
                      Send funds to
                    </Label>
                    <div className='relative flex items-center justify-between text-sm'>
                      <span className='font-medium'>
                        {walletAddress.slice(0, 6)}...
                        {walletAddress.slice(-6)}
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='absolute -top-0.5 -right-9 h-6 text-xs'
                        onClick={() => copy(walletAddress)}
                      >
                        <Copy className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>

                  <QRCodeCanvas
                    className='mx-auto rounded-md p-0.5'
                    value='https://reactjs.org/'
                    bgColor='#000000'
                    fgColor='#ffffff'
                  />
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className='pt-4'>
            <div className='w-full space-y-3'></div>
          </CardFooter>
        </Card>

        <Footer />
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
