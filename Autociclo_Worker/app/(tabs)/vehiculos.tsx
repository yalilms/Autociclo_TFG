import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { Vehiculo } from '@/lib/api';

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  completo:    { label: 'Completo',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  desguazando: { label: 'Desguazando', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  desguazado:  { label: 'Desguazado',  color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
};

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
  return (
    <View style={{
      backgroundColor: cfg.bg,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: 'flex-start',
    }}>
      <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
    </View>
  );
}

export default function VehiculosScreen() {
  const insets = useSafeAreaInsets();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('');

  const fetchVehiculos = useCallback(async () => {
    try {
      const res = await api.get<Vehiculo[]>('/api/vehiculos');
      setVehiculos(res.data);
    } catch {
      // mantener datos previos
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVehiculos();
    }, [fetchVehiculos])
  );

  const filtered = vehiculos.filter((v) => {
    const q = filtro.toLowerCase();
    return (
      !q ||
      v.matricula.toLowerCase().includes(q) ||
      v.marca.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q) ||
      v.estado.toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }: { item: Vehiculo }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
      }}
      onPress={() => router.push(`/vehiculo/${item.idVehiculo}`)}
      activeOpacity={0.75}
    >
      {/* Fila superior: icono + nombre + badge estado */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: 'rgba(59,130,246,0.15)',
          alignItems: 'center', justifyContent: 'center',
          marginRight: 12, flexShrink: 0,
        }}>
          <Ionicons name="car" size={22} color="#3b82f6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
            {item.marca} {item.modelo}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 1 }}>{item.anio}</Text>
        </View>
        <EstadoBadge estado={item.estado} />
      </View>

      {/* Fila secundaria: matrícula + color */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="document-text-outline" size={13} color="#475569" />
          <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}>{item.matricula}</Text>
        </View>
        {item.color ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="color-palette-outline" size={13} color="#475569" />
            <Text style={{ color: '#64748b', fontSize: 12 }}>{item.color}</Text>
          </View>
        ) : null}
      </View>

      {/* Ubicación en su propia línea para que no se desborde */}
      {item.ubicacionGps ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, gap: 5 }}>
          <Ionicons name="location-outline" size={13} color="#475569" style={{ marginTop: 1 }} />
          <Text style={{ color: '#64748b', fontSize: 12, flex: 1 }} numberOfLines={2}>
            {item.ubicacionGps}
          </Text>
        </View>
      ) : null}

      {/* Ver detalle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 }}>
        <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600' }}>Ver piezas</Text>
        <Ionicons name="chevron-forward" size={14} color="#3b82f6" style={{ marginLeft: 3 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Vehículos en Patio</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#1e293b', borderRadius: 12,
          marginTop: 12, paddingHorizontal: 12,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        }}>
          <Ionicons name="search" size={18} color="#475569" />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#f1f5f9', fontSize: 14 }}
            placeholder="Matrícula, marca, modelo..."
            placeholderTextColor="#334155"
            value={filtro}
            onChangeText={setFiltro}
            autoCorrect={false}
          />
          {filtro.length > 0 && (
            <TouchableOpacity onPress={() => setFiltro('')}>
              <Ionicons name="close-circle" size={18} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <Text style={{ color: '#475569', fontSize: 12 }}>
          {filtered.length} vehículo{filtered.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.idVehiculo.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchVehiculos(); }}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Ionicons name="car-outline" size={52} color="#1e293b" />
              <Text style={{ color: '#334155', marginTop: 12, fontSize: 14 }}>
                {filtro ? 'Sin resultados para ese filtro' : 'No hay vehículos registrados'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}
