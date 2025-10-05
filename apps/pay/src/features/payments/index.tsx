'use client';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command';
import { CopyButton } from '@/src/components/ui/copy-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { CheckoutState } from '@/src/features/payments/types/state';
import { ms } from '@/src/lib/ms';
import {
  useCheckoutsControllerCreateCheckoutAttemptV1,
  useCheckoutsControllerGetCheckoutV1,
  useNetworksControllerGetNetworksV1,
} from '@repo/api-client';
import { TokenResponseDto } from '@repo/api-client/model';
import { cn } from '@/src/lib/utils';
import { Check, ChevronsUpDown, TimerIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Countdown from 'react-countdown';
import { toast } from 'sonner';
import Image from 'next/image';
import PaymentDetails from './components/DetailsScreen';
import ExpiredScreen from './components/ExpiredScreen';
import SuccessScreen from './components/SuccessScreen';
import { getPaymentCheckoutState } from './utils/payment-checkout-state';

interface PaymentsProps {
  id: string;
}

enum PopoverId {
  TOKEN = 'token',
  RAIL = 'rail',
}

export default function Payament({ id }: PaymentsProps) {
  const { mutateAsync: createPaymentAttemp } = useCheckoutsControllerCreateCheckoutAttemptV1();
  const { data: { data: checkoutData } = {}, refetch: refetchPaymentData } = useCheckoutsControllerGetCheckoutV1(id, {
    query: {
      refetchInterval: ms('3s'),
    },
  });
  // ver como me traigo lso tokens permitidos para este checkout
  const { data: { data: networks } = {} } = useNetworksControllerGetNetworksV1();
  const [isLoading, setIsLoading] = useState(false);
  const [activePopover, setActivePopover] = useState<PopoverId | null>(null);

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const selectedTokenData: TokenResponseDto | null = useMemo(() => {
    return checkoutData?.enabledTokens?.find((t) => t.id === selectedTokenId) || null;
  }, [checkoutData?.enabledTokens, selectedTokenId]);

  const selectedNetworkId = useMemo(() => {
    return selectedTokenData?.networkId || null;
  }, [selectedTokenData]);

  // useEffect(() => {
  //   if (checkoutData?.depositWallet) {
  //     setSelectedTokenId(checkoutData?.depositWallet?.id || null);
  //   }
  // }, [checkoutData?.depositWallet]);

  const checkoutState = useMemo(() => {
    if (!checkoutData) return CheckoutState.AWAITING_DEPOSIT;
    return getPaymentCheckoutState(checkoutData);
  }, [checkoutData]);

  const availableNetworksIdsForSelectedToken: string[] = useMemo(() => {
    const tokens = checkoutData?.enabledTokens?.filter(
      (t) => t.canonicalTokenId === selectedTokenData?.canonicalTokenId && t.rail === 'ONCHAIN',
    );

    return tokens?.map((t) => t.networkId).filter((id): id is string => id !== null) || [];
  }, [checkoutData?.enabledTokens, selectedTokenData?.canonicalTokenId]);

  const availableProvidersForSelectedToken = useMemo(() => {
    const tokens = checkoutData?.enabledTokens?.filter(
      (t) => t.canonicalTokenId === selectedTokenData?.canonicalTokenId && t.rail === 'CUSTODIAL',
    );

    return tokens || [];
  }, [checkoutData?.enabledTokens, selectedTokenData?.canonicalTokenId]);

  // Calculate token amount and USD conversion

  const selectedNetworkData = useMemo(() => {
    if (!selectedNetworkId) return null;
    return networks?.find((n) => n.id.toString() === selectedNetworkId);
  }, [selectedNetworkId, networks]);

  // Auto-select network/provider if only one is available
  useEffect(() => {
    if (selectedTokenId) {
      const totalOptions = availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length;
      if (totalOptions === 1) {
        if (availableNetworksIdsForSelectedToken.length === 1) {
          const token = checkoutData?.enabledTokens?.find(
            (t) =>
              t.canonicalTokenId === selectedTokenData?.canonicalTokenId &&
              t.networkId === availableNetworksIdsForSelectedToken[0],
          );
          setSelectedTokenId(token?.id || null);
        } else if (availableProvidersForSelectedToken.length === 1) {
          const providerToken = availableProvidersForSelectedToken[0];
          if (providerToken) {
            setSelectedTokenId(providerToken.id);
          }
        }
      }
    }
  }, [
    selectedTokenId,
    availableNetworksIdsForSelectedToken,
    availableProvidersForSelectedToken,
    checkoutData?.enabledTokens,
    selectedTokenData,
  ]);

  const [disabled, buttonText] = useMemo(() => {
    if (isLoading) {
      return [true, 'Loading...'];
    }
    if (!selectedTokenData) {
      return [true, 'Select cryptocurrency'];
    }
    // Check if we have a valid selection (either network for ONCHAIN or provider for CUSTODIAL)
    const hasValidSelection =
      (selectedTokenData.rail === 'ONCHAIN' && selectedNetworkData) ||
      (selectedTokenData.rail === 'CUSTODIAL' && selectedTokenData.provider);

    if (!hasValidSelection) {
      return [true, 'Select payment method'];
    }
    return [false, 'Next'];
  }, [selectedTokenData, selectedNetworkData, isLoading]);

  const handleDepositSelectionSubmit = async () => {
    if (disabled || !checkoutData?.id) return;

    if (!selectedTokenId) return;
    setIsLoading(true);
    try {
      await createPaymentAttemp({
        id: checkoutData.id,
        data: {
          tokenId: selectedTokenId,
        },
      });
      await refetchPaymentData();
    } catch (error) {
      console.log('error', error);
      toast.error('Failed to update payment deposit selection');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log('checkoutData', checkoutData);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card className="">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CardTitle className="text-lg">Send Payment</CardTitle>
              </div>
              {checkoutData?.expiresAt && checkoutState === CheckoutState.AWAITING_DEPOSIT && (
                <Badge variant="secondary" data-testid="countdown">
                  <TimerIcon />
                  <Countdown
                    date={new Date(checkoutData.expiresAt)}
                    daysInHours
                    overtime={false}
                    renderer={({ hours, minutes, seconds }) => (
                      <span>
                        {hours !== 0 && String(hours).padStart(2, '0') + ':'}
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </span>
                    )}
                  />
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="py-4 text-center">
              <div>
                {checkoutState === CheckoutState.AWAITING_DEPOSIT &&
                selectedTokenData &&
                (selectedTokenData.rail === 'ONCHAIN' ? selectedNetworkData : selectedTokenData.provider) ? (
                  // Show token amount with copy button when token and payment method are selected
                  <>
                    <div className="flex items-center justify-center gap-3 text-3xl font-bold">
                      <span className="relative flex items-center gap-2">
                        <span data-testid="currency-amount" className="select-all">
                          {checkoutData?.depositDetails?.amount || checkoutData?.priceAmount}
                        </span>{' '}
                        {selectedTokenData.symbol}
                        <CopyButton
                          text={`${checkoutData?.depositDetails?.amount || checkoutData?.priceAmount} ${selectedTokenData.symbol}`}
                        />
                      </span>
                    </div>
                    <div className="mt-1 text-sm">
                      <Badge variant="secondary">
                        Method:{' '}
                        {selectedTokenData.rail === 'ONCHAIN'
                          ? selectedNetworkData?.displayName
                          : selectedTokenData.provider === 'BINANCE_PAY'
                            ? 'Binance Pay'
                            : selectedTokenData.provider}
                      </Badge>
                    </div>
                  </>
                ) : (
                  // Show currency amount when no token/payment method selected yet
                  <div className="flex items-center justify-center gap-3 text-3xl font-bold">
                    {checkoutData?.priceCurrency} {checkoutData?.priceAmount}
                  </div>
                )}
              </div>
            </div>

            {checkoutState === CheckoutState.AWAITING_SELECTION && (
              <>
                {/* Token Selector */}
                <div className="space-y-2">
                  <Popover
                    open={activePopover === PopoverId.TOKEN}
                    onOpenChange={(open: boolean) => {
                      setActivePopover(open ? PopoverId.TOKEN : null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={activePopover === PopoverId.TOKEN}
                        className="mx-auto h-12 w-full max-w-md justify-between"
                      >
                        {selectedTokenData ? (
                          <div className="flex items-center gap-3">
                            <Image
                              width={24}
                              height={24}
                              src={`/images/tokens/${selectedTokenData.canonicalTokenId.toLowerCase()}.png`}
                              alt={selectedTokenData.symbol}
                              className="h-6 w-6 rounded-full"
                            />
                            <div className="text-left">
                              <div className="text-sm font-bold">{selectedTokenData.symbol}</div>
                              <div className="text-xs">{selectedTokenData.symbol}</div>
                            </div>
                          </div>
                        ) : (
                          'Select cryptocurrency...'
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-0">
                      <Command>
                        <CommandInput placeholder="Search token..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No token found.</CommandEmpty>
                          <CommandGroup>
                            {checkoutData?.enabledTokens
                              ?.filter(
                                (t, i, arr) => i === arr.findIndex((u) => u.canonicalTokenId === t.canonicalTokenId),
                              )
                              ?.map((supportedToken) => (
                                <CommandItem
                                  key={supportedToken.id}
                                  value={supportedToken.id}
                                  onSelect={(currentValue: string) => {
                                    const token = checkoutData?.enabledTokens?.find((t) => t.id === currentValue);
                                    if (token) {
                                      setSelectedTokenId(token.id);
                                    }
                                    setActivePopover(null);
                                  }}
                                >
                                  <div className="flex w-full items-center gap-3">
                                    <Image
                                      width={24}
                                      height={24}
                                      src={`/images/tokens/${supportedToken.canonicalTokenId.toLowerCase()}.png`}
                                      alt={supportedToken.symbol}
                                      className="h-6 w-6 rounded-full"
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-bold">{supportedToken.symbol}</div>
                                      <div className="text-xs">{supportedToken.symbol}</div>
                                    </div>
                                    <Check
                                      className={cn(
                                        'ml-auto h-4 w-4',
                                        selectedTokenData?.id === supportedToken.id ? 'opacity-100' : 'opacity-0',
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

                {/* Payment Method Selector (Networks & Others) - Always visible but disabled when only one option */}
                <div className="space-y-2">
                  <Popover
                    open={activePopover === PopoverId.RAIL}
                    onOpenChange={(open: boolean) => {
                      // Only allow opening if multiple options available
                      const totalOptions =
                        availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length;
                      if (open && totalOptions <= 1) return;
                      setActivePopover(open ? PopoverId.RAIL : null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={activePopover === PopoverId.RAIL}
                        className="mx-auto h-12 w-full max-w-md justify-between"
                        disabled={
                          !selectedTokenData ||
                          availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length <= 1
                        }
                      >
                        {selectedTokenData?.rail === 'ONCHAIN' && selectedNetworkData ? (
                          <div className="">
                            <span className="text-muted-foreground text-xs">Network: </span>
                            <span className="">{selectedNetworkData.displayName}</span>
                          </div>
                        ) : selectedTokenData?.rail === 'CUSTODIAL' && selectedTokenData?.provider ? (
                          <div className="">
                            <span className="text-muted-foreground text-xs">Method: </span>
                            <span className="">
                              {selectedTokenData.provider === 'BINANCE_PAY'
                                ? 'Binance Pay'
                                : selectedTokenData.provider}
                            </span>
                          </div>
                        ) : (
                          'Select payment method...'
                        )}
                        {availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length >
                          1 && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                      </Button>
                    </PopoverTrigger>
                    {availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length > 1 && (
                      <PopoverContent className="w-96 p-0">
                        <Command>
                          <CommandInput placeholder="Search payment method..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No payment method found.</CommandEmpty>

                            {/* Others Section (Binance Pay, etc.) */}
                            {availableProvidersForSelectedToken.length > 0 && (
                              <CommandGroup heading="Others">
                                {availableProvidersForSelectedToken.map((token) => (
                                  <CommandItem
                                    key={token.id}
                                    value={token.id}
                                    onSelect={(currentValue: string) => {
                                      setSelectedTokenId(currentValue);
                                      setActivePopover(null);
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      {token.provider === 'BINANCE_PAY' ? 'Binance Pay' : token.provider}
                                      <Check
                                        className={cn(
                                          'ml-auto h-4 w-4',
                                          selectedTokenData?.id === token.id ? 'opacity-100' : 'opacity-0',
                                        )}
                                      />
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}

                            {/* Networks Section */}
                            {availableNetworksIdsForSelectedToken.length > 0 && (
                              <CommandGroup heading="Networks">
                                {availableNetworksIdsForSelectedToken.map((networkId) => {
                                  const network = networks?.find((n) => n.id.toString() === networkId);
                                  if (!network) return null;
                                  return (
                                    <CommandItem
                                      key={network.id.toString()}
                                      value={network.id.toString()}
                                      onSelect={(currentValue: string) => {
                                        if (currentValue !== selectedNetworkData?.id.toString()) {
                                          const token = checkoutData?.enabledTokens?.find(
                                            (t) =>
                                              t.canonicalTokenId === selectedTokenData?.canonicalTokenId &&
                                              t.networkId === currentValue,
                                          );
                                          if (token) {
                                            setSelectedTokenId(token.id);
                                          }
                                        }
                                        setActivePopover(null);
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        {network.displayName}
                                        <Check
                                          className={cn(
                                            'ml-auto h-4 w-4',
                                            selectedNetworkData?.id === network.id ? 'opacity-100' : 'opacity-0',
                                          )}
                                        />
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    )}
                  </Popover>
                </div>

                <Button
                  onClick={() => {
                    handleDepositSelectionSubmit();
                  }}
                  disabled={disabled}
                  className={`mx-auto w-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {buttonText}
                </Button>
              </>
            )}

            {checkoutState === CheckoutState.AWAITING_DEPOSIT && checkoutData?.depositDetails?.address && (
              <PaymentDetails walletAddress={checkoutData.depositDetails.address} />
            )}

            {checkoutState === CheckoutState.COMPLETED && <SuccessScreen />}

            {checkoutState === CheckoutState.EXPIRED && <ExpiredScreen />}
          </CardContent>

          <CardFooter className="pt-4">
            <div className="w-full space-y-3"></div>
          </CardFooter>
        </Card>

        <Footer />
      </div>
    </div>
  );
}

const Footer = () => {
  return (
    <div className="mt-6 text-center">
      <p className="text-xs font-normal">Open Source Crypto Payment Gateway</p>
      <p className="text-xs font-light italic">
        Powered by{' '}
        <a href={`${process.env.NEXT_PUBLIC_MAIN_DOMAIN_URL}`} target="_blank" rel="noreferrer">
          <span className="font-semibold underline">Zenobank</span>
        </a>
      </p>
    </div>
  );
};
