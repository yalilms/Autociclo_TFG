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
import api, { Vehiculo, Pieza, formatPrecio } from '@/lib/api';

interface PiezaEnVehiculo {
  pieza?: Pieza;
  cantidad: number;
  estadoPieza: string;
  fechaExtraccion: string;
  precioUnitario?: number | string;
  notas?: string;
}

const ESTADO_VEHICULO: Record<string, { label: string; color: string; bg: string }> = {
  completo:    { label: 'Completo',    color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  desguazando: { label: 'Desguazando', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  desguazado:  { label: 'Desguazado',  color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
};

const ESTADO_PIEZA: Record<string, { label: string; color: string }> = {
  nueva:     { label: 'Nueva',     color: '#10b981' },
  usada:     { label: 'Usada',     color: '#f59e0b' },
  reparada:  { label: 'Reparada',  color: '#3b82f6' },
};

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'flex-start',
      paddingVertical: 11,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    }}>
      <View style={{
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: 'rgba(59,130,246,0.1)',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Ionicons name={icon as any} size={15} color="#3b82f6" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
        <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '500', marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

export default function DetalleVehiculoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [piezas, setPiezas] = useState<PiezaEnVehiculo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, invRes] = await Promise.all([
        api.get<Vehiculo>(`/api/vehiculos/${id}`),
        api.get<PiezaEnVehiculo[]>(`/api/inventario/vehiculo/${id}`).catch(() => ({ data: [] })),
      ]);
      setVehiculo(vRes.data);
      setPiezas(invRes.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el vehículo.', [
        { text: 'Volver', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!vehiculo) return null;

  const estadoCfg = ESTADO_VEHICULO[vehiculo.estado] ?? { label: vehiculo.estado, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Header manual (sin headerShown nativo) */}
        <View style={{
          paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 20,
          backgroundColor: '#1e293b',
          borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}
          >
            <Ionicons name="arrow-back" size={18} color="#3b82f6" />
            <Text style={{ color: '#3b82f6', fontSize: 14 }}>Vehículos</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: '#f1f5f9', fontSize: 22, fontWeight: '900' }}>
                {vehiculo.marca} {vehiculo.modelo}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 14, marginTop: 3 }}>
                {vehiculo.anio}{vehiculo.color ? ` · ${vehiculo.color}` : ''}
              </Text>
            </View>
            <View style={{
              backgroundColor: estadoCfg.bg,
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
            }}>
              <Text style={{ color: estadoCfg.color, fontSize: 12, fontWeight: '800' }}>
                {estadoCfg.label}
              </Text>
            </View>
          </View>

          {/* Matrícula destacada */}
          <View style={{
            marginTop: 14, backgroundColor: 'rgba(59,130,246,0.1)',
            borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
            borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
            flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
          }}>
            <Ionicons name="document-text-outline" size={16} color="#3b82f6" />
            <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>
              {vehiculo.matricula}
            </Text>
          </View>
        </View>

        {/* Información del vehículo */}
        <View style={{
          marginHorizontal: 16, marginTop: 16,
          backgroundColor: '#1e293b', borderRadius: 18,
          paddingHorizontal: 16, paddingVertical: 4,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        }}>
          <Text style={{
            color: '#94a3b8', fontSize: 11, fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: 1,
            paddingTop: 16, paddingBottom: 4,
          }}>
            Información
          </Text>
          <InfoRow icon="location-outline" label="Ubicación en patio" value={vehiculo.ubicacionGps} />
          <InfoRow
            icon="speedometer-outline"
            label="Kilometraje"
            value={vehiculo.kilometraje != null ? `${vehiculo.kilometraje.toLocaleString('es-ES')} km` : null}
          />
          <InfoRow
            icon="cash-outline"
            label="Precio de compra"
            value={vehiculo.precioCompra != null ? `${formatPrecio(vehiculo.precioCompra)} €` : null}
          />
          <InfoRow
            icon="document-text-outline"
            label="Observaciones"
            value={vehiculo.observaciones || null}
          />
        </View>

        {/* Piezas del vehículo */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{
              color: '#94a3b8', fontSize: 11, fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              Piezas extraídas
            </Text>
            <View style={{
              backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 20,
              paddingHorizontal: 10, paddingVertical: 3,
            }}>
              <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '700' }}>{piezas.length}</Text>
            </View>
          </View>

          {piezas.length === 0 ? (
            <View style={{
              backgroundColor: '#1e293b', borderRadius: 16, padding: 28,
              alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            }}>
              <Ionicons name="layers-outline" size={40} color="#334155" />
              <Text style={{ color: '#475569', fontSize: 14, marginTop: 12 }}>
                Sin piezas registradas en este vehículo
              </Text>
            </View>
          ) : (
            piezas.map((item, i) => {
              const pieza = item.pieza;
              const estadoPieza = ESTADO_PIEZA[item.estadoPieza] ?? { label: item.estadoPieza, color: '#64748b' };
              const stockColor = pieza
                ? pieza.stockDisponible === 0
                  ? '#ef4444'
                  : pieza.stockDisponible <= pieza.stockMinimo
                  ? '#f59e0b'
                  : '#10b981'
                : '#64748b';

              return (
                <TouchableOpacity
                  key={i}
                  style={{
                    backgroundColor: '#1e293b',
                    borderRadius: 16, padding: 16, marginBottom: 10,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                  }}
                  onPress={() => pieza && router.push(`/pieza/${pieza.idPieza}`)}
                  activeOpacity={pieza ? 0.75 : 1}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 14 }}>
                        {pieza?.nombre ?? 'Pieza desconocida'}
                      </Text>
                      <Text style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
                        {pieza?.codigoPieza ?? '—'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ color: estadoPieza.color, fontSize: 11, fontWeight: '700' }}>
                        {estadoPieza.label}
                      </Text>
                      {pieza && (
                        <Text style={{ color: stockColor, fontSize: 18, fontWeight: '900' }}>
                          {pieza.stockDisponible}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="layers-outline" size={12} color="#475569" />
                      <Text style={{ color: '#64748b', fontSize: 12 }}>
                        {item.cantidad} ud{item.cantidad !== 1 ? 's' : ''}.
                      </Text>
                    </View>
                    {item.precioUnitario != null && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="cash-outline" size={12} color="#475569" />
                        <Text style={{ color: '#64748b', fontSize: 12 }}>{formatPrecio(item.precioUnitario)} €/ud</Text>
                      </View>
                    )}
                    {item.fechaExtraccion && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="calendar-outline" size={12} color="#475569" />
                        <Text style={{ color: '#64748b', fontSize: 12 }}>{item.fechaExtraccion}</Text>
                      </View>
                    )}
                    {pieza?.ubicacionAlmacen && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="location-outline" size={12} color="#475569" />
                        <Text style={{ color: '#64748b', fontSize: 12 }}>{pieza.ubicacionAlmacen}</Text>
                      </View>
                    )}
                  </View>

                  {item.notas ? (
                    <Text style={{ color: '#334155', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                      {item.notas}
                    </Text>
                  ) : null}

                  {pieza && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
                      <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: '600' }}>Ver pieza</Text>
                      <Ionicons name="chevron-forward" size={13} color="#3b82f6" style={{ marginLeft: 2 }} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
