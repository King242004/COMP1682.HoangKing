import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getDuBao, type DuBao } from '../../api/DuBaoApi';
import { getGiaoDichList, type GiaoDich } from '../../api/GiaoDichApi';
import { getViList, type Vi } from '../../api/ViApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import { addDays, addMonths, endOfMonth, formatDateKey, formatMonth, startOfMonth, todayKey } from '../../shared/dateKey';
import formatMoney from '../../shared/formatMoney';
import DongGiaoDich from './components/DongGiaoDich';
import DongKhoanSapToi from './components/DongKhoanSapToi';
import DongNhac from './components/DongNhac';
import LichThang from './components/LichThang';
import LocTheoVi from './components/LocTheoVi';
import TheChiThu from './components/TheChiThu';
import TheMoiNgayDuocTieu from './components/TheMoiNgayDuocTieu';

type CheDo = 'ngay' | 'thang';

const SO_NGAY_SAP_TOI = 7;

function tinhTong(danhSach: GiaoDich[], loai: 'thu' | 'chi'): number {
  return danhSach.filter((giaoDich) => giaoDich.loai === loai).reduce((tong, giaoDich) => tong + giaoDich.soTien, 0);
}

// Home tab (tai-lieu/Evenwise.md, section 6): greeting, ⭐ "Mỗi ngày được tiêu", reminders,
// Day/Month switch, income/expense cards, wallet filter, then the day list or the month calendar
// (past days = spending, future days = upcoming items).
export default function TrangChu() {
  const { token, nguoiDung } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();

  const [cheDo, setCheDo] = useState<CheDo>('thang');
  const [ngayDangXem, setNgayDangXem] = useState(todayKey());
  const [viDangLoc, setViDangLoc] = useState<number | null>(null);

  const [danhSachVi, setDanhSachVi] = useState<Vi[]>([]);
  const [danhSachGiaoDich, setDanhSachGiaoDich] = useState<GiaoDich[]>([]);
  const [daChiHomNay, setDaChiHomNay] = useState(0);
  const [duBao, setDuBao] = useState<DuBao | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');

  const homNay = todayKey();
  const tuNgay = cheDo === 'ngay' ? ngayDangXem : startOfMonth(ngayDangXem);
  const denNgay = cheDo === 'ngay' ? ngayDangXem : endOfMonth(ngayDangXem);
  // Upcoming items: the whole month on the calendar, or the next 7 days in Day mode.
  const lichTu = cheDo === 'ngay' ? homNay : tuNgay;
  const lichDen = cheDo === 'ngay' ? addDays(homNay, SO_NGAY_SAP_TOI - 1) : denNgay;

  // Reload whenever the screen is shown again (e.g. after recording an expense) or the view changes.
  useFocusEffect(
    useCallback(() => {
      async function taiDuLieu() {
        if (!token) {
          return;
        }
        setLoi('');
        try {
          const [viList, giaoDichList, giaoDichHomNay, duBaoMoi] = await Promise.all([
            getViList(token),
            getGiaoDichList(token, tuNgay, denNgay, viDangLoc),
            getGiaoDichList(token, homNay, homNay, null),
            getDuBao(token, lichTu, lichDen),
          ]);
          setDanhSachVi(viList);
          setDanhSachGiaoDich(giaoDichList);
          setDaChiHomNay(tinhTong(giaoDichHomNay, 'chi'));
          setDuBao(duBaoMoi);
        } catch (error) {
          setLoi(error instanceof Error ? error.message : 'Không tải được dữ liệu');
        } finally {
          setDangTai(false);
        }
      }
      taiDuLieu();
    }, [token, tuNgay, denNgay, viDangLoc, homNay, lichTu, lichDen]),
  );

  function luiHoacTien(buoc: number) {
    setNgayDangXem(cheDo === 'ngay' ? addDays(ngayDangXem, buoc) : addMonths(ngayDangXem, buoc));
  }

  // A personal transaction opens for editing; my share of a group bill opens its group.
  function moGiaoDich(giaoDich: GiaoDich) {
    if (giaoDich.nguon === 'nhom' && giaoDich.nhomId !== null) {
      navigation.navigate('ChiTietNhom', { nhomId: giaoDich.nhomId });
    } else {
      navigation.navigate('GhiKhoan', { giaoDich });
    }
  }

  const nhanKy = cheDo === 'ngay' ? (ngayDangXem === homNay ? 'hôm nay' : 'ngày này') : 'tháng này';
  const tieuDeKy =
    cheDo === 'ngay' ? `${ngayDangXem === homNay ? 'Hôm nay, ' : ''}${formatDateKey(ngayDangXem)}` : formatMonth(ngayDangXem);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Xin chào</Text>
        <Text style={styles.name}>{nguoiDung?.tenHienThi}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {daChiHomNay > 0 ? `Đã chi ${formatMoney(daChiHomNay)} hôm nay` : 'Hôm nay chưa chi tiêu'}
          </Text>
        </View>

        <TheMoiNgayDuocTieu duBao={duBao} khiTaoVi={() => navigation.navigate('Vi')} />

        {duBao?.nhacNho.map((nhacNho) => (
          <View key={nhacNho.noiDung} style={styles.spaced}>
            <DongNhac
              nhacNho={nhacNho}
              khiBam={() => nhacNho.nhomId > 0 && navigation.navigate('HenTraNo', { nhomId: nhacNho.nhomId })}
            />
          </View>
        ))}

        <View style={[styles.segment, styles.spacedLarge]}>
          {(['ngay', 'thang'] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: cheDo === option }}
              onPress={() => setCheDo(option)}
              style={[styles.segmentItem, cheDo === option && styles.segmentItemSelected]}
            >
              <Text style={[styles.segmentText, cheDo === option && styles.segmentTextSelected]}>
                {option === 'ngay' ? 'Ngày' : 'Tháng'}
              </Text>
            </Pressable>
          ))}
        </View>

        <TheChiThu tongChi={tinhTong(danhSachGiaoDich, 'chi')} tongThu={tinhTong(danhSachGiaoDich, 'thu')} nhanKy={nhanKy} />

        <View style={styles.spaced}>
          <LocTheoVi danhSachVi={danhSachVi} viDangLoc={viDangLoc} khiChon={setViDangLoc} />
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

        {dangTai ? (
          <ActivityIndicator color={colors.primary} style={styles.spaced} />
        ) : cheDo === 'thang' ? (
          <>
            <LichThang
              thang={ngayDangXem}
              danhSachGiaoDich={danhSachGiaoDich}
              khoanTrenLich={duBao?.khoanTrenLich ?? []}
              khiChonNgay={(ngay) => navigation.navigate('ChiTietNgay', { ngay })}
            />
            <Text style={styles.legend}>
              Số đỏ = đã chi · ô xanh = khoản sắp chi · ô xanh lá = tiền sắp vào · ô vàng = trả nợ nhóm · ô tím = kế hoạch nhóm
            </Text>
          </>
        ) : (
          <>
            {danhSachGiaoDich.length === 0 ? (
              <Text style={styles.empty}>Chưa có khoản nào trong ngày này.</Text>
            ) : (
              <View style={styles.list}>
                {danhSachGiaoDich.map((giaoDich) => (
                  <DongGiaoDich key={`${giaoDich.nguon}-${giaoDich.id}`} giaoDich={giaoDich} khiBam={() => moGiaoDich(giaoDich)} />
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Sắp tới trong {SO_NGAY_SAP_TOI} ngày</Text>
            {(duBao?.khoanTrenLich.length ?? 0) === 0 ? (
              <Text style={styles.emptyLeft}>Không có khoản nào.</Text>
            ) : (
              <View style={styles.list}>
                {duBao?.khoanTrenLich.map((khoan) => (
                  <DongKhoanSapToi key={`${khoan.ngay}-${khoan.nguon}-${khoan.ten}`} khoan={khoan} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ghi khoản mới"
        onPress={() => navigation.navigate('GhiKhoan', { ngay: cheDo === 'ngay' ? ngayDangXem : homNay })}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
      >
        <Ionicons name="add" size={30} color={colors.onPrimary} />
      </Pressable>
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
    paddingTop: 12,
    paddingBottom: 100,
  },
  greeting: {
    fontSize: 15,
    color: colors.textMuted,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 999,
    padding: 4,
    marginBottom: 12,
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
  spaced: {
    marginTop: 10,
  },
  spacedLarge: {
    marginTop: 18,
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
  legend: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyLeft: {
    fontSize: 15,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  list: {
    gap: 8,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
