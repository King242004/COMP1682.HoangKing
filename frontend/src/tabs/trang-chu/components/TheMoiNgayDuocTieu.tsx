import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DuBao } from '../../../api/DuBaoApi';
import colors from '../../../shared/colors';
import { formatDateKey } from '../../../shared/dateKey';
import formatMoney from '../../../shared/formatMoney';

type TheMoiNgayDuocTieuProps = {
  duBao: DuBao | null;
  khiTaoVi: () => void;
};

// ⭐ The main card of Home: how much the user can spend per day until money comes in,
// why (real money or budget), and the group debts that change it.
export default function TheMoiNgayDuocTieu({ duBao, khiTaoVi }: TheMoiNgayDuocTieuProps) {
  if (!duBao) {
    return <View style={[styles.card, styles.loading]} />;
  }

  // Without a wallet the app does not know how much money there is.
  if (!duBao.coVi) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Mỗi ngày được tiêu</Text>
        <Text style={styles.noWallet}>Tạo ví để app tính được số tiền bạn được tiêu mỗi ngày.</Text>
        <Pressable accessibilityRole="button" onPress={khiTaoVi} style={styles.createButton}>
          <Text style={styles.createText}>Tạo ví</Text>
        </Pressable>
      </View>
    );
  }

  const { hanMuc } = duBao;
  const lyDo =
    hanMuc.gioiHanBoi === 'ngan_sach'
      ? `Giới hạn bởi ngân sách · theo tiền thật ${formatMoney(hanMuc.coTheTieuMoiNgay)}`
      : `Tới ${formatDateKey(hanMuc.ngayCoTien)} (còn ${hanMuc.soNgayConLai} ngày)`;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`Mỗi ngày được tiêu ${formatMoney(hanMuc.moiNgayDuocTieu)}. ${lyDo}`}
    >
      <Text style={styles.label}>Mỗi ngày được tiêu</Text>
      <Text style={styles.amount}>{formatMoney(hanMuc.moiNgayDuocTieu)}</Text>
      <Text style={styles.reason}>{lyDo}</Text>
      {hanMuc.themNeuDuocTra > 0 ? (
        <Text style={styles.reason}>+{formatMoney(hanMuc.themNeuDuocTra)}/ngày nếu được trả nợ</Text>
      ) : null}

      {duBao.tongDangNo > 0 || duBao.sapDuocTra > 0 ? (
        <View style={styles.groupRow}>
          <Text style={styles.groupText}>Đang nợ {formatMoney(duBao.tongDangNo)}</Text>
          <Text style={styles.groupText}>Sắp được trả {formatMoney(duBao.sapDuocTra)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 18,
  },
  loading: {
    minHeight: 130,
  },
  label: {
    fontSize: 14,
    color: colors.onPrimary,
  },
  amount: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.onPrimary,
    marginTop: 2,
  },
  reason: {
    fontSize: 13,
    color: colors.onPrimary,
    marginTop: 2,
  },
  groupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.onPrimary,
    marginTop: 12,
    paddingTop: 10,
  },
  groupText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  noWallet: {
    fontSize: 15,
    color: colors.onPrimary,
    marginVertical: 8,
  },
  createButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  createText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
