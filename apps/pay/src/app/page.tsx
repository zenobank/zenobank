import { redirect } from 'next/navigation';

export default function Home() {
  redirect(process.env.NEXT_PUBLIC_MAIN_DOMAIN_URL ?? 'https://zenobank.io');
}
