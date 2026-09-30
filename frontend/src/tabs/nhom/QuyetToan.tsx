import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getChiTietNhom, type ChiTietNhom, type LanChuyen, type ThanhToan } from '../../api/NhomApi';
import { huyThanhToan, traTien, xacNhanDaNhan } from '../../api/ThanhToanNhomApi';
import { getViList, type Vi } from '../../api/ViApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import ChonVi from '../../shared/components/ChonVi';
import formatMoney from '../../shared/formatMoney';

type Props = NativeStackScreenProps<MainStackParams, 'QuyetToan'>;

// Settle up: who should pay whom (fewest transfers), payments waiting for confirmation, and finished ones.
// A payment counts only after the payer says "Đã trả" AND the receiver says "Đã nhận".
export default function QuyetToan({ route }: Props) {
  const { nhomId } = route.params;
  const { token, nguoiDung } = useAuth();
  const [chiTiet, setChiTiet] = useState<ChiTietNhom | null>(null);
  const [danhSachVi, setDanhSachVi] = useState<Vi[]>([]);
  const [viId, setViId] = useState<number | null>(null);
  const [loi, setLoi] = useState('');

  const taiDuLieu = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoi('');
    try {
      const [chiTietMoi, viList] = await Promise.all([getChiTietNhom(token, nhomId), getViList(token)]);
      setChiTiet(chiTietMoi);
      setDanhSachVi(viList);
      setViId((dangChon) => dangChon ?? viList[0]?.id ?? null);
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tải được dữ liệu');
    }
  }, [token, nhomId]);

  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, [taiDuLieu]),
  );

  async function lamViec(viec: () => Promise<void>) {
    setLoi('');
    try {
      await viec();
      await taiDuLieu();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại');
    }
  }

  if (!chiTiet || !nguoiDung || !token) {
    return (
      <View style={styles.center}>
        {loi ? <Text style={styles.error}>{loi}</Text> : <ActivityIndicator size="large" color={colors.primary} />}
      </View>
    );
  }

  const toiId = nguoiDung.id;
  const tokenDangDung = token;
  function tenCua(nguoiDungId: number): string {
    if (nguoiDungId === toiId) {
      return 'Bạn';
    }
    return chiTiet?.thanhVien.find((nguoi) => nguoi.id === nguoiDungId)?.tenHienThi ?? '?';
  }

  const dangCho = chiTiet.danhSachThanhToan.filter((thanhToan) => thanhToan.trangThai === 'cho');
  const daXong = chiTiet.danhSachThanhToan.filter((thanhToan) => thanhToan.trangThai === 'da_nhan');

  function hoiTraTien(lan: LanChuyen) {
    Alert.alert('Xác nhận đã trả', `Bạn đã chuyển ${formatMoney(lan.soTien)} cho ${tenCua(lan.nguoiNhanId)}?`, [
      { text: 'Chưa', style: 'cancel' },
      { text: 'Đã trả', onPress: () => lamViec(() => traTien(tokenDangDung, nhomId, lan.nguoiNhanId, lan.soTien, viId)) },
    ]);
  }

  function hoiDaNhan(thanhToan: ThanhToan) {
    Alert.alert('Xác nhận đã nhận', `Bạn đã nhận ${formatMoney(thanhToan.soTien)} từ ${thanhToan.tenNguoiTra}?`, [
      { text: 'Chưa', style: 'cancel' },
      { text: 'Đã nhận', onPress: () => lamViec(() => xacNhanDaNhan(tokenDangDung, nhomId, thanhToan.id, viId)) },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {loi ? (
        <Text style={styles.error} accessibilityRole="alert">
          {loi}
        </Text>
      ) : null}

      {danhSachVi.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ví dùng khi bạn trả hoặc nhận</Text>
          <ChonVi danhSach={danhSachVi} viDangChon={viId} khiChon={setViId} />
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cần chuyển</Text>
        {chiTiet.deXuatQuyetToan.length === 0 ? (
          <Text style={styles.empty}>Mọi người đã hòa, không ai nợ ai.</Text>
        ) : (
          chiTiet.deXuatQuyetToan.map((lan) => {
            const daBamTra = dangCho.some(
              (thanhToan) => thanhToan.nguoiTraId === lan.nguoiTraId && thanhToan.nguoiNhanId === lan.nguoiNhanId,
            );
            return (
              <View key={`${lan.nguoiTraId}-${lan.nguoiNhanId}`} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.transfer}>
                    {tenCua(lan.nguoiTraId)} <Ionicons name="arrow-forward" size={14} color={colors.text} /> {tenCua(lan.nguoiNhanId)}
                  </Text>
                  <Text style={styles.amount}>{formatMoney(lan.soTien)}</Text>
                </View>
                {daBamTra ? (
                  <Text style={styles.status}>Chờ xác nhận</Text>
                ) : lan.nguoiTraId === toiId ? (
                  <Pressable accessibilityRole="button" onPress={() => hoiTraTien(lan)} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Tôi đã trả</Text>
                  </Pressable>
                ) : lan.nguoiNhanId === toiId ? (
                  <Text style={styles.status}>Chờ {tenCua(lan.nguoiTraId)} trả</Text>
                ) : null}
              </View>
            );
          })
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đang chờ xác nhận</Text>
        {dangCho.length === 0 ? (
          <Text style={styles.empty}>Không có.</Text>
        ) : (
          dangCho.map((thanhToan) => (
            <View key={thanhToan.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.transfer}>
                  {tenCua(thanhToan.nguoiTraId)} đã trả {tenCua(thanhToan.nguoiNhanId)}
                </Text>
                <Text style={styles.amount}>{formatMoney(thanhToan.soTien)}</Text>
              </View>
              {thanhToan.nguoiNhanId === toiId ? (
                <Pressable accessibilityRole="button" onPress={() => hoiDaNhan(thanhToan)} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Đã nhận</Text>
                </Pressable>
              ) : thanhToan.nguoiTraId === toiId ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => lamViec(() => huyThanhToan(tokenDangDung, nhomId, thanhToan.id))}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Hủy</Text>
                </Pressable>
              ) : (
                <Text style={styles.status}>Chờ {thanhToan.tenNguoiNhan}</Text>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đã xong</Text>
        {daXong.length === 0 ? (
          <Text style={styles.empty}>Chưa có lần trả nào.</Text>
        ) : (
          daXong.map((thanhToan) => (
            <View key={thanhToan.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.transfer}>
                  {tenCua(thanhToan.nguoiTraId)} đã trả {tenCua(thanhToan.nguoiNhanId)}
                </Text>
                <Text style={styles.amount}>{formatMoney(thanhToan.soTien)}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={colors.income} accessibilityLabel="Đã xác nhận" />
            </View>
          ))
        )}
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowText: {
    flex: 1,
  },
  transfer: {
    fontSize: 15,
    color: colors.text,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  status: {
    fontSize: 13,
    color: colors.warningText,
  },
  primaryButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.dangerText,
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    paddingVertical: 6,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
});
