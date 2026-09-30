// Turns what the user typed in a money box into a whole number of VND.
// "500.000", "500,000" and "500000" all become 500000. Empty text becomes 0.
export default function readMoneyInput(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}
