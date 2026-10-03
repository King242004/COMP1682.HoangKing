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

// Lịch tháng. Ngày có ảnh thì hiện ảnh đó (giống CapMoney); ngày nào cũng hiện
// đã tiêu bao nhiêu (đỏ), hoặc với ngày chỉ có thu thì hiện đã nhận bao nhiêu (xanh lá).
// Màu nền của ngày tương lai, theo khoản quan trọng nhất ngày đó: nợ nhóm, rồi kế hoạch nhóm,
// rồi tiền vào, rồi khoản phải trả cá nhân.
function mauNgayTuongLai(cacKhoan: KhoanTrenLich[]): string | null {
  if (cacKhoan.some((khoan) => khoan.nguon === 'no_nhom')) {
    return colors.warningBackground;
  }
  if (cacKhoan.some((khoan) => khoan.nguon === 'ke_hoach_nhom')) {
    return colors.groupBackground;
  }
  if (cacKhoan.some((khoan) => khoan.loai === 'thu')) {
    return colors.upcomingIncomeBackground;
  }
  return cacKhoan.length > 0 ? colors.upcomingExpenseBackground : null;
}

export default function LichThang({ thang, danhSachGiaoDich, khoanTrenLich, khiChonNgay }: LichThangProps) {
  const ngayDau = startOfMonth(thang);
  const ngayCuoi = endOfMonth(thang);
  const homNay = todayKey();

  // Cộng thu và chi cho từng ngày trong tháng.
  const tongTheoNgay: Record<string, TongNgay> = {};
  for (const giaoDich of danhSachGiaoDich) {
    const tong = tongTheoNgay[giaoDich.ngay] ?? { chi: 0, thu: 0, anhUrl: null };
    tong[giaoDich.loai] += giaoDich.soTien;
    tong.anhUrl = tong.anhUrl ?? giaoDich.anhUrl;
    tongTheoNgay[giaoDich.ngay] = tong;
  }

  // Các ô trống trước ngày 1 để ngày 1 rơi đúng cột thứ trong tuần.
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
          const moTaSapToi = khoanNgayNay.length > 0 ? `, sắp tới: ${khoanNgayNay.map((khoan) => khoan.ten).join(', ')}` : '';
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
  // Số màu trắng có viền tối để đọc được trên mọi ảnh.
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
