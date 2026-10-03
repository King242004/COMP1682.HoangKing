// Đổi chữ người dùng gõ trong ô tiền thành số nguyên VND.
// "500.000", "500,000" và "500000" đều thành 500000. Ô trống thành 0.
export default function readMoneyInput(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}
