import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { joinNhom } from '../../api/NhomApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import PrimaryButton from '../../shared/components/PrimaryButton';
import TextField from '../../shared/components/TextField';

type Props = NativeStackScreenProps<MainStackParams, 'NhapMaMoi'>;

// Join a group with the 6-character invite code a friend sent.
export default function NhapMaMoi({ navigation }: Props) {
  const { token } = useAuth();
  const [maMoi, setMaMoi] = useState('');
  const [loi, setLoi] = useState('');
  const [dangGui, setDangGui] = useState(false);

  async function thamGia() {
    if (!token) {
      return;
    }
    setLoi('');
    setDangGui(true);
    try {
      const nhom = await joinNhom(token, maMoi);
      navigation.replace('ChiTietNhom', { nhomId: nhom.id });
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không vào được nhóm');
      setDangGui(false);
    }
  }

  return (
    <View style={styles.screen}>
      <TextField
        label="Mã mời (6 ký tự)"
        value={maMoi}
        onChangeText={setMaMoi}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        placeholder="K7Q2XM"
        autoFocus
        style={styles.codeInput}
      />
      {loi ? (
        <Text style={styles.error} accessibilityRole="alert">
          {loi}
        </Text>
      ) : null}
      <PrimaryButton title="Vào nhóm" onPress={thamGia} loading={dangGui} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  codeInput: {
    fontSize: 22,
    letterSpacing: 4,
    fontWeight: '600',
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
