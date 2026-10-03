import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getDuBao, type KhoanTrenLich } from '../../api/DuBaoApi';
import { getGiaoDichList, type GiaoDich } from '../../api/GiaoDichApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import PrimaryButton from '../../shared/components/PrimaryButton';
import formatMoney from '../../shared/formatMoney';
import DongGiaoDich from './components/DongGiaoDich';
import DongKhoanSapToi from './components/DongKhoanSapToi';

type Props = NativeStackScreenProps<MainStackParams, 'ChiTietNgay'>;

// Một ngày, mở từ lịch tháng: hôm đó đã chi hoặc thu những gì,
// và (với hôm nay hoặc ngày tương lai) hôm đó có khoản nào sắp tới.
export default function ChiTietNgay({ route, navigation }: Props) {
  const { ngay } = route.params;
  const { token } = useAuth();
  const [danhSachGiaoDich, setDanhSachGiaoDich] = useState<GiaoDich[]>([]);
  const [khoanSapToi, setKhoanSapToi] = useState<KhoanTrenLich[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function taiDuLieu() {
        if (!token) {
          return;
        }
        try {
          const [giaoDichList, duBao] = await Promise.all([
            getGiaoDichList(token, ngay, ngay, null),
            getDuBao(token, ngay, ngay),
          ]);
          setDanhSachGiaoDich(giaoDichList);
          setKhoanSapToi(duBao.khoanTrenLich);
        } catch (error) {
          setLoi(error instanceof Error ? error.message : 'Không tải được dữ liệu');
        } finally {
          setDangTai(false);
        }
      }
      taiDuLieu();
    }, [token, ngay]),
  );

  function moGiaoDich(giaoDich: GiaoDich) {
    if (giaoDich.nguon === 'nhom' && giaoDich.nhomId !== null) {
      navigation.navigate('ChiTietNhom', { nhomId: giaoDich.nhomId });
    } else {
      navigation.navigate('GhiKhoan', { giaoDich });
    }
  }

  const tongChi = danhSachGiaoDich
    .filter((giaoDich) => giaoDich.loai === 'chi')
    .reduce((tong, giaoDich) => tong + giaoDich.soTien, 0);
  const tongThu = danhSachGiaoDich
    .filter((giaoDich) => giaoDich.loai === 'thu')
    .reduce((tong, giaoDich) => tong + giaoDich.soTien, 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Chi <Text style={{ color: colors.expense }}>{formatMoney(tongChi)}</Text> · Thu{' '}
          <Text style={{ color: colors.income }}>{formatMoney(tongThu)}</Text>
        </Text>
      </View>

      {loi ? (
        <Text style={styles.error} accessibilityRole="alert">
          {loi}
        </Text>
      ) : null}

      {dangTai ? (
        <ActivityIndicator color={colors.primary} />
      ) : danhSachGiaoDich.length === 0 ? (
        <Text style={styles.empty}>Chưa có khoản nào trong ngày này.</Text>
      ) : (
        danhSachGiaoDich.map((giaoDich) => (
          <DongGiaoDich key={`${giaoDich.nguon}-${giaoDich.id}`} giaoDich={giaoDich} khiBam={() => moGiaoDich(giaoDich)} />
        ))
      )}

      {khoanSapToi.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Sắp tới trong ngày này</Text>
          {khoanSapToi.map((khoan) => (
            <DongKhoanSapToi key={`${khoan.nguon}-${khoan.ten}`} khoan={khoan} />
          ))}
        </>
      ) : null}

      <View style={styles.addButton}>
        <PrimaryButton title="+ Thêm khoản cho ngày này" onPress={() => navigation.navigate('GhiKhoan', { ngay })} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 8,
  },
  summary: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  addButton: {
    marginTop: 12,
  },
});
