import 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthBootstrap } from './src/hooks/useAuthBootstrap';

export default function App() {
  const scheme = useColorScheme();
  useAuthBootstrap();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
