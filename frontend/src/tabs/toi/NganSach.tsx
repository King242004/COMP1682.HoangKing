import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getDanhMucList, type DanhMuc } from '../../api/DanhMucApi';
import { createNganSach, deleteNganSach, getNganSachList, type NganSach as NganSachType } from '../../api/NganSachApi';
import { useAuth } from '../../auth/AuthContext';
import colors from '../../shared/colors';
import ChonDanhMuc from '../../shared/components/ChonDanhMuc';
import PrimaryButton from '../../shared/components/PrimaryButton';
import TextField from '../../shared/components/TextField';
import formatMoney from '../../shared/formatMoney';
import readMoneyInput from '../../shared/moneyInput';

// Ngân sách người dùng tự đặt ("tháng này chỉ muốn tiêu 3 triệu").
// Ngân sách tổng còn giới hạn luôn "Mỗi ngày được tiêu" ở Trang chủ; ngân sách theo danh mục chỉ theo dõi ở đây.
export default function NganSach() {
  const { token } = useAuth();
  const [danhSach, setDanhSach] = useState<NganSachType[]>([]);
  const [danhSachDanhMuc, setDanhSachDanhMuc] = useState<DanhMuc[]>([]);
  const [ten, setTen] = useState('');
  const [soTienText, setSoTienText] = useState('');
  const [chuKy, setChuKy] = useState<'tuan' | 'thang'>('thang');
  const [danhMucId, setDanhMucId] = useState<number | null>(null);
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const taiDuLieu = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const [nganSachList, danhMucList] = await Promise.all([getNganSachList(token), getDanhMucList(token)]);
      setDanhSach(nganSachList);
      setDanhSachDanhMuc(danhMucList.filter((danhMuc) => danhMuc.loai === 'chi'));
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tải được ngân sách');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, [taiDuLieu]),
  );

  async function them() {
    if (!token) {
      return;
    }
    setLoi('');
    setDangLuu(true);
    try {
      await createNganSach(token, ten, readMoneyInput(soTienText), chuKy, danhMucId);
      setTen('');
      setSoTienText('');
      setDanhMucId(null);
      await taiDuLieu();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không thêm được ngân sách');
    } finally {
      setDangLuu(false);
    }
  }

  function hoiXoa(nganSach: NganSachType) {
    Alert.alert('Xóa ngân sách', `Xóa "${nganSach.ten}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (!token) {
            return;
          }
          try {
            await deleteNganSach(token, nganSach.id);
            await taiDuLieu();
          } catch (error) {
            setLoi(error instanceof Error ? error.message : 'Không xóa được');
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {danhSach.length === 0 ? (
        <Text style={styles.empty}>Chưa có ngân sách. Ngân sách tổng sẽ giới hạn luôn con số "Mỗi ngày được tiêu" ở Trang chủ.</Text>
      ) : (
        danhSach.map((nganSach) => {
          const phanTram = Math.min(100, Math.round((nganSach.daTieu / nganSach.soTien) * 100));
          const vuot = nganSach.conLai < 0;
          return (
            <View key={nganSach.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBox}>
                  <Text style={styles.cardTitle}>{nganSach.ten}</Text>
                  <Text style={styles.detail}>
                    {nganSach.chuKy === 'tuan' ? 'Hằng tuần' : 'Hằng tháng'} · {nganSach.tenDanhMuc ?? 'Tất cả chi tiêu'}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa ngân sách ${nganSach.ten}`}
                  onPress={() => hoiXoa(nganSach)}
                  style={styles.iconButton}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.dangerText} />
                </Pressable>
              </View>
              <Text style={styles.progressText}>
                Đã tiêu {formatMoney(nganSach.daTieu)} / {formatMoney(nganSach.soTien)} ({phanTram}%)
              </Text>
              <View style={styles.track}>
                <View style={[styles.bar, { width: `${phanTram}%`, backgroundColor: vuot ? colors.expense : colors.primary }]} />
              </View>
              <Text style={[styles.detail, vuot && { color: colors.dangerText }]}>
                {vuot
                  ? `Đã vượt ${formatMoney(-nganSach.conLai)}`
                  : `Còn ${formatMoney(nganSach.conLai)} · ${formatMoney(nganSach.moiNgay)}/ngày trong ${nganSach.soNgayConLai} ngày`}
              </Text>
            </View>
          );
        })
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thêm ngân sách</Text>
        <View style={styles.spacedSmall}>
          <TextField label="Tên" value={ten} onChangeText={setTen} placeholder="Chi tiêu tháng này" />
          <TextField label="Số tiền" value={soTienText} onChangeText={setSoTienText} keyboardType="number-pad" placeholder="0" />
          <Text style={styles.preview}>{formatMoney(readMoneyInput(soTienText))}</Text>
        </View>

        <View style={styles.segment}>
          {(['tuan', 'thang'] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: chuKy === option }}
              onPress={() => setChuKy(option)}
              style={[styles.segmentItem, chuKy === option && styles.segmentItemSelected]}
            >
              <Text style={[styles.segmentText, chuKy === option && styles.segmentTextSelected]}>
                {option === 'tuan' ? 'Hằng tuần' : 'Hằng tháng'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Cho danh mục (bỏ trống = tất cả chi tiêu)</Text>
        <ChonDanhMuc
          danhSach={danhSachDanhMuc}
          danhMucDangChon={danhMucId}
          khiChon={(id) => setDanhMucId(id === danhMucId ? null : id)}
        />

        {loi ? (
          <Text style={styles.error} accessibilityRole="alert">
            {loi}
          </Text>
        ) : null}
        <View style={styles.spaced}>
          <PrimaryButton title="Thêm ngân sách" onPress={them} loading={dangLuu} />
        </View>
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
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleBox: {
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
  progressText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 10,
    marginBottom: 6,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginBottom: 6,
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  spacedSmall: {
    marginTop: 12,
  },
  spaced: {
    marginTop: 16,
  },
  preview: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: -8,
    marginBottom: 16,
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
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    fontSize: 14,
  },
});
