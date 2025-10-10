import { CommandGroup, CommandItem } from '@/src/components/ui/command';
import {
  BinancePayTokenResponseDto,
  CheckoutResponseDto,
  OnChainTokenResponseDto,
} from '@/lib/generated/api-client/model';
import Image from 'next/image';
import { PopoverId, TokenResponseDto } from '../..';
import { Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function TokenList({
  binancePayTokens,
  onchainTokens,
  setSelectedTokenId,
  setActivePopover,
  selectedTokenData,
}: {
  binancePayTokens: BinancePayTokenResponseDto[];
  onchainTokens: OnChainTokenResponseDto[];
  setSelectedTokenId: (tokenId: string | null) => void;
  setActivePopover: (open: PopoverId | null) => void;
  selectedTokenData: TokenResponseDto | null;
}) {
  const tokens = [...binancePayTokens, ...onchainTokens];
  return (
    <CommandGroup>
      {tokens
        ?.filter((t, i, arr) => i === arr.findIndex((u) => u.canonicalTokenId === t.canonicalTokenId))
        ?.map((supportedToken) => (
          <CommandItem
            key={supportedToken.id}
            value={supportedToken.id}
            onSelect={(currentValue: string) => {
              const token = tokens?.find((t) => t.id === currentValue);
              if (token) {
                setSelectedTokenId(token.id);
              }
              setActivePopover(null);
            }}
          >
            <div className="flex w-full items-center gap-3">
              <Image
                width={24}
                height={24}
                src={`/images/tokens/${supportedToken.canonicalTokenId.toLowerCase()}.png`}
                alt={supportedToken.symbol}
                className="h-6 w-6 rounded-full"
              />
              <div className="flex-1">
                <div className="text-sm font-bold">{supportedToken.symbol}</div>
                <div className="text-xs">{supportedToken.symbol}</div>
              </div>
              <Check
                className={cn(
                  'ml-auto h-4 w-4',
                  selectedTokenData?.id === supportedToken.id ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
          </CommandItem>
        ))}
    </CommandGroup>
  );
}
