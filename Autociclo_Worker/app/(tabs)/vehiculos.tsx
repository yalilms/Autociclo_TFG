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
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { Vehiculo } from '@/lib/api';

// Enum real de la BD: 'completo' | 'desguazando' | 'desguazado'
const ESTADO_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  completo:    { label: 'Completo',    color: '#10b981', dot: '#10b981' },
  desguazando: { label: 'Desguazando', color: '#f59e0b', dot: '#f59e0b' },
  desguazado:  { label: 'Desguazado',  color: '#64748b', dot: '#64748b' },
};

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: '#3b82f6', dot: '#3b82f6' };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: cfg.dot }} />
      <Text style={{ color: cfg.color, fontSize: 12, fontWeight: '700' }}>{cfg.label}</Text>
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
      // mantener datos previos si hay error de red
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
    <View
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: 'rgba(59,130,246,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="car" size={22} color="#3b82f6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }}>
              {item.marca} {item.modelo}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 1 }}>{item.anio}</Text>
          </View>
        </View>
        <EstadoBadge estado={item.estado} />
      </View>

      <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="document-text-outline" size={13} color="#475569" />
          <Text style={{ color: '#64748b', fontSize: 12 }}>{item.matricula}</Text>
        </View>
        {item.color ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="color-palette-outline" size={13} color="#475569" />
            <Text style={{ color: '#64748b', fontSize: 12 }}>{item.color}</Text>
          </View>
        ) : null}
        {item.ubicacionGps ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="location-outline" size={13} color="#475569" />
            <Text style={{ color: '#64748b', fontSize: 12 }} numberOfLines={1}>{item.ubicacionGps}</Text>
          </View>
        ) : null}
      </View>

      {item.observaciones ? (
        <Text style={{ color: '#475569', fontSize: 12, marginTop: 8, fontStyle: 'italic' }} numberOfLines={2}>
          {item.observaciones}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0f172a', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Vehículos en Patio</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1e293b',
            borderRadius: 12,
            marginTop: 12,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <Ionicons name="search" size={18} color="#475569" />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#f1f5f9', fontSize: 14 }}
            placeholder="Matrícula, marca o estado..."
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

      {/* Contador */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <Text style={{ color: '#475569', fontSize: 12 }}>
          {filtered.length} vehículo{filtered.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.idVehiculo.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
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
        />
      )}
    </View>
  );
}
