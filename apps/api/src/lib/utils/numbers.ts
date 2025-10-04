import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 30 });

export function toBN(number: BigNumber.Value): BigNumber {
  return new BigNumber(number);
}

export const BN_ZERO: BigNumber = toBN('0');
export const BN_ONE: BigNumber = toBN('1');
export const BN_TEN: BigNumber = toBN('10');

export enum RoundMode {
  ROUND_UP,
  ROUND_DOWN,
}

export function removeTrailingZeros(number: BigNumber.Value): string {
  return toBN(number).toString();
}

// TODO: delete
/**
 * @deprecated Use formatCurrency or formatDollarAmount instead
 */
export function formatPrice(
  number: BigNumber.Value,
  pricePrecision = 2,
  separator = false,
  roundMode = RoundMode.ROUND_DOWN,
): string {
  const toFixed = toBN(number).toFixed(pricePrecision, roundMode);
  return separator ? toBN(toFixed).toFormat() : removeTrailingZeros(toFixed);
}

export const formatAmount = (
  amount: BigNumber.Value | undefined | null,
  fixed = 6,
  separator = false,
): string => {
  if (amount === null || amount === undefined) return '';

  const bnAmount = toBN(amount);
  if (BN_TEN.pow(fixed - 1).lte(bnAmount)) {
    return separator
      ? toBN(amount).toFormat(0, BigNumber.ROUND_DOWN)
      : bnAmount.toFixed(0, BigNumber.ROUND_DOWN);
  }

  const rounded = bnAmount.sd(fixed, BigNumber.ROUND_DOWN);
  return separator ? toBN(rounded.toFixed()).toFormat() : rounded.toFixed();
};

export const formatCurrency = (
  amount: BigNumber.Value | undefined | null,
  decimals = 2,
  fixed = 6,
  separator = false,
) => {
  if (amount === undefined || amount === null || amount === '') return '-';
  const bnAmount = toBN(amount);
  if (bnAmount.isZero()) {
    return '0';
  }
  if (bnAmount.lt(0.001) && bnAmount.gt(0)) {
    return '< 0.001';
  }

  if (bnAmount.gte(1e9)) {
    const numericAmount = parseFloat(
      formatAmount(bnAmount.div(1e9), fixed, separator),
    ).toFixed(decimals);
    const numericAmountWithComa = numericAmount.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ',',
    );

    return numericAmountWithComa + 'B';
  }

  if (bnAmount.abs().gte(1e6)) {
    // Return the millions parsed with , every 3 digits
    const numericAmount = parseFloat(
      formatAmount(bnAmount.div(1e6), fixed, separator),
    ).toFixed(decimals);
    const numericAmountWithComa = numericAmount.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ',',
    );

    return numericAmountWithComa + 'M';
  }

  if (bnAmount.abs().gte(1e3)) {
    const numericAmount = parseFloat(
      formatAmount(bnAmount.div(1e3), fixed, separator),
    ).toFixed(decimals);
    const numericAmountWithComa = numericAmount.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ',',
    );

    return numericAmountWithComa + 'K';
  }

  const formattedAmount = parseFloat(formatAmount(bnAmount, fixed, separator));

  return formattedAmount.toFixed(formattedAmount < 1 ? 5 : 2);
};

export const formatDollarAmount = (
  amount: BigNumber.Value | undefined | null,
  showSymbol = true,
  decimals = 2,
  fixed = 4,
) => {
  const formattedAmount = formatCurrency(amount, decimals, fixed, false);
  if (formattedAmount === '< 0.001') {
    return `< ${showSymbol ? '$' : ''}0.001`;
  }
  return formattedAmount !== '-'
    ? `${showSymbol ? '$' : ''}${formattedAmount}`
    : '-';
};

export function trimTrailingDecimalZeros(value: BigNumber.Value): string {
  const valueStr = String(value);
  const decimalPointIndex = valueStr.indexOf('.');
  if (decimalPointIndex === -1) return valueStr; // no decimal part

  let lastSignificantIndex = valueStr.length - 1;
  let iterations = 0;
  const MAX_ITERATIONS = 256; // prevent infinite loop attacks

  while (
    lastSignificantIndex > decimalPointIndex &&
    valueStr[lastSignificantIndex] === '0' &&
    iterations < MAX_ITERATIONS
  ) {
    lastSignificantIndex--;
    iterations++;
  }

  // If we ended on the decimal point, remove it as well
  if (lastSignificantIndex === decimalPointIndex) {
    lastSignificantIndex--;
  }

  return valueStr.slice(0, lastSignificantIndex + 1);
}
