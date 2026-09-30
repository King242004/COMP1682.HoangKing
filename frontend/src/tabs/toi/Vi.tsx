import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { createVi, deleteVi, getViList, updateVi, type Vi as ViType } from '../../api/ViApi';
import { useAuth } from '../../auth/AuthContext';
import colors from '../../shared/colors';
import PrimaryButton from '../../shared/components/PrimaryButton';
import TextField from '../../shared/components/TextField';
import formatMoney from '../../shared/formatMoney';
import readMoneyInput from '../../shared/moneyInput';

// Wallets: see every wallet with its current balance, add one, edit one, delete an unused one.
export default function Vi() {
  const { token } = useAuth();
  const [danhSachVi, setDanhSachVi] = useState<ViType[]>([]);
  const [loi, setLoi] = useState('');

  // The form is used both to add a wallet (viDangSua = null) and to edit one.
  const [viDangSua, setViDangSua] = useState<ViType | null>(null);
  const [ten, setTen] = useState('');
  const [soDuText, setSoDuText] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const taiDanhSach = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      setDanhSachVi(await getViList(token));
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tải được danh sách ví');
    }
  }, [token]);

  // Reload every time the screen is shown, so balances are always fresh.
  useFocusEffect(
    useCallback(() => {
      taiDanhSach();
    }, [taiDanhSach]),
  );

  function batDauSua(vi: ViType) {
    setViDangSua(vi);
    setTen(vi.ten);
    setSoDuText(String(vi.soDuBanDau));
    setLoi('');
  }

  function xoaForm() {
    setViDangSua(null);
    setTen('');
    setSoDuText('');
  }

  async function luu() {
    if (!token) {
      return;
    }
    setLoi('');
    setDangLuu(true);
    try {
      const soDuBanDau = readMoneyInput(soDuText);
      if (viDangSua) {
        await updateVi(token, viDangSua.id, ten, soDuBanDau);
      } else {
        await createVi(token, ten, soDuBanDau);
      }
      xoaForm();
      await taiDanhSach();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không lưu được ví');
    } finally {
      setDangLuu(false);
    }
  }

  function hoiXoa(vi: ViType) {
    Alert.alert('Xóa ví', `Xóa ví "${vi.ten}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (!token) {
            return;
          }
          try {
            await deleteVi(token, vi.id);
            await taiDanhSach();
          } catch (error) {
            setLoi(error instanceof Error ? error.message : 'Không xóa được ví');
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {danhSachVi.length === 0 ? (
        <Text style={styles.empty}>Bạn chưa có ví nào. Thêm ví đầu tiên với số tiền bạn đang có.</Text>
      ) : (
        danhSachVi.map((vi) => (
          <Pressable
            key={vi.id}
            accessibilityRole="button"
            accessibilityLabel={`Sửa ví ${vi.ten}`}
            onPress={() => batDauSua(vi)}
            style={styles.row}
          >
            <View style={styles.rowText}>
              <Text style={styles.walletName}>{vi.ten}</Text>
              <Text style={styles.walletHint}>Số dư ban đầu {formatMoney(vi.soDuBanDau)}</Text>
            </View>
            <Text style={styles.balance}>{formatMoney(vi.soDuHienTai)}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Xóa ví ${vi.ten}`}
              onPress={() => hoiXoa(vi)}
              hitSlop={10}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.dangerText} />
            </Pressable>
          </Pressable>
        ))
      )}

      <View style={styles.form}>
        <Text style={styles.formTitle}>{viDangSua ? `Sửa ví "${viDangSua.ten}"` : 'Thêm ví'}</Text>
        <TextField label="Tên ví" value={ten} onChangeText={setTen} placeholder="Tiền mặt" />
        <TextField
          label="Số tiền bạn đang có trong ví"
          value={soDuText}
          onChangeText={setSoDuText}
          keyboardType="number-pad"
          placeholder="0"
        />
        <Text style={styles.preview}>{formatMoney(readMoneyInput(soDuText))}</Text>

        {loi ? (
          <Text style={styles.error} accessibilityRole="alert">
            {loi}
          </Text>
        ) : null}

        <PrimaryButton title={viDangSua ? 'Lưu thay đổi' : 'Thêm ví'} onPress={luu} loading={dangLuu} />
        {viDangSua ? (
          <Pressable accessibilityRole="button" onPress={xoaForm} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Hủy sửa</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 10,
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  rowText: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  walletHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  preview: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: -8,
    marginBottom: 16,
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  cancelButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
