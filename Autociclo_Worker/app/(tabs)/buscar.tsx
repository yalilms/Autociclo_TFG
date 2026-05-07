import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { Pieza, formatPrecio } from '@/lib/api';

// Caché en memoria para la última búsqueda (patrón del tema 7: evitar peticiones repetidas)
let memoriaCache: Pieza[] = [];

function StockDot({ stock, minimo }: { stock: number; minimo: number }) {
  const color = stock === 0 ? '#ef4444' : stock <= minimo ? '#f59e0b' : '#10b981';
  const label = stock === 0 ? 'Sin stock' : stock <= minimo ? 'Stock bajo' : `${stock} uds.`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export default function BuscarScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Pieza[]>(memoriaCache);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    // Debounce 400ms antes de lanzar la petición
    debounceRef.current = setTimeout(() => doSearch(query.trim()), 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function doSearch(q: string) {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get<Pieza[]>(`/api/piezas/buscar?q=${encodeURIComponent(q)}`);
      setResults(res.data);
      memoriaCache = res.data;
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }: { item: Pieza }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => router.push(`/pieza/${item.idPieza}`)}
      activeOpacity={0.75}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: 'rgba(59,130,246,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name="settings-outline" size={20} color="#3b82f6" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 14 }}>{item.nombre}</Text>
        <Text style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
          {item.codigoPieza} · {item.categoria}
        </Text>
        {item.ubicacionAlmacen ? (
          <Text style={{ color: '#334155', fontSize: 11, marginTop: 2 }}>{item.ubicacionAlmacen}</Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <StockDot stock={item.stockDisponible} minimo={item.stockMinimo} />
        <Text style={{ color: '#475569', fontSize: 12 }}>{formatPrecio(item.precioVenta)} €</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0f172a', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Buscar Piezas</Text>
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
            placeholder="Nombre, código o categoría..."
            placeholderTextColor="#334155"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Resultados */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.idPieza.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 80 }}>
                <Ionicons name="search-outline" size={52} color="#1e293b" />
                <Text style={{ color: '#334155', marginTop: 12, fontSize: 14 }}>
                  {searched
                    ? `Sin resultados para "${query}"`
                    : 'Escribe para buscar una pieza'}
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
