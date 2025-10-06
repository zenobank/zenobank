export function CheckoutPrice({ amount, currency }: { amount: string; currency: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4 text-center text-3xl font-bold">
      {amount} {currency}
    </div>
  );
}
