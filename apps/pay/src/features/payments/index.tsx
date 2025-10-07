'use client';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter } from '@/src/components/ui/card';
import { ms } from '@/src/lib/ms';
import { match } from 'ts-pattern';
import {
  useCheckoutsControllerCreateCheckoutV1,
  useCheckoutsControllerGetCheckoutV1,
  useNetworksControllerGetNetworksV1,
  useCheckoutsControllerCreateCheckoutAttemptBinancePayV1,
  useCheckoutsControllerCreateCheckoutAttemptOnchainV1,
  useCheckoutsControllerGetEnabledTokensV1,
} from '@repo/api-client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getPaymentCheckoutState } from './utils/payment-checkout-state';
import CheckoutHeader from './components/checkout-header';
import { TokenSelector } from './components/token-selector';
import { CheckoutPrice } from './components/checkout-price';
import PayFooter from './components/pay-footer';
import MethodSelector from './components/method-selector';
import {
  BinancePayTokenResponseDto,
  OnChainTokenResponseDto,
  BinancePayAttemptResponseDto,
  OnchainAttemptResponseDto,
} from '@repo/api-client/model';
import { OnchainPayAttemp } from './components/pay-attemp/onchain-pay-attemp';
import { BinancePayAttemp } from './components/pay-attemp/binance-pay-attemp';
import MissingPaymentMethodsNotice from './components/missing-payment-methods-notice';

export enum PopoverId {
  TOKEN = 'token',
  METHOD = 'method',
}

// this should come from the backend
export enum MethodType {
  ONCHAIN = 'ONCHAIN',
  BINANCE_PAY = 'BINANCE_PAY',
}
type AttemptPayload = {
  id: string;
  data: { tokenId: string; checkoutId: string };
};
type AttemptCreator = (p: AttemptPayload) => Promise<void>;

export type TokenResponseDto = BinancePayTokenResponseDto | OnChainTokenResponseDto;
export default function Payament({ id }: { id: string }) {
  const { mutateAsync: createCheckoutAttemptBinancePay } = useCheckoutsControllerCreateCheckoutAttemptBinancePayV1();
  const { mutateAsync: createCheckoutAttemptOnchain } = useCheckoutsControllerCreateCheckoutAttemptOnchainV1();

  const { data: { data: checkoutData } = {}, refetch: refetchPaymentData } = useCheckoutsControllerGetCheckoutV1(id, {
    query: {
      refetchInterval: ms('3s'),
    },
  });
  const { data: { data: canonicalTokens } = {} } = useCheckoutsControllerGetEnabledTokensV1(id);
  const binancePayTokens = canonicalTokens?.BINANCE_PAY || [];
  const onchainTokens = canonicalTokens?.ONCHAIN || [];
  const enabledTokens = [...binancePayTokens, ...onchainTokens];
  const { data: { data: networks } = {} } = useNetworksControllerGetNetworksV1();

  const [isLoading, setIsLoading] = useState(false);
  const [activePopover, setActivePopover] = useState<PopoverId | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [onchainAttempt, setOnchainAttempt] = useState<OnchainAttemptResponseDto | null>(null);
  const [binancePayAttempt, setBinancePayAttempt] = useState<BinancePayAttemptResponseDto | null>(null);
  const selectedTokenData: TokenResponseDto | null = useMemo(() => {
    return enabledTokens?.find((t) => t.id === selectedTokenId) || null;
  }, [enabledTokens, selectedTokenId]);

  const isBinancePayAvailableForSelectedCanonicalToken = useMemo(() => {
    return !!binancePayTokens?.find((t) => t.canonicalTokenId === selectedTokenData?.canonicalTokenId);
  }, [binancePayTokens, selectedTokenData]);

  const selectedMethod: MethodType | null = useMemo(() => {
    const isBinancePayToken = binancePayTokens?.find((t) => t.id === selectedTokenData?.id);
    const isOnChainToken = onchainTokens?.find((t) => t.id === selectedTokenData?.id);
    return isBinancePayToken ? MethodType.BINANCE_PAY : isOnChainToken ? MethodType.ONCHAIN : null;
  }, [selectedTokenData]);

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

  const handleDepositSelectionSubmit = async () => {
    if (disabled || !checkoutData?.id) return;

    if (!selectedTokenId) return;
    setIsLoading(true);
    try {
      if (selectedMethod === MethodType.BINANCE_PAY) {
        const { data } = await createCheckoutAttemptBinancePay({
          id: checkoutData.id,
          data: {
            tokenId: selectedTokenId,
            checkoutId: checkoutData.id,
          },
        });
        setBinancePayAttempt(data);
      } else if (selectedMethod === MethodType.ONCHAIN) {
        const { data } = await createCheckoutAttemptOnchain({
          id: checkoutData.id,
          data: {
            tokenId: selectedTokenId,
            checkoutId: checkoutData.id,
          },
        });
        setOnchainAttempt(data);
      }
    } catch (error) {
      console.log('error', error);
      toast.error('Failed to create payment attempt');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  if (!checkoutData) return null;

  const handleBack = () => {
    setOnchainAttempt(null);
    setBinancePayAttempt(null);
  };

  // Show Onchain attempt component with its own complete card
  if (onchainAttempt) {
    return (
      <OnchainPayAttemp
        attempt={onchainAttempt}
        expiresAt={checkoutData.expiresAt}
        onBack={handleBack}
        networks={networksAvailableForSelectedToken || []}
      />
    );
  }

  // Show Binance Pay attempt component with its own complete card
  if (binancePayAttempt) {
    return <BinancePayAttemp attempt={binancePayAttempt} expiresAt={checkoutData.expiresAt} onBack={handleBack} />;
  }

  // Show token/method selection screen
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card className="">
          <CheckoutHeader expiresAt={checkoutData?.expiresAt} />
          <CardContent className="space-y-3">
            <CheckoutPrice amount={checkoutData.priceAmount} currency={checkoutData.priceCurrency} />

            {enabledTokens.length === 0 ? (
              <MissingPaymentMethodsNotice />
            ) : (
              <>
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
                    handleDepositSelectionSubmit();
                  }}
                  disabled={!!disabled}
                  className={`mx-auto w-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {buttonText}
                </Button>
              </>
            )}
          </CardContent>

          <CardFooter className="w-full space-y-3 pt-4"></CardFooter>
        </Card>

        <PayFooter />
      </div>
    </div>
  );
}
