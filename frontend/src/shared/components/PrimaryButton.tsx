import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import colors from '../colors';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
};

// Nút chính màu navy. Đang tải thì hiện vòng xoay và bỏ qua các lần bấm thêm.
export default function PrimaryButton({ title, onPress, loading = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ busy: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.title}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
