import { now } from 'src/lib/utils/now';

export function buildTxSchedulerId({
  networkId,
  hash,
}: {
  networkId: string;
  hash: string;
}) {
  return `confirm:${networkId}:${hash}`;
}
