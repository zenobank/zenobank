import { CheckCircle } from 'lucide-react';

export default function SuccessScreen() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-green-600 dark:text-green-400">Payment Successful!</h3>
        <p className="text-muted-foreground">Your payment has been confirmed</p>
      </div>
    </div>
  );
}
