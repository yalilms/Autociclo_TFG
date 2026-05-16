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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { Pieza, SolicitudPresupuesto, formatPrecio } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const POLL_INTERVAL = 30_000;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  // Piezas con stock bajo (filtrado local de /api/piezas — endpoint público)
  const [alertas, setAlertas] = useState<Pieza[]>([]);
  // Solicitudes aprobadas pendientes de preparar
  const [pedidosAprobados, setPedidosAprobados] = useState<SolicitudPresupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // /api/piezas es público → siempre funciona sin auth
      const [piezasRes, solicitudesRes] = await Promise.all([
        api.get<Pieza[]>('/api/piezas'),
        api.get<SolicitudPresupuesto[]>('/api/solicitudes').catch(() => ({ data: [] as SolicitudPresupuesto[] })),
      ]);

      // Filtrar las que tienen stock bajo (igual que la lógica visual del buscar)
      const bajoStock = piezasRes.data.filter(
        (p) => p.stockDisponible <= p.stockMinimo
      );
      setAlertas(bajoStock);

      // Solo pedidos aprobados (el empleado tiene que ir a prepararlos)
      const aprobadas = solicitudesRes.data.filter((s) => s.estado === 'aprobada');
      setPedidosAprobados(aprobadas);

      setLastUpdate(new Date());
    } catch {
      // sin conexión: mantener datos anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

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

  function getAlertaStyle(disponible: number, minimo: number) {
    if (disponible === 0)
      return { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', text: '#f87171', icon: 'close-circle' as const };
    if (disponible <= minimo)
      return { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', text: '#fbbf24', icon: 'warning' as const };
    return { border: '#10b981', bg: 'rgba(16,185,129,0.08)', text: '#34d399', icon: 'checkmark-circle' as const };
  }

  const sinStock = alertas.filter((a) => a.stockDisponible === 0).length;
  const stockBajo = alertas.filter((a) => a.stockDisponible > 0 && a.stockDisponible <= a.stockMinimo).length;

  const renderAlerta = ({ item }: { item: Pieza }) => {
    const style = getAlertaStyle(item.stockDisponible, item.stockMinimo);
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
            <Ionicons name={style.icon} size={20} color={style.text} />
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
      <View style={{ backgroundColor: '#0f172a', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {lastUpdate && (
              <Text style={{ color: '#334155', fontSize: 11 }}>
                {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
            <TouchableOpacity
              style={{
                width: 38, height: 38, borderRadius: 19,
                backgroundColor: 'rgba(239,68,68,0.15)',
                alignItems: 'center', justifyContent: 'center',
              }}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={18} color="#f87171" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tarjetas resumen */}
        <View style={{ flexDirection: 'row', marginTop: 14, gap: 8 }}>
          <TouchableOpacity
            onPress={() => router.navigate('/(tabs)/pedidos' as any)}
            style={{
              flex: 1, borderRadius: 14, padding: 12, borderWidth: 1,
              backgroundColor: pedidosAprobados.length > 0 ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.08)',
              borderColor: pedidosAprobados.length > 0 ? '#10b981' : 'rgba(16,185,129,0.2)',
            }}
          >
            <Text style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Pedidos</Text>
            <Text style={{ color: '#10b981', fontSize: 26, fontWeight: '900' }}>{pedidosAprobados.length}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }}>
            <Text style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Sin stock</Text>
            <Text style={{ color: '#f87171', fontSize: 26, fontWeight: '900' }}>{sinStock}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' }}>
            <Text style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Stock bajo</Text>
            <Text style={{ color: '#fbbf24', fontSize: 26, fontWeight: '900' }}>{stockBajo}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ color: '#334155', marginTop: 12, fontSize: 14 }}>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(item) => item.idPieza.toString()}
          renderItem={renderAlerta}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchData(); }}
              tintColor="#3b82f6"
            />
          }
          // Sección de notificaciones de pedidos ENCIMA de las alertas de stock
          ListHeaderComponent={
            pedidosAprobados.length > 0 ? (
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <View style={{
                    width: 22, height: 22, borderRadius: 11,
                    backgroundColor: '#10b981',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{pedidosAprobados.length}</Text>
                  </View>
                  <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Pedidos que preparar
                  </Text>
                </View>

                {pedidosAprobados.map((sol) => (
                  <TouchableOpacity
                    key={sol.idSolicitud}
                    onPress={() => router.push(`/solicitud/${sol.idSolicitud}`)}
                    activeOpacity={0.75}
                    style={{
                      backgroundColor: 'rgba(16,185,129,0.08)',
                      borderWidth: 1,
                      borderColor: 'rgba(16,185,129,0.35)',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: 'rgba(16,185,129,0.15)',
                      alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Ionicons name="cube-outline" size={22} color="#10b981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#f1f5f9', fontWeight: '800', fontSize: 15 }}>
                          Pedido #{sol.idSolicitud}
                        </Text>
                        {sol.referenciaOdoo ? (
                          <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: '700' }}>{sol.referenciaOdoo}</Text>
                        ) : null}
                      </View>
                      {sol.cliente?.usuario && (
                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                          {sol.cliente.usuario.nombre}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="layers-outline" size={12} color="#475569" />
                          <Text style={{ color: '#475569', fontSize: 12 }}>
                            {sol.detalles?.length ?? '?'} {(sol.detalles?.length ?? 0) === 1 ? 'pieza' : 'piezas'}
                          </Text>
                        </View>
                        {sol.precioTotal ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="cash-outline" size={12} color="#10b981" />
                            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700' }}>
                              {formatPrecio(sol.precioTotal)} €
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#334155" />
                  </TouchableOpacity>
                ))}

                {/* Separador antes de alertas de stock */}
                {alertas.length > 0 && (
                  <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 12 }}>
                    Alertas de stock
                  </Text>
                )}
              </View>
            ) : alertas.length > 0 ? (
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Alertas de stock
              </Text>
            ) : null
          }
          ListEmptyComponent={
            pedidosAprobados.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 18, marginTop: 16 }}>
                  ¡Todo en orden!
                </Text>
                <Text style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>
                  Sin pedidos ni alertas de stock
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        />
      )}
    </View>
  );
}
