import { CardHeader, CardTitle } from '@/src/components/ui/card';
import { CheckoutState } from '../types/state';
import BadgerTimerCountdown from './BadgerTimerCountdown';
import { CheckoutResponseDto } from '@repo/api-client/model';

export default function PayHeader({
  expiresAt,
  checkoutState,
}: {
  expiresAt?: string | null;
  checkoutState: CheckoutState;
}) {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CardTitle className="text-lg">Send Payment</CardTitle>
        </div>
        {expiresAt && checkoutState === CheckoutState.AWAITING_DEPOSIT && (
          <BadgerTimerCountdown expiresAt={expiresAt} />
        )}
      </div>
    </CardHeader>
  );
}
