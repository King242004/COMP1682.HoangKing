import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getDanhMucList, type DanhMuc } from '../api/DanhMucApi';
import { createGiaoDich, deleteGiaoDich, updateGiaoDich } from '../api/GiaoDichApi';
import { getViList, type Vi } from '../api/ViApi';
import { useAuth } from '../auth/AuthContext';
import type { MainStackParams } from '../navigation/AppNavigator';
import colors from '../shared/colors';
import ChonAnh from '../shared/components/ChonAnh';
import ChonDanhMuc from '../shared/components/ChonDanhMuc';
import ChonNgay from '../shared/components/ChonNgay';
import ChonVi from '../shared/components/ChonVi';
import PrimaryButton from '../shared/components/PrimaryButton';
import TextField from '../shared/components/TextField';
import { todayKey } from '../shared/dateKey';
import formatMoney from '../shared/formatMoney';
import readMoneyInput from '../shared/moneyInput';

type Props = NativeStackScreenProps<MainStackParams, 'GhiKhoan'>;

// Record one personal income or expense. Opened by the + button (new),
// or by tapping an existing row (edit, with a delete button).
export default function GhiKhoan({ route, navigation }: Props) {
  const { token } = useAuth();
  const giaoDichDangSua = route.params?.giaoDich ?? null;
  // Opened from 'Khoản sắp tới' → 'Đã trả': the form starts from that item and marks it paid.
  const khoanSapToi = route.params?.khoanSapToi ?? null;

  const [danhSachVi, setDanhSachVi] = useState<Vi[]>([]);
  const [danhSachDanhMuc, setDanhSachDanhMuc] = useState<DanhMuc[]>([]);
  const [dangTai, setDangTai] = useState(true);

  // When editing, the form starts filled with the existing values.
  const [loai, setLoai] = useState<'thu' | 'chi'>(giaoDichDangSua?.loai ?? khoanSapToi?.loai ?? 'chi');
  const [soTienText, setSoTienText] = useState(
    giaoDichDangSua ? String(giaoDichDangSua.soTien) : khoanSapToi ? String(khoanSapToi.soTien) : '',
  );
  const [danhMucId, setDanhMucId] = useState<number | null>(giaoDichDangSua?.danhMucId ?? null);
  const [viId, setViId] = useState<number | null>(giaoDichDangSua?.viId ?? null);
  const [ngay, setNgay] = useState(giaoDichDangSua?.ngay ?? khoanSapToi?.kyNgay ?? route.params?.ngay ?? todayKey());
  const [ghiChu, setGhiChu] = useState(giaoDichDangSua?.ghiChu ?? khoanSapToi?.ten ?? '');
  const [anhUrl, setAnhUrl] = useState<string | null>(giaoDichDangSua?.anhUrl ?? null);
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: giaoDichDangSua ? 'Sửa khoản' : 'Ghi khoản' });
  }, [navigation, giaoDichDangSua]);

  // Reload wallets when coming back from the Wallet screen (the user may have just created one).
  useFocusEffect(
    useCallback(() => {
      async function taiDuLieu() {
        if (!token) {
          return;
        }
        try {
          const [viList, danhMucList] = await Promise.all([getViList(token), getDanhMucList(token)]);
          setDanhSachVi(viList);
          setDanhSachDanhMuc(danhMucList);
          // Pick the first wallet for the user if none is picked yet.
          setViId((dangChon) => dangChon ?? viList[0]?.id ?? null);
        } catch (error) {
          setLoi(error instanceof Error ? error.message : 'Không tải được dữ liệu');
        } finally {
          setDangTai(false);
        }
      }
      taiDuLieu();
    }, [token]),
  );

  // A category of the other type cannot be used, so the choice is cleared when switching thu/chi.
  function doiLoai(loaiMoi: 'thu' | 'chi') {
    if (loaiMoi !== loai) {
      setLoai(loaiMoi);
      setDanhMucId(null);
    }
  }

  const danhMucTheoLoai = danhSachDanhMuc.filter((danhMuc) => danhMuc.loai === loai);

  async function luu() {
    if (!token) {
      return;
    }
    const soTien = readMoneyInput(soTienText);
    if (soTien <= 0) {
      setLoi('Vui lòng nhập số tiền');
      return;
    }
    if (!danhMucId) {
      setLoi('Vui lòng chọn danh mục');
      return;
    }
    if (!viId) {
      setLoi('Vui lòng chọn ví');
      return;
    }

    setLoi('');
    setDangLuu(true);
    const duLieu = {
      viId,
      danhMucId,
      loai,
      soTien,
      ngay,
      ghiChu: ghiChu || null,
      anhUrl,
      khoanSapToiId: khoanSapToi?.id ?? null,
      kyNgay: khoanSapToi?.kyNgay ?? null,
    };
    try {
      if (giaoDichDangSua) {
        await updateGiaoDich(token, giaoDichDangSua.id, duLieu);
      } else {
        await createGiaoDich(token, duLieu);
      }
      navigation.goBack();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không lưu được khoản này');
      setDangLuu(false);
    }
  }

  function hoiXoa() {
    if (!giaoDichDangSua) {
      return;
    }
    Alert.alert('Xóa khoản', 'Xóa khoản này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (!token) {
            return;
          }
          try {
            await deleteGiaoDich(token, giaoDichDangSua.id);
            navigation.goBack();
          } catch (error) {
            setLoi(error instanceof Error ? error.message : 'Không xóa được khoản này');
          }
        },
      },
    ]);
  }

  if (dangTai) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // No wallet yet: the money has to come from somewhere, so send the user to create one first.
  if (danhSachVi.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Bạn chưa có ví nào</Text>
        <Text style={styles.emptyText}>Tạo một ví với số tiền bạn đang có, rồi quay lại ghi khoản.</Text>
        <PrimaryButton title="Tạo ví" onPress={() => navigation.navigate('Vi')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.segment}>
        {(['chi', 'thu'] as const).map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: loai === option }}
            onPress={() => doiLoai(option)}
            style={[styles.segmentItem, loai === option && styles.segmentItemSelected]}
          >
            <Text style={[styles.segmentText, loai === option && styles.segmentTextSelected]}>
              {option === 'chi' ? 'Khoản chi' : 'Khoản thu'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Số tiền</Text>
      <TextInput
        accessibilityLabel="Số tiền"
        value={soTienText}
        onChangeText={setSoTienText}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        style={[styles.amountInput, { color: loai === 'chi' ? colors.expense : colors.income }]}
      />
      <Text style={styles.amountPreview}>{formatMoney(readMoneyInput(soTienText))}</Text>

      <Text style={styles.label}>Danh mục</Text>
      <ChonDanhMuc danhSach={danhMucTheoLoai} danhMucDangChon={danhMucId} khiChon={setDanhMucId} />

      <Text style={[styles.label, styles.spaced]}>Ví</Text>
      <ChonVi danhSach={danhSachVi} viDangChon={viId} khiChon={setViId} />

      <Text style={[styles.label, styles.spaced]}>Ngày</Text>
      <ChonNgay ngay={ngay} khiDoi={setNgay} />

      <View style={styles.spaced}>
        <TextField label="Ghi chú (không bắt buộc)" value={ghiChu} onChangeText={setGhiChu} placeholder="Phở bò" />
      </View>

      <Text style={styles.label}>Ảnh (không bắt buộc)</Text>
      <View style={styles.photo}>
        <ChonAnh anhUrl={anhUrl} khiDoiAnh={setAnhUrl} />
      </View>

      {loi ? (
        <Text style={styles.error} accessibilityRole="alert">
          {loi}
        </Text>
      ) : null}

      <PrimaryButton title={giaoDichDangSua ? 'Lưu thay đổi' : 'Lưu'} onPress={luu} loading={dangLuu} />

      {giaoDichDangSua ? (
        <Pressable accessibilityRole="button" onPress={hoiXoa} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Xóa khoản này</Text>
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 999,
    padding: 4,
    marginBottom: 20,
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
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
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  spaced: {
    marginTop: 20,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 64,
  },
  amountPreview: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 20,
  },
  photo: {
    marginBottom: 20,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  deleteButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  deleteText: {
    color: colors.dangerText,
    fontSize: 16,
    fontWeight: '600',
  },
});
