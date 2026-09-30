import { StyleSheet, Text, View } from 'react-native';

import type { ThanhVien } from '../../../api/NhomApi';
import colors from '../../../shared/colors';
import moTaSoDu from '../moTaSoDu';

type DongSoDuThanhVienProps = {
  thanhVien: ThanhVien;
  laToi: boolean;
};

// One member with their balance in the group ("Được nhận 370.000đ", "Đang nợ 140.000đ", "Đã hòa").
export default function DongSoDuThanhVien({ thanhVien, laToi }: DongSoDuThanhVienProps) {
  const soDu = moTaSoDu(thanhVien.soDu, false);
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{thanhVien.tenHienThi.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>
        {thanhVien.tenHienThi}
        {laToi ? <Text style={styles.me}> (bạn)</Text> : null}
      </Text>
      <Text style={[styles.balance, { color: soDu.mau }]}>{soDu.chu}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  me: {
    color: colors.textMuted,
  },
  balance: {
    fontSize: 14,
    fontWeight: '600',
  },
});
