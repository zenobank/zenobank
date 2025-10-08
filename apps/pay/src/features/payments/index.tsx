'use client';
import { Card } from '@/src/components/ui/card';
import { ms } from '@/src/lib/ms';
import { match } from 'ts-pattern';
import {
  useCheckoutsControllerGetCheckoutV1,
  useNetworksControllerGetNetworksV1,
  useCheckoutsControllerCreateCheckoutAttemptBinancePayV1,
  useCheckoutsControllerCreateCheckoutAttemptOnchainV1,
  useCheckoutsControllerGetEnabledTokensV1,
} from '@repo/api-client';
import { CheckoutResponseDtoStatus } from '@repo/api-client/model';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PayFooter from './components/pay-footer';
import {
  BinancePayTokenResponseDto,
  OnChainTokenResponseDto,
  BinancePayAttemptResponseDto,
  OnchainAttemptResponseDto,
} from '@repo/api-client/model';
import { OnchainPayAttemp } from './components/pay-attemp/onchain-pay-attemp';
import { BinancePayAttemp } from './components/pay-attemp/binance-pay-attemp';
import OpenCheckout from './components/checkouts/open-checkout';
import ExpiredCheckout from './components/checkouts/expired-checkout';
import CompletedCheckout from './components/checkouts/completed-checkout';
import CancelledCheckout from './components/checkouts/cancelled-checkout';

export enum PopoverId {
  TOKEN = 'token',
  METHOD = 'method',
}

// this should come from the backend
export enum MethodType {
  ONCHAIN = 'ONCHAIN',
  BINANCE_PAY = 'BINANCE_PAY',
}

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

  if (checkoutData.status === CheckoutResponseDtoStatus.EXPIRED) {
    return <ExpiredCheckout />;
  }
  if (checkoutData.status === CheckoutResponseDtoStatus.COMPLETED) {
    return <CompletedCheckout />;
  }
  if (checkoutData.status === CheckoutResponseDtoStatus.CANCELLED) {
    return <CancelledCheckout />;
  }
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
          <OpenCheckout
            checkoutData={checkoutData}
            enabledTokens={enabledTokens}
            activePopover={activePopover}
            setActivePopover={setActivePopover}
            selectedTokenData={selectedTokenData}
            binancePayTokens={binancePayTokens}
            onchainTokens={onchainTokens}
            setSelectedTokenId={setSelectedTokenId}
            selectedMethod={selectedMethod}
            networksAvailableForSelectedToken={networksAvailableForSelectedToken || []}
            isBinancePayAvailableForSelectedCanonicalToken={isBinancePayAvailableForSelectedCanonicalToken}
            buttonText={buttonText?.toString()}
            disabled={!!disabled}
            handleDepositSelectionSubmit={handleDepositSelectionSubmit}
          />
        </Card>
        <PayFooter />
      </div>
    </div>
  );
}
