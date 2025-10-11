import { redirect } from 'next/navigation';
import { env } from '@/src/lib/env';
export default function Home() {
  redirect(env.NEXT_PUBLIC_MAIN_DOMAIN_URL ?? 'https://zenobank.io');
}
