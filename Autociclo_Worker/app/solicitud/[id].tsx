import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { SolicitudPresupuesto, DetalleSolicitud, formatPrecio, AUTH_REDIRECT } from '@/lib/api';

export default function DetalleSolicitudScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [solicitud, setSolicitud] = useState<SolicitudPresupuesto | null>(null);
  const [loading, setLoading] = useState(true);
  // ids de piezas ya recogidas en esta sesión
  const [recogidas, setRecogidas] = useState<Set<number>>(new Set());
  const [recogiendo, setRecogiendo] = useState<number | null>(null);

  const fetchSolicitud = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<SolicitudPresupuesto>(`/api/solicitudes/${id}`);
      setSolicitud(res.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el pedido.', [
        { text: 'Volver', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchSolicitud();
    }, [fetchSolicitud])
  );

  async function recogerPieza(detalle: DetalleSolicitud) {
    const pieza = detalle.pieza;
    if (!pieza) return;

    if (detalle.cantidad > pieza.stockDisponible) {
      Alert.alert(
        'Stock insuficiente',
        `Solo hay ${pieza.stockDisponible} ud(s). disponibles de "${pieza.nombre}" pero se necesitan ${detalle.cantidad}.`,
        [{ text: 'Entendido' }]
      );
      return;
    }

    Alert.alert(
      'Recoger pieza',
      `Retirar ${detalle.cantidad} ud(s). de:\n"${pieza.nombre}"\n\nUbicación: ${pieza.ubicacionAlmacen || 'No especificada'}\n\nStock actual: ${pieza.stockDisponible} uds.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar recogida',
          onPress: async () => {
            setRecogiendo(pieza.idPieza);
            try {
              await api.post('/api/stock/movimiento', {
                idPieza: pieza.idPieza,
                tipo: 'salida',
                cantidad: detalle.cantidad,
                notas: `Pedido #${solicitud?.idSolicitud}`,
              });
              setRecogidas((prev) => new Set(prev).add(pieza.idPieza));
              // Refrescar para actualizar stock
              await fetchSolicitud();
            } catch (err: any) {
              if (err === AUTH_REDIRECT) return;
              const msg = err.response?.data?.error ?? err.response?.data?.message ?? 'Error al registrar la salida.';
              Alert.alert('Error', msg);
            } finally {
              setRecogiendo(null);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!solicitud) return null;

  const todasRecogidas =
    solicitud.detalles.length > 0 &&
    solicitud.detalles.every((d) => d.pieza && recogidas.has(d.pieza.idPieza));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Header con botón atrás */}
      <View style={{ backgroundColor: '#1e293b', paddingTop: insets.top + 8, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Ionicons name="arrow-back" size={18} color="#3b82f6" />
          <Text style={{ color: '#3b82f6', fontSize: 14 }}>Pedidos</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: '#f1f5f9', fontSize: 22, fontWeight: '900' }}>
              Pedido #{solicitud.idSolicitud}
            </Text>
            {solicitud.cliente?.usuario && (
              <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                {solicitud.cliente.usuario.nombre} · {solicitud.cliente.usuario.email}
              </Text>
            )}
          </View>
          {solicitud.referenciaOdoo && (
            <View style={{ backgroundColor: 'rgba(59,130,246,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)' }}>
              <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: '700' }}>{solicitud.referenciaOdoo}</Text>
            </View>
          )}
        </View>

        {/* Info precio + fecha */}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
          {solicitud.precioTotal && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="cash-outline" size={14} color="#10b981" />
              <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 15 }}>
                {formatPrecio(solicitud.precioTotal)} €
              </Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="calendar-outline" size={14} color="#475569" />
            <Text style={{ color: '#64748b', fontSize: 13 }}>
              {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES')}
            </Text>
          </View>
        </View>

        {/* Banner todo recogido */}
        {todasRecogidas && (
          <View style={{ marginTop: 14, backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#10b981' }}>
            <Ionicons name="checkmark-circle" size={22} color="#10b981" />
            <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 14 }}>
              ¡Todas las piezas recogidas!
            </Text>
          </View>
        )}
      </View>

      {/* Sección piezas */}
      <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
          Piezas a preparar — {solicitud.detalles.length} {solicitud.detalles.length === 1 ? 'pieza' : 'piezas'}
        </Text>

        {solicitud.detalles.map((detalle, i) => {
          const pieza = detalle.pieza;
          if (!pieza) return null;

          const yaRecogida = recogidas.has(pieza.idPieza);
          const estaRecogiendo = recogiendo === pieza.idPieza;
          const sinStock = detalle.cantidad > pieza.stockDisponible;
          const stockColor = pieza.stockDisponible === 0
            ? '#ef4444'
            : pieza.stockDisponible <= pieza.stockMinimo
            ? '#f59e0b'
            : '#10b981';

          return (
            <View
              key={i}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: yaRecogida
                  ? 'rgba(16,185,129,0.35)'
                  : sinStock
                  ? 'rgba(239,68,68,0.25)'
                  : 'rgba(255,255,255,0.06)',
              }}
            >
              {/* Nombre + código */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }}>{pieza.nombre}</Text>
                  <Text style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>{pieza.codigoPieza}</Text>
                </View>
                {yaRecogida && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 12 }}>Recogida</Text>
                  </View>
                )}
              </View>

              {/* Datos: cantidad + ubicación + stock */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Ionicons name="layers-outline" size={13} color="#3b82f6" />
                  <Text style={{ color: '#3b82f6', fontWeight: '700', fontSize: 13 }}>
                    {detalle.cantidad} {detalle.cantidad === 1 ? 'unidad' : 'unidades'}
                  </Text>
                </View>
                {pieza.ubicacionAlmacen && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="location-outline" size={13} color="#f59e0b" />
                    <Text style={{ color: '#f59e0b', fontSize: 13, fontWeight: '600' }}>
                      {pieza.ubicacionAlmacen}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: stockColor }} />
                  <Text style={{ color: stockColor, fontSize: 12, fontWeight: '600' }}>
                    Stock: {pieza.stockDisponible} uds.
                  </Text>
                </View>
              </View>

              {/* Botón recoger */}
              {!yaRecogida && (
                <TouchableOpacity
                  onPress={() => recogerPieza(detalle)}
                  disabled={estaRecogiendo}
                  style={{
                    backgroundColor: sinStock ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                    borderRadius: 12,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderWidth: 1,
                    borderColor: sinStock ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)',
                  }}
                  activeOpacity={0.7}
                >
                  {estaRecogiendo ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <Ionicons
                      name={sinStock ? 'warning-outline' : 'hand-left-outline'}
                      size={16}
                      color={sinStock ? '#ef4444' : '#10b981'}
                    />
                  )}
                  <Text style={{
                    color: sinStock ? '#ef4444' : '#10b981',
                    fontWeight: '700',
                    fontSize: 14,
                  }}>
                    {estaRecogiendo
                      ? 'Registrando...'
                      : sinStock
                      ? 'Stock insuficiente'
                      : `Recoger ${detalle.cantidad} ud(s).`}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Notas del detalle */}
              {detalle.notas && (
                <Text style={{ color: '#334155', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                  Nota: {detalle.notas}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
