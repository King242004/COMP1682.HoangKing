import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import type { KhoanTrenLich } from '../../../api/DuBaoApi';
import type { GiaoDich } from '../../../api/GiaoDichApi';
import colors from '../../../shared/colors';
import { addDays, endOfMonth, startOfMonth, todayKey, weekdayIndex } from '../../../shared/dateKey';
import formatMoney, { formatShortMoney } from '../../../shared/formatMoney';
import { thumbnailUrl } from '../../../shared/uploadImage';

type LichThangProps = {
  thang: string;
  danhSachGiaoDich: GiaoDich[];
  khoanTrenLich: KhoanTrenLich[];
  khiChonNgay: (ngay: string) => void;
};

const TEN_THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

type TongNgay = { chi: number; thu: number; anhUrl: string | null };

// Month calendar. A day with a photo shows that photo (like CapMoney); every day also shows
// how much was spent (red) or, on days with only income, received (green).
// Fill color of a future day, from its most important upcoming item: group debt, then group plan,
// then money coming in, then a personal payment.
function mauNgayTuongLai(khoan: KhoanTrenLich[]): string | null {
  if (khoan.some((k) => k.nguon === 'no_nhom')) {
    return colors.warningBackground;
  }
  if (khoan.some((k) => k.nguon === 'ke_hoach_nhom')) {
    return colors.groupBackground;
  }
  if (khoan.some((k) => k.loai === 'thu')) {
    return colors.upcomingIncomeBackground;
  }
  return khoan.length > 0 ? colors.upcomingExpenseBackground : null;
}

export default function LichThang({ thang, danhSachGiaoDich, khoanTrenLich, khiChonNgay }: LichThangProps) {
  const ngayDau = startOfMonth(thang);
  const ngayCuoi = endOfMonth(thang);
  const homNay = todayKey();

  // Add up income and spending for each day of the month.
  const tongTheoNgay: Record<string, TongNgay> = {};
  for (const giaoDich of danhSachGiaoDich) {
    const tong = tongTheoNgay[giaoDich.ngay] ?? { chi: 0, thu: 0, anhUrl: null };
    tong[giaoDich.loai] += giaoDich.soTien;
    tong.anhUrl = tong.anhUrl ?? giaoDich.anhUrl;
    tongTheoNgay[giaoDich.ngay] = tong;
  }

  // Empty cells before day 1 so it lands under the right weekday.
  const oTrong = Array.from({ length: weekdayIndex(ngayDau) }, (_, index) => `trong-${index}`);
  const cacNgay: string[] = [];
  for (let ngay = ngayDau; ngay <= ngayCuoi; ngay = addDays(ngay, 1)) {
    cacNgay.push(ngay);
  }

  return (
    <View style={styles.card}>
      <View style={styles.grid}>
        {TEN_THU.map((tenThu) => (
          <Text key={tenThu} style={[styles.cell, styles.weekday]}>
            {tenThu}
          </Text>
        ))}
        {oTrong.map((key) => (
          <View key={key} style={styles.cell} />
        ))}
        {cacNgay.map((ngay) => {
          const tong = tongTheoNgay[ngay];
          const soNgay = Number(ngay.slice(8));
          const khoanNgayNay = khoanTrenLich.filter((khoan) => khoan.ngay === ngay);
          const mauTuongLai = mauNgayTuongLai(khoanNgayNay);
          const moTaSapToi = khoanNgayNay.length > 0 ? `, sắp tới: ${khoanNgayNay.map((k) => k.ten).join(', ')}` : '';
          const moTaTien = tong
            ? `chi ${formatMoney(tong.chi)}, thu ${formatMoney(tong.thu)}`
            : 'chưa có khoản nào';
          return (
            <Pressable
              key={ngay}
              accessibilityRole="button"
              accessibilityLabel={`Ngày ${soNgay}, ${moTaTien}${moTaSapToi}`}
              onPress={() => khiChonNgay(ngay)}
              style={styles.cell}
            >
              {tong?.anhUrl ? (
                <ImageBackground
                  source={{ uri: thumbnailUrl(tong.anhUrl, 90) }}
                  style={[styles.dayCircle, ngay === homNay && styles.todayRing]}
                  imageStyle={styles.dayPhoto}
                >
                  <Text style={styles.dayNumberOnPhoto}>{soNgay}</Text>
                </ImageBackground>
              ) : (
                <View
                  style={[
                    styles.dayCircle,
                    mauTuongLai !== null && { backgroundColor: mauTuongLai },
                    ngay === homNay && styles.today,
                  ]}
                >
                  <Text style={[styles.dayNumber, ngay === homNay && styles.todayText]}>{soNgay}</Text>
                </View>
              )}
              {tong && tong.chi > 0 ? (
                <Text style={[styles.dayAmount, { color: colors.expense }]}>{formatShortMoney(tong.chi)}</Text>
              ) : tong && tong.thu > 0 ? (
                <Text style={[styles.dayAmount, { color: colors.income }]}>+{formatShortMoney(tong.thu)}</Text>
              ) : (
                <Text style={styles.dayAmount}> </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: 52,
  },
  weekday: {
    minHeight: 24,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {
    backgroundColor: colors.primary,
  },
  dayNumber: {
    fontSize: 14,
    color: colors.text,
  },
  todayText: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  todayRing: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayPhoto: {
    borderRadius: 15,
  },
  // White number with a dark outline so it stays readable on any photo.
  dayNumberOnPhoto: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onPrimary,
    textShadowColor: colors.photoTextShadow,
    textShadowRadius: 3,
  },
  dayAmount: {
    fontSize: 11,
    marginTop: 2,
    color: colors.textMuted,
  },
});
