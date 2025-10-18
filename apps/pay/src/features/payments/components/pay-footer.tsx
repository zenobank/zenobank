import { envClient } from '@/src/lib/env-client';

export default function PayFooter() {
  return (
    <div className="mt-6 flex flex-col gap-y-1 text-center">
      <p className="text-xs font-light hover:underline">
        <a href="https://zenobank.io" target="_blank" rel="noreferrer">
          <span className="">
            <span className="font-normal">Zenobank</span> - Open Source Crypto Gateway
          </span>
        </a>
      </p>

      <p className="text-xs font-light">
        For support, contact us{' '}
        <a href={`https://t.me/zenobank`} target="_blank" rel="noreferrer">
          <span className="underline">on Telegram</span>
        </a>
      </p>
    </div>
  );
}
