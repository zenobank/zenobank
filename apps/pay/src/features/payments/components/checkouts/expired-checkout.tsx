import { Card, CardContent } from '@/src/components/ui/card';
import PayFooter from '../pay-footer';

export default function ExpiredCheckout() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card className="">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="space-y-4">
              <h1 className="text-xl font-medium">Checkout Expired</h1>
              <p className="text-muted-foreground text-sm">This checkout has expired.</p>
            </div>
          </CardContent>
        </Card>
        <PayFooter />
      </div>
    </div>
  );
}
