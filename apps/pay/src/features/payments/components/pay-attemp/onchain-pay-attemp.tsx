import {
  NetworkResponseDto,
  OnchainAttemptResponseDto,
  OnChainTokenResponseDto,
} from '@/lib/generated/api-client/model';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import BadgerTimerCountdown from '../badger-timer-countdown';
import PayFooter from '../pay-footer';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Loader } from 'lucide-react';
import { toast } from 'sonner';
import copy from 'copy-to-clipboard';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useSwitchChain, useChainId, useChains } from 'wagmi';
import { Chain, erc20Abi, parseUnits } from 'viem';
import { wagmiConfig } from '@/src/lib/wagmi-config';
import { useState, useEffect } from 'react';

interface OnchainPayAttempProps {
  attempt: OnchainAttemptResponseDto;
  expiresAt?: string | null;
  onBack: () => void;
  networks: NetworkResponseDto[];
  selectedTokenData: OnChainTokenResponseDto;
}

export function OnchainPayAttemp({ attempt, expiresAt, onBack, networks, selectedTokenData }: OnchainPayAttempProps) {
  const handleCopy = (text: string) => {
    copy(text);
    toast.success('Copied to clipboard!');
  };
  const chains = useChains();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const network = networks.find((network) => network.id === attempt.networkId);
  const { isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [isPayWithBrowserWalletLoading, setIsPayWithBrowserWalletLoading] = useState(false);
  const [shouldTriggerTransaction, setShouldTriggerTransaction] = useState(false);

  const sendTx = async (chain: Chain) => {
    await writeContractAsync({
      address: selectedTokenData.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [
        attempt.depositWallet.address as `0x${string}`,
        parseUnits(attempt.tokenPayAmount, selectedTokenData.decimals),
      ],
      chain: chain,
    });
  };
  const triggerPayWithBrowserWalletTransaction = async () => {
    setIsPayWithBrowserWalletLoading(true);
    try {
      if (isConnected) {
        if (!network?.chainId) {
          // Sentry.captureException(new Error(`Network chain ID is not set for ${network?.id}`));
          toast.error('Pay with browser wallet is not supported for this network');
          return;
        }
        const wagmiChain = chains.find((chain) => chain.id == network?.chainId);
        console.log('wagmiChain', wagmiChain);
        console.log('network', network);
        console.log('chains', chains);
        if (!wagmiChain) {
          // Sentry.captureException(new Error(`Unsupported network for ${network?.id}`));
          toast.error(`Unsupported network. Networkd Id: ${network?.chainId}. Chain Id: ${network?.chainId}.`);
          return;
        }
        if (chain?.id !== network?.chainId) {
          await switchChainAsync({ chainId: network?.chainId });
        }
        await sendTx(wagmiChain);
        toast.success('Transaction sent');
        setShouldTriggerTransaction(false);
      } else {
        setShouldTriggerTransaction(true);
        openConnectModal?.();
      }
    } catch (error) {
      toast.error('Failed to pay with browser wallet');
      console.error(error);
      setShouldTriggerTransaction(false);
    } finally {
      setIsPayWithBrowserWalletLoading(false);
    }
  };

  // Effect to trigger transaction after wallet connection
  useEffect(() => {
    if (isConnected && shouldTriggerTransaction) {
      triggerPayWithBrowserWalletTransaction();
    }
  }, [isConnected, shouldTriggerTransaction]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md flex-1">
        <Card className="">
          <CardHeader className="">
            <div className="flex items-baseline justify-between">
              <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {expiresAt && <BadgerTimerCountdown expiresAt={expiresAt} />}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="flex flex-col items-center gap-3">
              <span
                className="hover:text-muted-foreground cursor-pointer text-3xl font-semibold tracking-tight transition-colors"
                onClick={() => handleCopy(`${attempt.tokenPayAmount}`)}
              >
                {attempt.tokenPayAmount} {selectedTokenData.symbol}
              </span>
              <Badge variant="secondary" className="text-xs">
                {networks.find((network) => network.id === attempt.networkId)?.displayName} Network
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex w-full justify-center">
                <span className="text-muted-foreground text-center text-sm">Send exact amount to this address</span>
              </div>
              {/* Wallet Address */}
              <div
                className="bg-background hover:bg-accent cursor-pointer rounded-lg border px-3 py-3 shadow-sm transition-colors"
                onClick={() => handleCopy(attempt.depositWallet.address)}
              >
                <span className="block text-center font-mono text-sm break-all">{attempt.depositWallet.address}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <QRCodeCanvas
                className="rounded-lg"
                value={attempt.depositWallet.address}
                size={150}
                marginSize={1}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center">
            <Button
              disabled={isPayWithBrowserWalletLoading}
              variant={'outline'}
              onClick={triggerPayWithBrowserWalletTransaction}
            >
              {isPayWithBrowserWalletLoading ? <Loader className="h-5 w-5 animate-spin" /> : null}
              Or Pay With Browser Wallet
            </Button>
          </CardFooter>
        </Card>

        <PayFooter />
      </div>
    </div>
  );
}
