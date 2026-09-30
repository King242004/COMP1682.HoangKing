import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ThanhVien } from '../../../api/NhomApi';
import colors from '../../../shared/colors';
import formatMoney from '../../../shared/formatMoney';
import readMoneyInput from '../../../shared/moneyInput';

type ChiaTienProps = {
  thanhVien: ThanhVien[];
  soTien: number;
  cachChia: 'deu' | 'tuy_chinh';
  khiDoiCachChia: (cachChia: 'deu' | 'tuy_chinh') => void;
  nguoiChiuIds: number[];
  khiDoiNguoiChiu: (nguoiChiuIds: number[]) => void;
  phanTuyChinh: Record<number, string>;
  khiDoiPhanTuyChinh: (phanTuyChinh: Record<number, string>) => void;
};

// Who shares the bill and how: evenly, or custom amounts with a live "Còn lại" line.
// The backend does the real even split; here we only show an estimate per person.
export default function ChiaTien({
  thanhVien,
  soTien,
  cachChia,
  khiDoiCachChia,
  nguoiChiuIds,
  khiDoiNguoiChiu,
  phanTuyChinh,
  khiDoiPhanTuyChinh,
}: ChiaTienProps) {
  function batTatNguoi(nguoiDungId: number) {
    khiDoiNguoiChiu(
      nguoiChiuIds.includes(nguoiDungId)
        ? nguoiChiuIds.filter((id) => id !== nguoiDungId)
        : [...nguoiChiuIds, nguoiDungId],
    );
  }

  const daChiaTuyChinh = nguoiChiuIds.reduce((tong, id) => tong + readMoneyInput(phanTuyChinh[id] ?? ''), 0);
  const conLai = soTien - daChiaTuyChinh;
  const uocTinhMoiNguoi = nguoiChiuIds.length > 0 ? Math.floor(soTien / nguoiChiuIds.length) : 0;

  return (
    <View>
      <View style={styles.segment}>
        {(['deu', 'tuy_chinh'] as const).map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: cachChia === option }}
            onPress={() => khiDoiCachChia(option)}
            style={[styles.segmentItem, cachChia === option && styles.segmentItemSelected]}
          >
            <Text style={[styles.segmentText, cachChia === option && styles.segmentTextSelected]}>
              {option === 'deu' ? 'Chia đều' : 'Tùy chỉnh'}
            </Text>
          </Pressable>
        ))}
      </View>

      {thanhVien.map((nguoi) => {
        const duocChon = nguoiChiuIds.includes(nguoi.id);
        return (
          <View key={nguoi.id} style={styles.row}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: duocChon }}
              accessibilityLabel={`Chia cho ${nguoi.tenHienThi}`}
              onPress={() => batTatNguoi(nguoi.id)}
              style={styles.checkArea}
            >
              <Ionicons
                name={duocChon ? 'checkbox' : 'square-outline'}
                size={24}
                color={duocChon ? colors.primary : colors.textMuted}
              />
              <Text style={styles.name}>{nguoi.tenHienThi}</Text>
            </Pressable>

            {duocChon && cachChia === 'deu' ? <Text style={styles.share}>~{formatMoney(uocTinhMoiNguoi)}</Text> : null}

            {duocChon && cachChia === 'tuy_chinh' ? (
              <TextInput
                accessibilityLabel={`Phần của ${nguoi.tenHienThi}`}
                value={phanTuyChinh[nguoi.id] ?? ''}
                onChangeText={(text) => khiDoiPhanTuyChinh({ ...phanTuyChinh, [nguoi.id]: text })}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            ) : null}
          </View>
        );
      })}

      {cachChia === 'tuy_chinh' ? (
        <View style={[styles.remaining, conLai === 0 ? styles.remainingOk : styles.remainingNotOk]}>
          <Text style={[styles.remainingText, { color: conLai === 0 ? colors.income : colors.dangerText }]}>
            {conLai === 0 ? 'Đã chia đủ' : conLai > 0 ? `Còn lại ${formatMoney(conLai)}` : `Chia dư ${formatMoney(-conLai)}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 999,
    padding: 4,
    marginBottom: 8,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  checkArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
  },
  name: {
    fontSize: 15,
    color: colors.text,
  },
  share: {
    fontSize: 14,
    color: colors.textMuted,
  },
  input: {
    width: 120,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    textAlign: 'right',
    fontSize: 15,
    color: colors.text,
  },
  remaining: {
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  remainingOk: {
    backgroundColor: colors.card,
  },
  remainingNotOk: {
    backgroundColor: colors.dangerBackground,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
