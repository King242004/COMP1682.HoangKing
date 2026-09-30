import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';

// "Tôi" tab: profile, personal settings (wallets, categories, upcoming items, budgets) and log out.
export default function Toi() {
  const { nguoiDung, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Tôi</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{nguoiDung?.tenHienThi}</Text>
        <Text style={styles.email}>{nguoiDung?.email}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ví của tôi"
        onPress={() => navigation.navigate('Vi')}
        style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
      >
        <Ionicons name="wallet-outline" size={22} color={colors.primary} />
        <Text style={styles.menuText}>Ví của tôi</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Danh mục"
        onPress={() => navigation.navigate('DanhMuc')}
        style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
      >
        <Ionicons name="pricetags-outline" size={22} color={colors.primary} />
        <Text style={styles.menuText}>Danh mục</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Khoản sắp tới"
        onPress={() => navigation.navigate('KhoanSapToi')}
        style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
      >
        <Ionicons name="calendar-outline" size={22} color={colors.primary} />
        <Text style={styles.menuText}>Khoản sắp tới</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ngân sách"
        onPress={() => navigation.navigate('NganSach')}
        style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
      >
        <Ionicons name="speedometer-outline" size={22} color={colors.primary} />
        <Text style={styles.menuText}>Ngân sách</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Đăng xuất"
        onPress={logout}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
      >
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  logoutText: {
    color: colors.dangerText,
    fontSize: 16,
    fontWeight: '600',
  },
});
