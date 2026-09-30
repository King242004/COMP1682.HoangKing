import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createNhom } from '../../api/NhomApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import PrimaryButton from '../../shared/components/PrimaryButton';
import TextField from '../../shared/components/TextField';

type Props = NativeStackScreenProps<MainStackParams, 'TaoNhom'>;

// Create a group. The app then opens it, where the invite code can be shared.
export default function TaoNhom({ navigation }: Props) {
  const { token } = useAuth();
  const [ten, setTen] = useState('');
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  async function tao() {
    if (!token) {
      return;
    }
    setLoi('');
    setDangLuu(true);
    try {
      const nhom = await createNhom(token, ten);
      navigation.replace('ChiTietNhom', { nhomId: nhom.id });
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tạo được nhóm');
      setDangLuu(false);
    }
  }

  return (
    <View style={styles.screen}>
      <TextField label="Tên nhóm" value={ten} onChangeText={setTen} placeholder="Đi Đà Lạt, Phòng 302…" autoFocus />
      {loi ? (
        <Text style={styles.error} accessibilityRole="alert">
          {loi}
        </Text>
      ) : null}
      <PrimaryButton title="Tạo nhóm" onPress={tao} loading={dangLuu} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
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
