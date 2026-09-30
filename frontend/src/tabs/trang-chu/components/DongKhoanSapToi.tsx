import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { KhoanTrenLich } from '../../../api/DuBaoApi';
import colors from '../../../shared/colors';
import { formatDateKey } from '../../../shared/dateKey';
import formatMoney from '../../../shared/formatMoney';

type DongKhoanSapToiProps = {
  khoan: KhoanTrenLich;
};

const NHAN_NGUON: Record<KhoanTrenLich['nguon'], string> = {
  ca_nhan: 'Khoản sắp tới',
  no_nhom: 'Nợ nhóm',
  ke_hoach_nhom: 'Kế hoạch nhóm',
};

// One future money movement: a personal upcoming item, a group debt, or a group plan.
export default function DongKhoanSapToi({ khoan }: DongKhoanSapToiProps) {
  const laThu = khoan.loai === 'thu';
  const tuNhom = khoan.nguon !== 'ca_nhan';
  return (
    <View style={styles.row}>
      <Ionicons
        name={tuNhom ? 'people-outline' : laThu ? 'arrow-down-circle-outline' : 'time-outline'}
        size={20}
        color={tuNhom ? colors.group : colors.primary}
      />
      <View style={styles.text}>
        <Text style={styles.name}>{khoan.ten}</Text>
        <Text style={styles.detail}>
          {formatDateKey(khoan.ngay)} · {NHAN_NGUON[khoan.nguon]}
        </Text>
      </View>
      <Text style={[styles.amount, { color: laThu ? colors.income : colors.expense }]}>
        {laThu ? '+' : '−'}
        {formatMoney(khoan.soTien)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 14,
  },
  text: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  detail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
});
