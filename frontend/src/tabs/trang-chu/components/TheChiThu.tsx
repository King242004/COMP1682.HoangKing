import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../../shared/colors';
import formatMoney from '../../../shared/formatMoney';

type TheChiThuProps = {
  tongChi: number;
  tongThu: number;
  nhanKy: string;
};

// Two cards side by side: total spent and total received in the period being viewed.
export default function TheChiThu({ tongChi, tongThu, nhanKy }: TheChiThuProps) {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={styles.labelRow}>
          <Ionicons name="arrow-up-circle-outline" size={18} color={colors.expense} />
          <Text style={styles.label}>Chi {nhanKy}</Text>
        </View>
        <Text style={styles.amount}>{formatMoney(tongChi)}</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.labelRow}>
          <Ionicons name="arrow-down-circle-outline" size={18} color={colors.income} />
          <Text style={styles.label}>Thu {nhanKy}</Text>
        </View>
        <Text style={styles.amount}>{formatMoney(tongThu)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
});
