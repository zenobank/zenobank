import { createFileRoute } from '@tanstack/react-router'
import {
  assetControllerGetSupportedTokensV1,
  networksControllerGetNetworksV1,
  paymentControllerGetPaymentV1,
} from '@/lib/requests/api-client/aPIDocs'
import Payments from '@/features/payments'

export const Route = createFileRoute('/payments/$id')({
  loader: async ({ params }) => {
    const [
      { data: paymentData },
      { data: networks },
      { data: supportedTokens },
    ] = await Promise.all([
      paymentControllerGetPaymentV1(params.id),
      networksControllerGetNetworksV1(),
      assetControllerGetSupportedTokensV1(),
    ])
    console.log('supported tokens', supportedTokens)

    return { paymentData, networks, supportedTokens }
  },
  component: Payments,
})
