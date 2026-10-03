// 600000 → "600.000đ". Tiền luôn là số nguyên VND.
export default function formatMoney(amount: number): string {
  const digits = Math.abs(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = amount < 0 ? '−' : '';
  return `${sign}${digits}đ`;
}

// Dạng ngắn cho chỗ hẹp như ô lịch: 35000 → "35k", 1250000 → "1,2tr".
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
