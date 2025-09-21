'use client';
import { useState, useEffect, useMemo } from 'react';
import { ChevronsUpDown, Check, TimerIcon } from 'lucide-react';
import Countdown from 'react-countdown';
import { toast } from 'sonner';
import {
  useAssetControllerGetSupportedTokensV1,
  useNetworksControllerGetNetworksV1,
  usePaymentControllerGetPaymentV1,
  usePaymentControllerUpdatePaymentDepositSelectionV1,
} from '@/src/lib/requests/api-client/aPIDocs';
import {
  NetworkId,
  PaymentResponseDto,
  PaymentStatus,
  TokenResponseDto,
  NetworkResponseDto,
} from '@/src/lib/requests/api-client/model';
import { cn } from '@/src/lib/utils';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/components/ui/card';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/src/components/ui/command';
import { CopyButton } from '@/src/components/ui/copy-button';
import { PopoverContent, PopoverTrigger, Popover } from '@/src/components/ui/popover';
import { Separator } from '@/src/components/ui/separator';
import { CheckoutSelection } from '@/src/features/payments/types/selection';
import { CheckoutState } from '@/src/features/payments/types/state';
import PaymentDetails from './components/DetailsScreen';
import ExpiredScreen from './components/ExpiredScreen';
import SuccessScreen from './components/SuccessScreen';
import { getPaymentCheckoutState } from './utils/payment-checkout-state';
import { getCanonicalTokenOptions } from './utils/cannonical-token-options';
import { ms } from '@/src/lib/ms';

interface PaymentsProps {
  id: string;
}

enum PopoverId {
  TOKEN = 'token',
  NETWORK = 'network',
}

