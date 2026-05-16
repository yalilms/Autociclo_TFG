import '../global.css';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" options={{ title: '' }} />
        <Stack.Screen
          name="pieza/[id]"
          options={{
            headerShown: true,
            title: 'Detalle Pieza',
            headerStyle: { backgroundColor: '#1e40af' },
            headerTintColor: '#fff',
            headerBackTitle: ' ',
          }}
        />
        <Stack.Screen name="solicitud/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="vehiculo/[id]" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
