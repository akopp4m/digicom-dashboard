export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function calculatePercentage(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}
