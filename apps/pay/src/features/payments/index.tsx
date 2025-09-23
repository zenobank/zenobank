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
  useAssetControllerGetSupportedTokensV1,
  useNetworksControllerGetNetworksV1,
  usePaymentControllerGetPaymentV1,
  usePaymentControllerUpdatePaymentDepositSelectionV1,
} from '@/src/lib/requests/api-client/aPIDocs';
import { NetworkId, TokenResponseDto } from '@/src/lib/requests/api-client/model';
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
  NETWORK = 'network',
}

export default function Payament({ id }: PaymentsProps) {
  const { mutateAsync: updatePaymentDepositSelection } = usePaymentControllerUpdatePaymentDepositSelectionV1();
  const { data: { data: paymentData } = {}, refetch: refetchPaymentData } = usePaymentControllerGetPaymentV1(id, {
    query: {
      refetchInterval: ms('3s'),
    },
  });
  const { data: { data: supportedTokens } = {} } = useAssetControllerGetSupportedTokensV1();

  const { data: { data: networks } = {} } = useNetworksControllerGetNetworksV1();
  const [isLoading, setIsLoading] = useState(false);
  const [activePopover, setActivePopover] = useState<PopoverId | null>(null);

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const selectedTokenData: TokenResponseDto | null = useMemo(() => {
    return supportedTokens?.find((t) => t.id === selectedTokenId) || null;
  }, [supportedTokens, selectedTokenId]);

  const selectedNetworkId = useMemo(() => {
    return selectedTokenData?.networkId || null;
  }, [selectedTokenData]);

  useEffect(() => {
    if (paymentData?.depositDetails) {
      setSelectedTokenId(paymentData?.depositDetails?.currencyId || null);
    }
  }, [paymentData?.depositDetails]);

  const checkoutState = useMemo(() => {
    if (!paymentData) return CheckoutState.AWAITING_DEPOSIT;
    return getPaymentCheckoutState(paymentData);
  }, [paymentData]);

  const availableNetworksIdsForSelectedToken: NetworkId[] = useMemo(() => {
    const tokens = supportedTokens?.filter((t) => t.canonicalTokenId === selectedTokenData?.canonicalTokenId);

    return tokens?.map((t) => t.networkId) || [];
  }, [supportedTokens, selectedTokenData?.canonicalTokenId]);

  console.log('!!availableNetworksIdsForSelectedToken', availableNetworksIdsForSelectedToken);
  console.log('selectedTokenData?.id', selectedTokenData?.id);

  // Calculate token amount and USD conversion

  const selectedNetworkData = useMemo(() => {
    if (!selectedNetworkId) return null;
    return networks?.find((n) => n.id.toString() === selectedNetworkId);
  }, [selectedNetworkId, networks]);

  // Auto-select network if only one is available
  useEffect(() => {
    if (selectedTokenId && availableNetworksIdsForSelectedToken.length === 1) {
      const token = supportedTokens?.find(
        (t) =>
          t.canonicalTokenId === selectedTokenData?.canonicalTokenId &&
          t.networkId === availableNetworksIdsForSelectedToken[0],
      );
      setSelectedTokenId(token?.id || null);
    }
  }, [selectedTokenId, availableNetworksIdsForSelectedToken, supportedTokens, selectedTokenData]);

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

    if (!selectedTokenId || !selectedNetworkId) return;
    setIsLoading(true);
    try {
      await updatePaymentDepositSelection({
        id: paymentData.id,
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

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card className="">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CardTitle className="text-lg">Send Payment</CardTitle>
              </div>
              {paymentData?.expiredAt && checkoutState === CheckoutState.AWAITING_DEPOSIT && (
                <Badge variant="secondary" data-testid="countdown">
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
                        <span data-testid="currency-amount" className="select-all">
                          {paymentData?.depositDetails?.amount}
                        </span>{' '}
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
                        <CommandInput placeholder="Search cryptocurrency..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No cryptocurrency found.</CommandEmpty>
                          <CommandGroup>
                            {supportedTokens
                              ?.filter(
                                (t, i, arr) => i === arr.findIndex((u) => u.canonicalTokenId === t.canonicalTokenId),
                              )
                              ?.map((supportedToken) => (
                                <CommandItem
                                  key={supportedToken.id}
                                  value={supportedToken.id}
                                  onSelect={(currentValue: string) => {
                                    const token = supportedTokens?.find((t) => t.id === currentValue);
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
                                        const token = supportedTokens?.find(
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
        <a href="https://zenobank.io" target="_blank" rel="noreferrer">
          <span className="underline">Zenobank</span>
        </a>
      </p>
    </div>
  );
};
