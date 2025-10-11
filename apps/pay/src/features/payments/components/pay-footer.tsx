import { envClient } from '@/src/lib/env-client';

export default function PayFooter() {
  return (
    <div className="mt-6 text-center">
      <p className="text-xs font-normal">Open Source Crypto Gateway</p>
      <p className="text-xs font-light italic">
        Powered by{' '}
        <a href={`${envClient.NEXT_PUBLIC_MAIN_DOMAIN_URL}`} target="_blank" rel="noreferrer">
          <span className="font-semibold underline">Zenobank</span>
        </a>
      </p>
    </div>
  );
}
