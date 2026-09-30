import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { Vi } from '../../../api/ViApi';
import colors from '../../../shared/colors';

type LocTheoViProps = {
  danhSachVi: Vi[];
  viDangLoc: number | null;
  khiChon: (viId: number | null) => void;
};

// Filter chips: "Tất cả" plus one chip per wallet. null = all wallets.
export default function LocTheoVi({ danhSachVi, viDangLoc, khiChon }: LocTheoViProps) {
  const luaChon = [{ id: null as number | null, ten: 'Tất cả' }, ...danhSachVi.map((vi) => ({ id: vi.id, ten: vi.ten }))];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {luaChon.map((option) => {
        const dangChon = option.id === viDangLoc;
        return (
          <Pressable
            key={option.id ?? 'tat-ca'}
            accessibilityRole="button"
            accessibilityState={{ selected: dangChon }}
            onPress={() => khiChon(option.id)}
            style={[styles.chip, dangChon && styles.chipSelected]}
          >
            <Text style={[styles.text, dangChon && styles.textSelected]}>{option.ten}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 14,
    color: colors.text,
  },
  textSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
