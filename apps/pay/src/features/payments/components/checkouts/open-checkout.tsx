import { CardContent, CardFooter } from '@/src/components/ui/card';
import CheckoutHeader from '../checkout-header';
import { CheckoutPrice } from '../checkout-price';
import MethodSelector from '../method-selector';
import MissingPaymentMethodsNotice from '../missing-payment-methods-notice';
import { TokenSelector } from '../token-selector';
import {
  BinancePayTokenResponseDto,
  CheckoutResponseDto,
  NetworkResponseDto,
  OnChainTokenResponseDto,
} from '@/lib/generated/api-client/model';
import { Button } from '@/src/components/ui/button';
import { MethodType, PopoverId, TokenResponseDto } from '../..';
export default function OpenCheckout({
  checkoutData,
  enabledTokens,
  activePopover,
  setActivePopover,
  selectedTokenData,
  binancePayTokens,
  onchainTokens,
  setSelectedTokenId,
  selectedMethod,
  networksAvailableForSelectedToken,
  isBinancePayAvailableForSelectedCanonicalToken,
  buttonText,
  disabled,
  handleDepositSelectionSubmit,
}: {
  checkoutData: CheckoutResponseDto;
  enabledTokens: TokenResponseDto[];
  activePopover: PopoverId | null;
  setActivePopover: (open: PopoverId | null) => void;
  selectedTokenData: TokenResponseDto | null;
  binancePayTokens: BinancePayTokenResponseDto[];
  onchainTokens: OnChainTokenResponseDto[];
  setSelectedTokenId: (tokenId: string | null) => void;
  selectedMethod: MethodType | null;
  networksAvailableForSelectedToken: NetworkResponseDto[];
  isBinancePayAvailableForSelectedCanonicalToken: boolean;
  buttonText: string | null | undefined;
  disabled: boolean;
  handleDepositSelectionSubmit: () => void;
}) {
  return (
    <>
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
    </>
  );
}
