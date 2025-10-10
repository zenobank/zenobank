import { CardHeader, CardTitle } from '@/src/components/ui/card';
import BadgerTimerCountdown from './badger-timer-countdown';
import { CheckoutResponseDto } from '@/lib/generated/api-client/model';

export default function CheckoutHeader({ expiresAt }: { expiresAt?: string | null }) {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center">
          <CardTitle className="text-lg">Send Payment</CardTitle>
        </div>
        {expiresAt && <BadgerTimerCountdown expiresAt={expiresAt} />}
      </div>
    </CardHeader>
  );
}
