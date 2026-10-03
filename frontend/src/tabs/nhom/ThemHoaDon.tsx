import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getDanhMucList, type DanhMuc } from '../../api/DanhMucApi';
import { createHoaDon } from '../../api/HoaDonApi';
import { getChiTietNhom, type KeHoachNhom, type ThanhVien } from '../../api/NhomApi';
import { getViList, type Vi } from '../../api/ViApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import ChonAnh from '../../shared/components/ChonAnh';
import ChonDanhMuc from '../../shared/components/ChonDanhMuc';
import ChonNgay from '../../shared/components/ChonNgay';
import ChonVi from '../../shared/components/ChonVi';
import PrimaryButton from '../../shared/components/PrimaryButton';
import TextField from '../../shared/components/TextField';
import { todayKey } from '../../shared/dateKey';
import formatMoney from '../../shared/formatMoney';
import readMoneyInput from '../../shared/moneyInput';
import ChiaTien from './components/ChiaTien';

type Props = NativeStackScreenProps<MainStackParams, 'ThemHoaDon'>;

// Thêm hóa đơn vào nhóm: tên, số tiền, ai trả (và trả bằng ví nào nếu là tôi),
// danh mục, ngày, ai chịu (chia đều hoặc tùy chỉnh), ghi chú và ảnh.
export default function ThemHoaDon({ route, navigation }: Props) {
  const { nhomId } = route.params;
  const { token, nguoiDung } = useAuth();

  const [thanhVien, setThanhVien] = useState<ThanhVien[]>([]);
  const [danhSachKeHoach, setDanhSachKeHoach] = useState<KeHoachNhom[]>([]);
  const [danhSachVi, setDanhSachVi] = useState<Vi[]>([]);
  const [danhSachDanhMuc, setDanhSachDanhMuc] = useState<DanhMuc[]>([]);
  const [dangTai, setDangTai] = useState(true);

  const [ten, setTen] = useState('');
  const [soTienText, setSoTienText] = useState('');
  const [nguoiTraId, setNguoiTraId] = useState<number | null>(nguoiDung?.id ?? null);
  const [viId, setViId] = useState<number | null>(null);
  const [danhMucId, setDanhMucId] = useState<number | null>(null);
  const [ngay, setNgay] = useState(todayKey());
  const [cachChia, setCachChia] = useState<'deu' | 'tuy_chinh'>('deu');
  const [nguoiChiuIds, setNguoiChiuIds] = useState<number[]>([]);
  const [phanTuyChinh, setPhanTuyChinh] = useState<Record<number, string>>({});
  const [ghiChu, setGhiChu] = useState('');
  const [anhUrl, setAnhUrl] = useState<string | null>(null);
  const [keHoachId, setKeHoachId] = useState<number | null>(null);
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function taiDuLieu() {
        if (!token) {
          return;
        }
        try {
          const [chiTiet, viList, danhMucList] = await Promise.all([
            getChiTietNhom(token, nhomId),
            getViList(token),
            getDanhMucList(token),
          ]);
          setThanhVien(chiTiet.thanhVien);
          setDanhSachKeHoach(chiTiet.danhSachKeHoach);
          setDanhSachVi(viList);
          setDanhSachDanhMuc(danhMucList.filter((danhMuc) => danhMuc.loai === 'chi'));
          // Mặc định hóa đơn chia cho mọi người và trả bằng ví đầu tiên của tôi.
          setNguoiChiuIds((dangChon) => (dangChon.length > 0 ? dangChon : chiTiet.thanhVien.map((nguoi) => nguoi.id)));
          setViId((dangChon) => dangChon ?? viList[0]?.id ?? null);
        } catch (error) {
          setLoi(error instanceof Error ? error.message : 'Không tải được dữ liệu');
        } finally {
          setDangTai(false);
        }
      }
      taiDuLieu();
    }, [token, nhomId]),
  );

  const soTien = readMoneyInput(soTienText);
  const toiLaNguoiTra = nguoiTraId === nguoiDung?.id;

  async function luu() {
    if (!token) {
      return;
    }
    if (!ten.trim()) {
      setLoi('Vui lòng nhập tên hóa đơn');
      return;
    }
    if (soTien <= 0) {
      setLoi('Vui lòng nhập số tiền');
      return;
    }
    if (!nguoiTraId) {
      setLoi('Vui lòng chọn người trả');
      return;
    }
    if (!danhMucId) {
      setLoi('Vui lòng chọn danh mục');
      return;
    }
    if (nguoiChiuIds.length === 0) {
      setLoi('Chọn ít nhất một người để chia');
      return;
    }

    setLoi('');
    setDangLuu(true);
    try {
      await createHoaDon(token, nhomId, {
        ten,
        nguoiTraId,
        // Chỉ ghi được ví của chính người trả; ví của người khác thì ở đây không biết.
        viId: toiLaNguoiTra ? viId : null,
        danhMucId,
        soTien,
        ngay,
        ghiChu: ghiChu || null,
        anhUrl,
        cachChia,
        khoanSapToiId: keHoachId,
        phanChia: nguoiChiuIds.map((id) => ({ nguoiDungId: id, soTien: readMoneyInput(phanTuyChinh[id] ?? '') })),
      });
      navigation.goBack();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không lưu được hóa đơn');
      setDangLuu(false);
    }
  }

  if (dangTai) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TextField label="Tên hóa đơn" value={ten} onChangeText={setTen} placeholder="Ăn tối, Đi chợ, Chuyến đi…" />

      <Text style={styles.label}>Số tiền</Text>
      <TextInput
        accessibilityLabel="Số tiền"
        value={soTienText}
        onChangeText={setSoTienText}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        style={styles.amountInput}
      />
      <Text style={styles.amountPreview}>{formatMoney(soTien)}</Text>

      <Text style={styles.label}>Ai trả</Text>
      <View style={styles.chips}>
        {thanhVien.map((nguoi) => (
          <Pressable
            key={nguoi.id}
            accessibilityRole="button"
            accessibilityState={{ selected: nguoiTraId === nguoi.id }}
            onPress={() => setNguoiTraId(nguoi.id)}
            style={[styles.chip, nguoiTraId === nguoi.id && styles.chipSelected]}
          >
            <Text style={[styles.chipText, nguoiTraId === nguoi.id && styles.chipTextSelected]}>
              {nguoi.id === nguoiDung?.id ? 'Bạn' : nguoi.tenHienThi}
            </Text>
          </Pressable>
        ))}
      </View>

      {toiLaNguoiTra && danhSachVi.length > 0 ? (
        <>
          <Text style={[styles.label, styles.spaced]}>Bạn trả bằng ví nào</Text>
          <ChonVi danhSach={danhSachVi} viDangChon={viId} khiChon={setViId} />
        </>
      ) : null}

      <Text style={[styles.label, styles.spaced]}>Danh mục</Text>
      <ChonDanhMuc danhSach={danhSachDanhMuc} danhMucDangChon={danhMucId} khiChon={setDanhMucId} />

      <Text style={[styles.label, styles.spaced]}>Ngày</Text>
      <ChonNgay ngay={ngay} khiDoi={setNgay} />

      {danhSachKeHoach.length > 0 ? (
        <>
          <Text style={[styles.label, styles.spaced]}>Thuộc kế hoạch nào (không bắt buộc)</Text>
          <View style={styles.chips}>
            {danhSachKeHoach.map((keHoach) => (
              <Pressable
                key={keHoach.id}
                accessibilityRole="button"
                accessibilityState={{ selected: keHoachId === keHoach.id }}
                onPress={() => setKeHoachId(keHoachId === keHoach.id ? null : keHoach.id)}
                style={[styles.chip, keHoachId === keHoach.id && styles.chipSelected]}
              >
                <Text style={[styles.chipText, keHoachId === keHoach.id && styles.chipTextSelected]}>{keHoach.ten}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <Text style={[styles.label, styles.spaced]}>Chia cho</Text>
      <ChiaTien
        thanhVien={thanhVien}
        soTien={soTien}
        cachChia={cachChia}
        khiDoiCachChia={setCachChia}
        nguoiChiuIds={nguoiChiuIds}
        khiDoiNguoiChiu={setNguoiChiuIds}
        phanTuyChinh={phanTuyChinh}
        khiDoiPhanTuyChinh={setPhanTuyChinh}
      />

      <View style={styles.spaced}>
        <TextField label="Ghi chú (không bắt buộc)" value={ghiChu} onChangeText={setGhiChu} />
      </View>

      <Text style={styles.label}>Ảnh hóa đơn (không bắt buộc)</Text>
      <View style={styles.photo}>
        <ChonAnh anhUrl={anhUrl} khiDoiAnh={setAnhUrl} />
      </View>

      {loi ? (
        <Text style={styles.error} accessibilityRole="alert">
          {loi}
        </Text>
      ) : null}

      <PrimaryButton title="Lưu hóa đơn" onPress={luu} loading={dangLuu} />
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
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  amountPreview: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
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
});
