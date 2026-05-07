import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { Pieza, Vehiculo, formatPrecio } from '@/lib/api';

type TipoMovimiento = 'entrada' | 'salida';

interface InventarioPieza {
  vehiculo: Vehiculo;
  cantidad: number;
  estadoPieza: string;
  fechaExtraccion: string;
  notas?: string;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: 'rgba(59,130,246,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
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

export default function DetallePiezaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [pieza, setPieza] = useState<Pieza | null>(null);
  const [inventario, setInventario] = useState<InventarioPieza[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState<TipoMovimiento>('entrada');
  const [cantidad, setCantidad] = useState('1');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPieza = useCallback(async () => {
    setLoading(true);
    try {
      // Peticiones en paralelo: detalle pieza + vehículo de origen
      const [piezaRes, invRes] = await Promise.all([
        api.get<Pieza>(`/api/piezas/${id}`),
        api.get<InventarioPieza[]>(`/api/inventario/pieza/${id}`).catch(() => ({ data: [] })),
      ]);
      setPieza(piezaRes.data);
      setInventario(invRes.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar la pieza.', [
        { text: 'Volver', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchPieza();
    }, [fetchPieza])
  );

  function getStockColor(disponible: number, minimo: number) {
    if (disponible === 0) return '#ef4444';
    if (disponible <= minimo) return '#f59e0b';
    return '#10b981';
  }

  function getStockLabel(disponible: number, minimo: number) {
    if (disponible === 0) return 'Sin stock';
    if (disponible <= minimo) return 'Stock bajo';
    return 'En stock';
  }

  function adjustCantidad(delta: number) {
    const next = Math.max(1, (parseInt(cantidad) || 0) + delta);
    setCantidad(next.toString());
  }

  function confirmarMovimiento() {
    const qty = parseInt(cantidad);
    if (!qty || qty < 1) {
      Alert.alert('Cantidad inválida', 'Introduce una cantidad mayor a 0.');
      return;
    }
    if (tipo === 'salida' && qty > pieza!.stockDisponible) {
      Alert.alert('Stock insuficiente', `Solo hay ${pieza!.stockDisponible} unidades disponibles.`);
      return;
    }

    const resultante = tipo === 'entrada'
      ? pieza!.stockDisponible + qty
      : pieza!.stockDisponible - qty;

    Alert.alert(
      'Confirmar movimiento',
      `${tipo === 'entrada' ? 'Añadir' : 'Retirar'} ${qty} ud(s). de "${pieza!.nombre}"\n\nStock resultante: ${resultante} uds.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: ejecutarMovimiento },
      ]
    );
  }

  async function ejecutarMovimiento() {
    setSaving(true);
    try {
      await api.post('/api/stock/movimiento', {
        idPieza: pieza!.idPieza,
        tipo,
        cantidad: parseInt(cantidad),
        notas: notas.trim() || undefined,
      });
      Alert.alert('¡Listo!', 'Movimiento de stock registrado correctamente.');
      await fetchPieza();
      setCantidad('1');
      setNotas('');
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Error al registrar el movimiento.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!pieza) return null;

  const stockColor = getStockColor(pieza.stockDisponible, pieza.stockMinimo);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Cabecera stock */}
      <View style={{ backgroundColor: '#0f172a', padding: 20, paddingTop: 16 }}>
        <Text style={{ color: '#f1f5f9', fontSize: 22, fontWeight: '900' }}>{pieza.nombre}</Text>
        <Text style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>{pieza.codigoPieza}</Text>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
          {/* Stock actual */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#1e293b',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: stockColor + '40',
            }}
          >
            <Text style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
              Stock actual
            </Text>
            <Text style={{ color: stockColor, fontSize: 36, fontWeight: '900', lineHeight: 44 }}>
              {pieza.stockDisponible}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: stockColor }} />
              <Text style={{ color: stockColor, fontSize: 11, fontWeight: '700' }}>
                {getStockLabel(pieza.stockDisponible, pieza.stockMinimo)}
              </Text>
            </View>
          </View>

          {/* Stock mínimo */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#1e293b',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <Text style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
              Stock mínimo
            </Text>
            <Text style={{ color: '#64748b', fontSize: 36, fontWeight: '900', lineHeight: 44 }}>
              {pieza.stockMinimo}
            </Text>
            <Text style={{ color: '#334155', fontSize: 11, marginTop: 2 }}>umbral de alerta</Text>
          </View>
        </View>
      </View>

      {/* Información */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 4,
          backgroundColor: '#1e293b',
          borderRadius: 18,
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 4,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingTop: 16, paddingBottom: 4 }}>
          Información
        </Text>
        <InfoRow icon="pricetag-outline" label="Categoría" value={pieza.categoria} />
        <InfoRow icon="cash-outline" label="Precio de venta" value={`${formatPrecio(pieza.precioVenta)} €`} />
        <InfoRow icon="location-outline" label="Ubicación almacén" value={pieza.ubicacionAlmacen} />
        <InfoRow icon="car-outline" label="Marcas compatibles" value={pieza.compatibleMarcas} />
        <InfoRow icon="document-text-outline" label="Descripción" value={pieza.descripcion} />
      </View>

      {/* Vehículo de origen */}
      {inventario.length > 0 && (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 14,
            backgroundColor: '#1e293b',
            borderRadius: 18,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            Vehículo de origen
          </Text>
          {inventario.map((inv, i) => (
            <View
              key={i}
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 12,
                padding: 14,
                marginBottom: i < inventario.length - 1 ? 10 : 0,
                borderWidth: 1,
                borderColor: 'rgba(59,130,246,0.2)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="car" size={18} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 14 }}>
                    {inv.vehiculo.marca} {inv.vehiculo.modelo} ({inv.vehiculo.anio})
                  </Text>
                  <Text style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
                    {inv.vehiculo.matricula}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Ionicons name="layers-outline" size={13} color="#475569" />
                  <Text style={{ color: '#64748b', fontSize: 12 }}>
                    {inv.cantidad} ud(s) · {inv.estadoPieza}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Ionicons name="calendar-outline" size={13} color="#475569" />
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{inv.fechaExtraccion}</Text>
                </View>
              </View>
              {inv.notas ? (
                <Text style={{ color: '#334155', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                  {inv.notas}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* Actualizar stock */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 14,
          backgroundColor: '#1e293b',
          borderRadius: 18,
          padding: 20,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Actualizar Stock
        </Text>

        {/* Entrada / Salida */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: tipo === 'entrada' ? 'rgba(16,185,129,0.2)' : '#0f172a',
              borderWidth: 1,
              borderColor: tipo === 'entrada' ? '#10b981' : 'rgba(255,255,255,0.06)',
            }}
            onPress={() => setTipo('entrada')}
          >
            <Ionicons name="add-circle" size={18} color={tipo === 'entrada' ? '#10b981' : '#334155'} />
            <Text style={{ color: tipo === 'entrada' ? '#10b981' : '#475569', fontWeight: '700' }}>
              Entrada
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: tipo === 'salida' ? 'rgba(239,68,68,0.2)' : '#0f172a',
              borderWidth: 1,
              borderColor: tipo === 'salida' ? '#ef4444' : 'rgba(255,255,255,0.06)',
            }}
            onPress={() => setTipo('salida')}
          >
            <Ionicons name="remove-circle" size={18} color={tipo === 'salida' ? '#ef4444' : '#334155'} />
            <Text style={{ color: tipo === 'salida' ? '#ef4444' : '#475569', fontWeight: '700' }}>
              Salida
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selector cantidad */}
        <Text style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Cantidad
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: '#0f172a',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
            onPress={() => adjustCantidad(-1)}
          >
            <Ionicons name="remove" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <TextInput
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 28,
              fontWeight: '900',
              color: '#f1f5f9',
              backgroundColor: '#0f172a',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              paddingVertical: 10,
            }}
            value={cantidad}
            onChangeText={(v) => setCantidad(v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: '#0f172a',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
            onPress={() => adjustCantidad(1)}
          >
            <Ionicons name="add" size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Notas */}
        <Text style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Notas (opcional)
        </Text>
        <TextInput
          style={{
            backgroundColor: '#0f172a',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: '#e2e8f0',
            fontSize: 14,
            marginBottom: 20,
            minHeight: 56,
          }}
          placeholder="Motivo del movimiento..."
          placeholderTextColor="#334155"
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={2}
        />

        {/* Botón confirmar */}
        <TouchableOpacity
          style={{
            backgroundColor: saving ? '#1d4ed8' : '#3b82f6',
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 6,
          }}
          onPress={confirmarMovimiento}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          )}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {saving ? 'Registrando...' : 'Confirmar movimiento'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
