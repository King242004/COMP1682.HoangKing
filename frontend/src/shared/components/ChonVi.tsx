import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Vi } from '../../api/ViApi';
import colors from '../colors';
import formatMoney from '../formatMoney';

type ChonViProps = {
  danhSach: Vi[];
  viDangChon: number | null;
  khiChon: (viId: number) => void;
};

// Wallet chips showing name and current balance. Tap one to pick it.
export default function ChonVi({ danhSach, viDangChon, khiChon }: ChonViProps) {
  return (
    <View style={styles.wrap}>
      {danhSach.map((vi) => {
        const dangChon = vi.id === viDangChon;
        return (
          <Pressable
            key={vi.id}
            accessibilityRole="button"
            accessibilityState={{ selected: dangChon }}
            accessibilityLabel={`${vi.ten}, còn ${formatMoney(vi.soDuHienTai)}`}
            onPress={() => khiChon(vi.id)}
            style={[styles.chip, dangChon && styles.chipSelected]}
          >
            <Text style={[styles.name, dangChon && styles.textSelected]}>{vi.ten}</Text>
            <Text style={[styles.balance, dangChon && styles.textSelected]}>{formatMoney(vi.soDuHienTai)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  balance: {
    fontSize: 12,
    color: colors.textMuted,
  },
  textSelected: {
    color: colors.onPrimary,
  },
});
