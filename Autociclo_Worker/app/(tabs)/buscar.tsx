import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { Pieza, formatPrecio } from '@/lib/api';

function StockBadge({ stock, minimo }: { stock: number; minimo: number }) {
  const color = stock === 0 ? '#ef4444' : stock <= minimo ? '#f59e0b' : '#10b981';
  const label = stock === 0 ? 'Sin stock' : stock <= minimo ? 'Bajo' : 'OK';
  return (
    <View style={{ alignItems: 'flex-end', gap: 2 }}>
      <Text style={{ color, fontSize: 18, fontWeight: '900', lineHeight: 22 }}>{stock}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
        <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{label}</Text>
      </View>
    </View>
  );
}

export default function BuscarScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [allPiezas, setAllPiezas] = useState<Pieza[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const loadPiezas = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<Pieza[]>('/api/piezas');
      setAllPiezas(res.data);
    } catch {
      // mantener datos anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPiezas();
  }, [loadPiezas]);

  // Refresca al volver a la pestaña
  useFocusEffect(
    useCallback(() => {
      loadPiezas(true);
    }, [loadPiezas])
  );

  // Categorías únicas extraídas de los datos reales
  const categorias = Array.from(new Set(allPiezas.map((p) => p.categoria).filter(Boolean))).sort();

  // Filtrado local: por query + categoría seleccionada
  const q = query.trim().toLowerCase();
  const resultado = allPiezas.filter((p) => {
    const matchQuery =
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      p.codigoPieza.toLowerCase().includes(q) ||
      (p.categoria?.toLowerCase().includes(q) ?? false) ||
      (p.compatibleMarcas?.toLowerCase().includes(q) ?? false);
    const matchCat = !categoriaSeleccionada || p.categoria === categoriaSeleccionada;
    return matchQuery && matchCat;
  });

  const hayFiltro = q.length > 0 || categoriaSeleccionada !== null;

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
          flexShrink: 0,
        }}
      >
        <Ionicons name="settings-outline" size={20} color="#3b82f6" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
          {item.nombre}
        </Text>
        <Text style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
          {item.codigoPieza}
          {item.categoria ? ` · ${item.categoria}` : ''}
        </Text>
        {item.ubicacionAlmacen ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Ionicons name="location-outline" size={11} color="#334155" />
            <Text style={{ color: '#334155', fontSize: 11 }}>{item.ubicacionAlmacen}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <StockBadge stock={item.stockDisponible} minimo={item.stockMinimo} />
        <Text style={{ color: '#475569', fontSize: 11 }}>{formatPrecio(item.precioVenta)} €</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: insets.top }}>
      {/* Header fijo */}
      <View style={{ backgroundColor: '#0f172a', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Piezas</Text>

        {/* Barra de búsqueda */}
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
            ref={inputRef}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#f1f5f9', fontSize: 14 }}
            placeholder="Nombre, código, marca..."
            placeholderTextColor="#334155"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#475569" />
            </TouchableOpacity>
          )}
        </View>

        {/* Chips de categoría */}
        {categorias.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10 }}
            contentContainerStyle={{ gap: 6, paddingRight: 4 }}
          >
            {/* Chip "Todos" siempre primero */}
            <TouchableOpacity
              onPress={() => setCategoriaSeleccionada(null)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: categoriaSeleccionada === null ? '#3b82f6' : 'rgba(59,130,246,0.1)',
                borderWidth: 1,
                borderColor: categoriaSeleccionada === null ? '#3b82f6' : 'rgba(59,130,246,0.25)',
              }}
            >
              <Text style={{ color: categoriaSeleccionada === null ? '#fff' : '#60a5fa', fontSize: 12, fontWeight: '700' }}>
                Todos
              </Text>
            </TouchableOpacity>

            {categorias.map((cat) => {
              const activa = categoriaSeleccionada === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoriaSeleccionada(activa ? null : cat)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: activa ? '#3b82f6' : 'rgba(59,130,246,0.1)',
                    borderWidth: 1,
                    borderColor: activa ? '#3b82f6' : 'rgba(59,130,246,0.25)',
                  }}
                >
                  <Text
                    style={{
                      color: activa ? '#fff' : '#60a5fa',
                      fontSize: 12,
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Contador de resultados */}
      {!loading && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
          <Text style={{ color: '#334155', fontSize: 12 }}>
            {hayFiltro
              ? `${resultado.length} resultado${resultado.length !== 1 ? 's' : ''}`
              : `${allPiezas.length} pieza${allPiezas.length !== 1 ? 's' : ''} en almacén`}
          </Text>
        </View>
      )}

      {/* Lista */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ color: '#334155', marginTop: 12, fontSize: 14 }}>Cargando piezas...</Text>
          </View>
        ) : (
          <FlatList
            data={resultado}
            keyExtractor={(item) => item.idPieza.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadPiezas(); }}
                tintColor="#3b82f6"
              />
            }
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 80 }}>
                <Ionicons name="search-outline" size={52} color="#1e293b" />
                <Text style={{ color: '#475569', marginTop: 12, fontSize: 15, fontWeight: '600' }}>
                  Sin resultados
                </Text>
                <Text style={{ color: '#334155', marginTop: 4, fontSize: 13 }}>
                  Prueba con otro nombre, código o categoría
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </View>
  );
}
