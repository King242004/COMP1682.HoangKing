import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getNhomList, type NhomCuaToi } from '../../api/NhomApi';
import { useAuth } from '../../auth/AuthContext';
import type { MainStackParams } from '../../navigation/AppNavigator';
import colors from '../../shared/colors';
import moTaSoDu from './moTaSoDu';

// Tab Nhóm: mọi nhóm tôi đang ở, kèm số dư của tôi trong từng nhóm, cùng nút "tạo nhóm" và "vào bằng mã".
export default function DanhSachNhom() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const [danhSachNhom, setDanhSachNhom] = useState<NhomCuaToi[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function taiDuLieu() {
        if (!token) {
          return;
        }
        setLoi('');
        try {
          setDanhSachNhom(await getNhomList(token));
        } catch (error) {
          setLoi(error instanceof Error ? error.message : 'Không tải được danh sách nhóm');
        } finally {
          setDangTai(false);
        }
      }
      taiDuLieu();
    }, [token]),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nhóm</Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('TaoNhom')}
            style={({ pressed }) => [styles.actionButton, styles.primaryAction, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={20} color={colors.onPrimary} />
            <Text style={styles.primaryActionText}>Tạo nhóm</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('NhapMaMoi')}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Ionicons name="enter-outline" size={20} color={colors.primary} />
            <Text style={styles.actionText}>Nhập mã mời</Text>
          </Pressable>
        </View>

        {loi ? (
          <Text style={styles.error} accessibilityRole="alert">
            {loi}
          </Text>
        ) : null}

        {dangTai ? (
          <ActivityIndicator color={colors.primary} />
        ) : danhSachNhom.length === 0 ? (
          <Text style={styles.empty}>
            Bạn chưa ở nhóm nào. Tạo nhóm để chia hóa đơn với bạn bè, hoặc nhập mã mời bạn bè gửi.
          </Text>
        ) : (
          danhSachNhom.map((nhom) => {
            const soDu = moTaSoDu(nhom.soDuCuaToi, true);
            return (
              <Pressable
                key={nhom.id}
                accessibilityRole="button"
                accessibilityLabel={`${nhom.ten}, ${nhom.soThanhVien} thành viên, ${soDu.chu}`}
                onPress={() => navigation.navigate('ChiTietNhom', { nhomId: nhom.id })}
                style={({ pressed }) => [styles.groupRow, pressed && styles.pressed]}
              >
                <View style={styles.groupIcon}>
                  <Ionicons name="people-outline" size={22} color={colors.group} />
                </View>
                <View style={styles.groupText}>
                  <Text style={styles.groupName}>{nhom.ten}</Text>
                  <Text style={styles.groupMembers}>{nhom.soThanhVien} thành viên</Text>
                </View>
                <Text style={[styles.balance, { color: soDu.mau }]}>{soDu.chu}</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  actionText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupText: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  groupMembers: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  balance: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 130,
    textAlign: 'right',
  },
});
