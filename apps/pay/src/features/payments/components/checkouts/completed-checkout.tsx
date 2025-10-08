import { Card, CardContent } from '@/src/components/ui/card';
import PayFooter from '../pay-footer';
import { CheckCircle } from 'lucide-react';

export default function CompletedCheckout() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card className="">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-medium">Payment Completed</h1>
                <p className="text-muted-foreground text-sm">Your payment has been successfully processed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <PayFooter />
      </div>
    </div>
  );
}
