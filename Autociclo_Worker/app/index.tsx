import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { user, isLoaded } = useAuthStore();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-800">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return user ? <Redirect href="/(tabs)/dashboard" /> : <Redirect href="/login" />;
}
