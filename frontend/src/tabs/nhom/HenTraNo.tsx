import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { boHenTraNo, henTraNo } from '../../api/HenTraNoApi';
import { getChiTietNhom, type ChiTietNhom } from '../../api/NhomApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import ChonNgay from '../../shared/components/ChonNgay';
import PrimaryButton from '../../shared/components/PrimaryButton';
import { addDays, formatDateKey, todayKey } from '../../shared/dateKey';
import formatMoney from '../../shared/formatMoney';

type Props = NativeStackScreenProps<MainStackParams, 'HenTraNo'>;

// "Tôi sẽ trả hết nợ nhóm này trước …". Dự báo sẽ tính khoản nợ vào ngày đó
// thay vì hôm nay, và Trang chủ nhắc từ 2 ngày trước (vàng) hoặc khi đã quá hẹn (đỏ).
export default function HenTraNo({ route, navigation }: Props) {
  const { nhomId } = route.params;
  const { token, nguoiDung } = useAuth();
  const [chiTiet, setChiTiet] = useState<ChiTietNhom | null>(null);
  const [ngayHen, setNgayHen] = useState(addDays(todayKey(), 7));
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function taiDuLieu() {
        if (!token) {
          return;
        }
        try {
          const chiTietMoi = await getChiTietNhom(token, nhomId);
          setChiTiet(chiTietMoi);
          const henCu = chiTietMoi.danhSachHenTra.find((hen) => hen.nguoiDungId === nguoiDung?.id);
          if (henCu && henCu.ngayHen >= todayKey()) {
            setNgayHen(henCu.ngayHen);
          }
        } catch (error) {
          setLoi(error instanceof Error ? error.message : 'Không tải được nhóm');
        }
      }
      taiDuLieu();
    }, [token, nhomId, nguoiDung]),
  );

  async function lamViec(viec: () => Promise<void>) {
    setLoi('');
    setDangLuu(true);
    try {
      await viec();
      navigation.goBack();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại');
      setDangLuu(false);
    }
  }

  if (!chiTiet || !token) {
    return (
      <View style={styles.center}>
        {loi ? <Text style={styles.error}>{loi}</Text> : <ActivityIndicator size="large" color={colors.primary} />}
      </View>
    );
  }

  const soDuCuaToi = chiTiet.thanhVien.find((nguoi) => nguoi.id === nguoiDung?.id)?.soDu ?? 0;
  const henHienTai = chiTiet.danhSachHenTra.find((hen) => hen.nguoiDungId === nguoiDung?.id);
  const tokenDangDung = token;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.groupName}>{chiTiet.nhom.ten}</Text>
        <Text style={[styles.debt, { color: soDuCuaToi < 0 ? colors.expense : colors.textMuted }]}>
          {soDuCuaToi < 0 ? `Bạn đang nợ ${formatMoney(-soDuCuaToi)}` : 'Bạn không nợ nhóm này'}
        </Text>
        {henHienTai ? <Text style={styles.detail}>Đang hẹn trả ngày {formatDateKey(henHienTai.ngayHen)}</Text> : null}
      </View>

      <Text style={styles.label}>Tôi sẽ trả hết vào ngày</Text>
      <ChonNgay ngay={ngayHen} khiDoi={setNgayHen} ngayNhoNhat={todayKey()} />
      <Text style={styles.hint}>
        Mọi người trong nhóm đều thấy ngày hẹn này. App nhắc bạn từ 2 ngày trước ngày hẹn.
      </Text>

      {loi ? (
        <Text style={styles.error} accessibilityRole="alert">
          {loi}
        </Text>
      ) : null}

      <PrimaryButton title="Lưu ngày hẹn" onPress={() => lamViec(() => henTraNo(tokenDangDung, nhomId, ngayHen))} loading={dangLuu} />
      {henHienTai ? (
        <Pressable accessibilityRole="button" onPress={() => lamViec(() => boHenTraNo(tokenDangDung, nhomId))} style={styles.removeButton}>
          <Text style={styles.removeText}>Bỏ hẹn</Text>
        </Pressable>
      ) : null}
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
    gap: 12,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  debt: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  detail: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  removeButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.dangerText,
    fontSize: 16,
    fontWeight: '600',
  },
});
