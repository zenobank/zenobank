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
import CheckoutHeader from './components/checkout-header';
import { TokenSelector } from './components/token-selector';
import { CheckoutPrice } from './components/checkout-price';
import PayFooter from './components/pay-footer';
import MethodSelector from './components/method-selector';

export enum PopoverId {
  TOKEN = 'token',
  METHOD = 'method',
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

  const availableMethods: {
    [key: string]: string[];
  } = {
    ['ONCHAIN']: availableNetworksIdsForSelectedToken,
    ['CUSTODIAL']: availableProvidersForSelectedToken.map((t) => t.provider).filter((p) => p !== null),
  };

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
          <CheckoutHeader expiresAt={checkoutData?.expiresAt} checkoutState={checkoutState} />
          <CardContent className="space-y-3">
            <CheckoutPrice amount={checkoutData.priceAmount} currency={checkoutData.priceCurrency} />
            <TokenSelector
              activePopover={activePopover}
              setActivePopover={setActivePopover}
              selectedTokenData={selectedTokenData}
              checkoutData={checkoutData}
              setSelectedTokenId={setSelectedTokenId}
            />
            <MethodSelector
              activePopover={activePopover}
              availableMethods={availableMethods}
              setActivePopover={setActivePopover}
              selectedTokenData={selectedTokenData}
              selectedNetworkData={selectedNetworkData}
              setSelectedTokenId={setSelectedTokenId}
              networks={networks || []}
            />

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

        <PayFooter />
      </div>
    </div>
  );
}
