// 600000 → "600.000đ". Money is always a whole number of VND.
export default function formatMoney(amount: number): string {
  const digits = Math.abs(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = amount < 0 ? '−' : '';
  return `${sign}${digits}đ`;
}

// Short form for small spaces such as calendar cells: 35000 → "35k", 1250000 → "1,2tr".
export function formatShortMoney(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = Math.floor(amount / 100_000) / 10;
    return `${String(millions).replace('.', ',')}tr`;
  }
  if (amount >= 1_000) {
    return `${Math.floor(amount / 1_000)}k`;
  }
  return String(amount);
}