export default function Payament({ id }: PaymentsProps) {
  const { mutateAsync: updatePaymentDepositSelection } = usePaymentControllerUpdatePaymentDepositSelectionV1();
  const {
    data: { data: paymentData } = {},
    refetch: refetchPaymentData,
    isLoading: isLoadingPaymentData,
  } = usePaymentControllerGetPaymentV1(id, {
    query: {
      refetchInterval: ms('3s'),
    },
  });
  const { data: { data: supportedTokens } = {} } = useAssetControllerGetSupportedTokensV1();
  const { data: { data: networks } = {} } = useNetworksControllerGetNetworksV1();
  const [isLoading, setIsLoading] = useState(false);
  const [activePopover, setActivePopover] = useState<PopoverId | null>(null);

  const [paymentSelection, setPaymentSelection] = useState<CheckoutSelection>({
    selectedTokenId: paymentData?.depositDetails?.currencyId || null,
    selectedNetworkId: paymentData?.depositDetails?.networkId || null,
  });

  const checkoutState = useMemo(() => {
    if (!paymentData) return CheckoutState.AWAITING_DEPOSIT;
    return getPaymentCheckoutState(paymentData);
  }, [paymentData, isLoadingPaymentData]);

  const cannonicalTokenOptions = useMemo(() => getCanonicalTokenOptions(supportedTokens), [supportedTokens]);
  const availableNetworksIdsForSelectedToken: NetworkId[] = useMemo(() => {
    const networksIds =
      cannonicalTokenOptions.find((cannonicalToken) => cannonicalToken.id === paymentSelection.selectedTokenId)
        ?.networks || [];

    return networksIds;
  }, [cannonicalTokenOptions, paymentSelection.selectedTokenId]);

  const selectedTokenData: TokenResponseDto | null = useMemo(() => {
    return supportedTokens?.find((t) => t.id === paymentSelection.selectedTokenId) || null;
  }, [supportedTokens, paymentSelection.selectedTokenId]);

  // Calculate token amount and USD conversion

  const selectedNetworkData = useMemo(() => {
    if (!paymentSelection.selectedNetworkId) return null;
    return networks?.find((n) => n.id.toString() === paymentSelection.selectedNetworkId);
  }, [paymentSelection.selectedNetworkId, networks]);

  // Auto-select network if only one is available
  useEffect(() => {
    if (paymentSelection.selectedTokenId && availableNetworksIdsForSelectedToken.length === 1) {
      setPaymentSelection((prev) => ({
        ...prev,
        selectedNetworkId: availableNetworksIdsForSelectedToken[0] as NetworkId,
      }));
    }
  }, [paymentSelection.selectedTokenId, cannonicalTokenOptions]);

  // Auto-open network selector when token is selected (only if multiple networks available)
  useEffect(() => {
    if (
      paymentSelection.selectedTokenId &&
      !paymentSelection.selectedNetworkId &&
      availableNetworksIdsForSelectedToken.length > 1
    ) {
      setActivePopover(PopoverId.NETWORK);
    }
  }, [paymentSelection.selectedTokenId, paymentSelection.selectedNetworkId, availableNetworksIdsForSelectedToken]);

  const [disabled, buttonText] = useMemo(() => {
    if (isLoading) {
      return [true, 'Loading...'];
    }
    if (!selectedTokenData) {
      return [true, 'Select cryptocurrency'];
    }
    if (!selectedNetworkData) {
      return [true, 'Select network'];
    }
    return [false, 'Next'];
  }, [selectedTokenData, selectedNetworkData, isLoading]);

  const handleDepositSelectionSubmit = async () => {
    if (disabled || !paymentData?.id) return;
    const { selectedTokenId: selectedToken, selectedNetworkId: selectedNetwork } = paymentSelection;

    if (!selectedToken || !selectedNetwork) return;
    setIsLoading(true);
    try {
      await updatePaymentDepositSelection({
        id: paymentData.id,
        data: {
          tokenId: selectedToken,
          networkId: selectedNetwork,
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

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card className="">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CardTitle className="text-lg">Send Payment</CardTitle>
              </div>
              {paymentData?.expiredAt && (
                <Badge variant="secondary">
                  <TimerIcon />
                  <Countdown
                    date={new Date(paymentData.expiredAt)}
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
                {checkoutState === CheckoutState.AWAITING_DEPOSIT && selectedTokenData && selectedNetworkData ? (
                  // Show token amount with copy button when both token and network are selected
                  <>
                    <div className="flex items-center justify-center gap-3 text-3xl font-bold">
                      <span className="relative flex items-center gap-2">
                        <span className="select-all">{paymentData?.depositDetails?.amount}</span>{' '}
                        {selectedTokenData.symbol}
                        <CopyButton text={`${paymentData?.depositDetails?.amount} ${selectedTokenData.symbol}`} />
                      </span>
                    </div>
                    <div className="mt-1 text-sm">
                      <Badge variant="secondary">Network: {selectedNetworkData.displayName}</Badge>
                    </div>
                  </>
                ) : (
                  // Show currency amount when no token/network selected yet
                  <div className="flex items-center justify-center gap-3 text-3xl font-bold">
                    {paymentData?.priceCurrency} {paymentData?.priceAmount}
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
                            <img
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
                        <CommandInput placeholder="Search cryptocurrency..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No cryptocurrency found.</CommandEmpty>
                          <CommandGroup>
                            {cannonicalTokenOptions?.map((cannonicalToken) => (
                              <CommandItem
                                key={cannonicalToken.id}
                                value={cannonicalToken.id}
                                onSelect={(currentValue: string) => {
                                  if (currentValue !== selectedTokenData?.id) {
                                    setPaymentSelection({
                                      ...paymentSelection,
                                      selectedTokenId: currentValue,
                                      selectedNetworkId: null,
                                    });
                                  }
                                  setActivePopover(null);
                                }}
                              >
                                <div className="flex w-full items-center gap-3">
                                  <img
                                    src={cannonicalToken.imageUrl}
                                    alt={cannonicalToken.symbol}
                                    className="h-6 w-6 rounded-full"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-bold">{cannonicalToken.symbol}</div>
                                    <div className="text-xs">{cannonicalToken.symbol}</div>
                                  </div>
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      selectedTokenData?.id === cannonicalToken.id ? 'opacity-100' : 'opacity-0',
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
                <div className="space-y-2">
                  <Popover
                    open={activePopover === PopoverId.NETWORK}
                    onOpenChange={(open: boolean) => {
                      // Only allow opening if multiple networks available
                      if (open && availableNetworksIdsForSelectedToken.length <= 1) return;
                      setActivePopover(open ? PopoverId.NETWORK : null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={activePopover === PopoverId.NETWORK}
                        className="mx-auto h-12 w-full max-w-md justify-between"
                        disabled={!selectedTokenData || availableNetworksIdsForSelectedToken.length <= 1}
                      >
                        {selectedNetworkData ? (
                          <div className="">
                            <span className="text-muted-foreground text-xs">Network: </span>
                            <span className="">{selectedNetworkData.displayName}</span>
                          </div>
                        ) : (
                          'Select network...'
                        )}
                        {availableNetworksIdsForSelectedToken.length > 1 && (
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    {availableNetworksIdsForSelectedToken.length > 1 && (
                      <PopoverContent className="w-96 p-0">
                        <Command>
                          <CommandInput placeholder="Search network..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No network found.</CommandEmpty>
                            <CommandGroup>
                              {availableNetworksIdsForSelectedToken.map((networkId) => {
                                const network = networks?.find((n) => n.id.toString() === networkId);
                                if (!network) return null;
                                return (
                                  <CommandItem
                                    key={network.id.toString()}
                                    value={network.id.toString()}
                                    onSelect={(currentValue: string) => {
                                      if (currentValue !== selectedNetworkData?.id.toString()) {
                                        setPaymentSelection({
                                          ...paymentSelection,
                                          selectedNetworkId: currentValue as NetworkId,
                                        });
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

            {checkoutState === CheckoutState.AWAITING_DEPOSIT && paymentData?.depositDetails?.address && (
              <PaymentDetails walletAddress={paymentData?.depositDetails?.address} />
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
      <p className="text-xs">
        Powered by{' '}
        <a href="https://zenobank.io" target="_blank">
          <span className="underline">Zenobank</span>
        </a>
      </p>
    </div>
  );
};
