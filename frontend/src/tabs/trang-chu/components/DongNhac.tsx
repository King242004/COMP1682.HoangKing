import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { NhacNho } from '../../../api/DuBaoApi';
import colors from '../../../shared/colors';

type DongNhacProps = {
  nhacNho: NhacNho;
  khiBam: () => void;
};

// One reminder line: yellow = coming soon (promise in ≤ 2 days), red = late or money running out.
// Always words + icon, never color alone.
export default function DongNhac({ nhacNho, khiBam }: DongNhacProps) {
  const laMauDo = nhacNho.mucDo === 'do';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={khiBam}
      style={[styles.row, { backgroundColor: laMauDo ? colors.dangerBackground : colors.warningBackground }]}
    >
      <Ionicons
        name={laMauDo ? 'alert-circle-outline' : 'alarm-outline'}
        size={20}
        color={laMauDo ? colors.dangerText : colors.warningText}
      />
      <Text style={[styles.text, { color: laMauDo ? colors.dangerText : colors.warningText }]}>{nhacNho.noiDung}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
