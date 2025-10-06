export default function PayFooter() {
  return (
    <div className="mt-6 text-center">
      <p className="text-xs font-normal">0% Fees Open Source Crypto Gateway</p>
      <p className="text-xs font-light italic">
        Powered by{' '}
        <a href={`${process.env.NEXT_PUBLIC_MAIN_DOMAIN_URL}`} target="_blank" rel="noreferrer">
          <span className="font-semibold underline">Zenobank</span>
        </a>
      </p>
    </div>
  );
}
