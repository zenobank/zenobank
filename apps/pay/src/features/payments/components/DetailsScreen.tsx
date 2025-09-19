import { QRCodeCanvas } from 'qrcode.react';
import { CopyButton } from '@/src/components/ui/copy-button';

export default function PaymentDetails({ walletAddress }: { walletAddress: string }) {
  return (
    <div className="space-y-4">
      <div className="mx-auto flex w-full flex-col items-center justify-center">
        <span className="text-muted-foreground">Send exact amount to</span>
        <div className="relative flex items-center justify-between text-sm">
          <span className="font-medium">{walletAddress}</span>
          <CopyButton text={walletAddress} />
        </div>
      </div>

      <QRCodeCanvas
        className="mx-auto rounded-md p-0.5"
        value="https://reactjs.org/"
        bgColor="#000000"
        fgColor="#ffffff"
      />
    </div>
  );
}
