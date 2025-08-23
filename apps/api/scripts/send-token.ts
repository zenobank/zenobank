import 'dotenv/config';
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  http,
  parseUnits,
  publicActions,
} from 'viem';
import { holesky } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { Env, getEnv } from 'src/lib/utils/env';

const TOKEN_ADDRESS =
  '0x685cE6742351ae9b618F383883D6d1e0c5A31B4B' as `0x${string}`;
const TO = '0x7BbFa33fA643A1613499213D13271D402Dbf91Ac' as `0x${string}`;

const AMOUNT_HUMAN = '1.5';

async function main() {
  const account = privateKeyToAccount(
    getEnv(Env.GAS_TANKER_TESTING_PRIVATE_KEY) as `0x${string}`,
  );

  const walletClient = createWalletClient({
    chain: holesky,
    account,
    transport: http(),
  }).extend(publicActions);

  const hash = await walletClient.writeContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [TO, 2n],
    account,
  });

  console.log('Tx hash:', hash);

  const receipt = await walletClient.waitForTransactionReceipt({ hash });
  console.log('Confirmada en bloque:', receipt.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
