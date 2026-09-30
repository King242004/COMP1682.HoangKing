import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthStackParams } from '../navigation/AppNavigator';
import colors from '../shared/colors';
import PrimaryButton from '../shared/components/PrimaryButton';
import TextField from '../shared/components/TextField';
import { useAuth } from './AuthContext';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState('');
  const [dangGui, setDangGui] = useState(false);

  async function handleLogin() {
    setLoi('');
    setDangGui(true);
    try {
      await login(email, matKhau);
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setDangGui(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
        <Text style={styles.appName}>Evenwise</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

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
          label="Mật khẩu"
          value={matKhau}
          onChangeText={setMatKhau}
          secureTextEntry
          autoComplete="password"
        />

        {loi ? (
          <Text style={styles.error} accessibilityRole="alert">
            {loi}
          </Text>
        ) : null}

        <PrimaryButton title="Đăng nhập" onPress={handleLogin} loading={dangGui} />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Chưa có tài khoản?</Text>
          <Pressable accessibilityRole="link" onPress={() => navigation.navigate('Register')} hitSlop={12}>
            <Text style={styles.switchLink}>Đăng ký</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 32,
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
