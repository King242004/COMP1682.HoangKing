import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createKeHoach, deleteKeHoach, roiKeHoach, thamGiaKeHoach } from '../../api/KeHoachNhomApi';
import { getChiTietNhom, type KeHoachNhom as KeHoachNhomType } from '../../api/NhomApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import ChonNgay from '../../shared/components/ChonNgay';
import PrimaryButton from '../../shared/components/PrimaryButton';
import TextField from '../../shared/components/TextField';
import { addDays, formatDateKey, todayKey } from '../../shared/dateKey';
import formatMoney from '../../shared/formatMoney';
import readMoneyInput from '../../shared/moneyInput';

type Props = NativeStackScreenProps<MainStackParams, 'KeHoachNhom'>;

// Group plans ("Đà Lạt on 15/11, about 1.5 million each"). Only people who press "Tôi tham gia"
// get the amount in their own forecast; bills added to the plan later are subtracted from it.
export default function KeHoachNhom({ route }: Props) {
  const { nhomId } = route.params;
  const { token } = useAuth();
  const [danhSach, setDanhSach] = useState<KeHoachNhomType[] | null>(null);
  const [ten, setTen] = useState('');
  const [soTienText, setSoTienText] = useState('');
  const [ngay, setNgay] = useState(addDays(todayKey(), 14));
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const taiDuLieu = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      setDanhSach((await getChiTietNhom(token, nhomId)).danhSachKeHoach);
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tải được kế hoạch');
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

  async function them() {
    if (!token) {
      return;
    }
    setDangLuu(true);
    await lamViec(async () => {
      await createKeHoach(token, nhomId, ten, readMoneyInput(soTienText), ngay);
      setTen('');
      setSoTienText('');
    });
    setDangLuu(false);
  }

  function hoiXoa(keHoach: KeHoachNhomType) {
    Alert.alert('Xóa kế hoạch', `Xóa "${keHoach.ten}" cho cả nhóm? Hóa đơn đã ghi vẫn giữ nguyên.`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => token && lamViec(() => deleteKeHoach(token, nhomId, keHoach.id)) },
    ]);
  }

  if (!danhSach || !token) {
    return (
      <View style={styles.center}>
        {loi ? <Text style={styles.error}>{loi}</Text> : <ActivityIndicator size="large" color={colors.primary} />}
      </View>
    );
  }

  const tokenDangDung = token;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {danhSach.length === 0 ? (
        <Text style={styles.empty}>Nhóm chưa có kế hoạch nào.</Text>
      ) : (
        danhSach.map((keHoach) => (
          <View key={keHoach.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="airplane-outline" size={22} color={colors.group} />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{keHoach.ten}</Text>
                <Text style={styles.detail}>
                  {formatDateKey(keHoach.ngay)} · khoảng {formatMoney(keHoach.soTienMoiNguoi)}/người · {keHoach.soNguoiThamGia} người tham gia
                </Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Xóa kế hoạch ${keHoach.ten}`} onPress={() => hoiXoa(keHoach)} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={20} color={colors.dangerText} />
              </Pressable>
            </View>
            {keHoach.toiThamGia ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => lamViec(() => roiKeHoach(tokenDangDung, nhomId, keHoach.id))}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>Bạn đã tham gia · Bấm để rút</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => lamViec(() => thamGiaKeHoach(tokenDangDung, nhomId, keHoach.id))}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryText}>Tôi tham gia</Text>
              </Pressable>
            )}
          </View>
        ))
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thêm kế hoạch</Text>
        <View style={styles.spaced}>
          <TextField label="Tên" value={ten} onChangeText={setTen} placeholder="Đi Đà Lạt" />
          <TextField label="Mỗi người khoảng" value={soTienText} onChangeText={setSoTienText} keyboardType="number-pad" placeholder="0" />
          <Text style={styles.preview}>{formatMoney(readMoneyInput(soTienText))}</Text>
        </View>
        <Text style={styles.label}>Ngày</Text>
        <ChonNgay ngay={ngay} khiDoi={setNgay} ngayNhoNhat={todayKey()} />
        {loi ? (
          <Text style={styles.error} accessibilityRole="alert">
            {loi}
          </Text>
        ) : null}
        <View style={styles.spaced}>
          <PrimaryButton title="Thêm kế hoạch" onPress={them} loading={dangLuu} />
        </View>
        <Text style={styles.hint}>Bạn tự động tham gia kế hoạch mình tạo.</Text>
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
  empty: {
    fontSize: 15,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  detail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.groupBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryText: {
    color: colors.group,
    fontSize: 14,
    fontWeight: '600',
  },
  spaced: {
    marginTop: 12,
  },
  preview: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: -8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    fontSize: 14,
  },
});
