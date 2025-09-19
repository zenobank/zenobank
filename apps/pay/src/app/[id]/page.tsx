import Payament from "@/src/features/payments";




export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Payament id={id} />
}