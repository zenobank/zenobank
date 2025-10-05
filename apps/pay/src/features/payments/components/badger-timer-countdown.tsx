import { Badge } from '@/src/components/ui/badge';
import { TimerIcon } from 'lucide-react';
import Countdown from 'react-countdown';

export default function BadgerTimerCountdown({ expiresAt }: { expiresAt: string }) {
  return (
    <Badge variant="secondary" data-testid="countdown">
      <TimerIcon />
      <Countdown
        date={new Date(expiresAt)}
        daysInHours
        overtime={false}
        renderer={({ hours, minutes, seconds }) => (
          <span>
            {hours !== 0 && String(hours).padStart(2, '0') + ':'}
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        )}
      />
    </Badge>
  );
}
