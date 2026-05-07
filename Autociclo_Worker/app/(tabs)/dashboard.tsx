import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { Pieza } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const POLL_INTERVAL = 30_000;

// /api/stock/alertas devuelve List<Pieza> directamente
type AlertaStock = Pieza;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAlertas = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<AlertaStock[]>('/api/stock/alertas');
      setAlertas(res.data);
      setLastUpdate(new Date());
    } catch {
      // sin conexión: mantener datos anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Polling cada 30s — equivalente al patrón onSnapshot de Firestore del curso
  useEffect(() => {
    fetchAlertas();
    const interval = setInterval(() => fetchAlertas(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlertas]);

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  function getCardStyle(disponible: number, minimo: number) {
    if (disponible === 0) return { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', badge: '#ef4444', text: '#f87171' };
    if (disponible <= minimo) return { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', badge: '#f59e0b', text: '#fbbf24' };
    return { border: '#10b981', bg: 'rgba(16,185,129,0.08)', badge: '#10b981', text: '#34d399' };
  }

  const sinStock = alertas.filter((a) => a.stockDisponible === 0).length;
  const stockBajo = alertas.filter((a) => a.stockDisponible > 0).length;

  const renderAlerta = ({ item }: { item: AlertaStock }) => {
    const style = getCardStyle(item.stockDisponible, item.stockMinimo);
    return (
      <TouchableOpacity
        style={{
          backgroundColor: style.bg,
          borderWidth: 1,
          borderColor: style.border,
          borderRadius: 16,
          padding: 16,
          marginBottom: 10,
        }}
        onPress={() => router.push(`/pieza/${item.idPieza}`)}
        activeOpacity={0.75}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }}>{item.nombre}</Text>
            <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{item.codigoPieza}</Text>
            {item.ubicacionAlmacen ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 }}>
                <Ionicons name="location-outline" size={12} color="#475569" />
                <Text style={{ color: '#475569', fontSize: 12 }}>{item.ubicacionAlmacen}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Ionicons
              name={item.stockDisponible === 0 ? 'close-circle' : 'warning'}
              size={20}
              color={style.badge}
            />
            <Text style={{ color: style.text, fontSize: 26, fontWeight: '900', lineHeight: 32 }}>
              {item.stockDisponible}
            </Text>
            <Text style={{ color: '#475569', fontSize: 11 }}>/ mín {item.stockMinimo}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0f172a', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff' }}
              resizeMode="contain"
            />
            <View>
              <Text style={{ color: '#475569', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
                AutoCiclo Worker
              </Text>
              <Text style={{ color: '#f1f5f9', fontSize: 17, fontWeight: '800', marginTop: 1 }}>
                Hola, {user?.nombre ?? 'Empleado'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: 'rgba(239,68,68,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#f87171" />
          </TouchableOpacity>
        </View>

        {/* Tarjetas resumen */}
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(59,130,246,0.12)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' }}>
            <Text style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Alertas</Text>
            <Text style={{ color: '#3b82f6', fontSize: 28, fontWeight: '900' }}>{alertas.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }}>
            <Text style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Sin stock</Text>
            <Text style={{ color: '#f87171', fontSize: 28, fontWeight: '900' }}>{sinStock}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' }}>
            <Text style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Stock bajo</Text>
            <Text style={{ color: '#fbbf24', fontSize: 28, fontWeight: '900' }}>{stockBajo}</Text>
          </View>
        </View>
      </View>

      {/* Lista */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
            Piezas con stock bajo
          </Text>
          {lastUpdate && (
            <Text style={{ color: '#334155', fontSize: 11 }}>
              {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ color: '#334155', marginTop: 12, fontSize: 14 }}>Cargando alertas...</Text>
          </View>
        ) : (
          <FlatList
            data={alertas}
            keyExtractor={(item) => item.idPieza.toString()}
            renderItem={renderAlerta}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchAlertas(); }}
                tintColor="#3b82f6"
              />
            }
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 80 }}>
                <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 18, marginTop: 16 }}>
                  ¡Todo en orden!
                </Text>
                <Text style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>
                  No hay alertas de stock
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </View>
  );
}
