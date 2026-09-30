import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { DanhMuc } from '../../api/DanhMucApi';
import colors from '../colors';

type ChonDanhMucProps = {
  danhSach: DanhMuc[];
  danhMucDangChon: number | null;
  khiChon: (danhMucId: number) => void;
};

// A row of category chips (icon + name). Tap one to pick it.
export default function ChonDanhMuc({ danhSach, danhMucDangChon, khiChon }: ChonDanhMucProps) {
  return (
    <View style={styles.wrap}>
      {danhSach.map((danhMuc) => {
        const dangChon = danhMuc.id === danhMucDangChon;
        return (
          <Pressable
            key={danhMuc.id}
            accessibilityRole="button"
            accessibilityState={{ selected: dangChon }}
            accessibilityLabel={danhMuc.ten}
            onPress={() => khiChon(danhMuc.id)}
            style={[styles.chip, dangChon && styles.chipSelected]}
          >
            <Ionicons
              name={danhMuc.bieuTuong as keyof typeof Ionicons.glyphMap}
              size={16}
              color={dangChon ? colors.onPrimary : colors.primary}
            />
            <Text style={[styles.chipText, dangChon && styles.chipTextSelected]}>{danhMuc.ten}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
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
});
