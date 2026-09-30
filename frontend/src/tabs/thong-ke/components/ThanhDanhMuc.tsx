import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ChiTheoDanhMuc } from '../../../api/ThongKeApi';
import colors from '../../../shared/colors';
import formatMoney from '../../../shared/formatMoney';

type ThanhDanhMucProps = {
  muc: ChiTheoDanhMuc;
  lonNhat: number;
  tongChi: number;
};

// One horizontal bar: how much was spent in one category. The longest bar is the biggest category.
// Name, amount and share are written as text, so the bar length is never the only way to read it.
export default function ThanhDanhMuc({ muc, lonNhat, tongChi }: ThanhDanhMucProps) {
  const doDai = lonNhat > 0 ? (muc.soTien / lonNhat) * 100 : 0;
  const phanTram = tongChi > 0 ? Math.round((muc.soTien / tongChi) * 100) : 0;

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${muc.tenDanhMuc}: ${formatMoney(muc.soTien)}, ${phanTram}% tổng chi`}
    >
      <View style={styles.labelRow}>
        <Ionicons name={muc.bieuTuong as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
        <Text style={styles.name}>{muc.tenDanhMuc}</Text>
        <Text style={styles.amount}>{formatMoney(muc.soTien)}</Text>
        <Text style={styles.percent}>{phanTram}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${doDai}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  percent: {
    width: 40,
    textAlign: 'right',
    fontSize: 13,
    color: colors.textMuted,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
