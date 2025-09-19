import { redirect } from 'next/navigation'

export default function Home() {
  redirect(process.env.MAIN_DOMAIN_URL ?? 'https://zenobank.io')
}
