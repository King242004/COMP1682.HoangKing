import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { createDanhMuc, deleteDanhMuc, getDanhMucList, type DanhMuc as DanhMucType } from '../../api/DanhMucApi';
import { useAuth } from '../../auth/AuthContext';
import colors from '../../shared/colors';
import PrimaryButton from '../../shared/components/PrimaryButton';
import TextField from '../../shared/components/TextField';

type IoniconName = keyof typeof Ionicons.glyphMap;

// Các icon người dùng chọn được cho danh mục riêng.
const BIEU_TUONG_CO_THE_CHON: IoniconName[] = [
  'pricetag-outline',
  'cafe-outline',
  'fast-food-outline',
  'heart-outline',
  'shirt-outline',
  'phone-portrait-outline',
  'paw-outline',
  'barbell-outline',
];

// Danh mục: các danh mục mặc định ai cũng có, cùng danh mục riêng của người dùng (xóa được nếu chưa dùng).
export default function DanhMuc() {
  const { token } = useAuth();
  const [danhSach, setDanhSach] = useState<DanhMucType[]>([]);
  const [ten, setTen] = useState('');
  const [loai, setLoai] = useState<'thu' | 'chi'>('chi');
  const [bieuTuong, setBieuTuong] = useState<IoniconName>(BIEU_TUONG_CO_THE_CHON[0]);
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const taiDanhSach = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      setDanhSach(await getDanhMucList(token));
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tải được danh mục');
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
      await createDanhMuc(token, ten, loai, bieuTuong);
      setTen('');
      await taiDanhSach();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không thêm được danh mục');
    } finally {
      setDangLuu(false);
    }
  }

  function hoiXoa(danhMuc: DanhMucType) {
    Alert.alert('Xóa danh mục', `Xóa danh mục "${danhMuc.ten}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (!token) {
            return;
          }
          try {
            await deleteDanhMuc(token, danhMuc.id);
            await taiDanhSach();
          } catch (error) {
            setLoi(error instanceof Error ? error.message : 'Không xóa được danh mục');
          }
        },
      },
    ]);
  }

  function nhomDanhMuc(loaiCanXem: 'thu' | 'chi', tieuDe: string) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{tieuDe}</Text>
        {danhSach
          .filter((danhMuc) => danhMuc.loai === loaiCanXem)
          .map((danhMuc) => (
            <View key={danhMuc.id} style={styles.row}>
              <Ionicons name={danhMuc.bieuTuong as IoniconName} size={20} color={colors.primary} />
              <Text style={styles.name}>{danhMuc.ten}</Text>
              {danhMuc.laMacDinh ? (
                <Text style={styles.defaultTag}>Mặc định</Text>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa danh mục ${danhMuc.ten}`}
                  onPress={() => hoiXoa(danhMuc)}
                  hitSlop={10}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.dangerText} />
                </Pressable>
              )}
            </View>
          ))}
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thêm danh mục riêng</Text>
        <TextField label="Tên danh mục" value={ten} onChangeText={setTen} placeholder="Trà sữa" />

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
                {option === 'chi' ? 'Cho khoản chi' : 'Cho khoản thu'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Biểu tượng</Text>
        <View style={styles.iconRow}>
          {BIEU_TUONG_CO_THE_CHON.map((icon) => (
            <Pressable
              key={icon}
              accessibilityRole="button"
              accessibilityLabel={`Biểu tượng ${icon}`}
              accessibilityState={{ selected: bieuTuong === icon }}
              onPress={() => setBieuTuong(icon)}
              style={[styles.iconChoice, bieuTuong === icon && styles.iconChoiceSelected]}
            >
              <Ionicons name={icon} size={22} color={bieuTuong === icon ? colors.onPrimary : colors.primary} />
            </Pressable>
          ))}
        </View>

        {loi ? (
          <Text style={styles.error} accessibilityRole="alert">
            {loi}
          </Text>
        ) : null}

        <PrimaryButton title="Thêm danh mục" onPress={them} loading={dangLuu} />
      </View>

      {nhomDanhMuc('chi', 'Danh mục chi')}
      {nhomDanhMuc('thu', 'Danh mục thu')}
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  defaultTag: {
    fontSize: 12,
    color: colors.textMuted,
  },
  deleteButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 14,
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
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  iconChoice: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChoiceSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
