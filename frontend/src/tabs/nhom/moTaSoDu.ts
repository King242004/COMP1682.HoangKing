import colors from '../../shared/colors';
import formatMoney from '../../shared/formatMoney';

// Turns a group balance into words and a color, so it is never shown by color alone.
// Positive = the group owes this person; negative = this person owes the group.
export default function moTaSoDu(soDu: number, laToi: boolean): { chu: string; mau: string } {
  if (soDu > 0) {
    return { chu: `${laToi ? 'Bạn được' : 'Được'} nhận ${formatMoney(soDu)}`, mau: colors.income };
  }
  if (soDu < 0) {
    return { chu: `${laToi ? 'Bạn đang' : 'Đang'} nợ ${formatMoney(-soDu)}`, mau: colors.expense };
  }
  return { chu: 'Đã hòa', mau: colors.textMuted };
}
