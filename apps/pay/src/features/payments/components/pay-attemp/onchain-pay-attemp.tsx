import { NetworkResponseDto, OnchainAttemptResponseDto } from '@repo/api-client/model';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import BadgerTimerCountdown from '../badger-timer-countdown';
import PayFooter from '../pay-footer';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import copy from 'copy-to-clipboard';

interface OnchainPayAttempProps {
  attempt: OnchainAttemptResponseDto;
  expiresAt?: string | null;
  onBack: () => void;
  networks: NetworkResponseDto[];
}

export function OnchainPayAttemp({ attempt, expiresAt, onBack, networks }: OnchainPayAttempProps) {
  const handleCopy = (text: string) => {
    copy(text);
    toast.success('Copied to clipboard!');
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card className="">
          <CardHeader className="">
            <div className="flex items-baseline justify-between">
              <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {expiresAt && <BadgerTimerCountdown expiresAt={expiresAt} />}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="flex flex-col items-center gap-3">
              <span
                className="hover:text-muted-foreground cursor-pointer text-3xl font-semibold tracking-tight transition-colors"
                onClick={() => handleCopy(`${attempt.tokenPayAmount}`)}
              >
                {attempt.tokenPayAmount} USDC
              </span>
              <Badge variant="secondary" className="text-xs">
                {networks.find((network) => network.id === attempt.networkId)?.displayName} Network
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex w-full justify-center">
                <span className="text-muted-foreground text-center text-xs font-light">
                  Send Exact Amount to this address
                </span>
              </div>
              {/* Wallet Address */}
              <div
                className="bg-background hover:bg-accent cursor-pointer rounded-lg border px-3 py-3 shadow-sm transition-colors"
                onClick={() => handleCopy(attempt.depositWallet.address)}
              >
                <span className="block text-center font-mono text-sm break-all">{attempt.depositWallet.address}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <QRCodeCanvas
                className="rounded-lg"
                value={attempt.depositWallet.address}
                size={150}
                marginSize={1}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </CardContent>

          <CardFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                toast.error('Not implemented');
              }}
            >
              Connect Wallet
            </Button>
          </CardFooter>
        </Card>

        <PayFooter />
      </div>
    </div>
  );
}
