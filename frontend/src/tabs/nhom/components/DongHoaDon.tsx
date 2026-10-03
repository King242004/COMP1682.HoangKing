import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { HoaDon } from '../../../api/NhomApi';
import colors from '../../../shared/colors';
import { formatDateKey } from '../../../shared/dateKey';
import formatMoney from '../../../shared/formatMoney';
import { thumbnailUrl } from '../../../shared/uploadImage';

type DongHoaDonProps = {
  hoaDon: HoaDon;
  nguoiDungId: number;
  khiBam: () => void;
};

// Một hóa đơn của nhóm: ai trả bao nhiêu, và phần của tôi trong đó.
export default function DongHoaDon({ hoaDon, nguoiDungId, khiBam }: DongHoaDonProps) {
  const phanCuaToi = hoaDon.phanChia.find((phan) => phan.nguoiDungId === nguoiDungId)?.soTien ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${hoaDon.ten}, ${hoaDon.tenNguoiTra} trả ${formatMoney(hoaDon.soTien)}`}
      onPress={khiBam}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {hoaDon.anhUrl ? (
        <Image source={{ uri: thumbnailUrl(hoaDon.anhUrl, 120) }} style={styles.icon} />
      ) : (
        <View style={styles.icon}>
          <Ionicons name={hoaDon.bieuTuongDanhMuc as keyof typeof Ionicons.glyphMap} size={20} color={colors.group} />
        </View>
      )}
      <View style={styles.text}>
        <Text style={styles.name}>{hoaDon.ten}</Text>
        <Text style={styles.detail}>
          {hoaDon.tenNguoiTra} trả · {formatDateKey(hoaDon.ngay)}
        </Text>
      </View>
      <View style={styles.amounts}>
        <Text style={styles.total}>{formatMoney(hoaDon.soTien)}</Text>
        <Text style={styles.myShare}>{phanCuaToi > 0 ? `Phần bạn ${formatMoney(phanCuaToi)}` : 'Bạn không chịu'}</Text>
      </View>
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  amounts: {
    alignItems: 'flex-end',
  },
  total: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  myShare: {
    fontSize: 12,
    color: colors.group,
    marginTop: 2,
  },
});
