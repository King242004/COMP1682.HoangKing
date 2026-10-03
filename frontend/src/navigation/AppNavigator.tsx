import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import type { GiaoDich } from '../api/GiaoDichApi';
import { useAuth } from '../auth/AuthContext';
import LoginScreen from '../auth/LoginScreen';
import RegisterScreen from '../auth/RegisterScreen';
import GhiKhoan from '../ghi-khoan/GhiKhoan';
import colors from '../shared/colors';
import { formatDateKey } from '../shared/dateKey';
import ChiTietNhom from '../tabs/nhom/ChiTietNhom';
import DanhSachNhom from '../tabs/nhom/DanhSachNhom';
import HenTraNo from '../tabs/nhom/HenTraNo';
import KeHoachNhom from '../tabs/nhom/KeHoachNhom';
import NhapMaMoi from '../tabs/nhom/NhapMaMoi';
import QuyetToan from '../tabs/nhom/QuyetToan';
import TaoNhom from '../tabs/nhom/TaoNhom';
import ThemHoaDon from '../tabs/nhom/ThemHoaDon';
import ThongKe from '../tabs/thong-ke/ThongKe';
import DanhMuc from '../tabs/toi/DanhMuc';
import KhoanSapToi from '../tabs/toi/KhoanSapToi';
import NganSach from '../tabs/toi/NganSach';
import Toi from '../tabs/toi/Toi';
import Vi from '../tabs/toi/Vi';
import ChiTietNgay from '../tabs/trang-chu/ChiTietNgay';
import TrangChu from '../tabs/trang-chu/TrangChu';

// Bản đồ mọi màn hình của app. Muốn biết app có những màn nào thì đọc file này.

export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type TabParams = {
  TrangChu: undefined;
  ThongKe: undefined;
  Nhom: undefined;
  Toi: undefined;
};

export type MainStackParams = {
  Tabs: undefined;
  // Ghi mới: có thể truyền ngày điền sẵn. Sửa: truyền giao dịch cần sửa.
  // Từ khoản sắp tới: trả kỳ ngày kyNgay của khoản đó.
  GhiKhoan:
    | {
        ngay?: string;
        giaoDich?: GiaoDich;
        khoanSapToi?: { id: number; kyNgay: string; ten: string; loai: 'thu' | 'chi'; soTien: number };
      }
    | undefined;
  ChiTietNgay: { ngay: string };
  Vi: undefined;
  DanhMuc: undefined;
  TaoNhom: undefined;
  NhapMaMoi: undefined;
  ChiTietNhom: { nhomId: number };
  ThemHoaDon: { nhomId: number };
  QuyetToan: { nhomId: number };
  KeHoachNhom: { nhomId: number };
  HenTraNo: { nhomId: number };
  NganSach: undefined;
  KhoanSapToi: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const MainStack = createNativeStackNavigator<MainStackParams>();
const Tab = createBottomTabNavigator<TabParams>();

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: string; size: number }) => <Ionicons name={name} color={color} size={size} />;
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen name="TrangChu" component={TrangChu} options={{ title: 'Trang chủ', tabBarIcon: tabIcon('home-outline') }} />
      <Tab.Screen name="ThongKe" component={ThongKe} options={{ title: 'Thống kê', tabBarIcon: tabIcon('pie-chart-outline') }} />
      <Tab.Screen name="Nhom" component={DanhSachNhom} options={{ title: 'Nhóm', tabBarIcon: tabIcon('people-outline') }} />
      <Tab.Screen name="Toi" component={Toi} options={{ title: 'Tôi', tabBarIcon: tabIcon('person-outline') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, dangKiemTra } = useAuth();

  // Trong lúc app kiểm tra đăng nhập đã lưu, chỉ hiện vòng xoay (tránh nháy màn đăng nhập).
  if (dangKiemTra) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Chưa đăng nhập: chỉ có màn đăng nhập và đăng ký.
  if (!token) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <MainStack.Screen
        name="GhiKhoan"
        component={GhiKhoan}
        options={{ title: 'Ghi khoản', presentation: 'modal' }}
      />
      <MainStack.Screen
        name="ChiTietNgay"
        component={ChiTietNgay}
        options={({ route }) => ({ title: formatDateKey(route.params.ngay) })}
      />
      <MainStack.Screen name="Vi" component={Vi} options={{ title: 'Ví của tôi' }} />
      <MainStack.Screen name="DanhMuc" component={DanhMuc} options={{ title: 'Danh mục' }} />
      <MainStack.Screen name="TaoNhom" component={TaoNhom} options={{ title: 'Tạo nhóm' }} />
      <MainStack.Screen name="NhapMaMoi" component={NhapMaMoi} options={{ title: 'Nhập mã mời' }} />
      <MainStack.Screen name="ChiTietNhom" component={ChiTietNhom} options={{ title: 'Nhóm' }} />
      <MainStack.Screen
        name="ThemHoaDon"
        component={ThemHoaDon}
        options={{ title: 'Thêm hóa đơn', presentation: 'modal' }}
      />
      <MainStack.Screen name="QuyetToan" component={QuyetToan} options={{ title: 'Quyết toán' }} />
      <MainStack.Screen name="KeHoachNhom" component={KeHoachNhom} options={{ title: 'Kế hoạch nhóm' }} />
      <MainStack.Screen name="HenTraNo" component={HenTraNo} options={{ title: 'Hẹn trả nợ' }} />
      <MainStack.Screen name="NganSach" component={NganSach} options={{ title: 'Ngân sách' }} />
      <MainStack.Screen name="KhoanSapToi" component={KhoanSapToi} options={{ title: 'Khoản sắp tới' }} />
    </MainStack.Navigator>
  );
}
