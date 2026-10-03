import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  createKhoanSapToi,
  deleteKhoanSapToi,
  getKhoanSapToiList,
  type KhoanSapToi as KhoanSapToiType,
} from '../../api/KhoanSapToiApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import ChonNgay from '../../shared/components/ChonNgay';
import PrimaryButton from '../../shared/components/PrimaryButton';
import TextField from '../../shared/components/TextField';
import { formatDateKey, todayKey } from '../../shared/dateKey';
import formatMoney from '../../shared/formatMoney';
import readMoneyInput from '../../shared/moneyInput';

type Props = NativeStackScreenProps<MainStackParams, 'KhoanSapToi'>;

const NHAN_LAP_LAI: Record<KhoanSapToiType['lapLai'], string> = {
  khong: 'Một lần',
  tuan: 'Hằng tuần',
  thang: 'Hằng tháng',
};

// Khoản sắp tới: tiền nhà hằng tháng, gói đăng ký, đám cưới ngày 20, tiền nhà gửi ngày 1…
// Dự báo cần chúng vì app không tự đoán được. "Đã trả" ghi lại khoản đã trả
// (qua màn Ghi khoản) và đánh dấu kỳ đó đã xong.
export default function KhoanSapToi({ navigation }: Props) {
  const { token } = useAuth();
  const [danhSach, setDanhSach] = useState<KhoanSapToiType[]>([]);
  const [ten, setTen] = useState('');
  const [loai, setLoai] = useState<'thu' | 'chi'>('chi');
  const [soTienText, setSoTienText] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState(todayKey());
  const [lapLai, setLapLai] = useState<KhoanSapToiType['lapLai']>('thang');
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const taiDanhSach = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      setDanhSach(await getKhoanSapToiList(token));
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tải được khoản sắp tới');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      taiDanhSach();
    }, [taiDanhSach]),
  );

  async function them() {
    if (!token) {
      return;
    }
    setLoi('');
    setDangLuu(true);
    try {
      await createKhoanSapToi(token, { ten, loai, soTien: readMoneyInput(soTienText), ngayBatDau, lapLai, ngayKetThuc: null });
      setTen('');
      setSoTienText('');
      await taiDanhSach();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không thêm được khoản');
    } finally {
      setDangLuu(false);
    }
  }

  function hoiXoa(khoan: KhoanSapToiType) {
    Alert.alert('Xóa khoản sắp tới', `Xóa "${khoan.ten}"? Các khoản đã ghi trước đó vẫn giữ nguyên.`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (!token) {
            return;
          }
          try {
            await deleteKhoanSapToi(token, khoan.id);
            await taiDanhSach();
          } catch (error) {
            setLoi(error instanceof Error ? error.message : 'Không xóa được');
          }
        },
      },
    ]);
  }

  function danhDauDaTra(khoan: KhoanSapToiType) {
    if (!khoan.kyToiTiep) {
      return;
    }
    navigation.navigate('GhiKhoan', {
      khoanSapToi: { id: khoan.id, kyNgay: khoan.kyToiTiep, ten: khoan.ten, loai: khoan.loai, soTien: khoan.soTien },
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {danhSach.length === 0 ? (
        <Text style={styles.empty}>Chưa có khoản nào. Thêm tiền nhà, tiền về, các gói trả hằng tháng… để app tính trước giúp bạn.</Text>
      ) : (
        danhSach.map((khoan) => (
          <View key={khoan.id} style={styles.row}>
            <Ionicons
              name={khoan.loai === 'thu' ? 'arrow-down-circle-outline' : 'time-outline'}
              size={22}
              color={khoan.loai === 'thu' ? colors.income : colors.primary}
            />
            <View style={styles.rowText}>
              <Text style={styles.name}>{khoan.ten}</Text>
              <Text style={styles.detail}>
                {NHAN_LAP_LAI[khoan.lapLai]}
                {khoan.kyToiTiep ? ` · lần tới ${formatDateKey(khoan.kyToiTiep)}` : ' · không còn lần nào'}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.amount, { color: khoan.loai === 'thu' ? colors.income : colors.expense }]}>
                {khoan.loai === 'thu' ? '+' : '−'}
                {formatMoney(khoan.soTien)}
              </Text>
              <View style={styles.rowButtons}>
                {khoan.kyToiTiep ? (
                  <Pressable accessibilityRole="button" onPress={() => danhDauDaTra(khoan)} style={styles.smallButton}>
                    <Text style={styles.smallButtonText}>{khoan.loai === 'thu' ? 'Đã nhận' : 'Đã trả'}</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa ${khoan.ten}`}
                  onPress={() => hoiXoa(khoan)}
                  style={styles.iconButton}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.dangerText} />
                </Pressable>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={styles.form}>
        <Text style={styles.formTitle}>Thêm khoản sắp tới</Text>
        <View style={styles.segment}>
          {(['chi', 'thu'] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: loai === option }}
              onPress={() => setLoai(option)}
              style={[styles.segmentItem, loai === option && styles.segmentItemSelected]}
            >
              <Text style={[styles.segmentText, loai === option && styles.segmentTextSelected]}>
                {option === 'chi' ? 'Sắp phải trả' : 'Sắp có tiền vào'}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextField
          label="Tên"
          value={ten}
          onChangeText={setTen}
          placeholder={loai === 'chi' ? 'Tiền nhà, ChatGPT, Đám cưới…' : 'Lương, Gia đình gửi…'}
        />
        <TextField label="Số tiền" value={soTienText} onChangeText={setSoTienText} keyboardType="number-pad" placeholder="0" />
        <Text style={styles.preview}>{formatMoney(readMoneyInput(soTienText))}</Text>

        <Text style={styles.label}>Ngày (lần đầu)</Text>
        <ChonNgay ngay={ngayBatDau} khiDoi={setNgayBatDau} />

        <Text style={[styles.label, styles.spaced]}>Lặp lại</Text>
        <View style={styles.segment}>
          {(['khong', 'tuan', 'thang'] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: lapLai === option }}
              onPress={() => setLapLai(option)}
              style={[styles.segmentItem, lapLai === option && styles.segmentItemSelected]}
            >
              <Text style={[styles.segmentText, lapLai === option && styles.segmentTextSelected]}>{NHAN_LAP_LAI[option]}</Text>
            </Pressable>
          ))}
        </View>

        {loi ? (
          <Text style={styles.error} accessibilityRole="alert">
            {loi}
          </Text>
        ) : null}
        <PrimaryButton title="Thêm khoản" onPress={them} loading={dangLuu} />
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
    gap: 10,
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  detail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  smallButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  smallButtonText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
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
    fontSize: 13,
    color: colors.textMuted,
  },
  segmentTextSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
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
  spaced: {
    marginTop: 16,
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
