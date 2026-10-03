import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { deleteHoaDon } from '../../api/HoaDonApi';
import { getChiTietNhom, type ChiTietNhom as ChiTietNhomData, type HoaDon } from '../../api/NhomApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import { formatDateKey } from '../../shared/dateKey';
import formatMoney from '../../shared/formatMoney';
import DongHoaDon from './components/DongHoaDon';
import DongSoDuThanhVien from './components/DongSoDuThanhVien';

type Props = NativeStackScreenProps<MainStackParams, 'ChiTietNhom'>;

// Một nhóm: mã mời, số dư từng thành viên, các hóa đơn, và nút thêm hóa đơn hoặc quyết toán.
export default function ChiTietNhom({ route, navigation }: Props) {
  const { nhomId } = route.params;
  const { token, nguoiDung } = useAuth();
  const [chiTiet, setChiTiet] = useState<ChiTietNhomData | null>(null);
  const [loi, setLoi] = useState('');

  const taiDuLieu = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoi('');
    try {
      setChiTiet(await getChiTietNhom(token, nhomId));
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tải được nhóm');
    }
  }, [token, nhomId]);

  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, [taiDuLieu]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: chiTiet?.nhom.ten ?? 'Nhóm' });
  }, [navigation, chiTiet]);

  function chiaSeMaMoi() {
    if (chiTiet) {
      Share.share({
        message: `Vào nhóm "${chiTiet.nhom.ten}" trên Evenwise bằng mã mời: ${chiTiet.nhom.maMoi}`,
      });
    }
  }

  // Bấm vào một hóa đơn để xem đã chia thế nào, có thể xóa.
  function xemHoaDon(hoaDon: HoaDon) {
    const cacPhan = hoaDon.phanChia.map((phan) => `• ${phan.tenHienThi}: ${formatMoney(phan.soTien)}`).join('\n');
    Alert.alert(hoaDon.ten, `${hoaDon.tenNguoiTra} trả ${formatMoney(hoaDon.soTien)}\n\n${cacPhan}`, [
      { text: 'Đóng', style: 'cancel' },
      {
        text: 'Xóa hóa đơn',
        style: 'destructive',
        onPress: async () => {
          if (!token) {
            return;
          }
          try {
            await deleteHoaDon(token, nhomId, hoaDon.id);
            await taiDuLieu();
          } catch (error) {
            setLoi(error instanceof Error ? error.message : 'Không xóa được hóa đơn');
          }
        },
      },
    ]);
  }

  if (!chiTiet) {
    return (
      <View style={styles.center}>
        {loi ? <Text style={styles.error}>{loi}</Text> : <ActivityIndicator size="large" color={colors.primary} />}
      </View>
    );
  }

  const soLanChoXacNhan = chiTiet.danhSachThanhToan.filter((thanhToan) => thanhToan.trangThai === 'cho').length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Mã mời</Text>
        <View style={styles.codeRow}>
          <Text style={styles.code} selectable>
            {chiTiet.nhom.maMoi}
          </Text>
          <Pressable accessibilityRole="button" onPress={chiaSeMaMoi} style={styles.shareButton}>
            <Ionicons name="share-outline" size={18} color={colors.primary} />
            <Text style={styles.shareText}>Gửi mã</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('ThemHoaDon', { nhomId })}
          style={({ pressed }) => [styles.actionButton, styles.primaryAction, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={20} color={colors.onPrimary} />
          <Text style={styles.primaryActionText}>Thêm hóa đơn</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('QuyetToan', { nhomId })}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Ionicons name="swap-horizontal-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>
            Quyết toán{soLanChoXacNhan > 0 ? ` (${soLanChoXacNhan} chờ)` : ''}
          </Text>
        </Pressable>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('KeHoachNhom', { nhomId })}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Ionicons name="airplane-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Kế hoạch ({chiTiet.danhSachKeHoach.length})</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('HenTraNo', { nhomId })}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Ionicons name="alarm-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Hẹn trả nợ</Text>
        </Pressable>
      </View>

      {loi ? (
        <Text style={styles.error} accessibilityRole="alert">
          {loi}
        </Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Số dư thành viên</Text>
        {chiTiet.thanhVien.map((thanhVien) => (
          <DongSoDuThanhVien key={thanhVien.id} thanhVien={thanhVien} laToi={thanhVien.id === nguoiDung?.id} />
        ))}
        {chiTiet.danhSachHenTra
          .filter((hen) => (chiTiet.thanhVien.find((nguoi) => nguoi.id === hen.nguoiDungId)?.soDu ?? 0) < 0)
          .map((hen) => (
            <Text key={hen.nguoiDungId} style={styles.promise}>
              {hen.nguoiDungId === nguoiDung?.id
                ? 'Bạn'
                : chiTiet.thanhVien.find((nguoi) => nguoi.id === hen.nguoiDungId)?.tenHienThi}{' '}
              hẹn trả ngày {formatDateKey(hen.ngayHen)}
            </Text>
          ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hóa đơn</Text>
        {chiTiet.danhSachHoaDon.length === 0 ? (
          <Text style={styles.empty}>Chưa có hóa đơn nào. Bấm "Thêm hóa đơn" để bắt đầu.</Text>
        ) : (
          chiTiet.danhSachHoaDon.map((hoaDon) => (
            <DongHoaDon
              key={hoaDon.id}
              hoaDon={hoaDon}
              nguoiDungId={nguoiDung?.id ?? 0}
              khiBam={() => xemHoaDon(hoaDon)}
            />
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
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  code: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 4,
    color: colors.text,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  shareText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  actionText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  promise: {
    fontSize: 13,
    color: colors.warningText,
    marginTop: 6,
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    paddingVertical: 10,
  },
});
