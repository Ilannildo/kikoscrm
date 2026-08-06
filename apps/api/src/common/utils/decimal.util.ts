import { Decimal } from '@prisma/client/runtime/client';

export function serializeDecimal(value: Decimal | number | string): string {
  if (value instanceof Decimal) {
    return value.toFixed(2);
  }
  return Number(value).toFixed(2);
}

export function toDecimal(value: string | number): Decimal {
  return new Decimal(value);
}

export function sumDecimals(values: (Decimal | null | undefined)[]): string {
  const total = values.reduce((acc, val) => {
    if (!val) return acc;
    return acc.add(val);
  }, new Decimal(0));
  return total.toFixed(2);
}
