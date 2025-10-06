import { OnchainAttemptResponseDto } from '@repo/api-client/model';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { CheckoutState } from '../../types/state';
import BadgerTimerCountdown from '../badger-timer-countdown';
import PayFooter from '../pay-footer';
import { QRCodeCanvas } from 'qrcode.react';
import { CopyButton } from '@/src/components/ui/copy-button';
import { ArrowLeft } from 'lucide-react';

interface OnchainPayAttempProps {
  attempt: OnchainAttemptResponseDto;
  expiresAt?: string | null;
  checkoutState: CheckoutState;
  onBack: () => void;
}

export function OnchainPayAttemp({ attempt, expiresAt, checkoutState, onBack }: OnchainPayAttempProps) {
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
                <CardTitle className="text-lg">Complete Payment</CardTitle>
              </div>
              {expiresAt && checkoutState === CheckoutState.AWAITING_DEPOSIT && (
                <BadgerTimerCountdown expiresAt={expiresAt} />
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Amount to pay */}
            <div className="bg-muted/50 mx-auto flex w-full flex-col items-center justify-center rounded-lg border p-4">
              <span className="text-muted-foreground text-sm">Amount to pay</span>
              <div className="text-2xl font-bold">
                {attempt.tokenPayAmount} {attempt.tokenId}
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mx-auto flex w-full flex-col items-center justify-center space-y-2">
              <span className="text-muted-foreground text-sm">Send exact amount to</span>
              <div className="bg-background flex w-full items-center justify-center gap-2 rounded-lg border p-3">
                <span className="flex-1 truncate text-center font-mono text-sm font-medium">
                  {attempt.depositWallet.address}
                </span>
                <CopyButton text={attempt.depositWallet.address} />
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-muted-foreground text-sm">Scan QR code</span>
              <QRCodeCanvas
                className="rounded-md border-4 border-white"
                value={attempt.depositWallet.address}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            {/* Network Info */}
            <div className="bg-muted/30 rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium">{attempt.networkId}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="w-full space-y-3 pt-4"></CardFooter>
        </Card>

        <PayFooter />
      </div>
    </div>
  );
}
