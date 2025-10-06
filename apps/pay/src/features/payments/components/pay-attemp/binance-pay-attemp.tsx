import { BinancePayAttemptResponseDto } from '@repo/api-client/model';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { CopyButton } from '@/src/components/ui/copy-button';
import { CheckoutState } from '../../types/state';
import BadgerTimerCountdown from '../badger-timer-countdown';
import PayFooter from '../pay-footer';
import { ArrowLeft } from 'lucide-react';

interface BinancePayAttempProps {
  attempt: BinancePayAttemptResponseDto;
  expiresAt?: string | null;
  checkoutState: CheckoutState;
  onBack: () => void;
}

export function BinancePayAttemp({ attempt, expiresAt, checkoutState, onBack }: BinancePayAttempProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-lg">Pay with Binance</CardTitle>
              </div>
              {expiresAt && checkoutState === CheckoutState.AWAITING_DEPOSIT && (
                <BadgerTimerCountdown expiresAt={expiresAt} />
              )}
            </div>
          </CardHeader>
          <p>Estimated confirmation time: ~1m</p>
          <CardContent className="space-y-4">
            {/* Amount to pay */}
            <div className="bg-muted/50 mx-auto flex w-full flex-col items-center justify-center rounded-lg border p-4">
              <span className="text-muted-foreground text-sm">Amount to pay</span>
              <div className="text-2xl font-bold">
                {attempt.tokenPayAmount} {attempt.binanceTokenId}
              </div>
            </div>

            {/* Binance Account ID */}
            <div className="mx-auto flex w-full flex-col items-center justify-center space-y-2">
              <span className="text-muted-foreground text-sm">Send to Binance Account ID</span>
              <div className="bg-background flex w-full items-center justify-center gap-2 rounded-lg border p-3">
                <span className="flex-1 truncate text-center font-mono text-sm font-medium">
                  {attempt.depositAccountId}
                </span>
                <CopyButton text={attempt.depositAccountId} />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-muted/30 space-y-2 rounded-lg border p-4">
              <h3 className="font-semibold">How to pay with Binance Pay</h3>
              <ol className="text-muted-foreground space-y-1 text-sm">
                <li>1. Open your Binance app</li>
                <li>2. Go to Binance Pay</li>
                <li>3. Send the exact amount to the Account ID above</li>
                <li>4. Your payment will be confirmed automatically</li>
              </ol>
            </div>
          </CardContent>

          <CardFooter className="w-full space-y-3 pt-4"></CardFooter>
        </Card>

        <PayFooter />
      </div>
    </div>
  );
}
