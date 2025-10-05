import { Popover, PopoverTrigger, PopoverContent } from '@/src/components/ui/popover';
import { Button } from '@/src/components/ui/button';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/src/components/ui/command';
import { ChevronsUpDown } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { MethodType, PopoverId, TokenResponseDto } from '../..';
import { NetworkResponseDto, BinancePayTokenResponseDto, OnChainTokenResponseDto } from '@repo/api-client/model';
import { useMemo } from 'react';

export default function MethodSelector({
  activePopover,
  setActivePopover,
  selectedTokenData,
  setSelectedTokenId,
  networks,
  isBinancePayAvailableForSelectedCanonicalToken,
  selectedMethod,
  onChainTokens,
  binancePayTokens,
}: {
  activePopover: PopoverId | null;
  setActivePopover: (open: PopoverId | null) => void;
  selectedTokenData: TokenResponseDto | null;
  setSelectedTokenId: (tokenId: string | null) => void;
  networks: NetworkResponseDto[];
  isBinancePayAvailableForSelectedCanonicalToken: boolean;
  selectedMethod: MethodType | null;
  onChainTokens: OnChainTokenResponseDto[];
  binancePayTokens: BinancePayTokenResponseDto[];
}) {
  const methodsChoicesLength = useMemo(() => {
    return isBinancePayAvailableForSelectedCanonicalToken ? networks.length + 1 : networks.length;
  }, [networks]);

  return (
    <div className="space-y-2">
      <Popover
        open={activePopover === PopoverId.METHOD}
        onOpenChange={(open: boolean) => {
          if (open && methodsChoicesLength <= 1) return;
          setActivePopover(open ? PopoverId.METHOD : null);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={activePopover === PopoverId.METHOD}
            className="mx-auto h-12 w-full max-w-md justify-between"
            disabled={!selectedTokenData || methodsChoicesLength <= 1}
          >
            {selectedMethod ? (
              <span className="">
                {selectedMethod === MethodType.ONCHAIN
                  ? networks.find((n) => n.id === (selectedTokenData as OnChainTokenResponseDto)?.['networkId'])
                      ?.displayName
                  : 'Binance Pay'}
              </span>
            ) : (
              'Select method...'
            )}
            {methodsChoicesLength > 1 && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <Command>
            <CommandInput placeholder="Search payment method..." className="h-9" />
            <CommandList>
              <CommandEmpty>No payment method found.</CommandEmpty>
              <CommandGroup heading="">
                {isBinancePayAvailableForSelectedCanonicalToken && (
                  <CommandItem
                    key="binance-pay"
                    value="binance-pay"
                    onSelect={() => {
                      const binancePayToken = binancePayTokens.find(
                        (t) => t.canonicalTokenId === selectedTokenData?.canonicalTokenId,
                      );
                      if (binancePayToken) {
                        setSelectedTokenId(binancePayToken.id);
                      }
                      setActivePopover(null);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      Binance Pay
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedMethod === MethodType.BINANCE_PAY ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </div>
                  </CommandItem>
                )}
              </CommandGroup>

              {networks?.length && (
                <CommandGroup heading={`${networks.length > 1 ? 'Networks' : ''}`}>
                  {networks?.map((network) => {
                    return (
                      <CommandItem
                        key={network.id}
                        value={network.id}
                        onSelect={() => {
                          const token = onChainTokens?.find(
                            (token) =>
                              token.networkId === network.id &&
                              token.canonicalTokenId === selectedTokenData?.canonicalTokenId,
                          );
                          if (token) {
                            setSelectedTokenId(token.id);
                          }
                          setActivePopover(null);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {network.displayName}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              selectedTokenData?.id === network.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
