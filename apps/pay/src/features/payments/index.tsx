'use client';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter } from '@/src/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { CheckoutState } from '@/src/features/payments/types/state';
import { ms } from '@/src/lib/ms';
import { match } from 'ts-pattern';
import {
  useCheckoutsControllerCreateCheckoutAttemptV1,
  useCheckoutsControllerGetCheckoutV1,
  useNetworksControllerGetNetworksV1,
} from '@repo/api-client';
import { TokenResponseDto } from '@repo/api-client/model';
import { cn } from '@/src/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import PaymentDetails from './components/details-screen';
import ExpiredScreen from './components/expired-screen';
import SuccessScreen from './components/success-screen';
import { getPaymentCheckoutState } from './utils/payment-checkout-state';
import PayHeader from './components/pay-header';
import { TokenSelector } from './components/token-selector';

export enum PopoverId {
  TOKEN = 'token',
  RAIL = 'rail',
}

export default function Payament({ id }: { id: string }) {
  const { mutateAsync: createPaymentAttemp } = useCheckoutsControllerCreateCheckoutAttemptV1();
  const { data: { data: checkoutData } = {}, refetch: refetchPaymentData } = useCheckoutsControllerGetCheckoutV1(id, {
    query: {
      refetchInterval: ms('3s'),
    },
  });
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
  const availableNetworksIdsForSelectedToken: string[] = useMemo(() => {
    const tokens = checkoutData?.enabledTokens?.filter(
      (t) => t.canonicalTokenId === selectedTokenData?.canonicalTokenId && t.rail === 'ONCHAIN',
    );

    return tokens?.map((t) => t.networkId).filter((id): id is string => id !== null) || [];
  }, [checkoutData?.enabledTokens, selectedTokenData?.canonicalTokenId]);

  const availableProvidersForSelectedToken: TokenResponseDto[] = useMemo(() => {
    const tokens = checkoutData?.enabledTokens?.filter(
      (t) => t.canonicalTokenId === selectedTokenData?.canonicalTokenId && t.rail === 'CUSTODIAL',
    );

    return tokens || [];
  }, [checkoutData?.enabledTokens, selectedTokenData?.canonicalTokenId]);

  const availableMethodsForSelectedToken = {
    ['ONCHAIN']: availableNetworksIdsForSelectedToken,
    ['CUSTODIAL']: availableProvidersForSelectedToken,
  };
  console.log('availableMethodsForSelectedToken', availableMethodsForSelectedToken);

  const checkoutState = useMemo(() => {
    if (!checkoutData) return CheckoutState.AWAITING_DEPOSIT;
    return getPaymentCheckoutState(checkoutData);
  }, [checkoutData]);

  // Calculate token amount and USD conversion

  const selectedNetworkData = useMemo(() => {
    if (!selectedNetworkId) return null;
    return networks?.find((n) => n.id.toString() === selectedNetworkId);
  }, [selectedNetworkId, networks]);

  const [disabled, buttonText] = useMemo(() => {
    return match({
      isLoading,
      selectedTokenData,
      selectedNetworkData,
    })
      .with({ isLoading: true }, () => [true, 'Loading...'])
      .with({ selectedTokenData: null }, () => [true, 'Select cryptocurrency'])
      .with({ selectedTokenData: { rail: 'ONCHAIN' }, selectedNetworkData: null }, () => [true, 'Select method'])
      .with({ selectedTokenData: { rail: 'CUSTODIAL', provider: null } }, () => [true, 'Select method'])
      .otherwise(() => [false, 'Next']);
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
  if (!checkoutData) return null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card className="">
          <PayHeader expiresAt={checkoutData?.expiresAt} checkoutState={checkoutState} />
          <CardContent className="space-y-3">
            <div className="flex items-center justify-center gap-3 py-4 text-center text-3xl font-bold">
              {checkoutData.priceAmount} {checkoutData.priceCurrency}
            </div>

            {/* Token Selector */}
            <TokenSelector
              activePopover={activePopover}
              setActivePopover={setActivePopover}
              selectedTokenData={selectedTokenData}
              checkoutData={checkoutData}
              setSelectedTokenId={setSelectedTokenId}
            />
            {/* ------- */}
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
                          {selectedTokenData.provider === 'BINANCE_PAY' ? 'Binance Pay' : selectedTokenData.provider}
                        </span>
                      </div>
                    ) : (
                      'Select payment method...'
                    )}
                    {availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length > 1 && (
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
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
              disabled={!!disabled}
              className={`mx-auto w-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {buttonText}
            </Button>

            {/* {match(checkoutState)
              .with(CheckoutState.AWAITING_DEPOSIT, () => (
                <PaymentDetails walletAddress={checkoutData?.depositDetails?.address || ''} />
              ))
              .with(CheckoutState.COMPLETED, () => <SuccessScreen />)
              .with(CheckoutState.EXPIRED, () => <ExpiredScreen />)
              .otherwise(() => null)} */}
          </CardContent>

          <CardFooter className="w-full space-y-3 pt-4"></CardFooter>
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
