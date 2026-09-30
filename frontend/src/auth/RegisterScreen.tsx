import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthStackParams } from '../navigation/AppNavigator';
import colors from '../shared/colors';
import PrimaryButton from '../shared/components/PrimaryButton';
import TextField from '../shared/components/TextField';
import { useAuth } from './AuthContext';

type Props = NativeStackScreenProps<AuthStackParams, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [tenHienThi, setTenHienThi] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState('');
  const [dangGui, setDangGui] = useState(false);

  async function handleRegister() {
    setLoi('');
    setDangGui(true);
    try {
      await register(email, matKhau, tenHienThi);
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setDangGui(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Tạo tài khoản</Text>

          <TextField label="Tên hiển thị" value={tenHienThi} onChangeText={setTenHienThi} placeholder="King" />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="ban@gmail.com"
          />
          <TextField
            label="Mật khẩu (ít nhất 8 ký tự)"
            value={matKhau}
            onChangeText={setMatKhau}
            secureTextEntry
            autoComplete="new-password"
          />

          {loi ? (
            <Text style={styles.error} accessibilityRole="alert">
              {loi}
            </Text>
          ) : null}

          <PrimaryButton title="Đăng ký" onPress={handleRegister} loading={dangGui} />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Đã có tài khoản?</Text>
            <Pressable accessibilityRole="link" onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={styles.switchLink}>Đăng nhập</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 28,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  switchText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  switchLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
