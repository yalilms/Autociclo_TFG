import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: IoniconsName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#334155',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarActiveBackgroundColor: 'transparent',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="escanear"
        options={{
          title: 'Escanear QR',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="qr-code" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="receipt" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehiculos"
        options={{
          title: 'Vehículos',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="car" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
