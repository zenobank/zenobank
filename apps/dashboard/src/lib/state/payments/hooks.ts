// import { usePaymentControllerGetPaymentsV1 } from '@repo/api-client'
// import { useActiveStore } from '../store/hooks'

// export function usePayments() {
//   const { activeStore } = useActiveStore()
//   const { data: payments, isLoading } = usePaymentControllerGetPaymentsV1({
//     query: {
//       enabled: !!activeStore?.apiKey,
//     },
//     axios: {
//       headers: {
//         'x-api-key': activeStore?.apiKey || '',
//       },
//     },
//   })
//   return { payments: payments?.data, isLoading }
// }
