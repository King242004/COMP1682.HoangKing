import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getThongKe, type ThongKe as ThongKeData } from '../../api/ThongKeApi';
import { useAuth } from '../../auth/AuthContext';
import colors from '../../shared/colors';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  formatDateKey,
  formatMonth,
  startOfMonth,
  startOfWeek,
  todayKey,
} from '../../shared/dateKey';
import formatMoney from '../../shared/formatMoney';
import ThanhDanhMuc from './components/ThanhDanhMuc';

type Ky = 'tuan' | 'thang';

// Tab Thống kê: thu, chi và chênh lệch trong một tuần hoặc một tháng,
// sau đó là chi theo từng danh mục, từ lớn tới nhỏ.
export default function ThongKe() {
  const { token } = useAuth();
  const [ky, setKy] = useState<Ky>('thang');
  const [ngayMoc, setNgayMoc] = useState(todayKey());
  const [thongKe, setThongKe] = useState<ThongKeData | null>(null);
  const [loi, setLoi] = useState('');

  const tuNgay = ky === 'tuan' ? startOfWeek(ngayMoc) : startOfMonth(ngayMoc);
  const denNgay = ky === 'tuan' ? endOfWeek(ngayMoc) : endOfMonth(ngayMoc);

  useFocusEffect(
    useCallback(() => {
      async function taiDuLieu() {
        if (!token) {
          return;
        }
        setLoi('');
        try {
          setThongKe(await getThongKe(token, tuNgay, denNgay));
        } catch (error) {
          setLoi(error instanceof Error ? error.message : 'Không tải được thống kê');
        }
      }
      taiDuLieu();
    }, [token, tuNgay, denNgay]),
  );

  function luiHoacTien(buoc: number) {
    setNgayMoc(ky === 'tuan' ? addDays(ngayMoc, buoc * 7) : addMonths(ngayMoc, buoc));
  }

  const tieuDeKy =
    ky === 'tuan' ? `${formatDateKey(tuNgay)} – ${formatDateKey(denNgay)}` : formatMonth(ngayMoc);
  const lonNhat = thongKe?.chiTheoDanhMuc[0]?.soTien ?? 0;
  const chenhLech = thongKe ? thongKe.tongThu - thongKe.tongChi : 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Thống kê</Text>

        <View style={styles.segment}>
          {(['tuan', 'thang'] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: ky === option }}
              onPress={() => setKy(option)}
              style={[styles.segmentItem, ky === option && styles.segmentItemSelected]}
            >
              <Text style={[styles.segmentText, ky === option && styles.segmentTextSelected]}>
                {option === 'tuan' ? 'Tuần' : 'Tháng'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.periodRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Kỳ trước" onPress={() => luiHoacTien(-1)} style={styles.periodButton}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <Text style={styles.periodText}>{tieuDeKy}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Kỳ sau" onPress={() => luiHoacTien(1)} style={styles.periodButton}>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </Pressable>
        </View>

        {loi ? (
          <Text style={styles.error} accessibilityRole="alert">
            {loi}
          </Text>
        ) : null}

        {!thongKe ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <View style={styles.totals}>
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Thu</Text>
                <Text style={[styles.totalAmount, { color: colors.income }]}>{formatMoney(thongKe.tongThu)}</Text>
              </View>
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Chi</Text>
                <Text style={[styles.totalAmount, { color: colors.expense }]}>{formatMoney(thongKe.tongChi)}</Text>
              </View>
            </View>
            <View style={styles.differenceCard}>
              <Text style={styles.totalLabel}>Chênh lệch (thu − chi)</Text>
              <Text style={[styles.totalAmount, { color: chenhLech < 0 ? colors.expense : colors.income }]}>
                {chenhLech > 0 ? '+' : ''}
                {formatMoney(chenhLech)}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Chi theo danh mục</Text>
              {thongKe.chiTheoDanhMuc.length === 0 ? (
                <Text style={styles.empty}>Chưa có khoản chi nào trong kỳ này.</Text>
              ) : (
                thongKe.chiTheoDanhMuc.map((muc) => (
                  <ThanhDanhMuc key={muc.danhMucId} muc={muc} lonNhat={lonNhat} tongChi={thongKe.tongChi} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 999,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemSelected: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  segmentTextSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 14,
    marginVertical: 12,
  },
  periodButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  totals: {
    flexDirection: 'row',
    gap: 10,
  },
  totalCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
  },
  differenceCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    paddingVertical: 12,
  },
});
