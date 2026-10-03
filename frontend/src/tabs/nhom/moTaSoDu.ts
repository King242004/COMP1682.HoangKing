import colors from '../../shared/colors';
import formatMoney from '../../shared/formatMoney';

// Đổi số dư nhóm thành chữ và màu, để không bao giờ chỉ dựa vào màu.
// Dương = nhóm nợ người này; âm = người này nợ nhóm.
export default function moTaSoDu(soDu: number, laToi: boolean): { chu: string; mau: string } {
  if (soDu > 0) {
    return { chu: `${laToi ? 'Bạn được' : 'Được'} nhận ${formatMoney(soDu)}`, mau: colors.income };
  }
  if (soDu < 0) {
    return { chu: `${laToi ? 'Bạn đang' : 'Đang'} nợ ${formatMoney(-soDu)}`, mau: colors.expense };
  }
  return { chu: 'Đã hòa', mau: colors.textMuted };
}
