import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/auth-store';
import { LoadingScreen } from '../screens/LoadingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { RegulationScreen } from '../screens/RegulationScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

type AuthStackParamList = {
  Login: undefined;
};

type AppTabsParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  Progress: undefined;
  Regulation: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator<AppTabsParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tabs.Screen name="CheckIn" component={CheckInScreen} options={{ title: 'Chequeo' }} />
      <Tabs.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progreso' }} />
      <Tabs.Screen name="Regulation" component={RegulationScreen} options={{ title: 'Regulación' }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const isAuthenticated = useAuthStore((state) => !!state.token && !!state.access);

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="App" component={AppNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}
