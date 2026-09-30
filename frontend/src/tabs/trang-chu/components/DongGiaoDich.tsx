import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { GiaoDich } from '../../../api/GiaoDichApi';
import colors from '../../../shared/colors';
import formatMoney from '../../../shared/formatMoney';
import { thumbnailUrl } from '../../../shared/uploadImage';

type DongGiaoDichProps = {
  giaoDich: GiaoDich;
  khiBam: () => void;
};

// One income/expense row: photo (or category icon), category name, note and wallet, then the amount.
export default function DongGiaoDich({ giaoDich, khiBam }: DongGiaoDichProps) {
  const laChi = giaoDich.loai === 'chi';
  const soTien = laChi ? -giaoDich.soTien : giaoDich.soTien;
  const tuNhom = giaoDich.nguon === 'nhom';
  // For my share of a group bill: bill name · group name.
  const moTa = [giaoDich.ghiChu, tuNhom ? `nhóm ${giaoDich.tenVi}` : giaoDich.tenVi].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${giaoDich.tenDanhMuc}, ${laChi ? 'chi' : 'thu'} ${formatMoney(giaoDich.soTien)}`}
      onPress={khiBam}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {giaoDich.anhUrl ? (
        <Image source={{ uri: thumbnailUrl(giaoDich.anhUrl, 120) }} style={styles.icon} />
      ) : (
        <View style={styles.icon}>
          <Ionicons
            name={giaoDich.bieuTuongDanhMuc as keyof typeof Ionicons.glyphMap}
            size={20}
            color={tuNhom ? colors.group : colors.primary}
          />
        </View>
      )}
      <View style={styles.text}>
        <Text style={styles.category}>
          {giaoDich.tenDanhMuc}
          {tuNhom ? <Text style={styles.groupTag}> · phần của bạn</Text> : null}
        </Text>
        <Text style={styles.note} numberOfLines={1}>
          {moTa}
        </Text>
      </View>
      <Text style={[styles.amount, { color: laChi ? colors.expense : colors.income }]}>
        {laChi ? '' : '+'}
        {formatMoney(soTien)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderRadius: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  groupTag: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.group,
  },
  note: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
});
