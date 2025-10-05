import Image from 'next/image';
import { TokenResponseDto } from '../..';

export function SelectedToken({ selectedTokenData }: { selectedTokenData: TokenResponseDto }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        width={24}
        height={24}
        src={`/images/tokens/${selectedTokenData.canonicalTokenId.toLowerCase()}.png`}
        alt={selectedTokenData.symbol}
        className="h-6 w-6 rounded-full"
      />
      <div className="text-left">
        <div className="text-sm font-bold">{selectedTokenData.symbol}</div>
        <div className="text-xs">{selectedTokenData.symbol}</div>
      </div>
    </div>
  );
}
