import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '@/src/components/ui/popover';
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
import { PopoverId } from '../..';
import { CheckoutResponseDto, NetworkResponseDto, TokenResponseDto } from '@repo/api-client/model';

export default function MethodSelector({
  activePopover,
  setActivePopover,
  selectedTokenData,
  availableNetworksIdsForSelectedToken,
  availableProvidersForSelectedToken,
  selectedNetworkData,
  setSelectedTokenId,
  networks,
}: {
  activePopover: PopoverId | null;
  setActivePopover: (open: PopoverId | null) => void;
  selectedTokenData: TokenResponseDto | null;
  availableNetworksIdsForSelectedToken: string[];
  availableProvidersForSelectedToken: TokenResponseDto[];
  selectedNetworkData: NetworkResponseDto | null;
  setSelectedTokenId: (tokenId: string | null) => void;
  networks: NetworkResponseDto[];
}) {
  return (
    <div className="space-y-2">
      <Popover
        open={activePopover === PopoverId.RAIL}
        onOpenChange={(open: boolean) => {
          // Only allow opening if multiple options available
          const totalOptions = availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length;
          if (open && totalOptions <= 1) return;
          setActivePopover(open ? PopoverId.RAIL : null);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={activePopover === PopoverId.RAIL}
            className="mx-auto h-12 w-full max-w-md justify-between"
            disabled={
              !selectedTokenData ||
              availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length <= 1
            }
          >
            {selectedTokenData?.rail === 'ONCHAIN' && selectedNetworkData ? (
              <div className="">
                <span className="text-muted-foreground text-xs">Network: </span>
                <span className="">{selectedNetworkData.displayName}</span>
              </div>
            ) : selectedTokenData?.rail === 'CUSTODIAL' && selectedTokenData?.provider ? (
              <div className="">
                <span className="text-muted-foreground text-xs">Method: </span>
                <span className="">
                  {selectedTokenData.provider === 'BINANCE_PAY' ? 'Binance Pay' : selectedTokenData.provider}
                </span>
              </div>
            ) : (
              'Select payment method...'
            )}
            {availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length > 1 && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        {availableNetworksIdsForSelectedToken.length + availableProvidersForSelectedToken.length > 1 && (
          <PopoverContent className="w-96 p-0">
            <Command>
              <CommandInput placeholder="Search payment method..." className="h-9" />
              <CommandList>
                <CommandEmpty>No payment method found.</CommandEmpty>

                {/* Others Section (Binance Pay, etc.) */}
                {availableProvidersForSelectedToken.length > 0 && (
                  <CommandGroup heading="Others">
                    {availableProvidersForSelectedToken.map((token) => (
                      <CommandItem
                        key={token.id}
                        value={token.id}
                        onSelect={(currentValue: string) => {
                          setSelectedTokenId(currentValue);
                          setActivePopover(null);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {token.provider === 'BINANCE_PAY' ? 'Binance Pay' : token.provider}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              selectedTokenData?.id === token.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Networks Section */}
                {availableNetworksIdsForSelectedToken.length > 0 && (
                  <CommandGroup heading="Networks">
                    {availableNetworksIdsForSelectedToken.map((networkId) => {
                      const network = networks?.find((n) => n.id.toString() === networkId);
                      if (!network) return null;
                      return (
                        <CommandItem
                          key={network.id.toString()}
                          value={network.id.toString()}
                          onSelect={(currentValue: string) => {
                            if (currentValue !== selectedNetworkData?.id.toString()) {
                              const token = networks?.find((t) => t.id === currentValue);
                              if (token) {
                                setSelectedTokenId(token.id);
                              }
                            }
                            setActivePopover(null);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {network.displayName}
                            <Check
                              className={cn(
                                'ml-auto h-4 w-4',
                                selectedNetworkData?.id === network.id ? 'opacity-100' : 'opacity-0',
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
        )}
      </Popover>
    </div>
  );
}
