import {
  BinancePayTokenResponseDto,
  CheckoutResponseDto,
  OnChainTokenResponseDto,
} from '@/lib/generated/api-client/model';
import { PopoverId } from '../..';
import { TokenResponseDto } from '../..';
import { Button } from '@/src/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/src/components/ui/popover';
import { SelectedToken } from './selected-token';
import { ChevronsUpDown } from 'lucide-react';
import { Command, CommandInput, CommandList, CommandEmpty } from '@/src/components/ui/command';
import { TokenList } from './token-list';

export function TokenSelector({
  activePopover,
  setActivePopover,
  selectedTokenData,
  binancePayTokens,
  onchainTokens,
  setSelectedTokenId,
}: {
  activePopover: PopoverId | null;
  setActivePopover: (open: PopoverId | null) => void;
  selectedTokenData: TokenResponseDto | null;
  binancePayTokens: BinancePayTokenResponseDto[];
  onchainTokens: OnChainTokenResponseDto[];
  setSelectedTokenId: (tokenId: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Popover
        open={activePopover === PopoverId.TOKEN}
        onOpenChange={(open: boolean) => {
          setActivePopover(open ? PopoverId.TOKEN : null);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={activePopover === PopoverId.TOKEN}
            className="mx-auto h-12 w-full max-w-md justify-between"
          >
            {selectedTokenData ? <SelectedToken selectedTokenData={selectedTokenData} /> : 'Select token...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <Command>
            <CommandInput placeholder="Search token..." className="h-9" />
            <CommandList>
              <CommandEmpty>No token found.</CommandEmpty>
              <TokenList
                binancePayTokens={binancePayTokens}
                onchainTokens={onchainTokens}
                setSelectedTokenId={setSelectedTokenId}
                setActivePopover={setActivePopover}
                selectedTokenData={selectedTokenData}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
