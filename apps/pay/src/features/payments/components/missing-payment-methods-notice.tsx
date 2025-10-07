export default function MissingPaymentMethodsNotice() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <p className="mb-1 max-w-xs font-medium">No payment methods configured</p>
      <p className="mb-4 max-w-xs font-medium">Set them up in the dashboard</p>
    </div>
  );
}
