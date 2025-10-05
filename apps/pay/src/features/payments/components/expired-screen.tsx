import { Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function ExpiredScreen() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-red-600 dark:text-red-400">Payment Expired</h3>
        <p className="text-muted-foreground mb-4">The payment session has expired. This payment is no longer valid.</p>

        <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <span>Please contact the merchant to create a new payment</span>
        </div>
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
