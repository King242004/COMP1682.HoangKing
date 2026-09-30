import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../auth/AuthContext';
import colors from '../colors';
import { pickImage, uploadImage } from '../uploadImage';

type ChonAnhProps = {
  anhUrl: string | null;
  khiDoiAnh: (anhUrl: string | null) => void;
};

// Optional photo for an expense (or a group bill): take one, pick one, or remove it.
// The photo is uploaded right after picking, so saving the form stays fast.
export default function ChonAnh({ anhUrl, khiDoiAnh }: ChonAnhProps) {
  const { token } = useAuth();
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState('');

  async function chonVaTaiAnh(nguon: 'camera' | 'library') {
    if (!token) {
      return;
    }
    setLoi('');
    try {
      const localUri = await pickImage(nguon);
      if (!localUri) {
        return;
      }
      setDangTai(true);
      khiDoiAnh(await uploadImage(token, localUri));
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tải ảnh lên được');
    } finally {
      setDangTai(false);
    }
  }

  if (dangTai) {
    return (
      <View style={[styles.box, styles.center]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.hint}>Đang tải ảnh lên…</Text>
      </View>
    );
  }

  if (anhUrl) {
    return (
      <View>
        <Image source={{ uri: anhUrl }} style={styles.photo} accessibilityLabel="Ảnh của khoản này" />
        <Pressable accessibilityRole="button" onPress={() => khiDoiAnh(null)} style={styles.removeButton}>
          <Text style={styles.removeText}>Bỏ ảnh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chụp ảnh"
          onPress={() => chonVaTaiAnh('camera')}
          style={[styles.box, styles.center, styles.half]}
        >
          <Ionicons name="camera-outline" size={24} color={colors.primary} />
          <Text style={styles.hint}>Chụp ảnh</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chọn ảnh từ thư viện"
          onPress={() => chonVaTaiAnh('library')}
          style={[styles.box, styles.center, styles.half]}
        >
          <Ionicons name="images-outline" size={24} color={colors.primary} />
          <Text style={styles.hint}>Chọn từ thư viện</Text>
        </Pressable>
      </View>
      {loi ? (
        <Text style={styles.error} accessibilityRole="alert">
          {loi}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  box: {
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  half: {
    flex: 1,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  removeButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.dangerText,
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    color: colors.dangerText,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    fontSize: 14,
  },
});
