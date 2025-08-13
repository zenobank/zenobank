interface PercentageOptions {
  long?: boolean;
}

export function parsePercent(str: `${number}%`): number {
  const match = /^\s*(-?(?:\d+)?\.?\d+)\s*%?\s*$/.exec(str.trim());
  if (!match) {
    throw new Error(`Invalid percent string: ${str}`);
  }
  return parseFloat(match[1] ?? '0') / 100;
}

export function formatPercent(
  decimal: number,
  options?: PercentageOptions,
): string {
  const percent = decimal * 100;
  const useLong = options?.long ?? true;
  return useLong ? `${percent}%` : `${percent}`;
}
