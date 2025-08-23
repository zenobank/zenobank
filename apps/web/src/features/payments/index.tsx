import { useState, useEffect, useMemo } from 'react'
import { Route } from '@/routes/payments/$id'
import { ChevronsUpDown, Check, TimerIcon } from 'lucide-react'
import Countdown from 'react-countdown'
import { toast } from 'sonner'
import { usePaymentControllerUpdatePaymentDepositSelectionV1 } from '@/lib/requests/api-client/aPIDocs'
import {
  NetworkId,
  PaymentResponseDto,
  PaymentStatus,
} from '@/lib/requests/api-client/model'
import { CheckoutState } from '@/lib/types/payment-checkout/payment-state'
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
import { CopyButton } from '@/components/ui/copy-button'
import {
  PopoverContent,
  PopoverTrigger,
  Popover,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import PaymentDetails from './components/DetailsScreen'
import ExpiredScreen from './components/ExpiredScreen'
import SuccessScreen from './components/SuccessScreen'
import { getPaymentCheckoutState } from './hooks/usePaymentState'

interface PaymentSelection<TokenId> {
  selectedToken: TokenId | null
  selectedNetwork: NetworkId | null
}

enum PopoverId {
  TOKEN = 'token',
  NETWORK = 'network',
}

export default function Payments() {
  const {
    paymentData: initialPaymentData,
    networks,
    supportedTokens,
  } = Route.useLoaderData()
  const [paymentData, setPaymentData] =
    useState<PaymentResponseDto>(initialPaymentData)

  const checkoutState = useMemo(
    () => getPaymentCheckoutState(paymentData),
    [paymentData]
  )
  const { mutateAsync: updatePaymentDepositSelection } =
    usePaymentControllerUpdatePaymentDepositSelectionV1()

  const [isLoading, setIsLoading] = useState(false)
  const [activePopover, setActivePopover] = useState<PopoverId | null>(null)

  const [paymentSelection, setPaymentSelection] = useState<
    PaymentSelection<TokenId>
  >({
    selectedToken: paymentData?.depositDetails?.currencyId || null,
    selectedNetwork: paymentData?.depositDetails?.networkId || null,
  })

  type TokenId = (typeof supportedTokens)[number]['id']

  // Group tokens by canonicalTokenId and get unique tokens
  const uniqueTokens = useMemo(() => {
    const tokenMap = new Map()
    supportedTokens?.forEach((token) => {
      if (!tokenMap.has(token.canonicalTokenId)) {
        tokenMap.set(token.canonicalTokenId, token)
      }
    })
    return Array.from(tokenMap.values())
  }, [supportedTokens])

  const availableNetworks = useMemo(() => {
    if (!paymentSelection.selectedToken) return []

    const selectedTokenData = supportedTokens.find(
      (t) => t.id === paymentSelection.selectedToken
    )
    if (!selectedTokenData) return []

    const tokensWithSameCanonical = supportedTokens.filter(
      (t) => t.canonicalTokenId === selectedTokenData.canonicalTokenId
    )

    const networkIds = tokensWithSameCanonical.map((t) => t.networkId)
    return networks.filter((network) =>
      networkIds.some(
        (networkId) => networkId.toString() === network.id.toString()
      )
    )
  }, [paymentSelection.selectedToken, supportedTokens, networks])

  // Calculate token amount and USD conversion
  const selectedTokenData = useMemo(() => {
    if (!paymentSelection.selectedToken) return null
    return supportedTokens.find((t) => t.id === paymentSelection.selectedToken)
  }, [paymentSelection.selectedToken, supportedTokens])

  const selectedNetworkData = useMemo(() => {
    if (!paymentSelection.selectedNetwork) return null
    return networks.find(
      (n) => n.id.toString() === paymentSelection.selectedNetwork
    )
  }, [paymentSelection.selectedNetwork, networks])

  // Auto-select network if only one is available
  useEffect(() => {
    if (paymentSelection.selectedToken && availableNetworks.length === 1) {
      setPaymentSelection((prev) => ({
        ...prev,
        selectedNetwork: availableNetworks[0].id.toString() as NetworkId,
      }))
    }
  }, [paymentSelection.selectedToken, availableNetworks])

  // Auto-open network selector when token is selected (only if multiple networks available)
  useEffect(() => {
    if (
      paymentSelection.selectedToken &&
      !paymentSelection.selectedNetwork &&
      availableNetworks.length > 1
    ) {
      setActivePopover(PopoverId.NETWORK)
    }
  }, [
    paymentSelection.selectedToken,
    paymentSelection.selectedNetwork,
    availableNetworks,
  ])

  const [disabled, buttonText] = useMemo(() => {
    if (isLoading) {
      return [true, 'Loading...']
    }
    if (!selectedTokenData) {
      return [true, 'Select cryptocurrency']
    }
    if (!selectedNetworkData) {
      return [true, 'Select network']
    }
    return [false, 'Next']
  }, [selectedTokenData, selectedNetworkData, isLoading])

  const handleDepositSelectionSubmit = async () => {
    if (disabled) return
    const { selectedToken, selectedNetwork } = paymentSelection

    if (!selectedToken || !selectedNetwork) return
    setIsLoading(true)
    try {
      const { data: updatedPaymentData } = await updatePaymentDepositSelection({
        id: paymentData.id,
        data: {
          tokenId: selectedToken,
          networkId: selectedNetwork,
        },
      })
      console.log('updatedPaymentData', updatedPaymentData)
      setPaymentData(updatedPaymentData)
    } catch (error) {
      console.log('error', error)
      toast.error('Failed to update payment deposit selection')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='bg-secondary flex min-h-screen items-center justify-center px-4 py-8'>
      <div className='mx-auto max-w-md flex-1'>
        <Card className=''>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <CardTitle className='text-lg'>Send Payment</CardTitle>
              </div>
              <Badge variant='secondary'>
                <TimerIcon />
                <Countdown
                  date={new Date(paymentData.expiredAt)}
                  daysInHours
                  overtime={false}
                  onComplete={() => {
                    setPaymentData((prev) => ({
                      ...prev,
                      status: PaymentStatus.EXPIRED,
                    }))
                  }}
                  renderer={({ hours, minutes, seconds }) => (
                    <span>
                      {hours !== 0 && String(hours).padStart(2, '0') + ':'}
                      {String(minutes).padStart(2, '0')}:
                      {String(seconds).padStart(2, '0')}
                    </span>
                  )}
                />
              </Badge>
            </div>
          </CardHeader>

          <CardContent className='space-y-3'>
            <div className='py-4 text-center'>
              <div>
                <div className='flex items-center justify-center gap-3 text-3xl font-bold'>
                  {selectedTokenData ? (
                    <span className='relative flex items-center gap-2'>
                      {paymentData.amount} {selectedTokenData.symbol}
                      <CopyButton
                        text={`${paymentData.amount} ${selectedTokenData.symbol}`}
                      />
                    </span>
                  ) : (
                    <>Select currency</>
                  )}
                </div>
                <div className='mt-1 text-sm'>
                  <Badge variant='secondary'>
                    Network:{' '}
                    {selectedNetworkData
                      ? selectedNetworkData.displayName
                      : '-'}
                  </Badge>
                </div>
              </div>
            </div>
            <Separator />

            {checkoutState === CheckoutState.AWAITING_SELECTION && (
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
                              src={`/images/tokens/${selectedTokenData.canonicalTokenId.toLowerCase()}.png`}
                              alt={selectedTokenData.symbol}
                              className='h-6 w-6 rounded-full'
                            />
                            <div className='text-left'>
                              <div className='text-sm font-bold'>
                                {selectedTokenData.symbol}
                              </div>
                              <div className='text-xs'>
                                {selectedTokenData.symbol}
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
                            {uniqueTokens?.map((token) => (
                              <CommandItem
                                key={token.id}
                                value={token.id}
                                onSelect={(currentValue) => {
                                  if (currentValue !== selectedTokenData?.id) {
                                    setPaymentSelection({
                                      ...paymentSelection,
                                      selectedToken: currentValue,
                                      selectedNetwork: null, // Reset network when token changes
                                    })
                                  }
                                  setActivePopover(null)
                                }}
                              >
                                <div className='flex w-full items-center gap-3'>
                                  <img
                                    src={`/images/tokens/${token.canonicalTokenId.toLowerCase()}.png`}
                                    alt={token.symbol}
                                    className='h-6 w-6 rounded-full'
                                  />
                                  <div className='flex-1'>
                                    <div className='text-sm font-bold'>
                                      {token.symbol}
                                    </div>
                                    <div className='text-xs'>
                                      {token.symbol}
                                    </div>
                                  </div>
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      selectedTokenData?.id === token.id
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

                {/* Network Selector - Always visible but disabled when only one network */}
                <div className='space-y-2'>
                  <Popover
                    open={activePopover === PopoverId.NETWORK}
                    onOpenChange={(open) => {
                      // Only allow opening if multiple networks available
                      if (open && availableNetworks.length <= 1) return
                      setActivePopover(open ? PopoverId.NETWORK : null)
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={activePopover === PopoverId.NETWORK}
                        className='mx-auto h-12 w-full max-w-md justify-between'
                        disabled={
                          !selectedTokenData || availableNetworks.length <= 1
                        }
                      >
                        {selectedNetworkData ? (
                          <div className='flex items-center gap-3'>
                            {selectedNetworkData.displayName}
                          </div>
                        ) : (
                          'Select network...'
                        )}
                        {availableNetworks.length > 1 && (
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        )}
                      </Button>
                    </PopoverTrigger>
                    {availableNetworks.length > 1 && (
                      <PopoverContent className='w-96 p-0'>
                        <Command>
                          <CommandInput
                            placeholder='Search network...'
                            className='h-9'
                          />
                          <CommandList>
                            <CommandEmpty>No network found.</CommandEmpty>
                            <CommandGroup>
                              {availableNetworks.map((network) => (
                                <CommandItem
                                  key={network.id.toString()}
                                  value={network.id.toString()}
                                  onSelect={(currentValue) => {
                                    if (
                                      currentValue !==
                                      selectedNetworkData?.id.toString()
                                    ) {
                                      setPaymentSelection({
                                        ...paymentSelection,
                                        selectedNetwork:
                                          currentValue as NetworkId,
                                      })
                                    }
                                    setActivePopover(null)
                                  }}
                                >
                                  <div className='flex items-center gap-3'>
                                    {network.displayName}
                                    <Check
                                      className={cn(
                                        'ml-auto h-4 w-4',
                                        selectedNetworkData?.id === network.id
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
                    )}
                  </Popover>
                </div>

                <Button
                  onClick={() => {
                    handleDepositSelectionSubmit()
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

            {checkoutState === CheckoutState.AWAITING_DEPOSIT &&
              paymentData.depositDetails?.address && (
                <PaymentDetails
                  walletAddress={paymentData.depositDetails?.address}
                />
              )}

            {checkoutState === CheckoutState.SUCCESS && <SuccessScreen />}

            {checkoutState === CheckoutState.EXPIRED && <ExpiredScreen />}
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
