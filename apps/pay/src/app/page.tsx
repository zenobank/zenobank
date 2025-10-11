import { redirect } from 'next/navigation';
import { envClient } from '@/src/lib/env-client';
export default function Home() {
  redirect(envClient.NEXT_PUBLIC_MAIN_DOMAIN_URL ?? 'https://zenobank.io');
}
