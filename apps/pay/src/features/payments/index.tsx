'use client';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter } from '@/src/components/ui/card';
import { CheckoutState } from '@/src/features/payments/types/state';
import { ms } from '@/src/lib/ms';
import { match } from 'ts-pattern';
import {
  useCheckoutsControllerCreateCheckoutAttemptV1,
  useCheckoutsControllerGetCheckoutV1,
  useNetworksControllerGetNetworksV1,
  useTokensControllerGetBinancePayTokensV1,
  useTokensControllerGetOnChainTokensV1,
} from '@repo/api-client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getPaymentCheckoutState } from './utils/payment-checkout-state';
import CheckoutHeader from './components/checkout-header';
import { TokenSelector } from './components/token-selector';
import { CheckoutPrice } from './components/checkout-price';
import PayFooter from './components/pay-footer';
import MethodSelector from './components/method-selector';
import { BinancePayTokenResponseDto, OnChainTokenResponseDto } from '@repo/api-client/model';

export enum PopoverId {
  TOKEN = 'token',
  METHOD = 'method',
}

// this should come from the backend
export enum MethodType {
  CRYPTO_ONCHAIN = 'CRYPTO_ONCHAIN',
  BINANCE_PAY = 'BINANCE_PAY',
}
export type TokenResponseDto = BinancePayTokenResponseDto | OnChainTokenResponseDto;
export default function Payament({ id }: { id: string }) {
  const { mutateAsync: createPaymentAttemp } = useCheckoutsControllerCreateCheckoutAttemptV1();
  const { data: { data: checkoutData } = {}, refetch: refetchPaymentData } = useCheckoutsControllerGetCheckoutV1(id, {
    query: {
      refetchInterval: ms('3s'),
    },
  });
  const { data: { data: binancePayTokens } = {} } = useTokensControllerGetBinancePayTokensV1();
  const { data: { data: onchainTokens } = {} } = useTokensControllerGetOnChainTokensV1();
  const { data: { data: networks } = {} } = useNetworksControllerGetNetworksV1();

  const enabledTokens: TokenResponseDto[] = useMemo(() => {
    return [...(binancePayTokens || []), ...(onchainTokens || [])];
  }, [binancePayTokens, onchainTokens]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePopover, setActivePopover] = useState<PopoverId | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const selectedTokenData: TokenResponseDto | null = useMemo(() => {
    return enabledTokens?.find((t) => t.id === selectedTokenId) || null;
  }, [enabledTokens, selectedTokenId]);

  const isBinancePayAvailableForSelectedCanonicalToken = useMemo(() => {
    return !!binancePayTokens?.find((t) => t.canonicalTokenId === selectedTokenData?.canonicalTokenId);
  }, [binancePayTokens, selectedTokenData]);

  const selectedMethod: MethodType | null = useMemo(() => {
    const isBinancePayToken = binancePayTokens?.find((t) => t.id === selectedTokenData?.id);
    const isOnChainToken = onchainTokens?.find((t) => t.id === selectedTokenData?.id);
    return isBinancePayToken ? MethodType.BINANCE_PAY : isOnChainToken ? MethodType.CRYPTO_ONCHAIN : null;
  }, [selectedTokenData]);

  const checkoutState = useMemo(() => {
    if (!checkoutData) return CheckoutState.AWAITING_DEPOSIT;
    return getPaymentCheckoutState(checkoutData);
  }, [checkoutData]);

  const networksAvailableForSelectedToken = useMemo(() => {
    return networks?.filter((network) =>
      onchainTokens?.find(
        (t) => t.networkId === network.id && t.canonicalTokenId === selectedTokenData?.canonicalTokenId,
      ),
    );
  }, [networks, selectedTokenData]);
  // Calculate token amount and USD conversion

  const [disabled, buttonText] = useMemo(() => {
    return match({
      isLoading,
      selectedTokenData,
    })
      .with({ isLoading: true }, () => [true, 'Loading...'])
      .with({ selectedTokenData: null }, () => [true, 'Select token'])
      .otherwise(() => [false, 'Next']);
  }, [selectedTokenData, isLoading]);

  // const handleDepositSelectionSubmit = async () => {
  //   if (disabled || !checkoutData?.id) return;

  //   if (!selectedTokenId) return;
  //   setIsLoading(true);
  //   try {
  //     await createPaymentAttemp({
  //       id: checkoutData.id,
  //       data: {
  //         tokenId: selectedTokenId,
  //       },
  //     });
  //     await refetchPaymentData();
  //   } catch (error) {
  //     console.log('error', error);
  //     toast.error('Failed to update payment deposit selection');
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
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
              binancePayTokens={binancePayTokens || []}
              onchainTokens={onchainTokens || []}
              setSelectedTokenId={setSelectedTokenId}
            />
            <MethodSelector
              activePopover={activePopover}
              selectedMethod={selectedMethod}
              onChainTokens={onchainTokens || []}
              binancePayTokens={binancePayTokens || []}
              setActivePopover={setActivePopover}
              selectedTokenData={selectedTokenData}
              setSelectedTokenId={setSelectedTokenId}
              networks={networksAvailableForSelectedToken || []}
              isBinancePayAvailableForSelectedCanonicalToken={isBinancePayAvailableForSelectedCanonicalToken}
            />

            <Button
              onClick={() => {
                // handleDepositSelectionSubmit();
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
