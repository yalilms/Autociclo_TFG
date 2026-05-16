import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { SolicitudPresupuesto, formatPrecio } from '@/lib/api';

export default function PedidosScreen() {
  const insets = useSafeAreaInsets();
  const [pedidos, setPedidos] = useState<SolicitudPresupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPedidos = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<SolicitudPresupuesto[]>('/api/solicitudes');
      setPedidos(res.data.filter((s) => s.estado === 'aprobada'));
    } catch {
      // mantener datos anteriores si falla
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPedidos();
    }, [fetchPedidos])
  );

  function renderPedido({ item }: { item: SolicitudPresupuesto }) {
    const numPiezas = item.detalles?.length ?? 0;
    const totalUnidades = item.detalles?.reduce((acc, d) => acc + d.cantidad, 0) ?? 0;
    const fecha = new Date(item.fechaSolicitud).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        onPress={() => router.push(`/solicitud/${item.idSolicitud}`)}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: 16,
          padding: 18,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(16,185,129,0.2)',
        }}
        activeOpacity={0.75}
      >
        {/* Fila superior: ID + fecha */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{
              width: 34, height: 34, borderRadius: 10,
              backgroundColor: 'rgba(16,185,129,0.12)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="receipt-outline" size={17} color="#10b981" />
            </View>
            <Text style={{ color: '#f1f5f9', fontWeight: '800', fontSize: 16 }}>
              Pedido #{item.idSolicitud}
            </Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(16,185,129,0.15)',
            paddingHorizontal: 10, paddingVertical: 4,
            borderRadius: 20, borderWidth: 1, borderColor: '#10b981',
          }}>
            <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>APROBADO</Text>
          </View>
        </View>

        {/* Cliente */}
        {item.cliente?.usuario && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Ionicons name="person-outline" size={13} color="#475569" />
            <Text style={{ color: '#64748b', fontSize: 13 }}>
              {item.cliente.usuario.nombre}
            </Text>
          </View>
        )}

        {/* Separador */}
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 10 }} />

        {/* Fila inferior: piezas + precio + fecha */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="cube-outline" size={13} color="#3b82f6" />
              <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '700' }}>
                {numPiezas} {numPiezas === 1 ? 'pieza' : 'piezas'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="layers-outline" size={13} color="#64748b" />
              <Text style={{ color: '#64748b', fontSize: 12 }}>{totalUnidades} uds.</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            {item.precioTotal && (
              <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 14 }}>
                {formatPrecio(item.precioTotal)} €
              </Text>
            )}
            {item.referenciaOdoo && (
              <Text style={{ color: '#334155', fontSize: 11 }}>{item.referenciaOdoo}</Text>
            )}
            <Text style={{ color: '#334155', fontSize: 11 }}>{fecha}</Text>
          </View>
        </View>

        {/* Flecha */}
        <View style={{ position: 'absolute', right: 18, top: '50%' }}>
          <Ionicons name="chevron-forward" size={16} color="#334155" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
        <Text style={{ color: '#475569', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
          AutoCiclo Worker
        </Text>
        <Text style={{ color: '#f1f5f9', fontSize: 22, fontWeight: '900', marginTop: 2 }}>
          Pedidos a preparar
        </Text>
        <Text style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>
          Solicitudes aprobadas pendientes de envío
        </Text>
      </View>

      {/* Lista */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={{ color: '#334155', marginTop: 12, fontSize: 14 }}>Cargando pedidos...</Text>
          </View>
        ) : (
          <FlatList
            data={pedidos}
            keyExtractor={(item) => item.idSolicitud.toString()}
            renderItem={renderPedido}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchPedidos(true); }}
                tintColor="#10b981"
              />
            }
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 80 }}>
                <Ionicons name="checkmark-done-circle" size={64} color="#10b981" />
                <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 18, marginTop: 16 }}>
                  Sin pedidos pendientes
                </Text>
                <Text style={{ color: '#475569', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
                  No hay solicitudes aprobadas esperando preparación
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </View>
  );
}
