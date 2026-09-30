import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../colors';
import { addDays, formatDateKey, todayKey } from '../dateKey';

type ChonNgayProps = {
  ngay: string;
  khiDoi: (ngay: string) => void;
  // Earliest allowed day (e.g. today for a promise or a plan). No limit when left out.
  ngayNhoNhat?: string;
};

// Pick a day without a calendar library: « −7 days · ‹ −1 day · the day · › +1 day · » +7 days.
export default function ChonNgay({ ngay, khiDoi, ngayNhoNhat }: ChonNgayProps) {
  function doi(soNgay: number) {
    const ngayMoi = addDays(ngay, soNgay);
    khiDoi(ngayNhoNhat && ngayMoi < ngayNhoNhat ? ngayNhoNhat : ngayMoi);
  }

  const nut = (soNgay: number, icon: keyof typeof Ionicons.glyphMap, nhan: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={nhan} onPress={() => doi(soNgay)} style={styles.button}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </Pressable>
  );

  return (
    <View style={styles.row}>
      {nut(-7, 'play-back-outline', 'Lùi một tuần')}
      {nut(-1, 'chevron-back', 'Lùi một ngày')}
      <Text style={styles.text}>{ngay === todayKey() ? `Hôm nay, ${formatDateKey(ngay)}` : formatDateKey(ngay)}</Text>
      {nut(1, 'chevron-forward', 'Tiến một ngày')}
      {nut(7, 'play-forward-outline', 'Tiến một tuần')}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 14,
  },
  button: {
    minWidth: 44,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
});
