export const CheckoutEvents = {
  COMPLETED: 'checkout.completed',
} as const;

export type CheckoutEvent =
  (typeof CheckoutEvents)[keyof typeof CheckoutEvents];
