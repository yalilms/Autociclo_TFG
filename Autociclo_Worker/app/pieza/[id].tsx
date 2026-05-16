import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'qrcode';
import { SvgXml } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api, { Pieza, Vehiculo, CodigoQR, formatPrecio, AUTH_REDIRECT } from '@/lib/api';
import { getToken, isTokenExpired } from '@/lib/auth';

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
  const [confirmando, setConfirmando] = useState(false);
  const [sessionOk, setSessionOk] = useState(true);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [qrCodigo, setQrCodigo] = useState<string | null>(null);
  const [generandoQr, setGenerandoQr] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);

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
      // Verificar sesión al entrar en la pantalla
      getToken().then((t) => setSessionOk(!!t && !isTokenExpired(t)));
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

  function prepararMovimiento() {
    if (!sessionOk) {
      Alert.alert(
        'Sesión caducada',
        'Tu sesión ha expirado. Inicia sesión de nuevo para continuar.',
        [{ text: 'Iniciar sesión', onPress: () => router.replace('/login') }]
      );
      return;
    }
    const qty = parseInt(cantidad);
    if (!qty || qty < 1) {
      Alert.alert('Cantidad inválida', 'Introduce una cantidad mayor a 0.');
      return;
    }
    if (tipo === 'salida' && qty > pieza!.stockDisponible) {
      Alert.alert('Stock insuficiente', `Solo hay ${pieza!.stockDisponible} unidades disponibles.`);
      return;
    }
    setConfirmando(true);
  }

  async function ejecutarMovimiento() {
    setConfirmando(false);
    setSaving(true);
    try {
      await api.post('/api/stock/movimiento', {
        idPieza: pieza!.idPieza,
        tipo,
        cantidad: parseInt(cantidad),
        notas: notas.trim() || undefined,
      });
      await fetchPieza();
      setCantidad('1');
      setNotas('');
    } catch (err: any) {
      if (err === AUTH_REDIRECT) return;
      const status = err.response?.status;
      const msg = err.response?.data?.error ?? err.response?.data?.message
        ?? (err.code === 'ECONNABORTED' ? 'Tiempo de espera agotado.' : 'Error de red.');
      Alert.alert('Error', `${msg}${status ? ` [${status}]` : ''}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleVerQR() {
    setGenerandoQr(true);
    try {
      // Primero buscamos si ya existe un QR para esta pieza
      let codigoUnico: string;
      const existentes = await api.get<CodigoQR[]>(`/api/codigos-qr/buscar?tipo=pieza&id=${pieza!.idPieza}`)
        .catch(() => ({ data: [] as CodigoQR[] }));

      if (existentes.data.length > 0) {
        codigoUnico = existentes.data[0].codigoUnico;
      } else {
        // No existe — generamos uno nuevo
        const res = await api.post<CodigoQR>('/api/codigos-qr', {
          tipo: 'pieza',
          idReferencia: pieza!.idPieza,
        });
        codigoUnico = res.data.codigoUnico;
      }

      const svg = await QRCode.toString(codigoUnico, { type: 'svg', width: 280, margin: 2 });
      setQrSvg(svg);
      setQrCodigo(codigoUnico);
      setQrVisible(true);
    } catch (err: any) {
      if (err === AUTH_REDIRECT) return;
      const msg = err.response?.data?.error ?? err.response?.data?.message ?? 'No se pudo generar el código QR.';
      Alert.alert('Error QR', msg);
    } finally {
      setGenerandoQr(false);
    }
  }

  async function handleImprimir() {
    if (!qrCodigo || !pieza || !qrSvg) return;
    setImprimiendo(true);
    // SVG inline evita canvas (no disponible en React Native)
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; padding: 48px 32px; background: #fff; }
    .titulo { font-size: 22px; font-weight: bold; margin-bottom: 4px; text-align: center; }
    .sub    { font-size: 13px; color: #666; margin-bottom: 6px; text-align: center; }
    .ubic   { font-size: 12px; color: #999; margin-bottom: 28px; text-align: center; }
    .qr svg { width: 280px; height: 280px; }
    .codigo { margin-top: 16px; font-size: 10px; color: #aaa; word-break: break-all; text-align: center; max-width: 300px; }
    .footer { margin-top: 32px; font-size: 11px; color: #ccc; }
  </style>
</head>
<body>
  <div class="titulo">${pieza.nombre}</div>
  <div class="sub">${pieza.codigoPieza}</div>
  ${pieza.ubicacionAlmacen ? `<div class="ubic">${pieza.ubicacionAlmacen}</div>` : ''}
  <div class="qr">${qrSvg}</div>
  <div class="codigo">${qrCodigo}</div>
  <div class="footer">AutoCiclo · Etiqueta de pieza</div>
</body>
</html>`;
    try {
      // printAsync abre el diálogo nativo de impresión (Android + iOS)
      await Print.printAsync({ html });
    } catch (printErr: any) {
      // printAsync falló → fallback a PDF + share
      try {
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Etiqueta ${pieza.nombre}`,
          UTI: 'com.adobe.pdf',
        });
      } catch (shareErr: any) {
        const msg = shareErr?.message ?? printErr?.message ?? 'Error desconocido';
        Alert.alert('Error al imprimir', msg);
      }
    } finally {
      setImprimiendo(false);
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
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Modal QR — fuera del ScrollView para que funcione correctamente */}
      <Modal visible={qrVisible && !!qrSvg} transparent animationType="fade" onRequestClose={() => setQrVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={{ backgroundColor: '#1e293b', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '800', marginBottom: 4 }}>
              QR — {pieza.nombre}
            </Text>
            <Text style={{ color: '#475569', fontSize: 12, marginBottom: 20 }}>{pieza.codigoPieza}</Text>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 12 }}>
              {qrSvg ? <SvgXml xml={qrSvg} width={220} height={220} /> : null}
            </View>
            {qrCodigo && (
              <Text style={{ color: '#334155', fontSize: 10, marginTop: 10, textAlign: 'center' }} numberOfLines={2}>
                {qrCodigo}
              </Text>
            )}

            {/* Botones imprimir + cerrar */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' }}>
              <TouchableOpacity
                onPress={handleImprimir}
                disabled={imprimiendo}
                style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
                  backgroundColor: imprimiendo ? '#374151' : 'rgba(16,185,129,0.15)',
                  borderRadius: 12, paddingVertical: 14,
                  borderWidth: 1, borderColor: imprimiendo ? 'transparent' : 'rgba(16,185,129,0.4)',
                }}
              >
                {imprimiendo
                  ? <ActivityIndicator size="small" color="#10b981" />
                  : <Ionicons name="print-outline" size={18} color="#10b981" />}
                <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 14 }}>
                  {imprimiendo ? 'Abriendo...' : 'Imprimir'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setQrVisible(false)}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 14,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
      <View style={{ backgroundColor: '#0f172a', paddingBottom: 16 }}>
        {/* Imagen de la pieza */}
        {pieza.imagen ? (
          <Image
            source={{ uri: pieza.imagen }}
            style={{ width: '100%', height: 220 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ width: '100%', height: 140, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="construct-outline" size={48} color="#334155" />
          </View>
        )}

        <View style={{ paddingHorizontal: 20, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: '#f1f5f9', fontSize: 22, fontWeight: '900' }}>{pieza.nombre}</Text>
            <Text style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>{pieza.codigoPieza}</Text>
          </View>
          <TouchableOpacity
            onPress={handleVerQR}
            disabled={generandoQr}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: 'rgba(59,130,246,0.12)',
              borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
              borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
            }}
          >
            {generandoQr
              ? <ActivityIndicator size="small" color="#3b82f6" />
              : <Ionicons name="qr-code-outline" size={16} color="#3b82f6" />}
            <Text style={{ color: '#3b82f6', fontWeight: '700', fontSize: 13 }}>Ver QR</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12, paddingHorizontal: 20 }}>
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
          borderColor: sessionOk ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.3)',
        }}
      >
        <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Actualizar Stock
        </Text>

        {/* Aviso sesión caducada */}
        {!sessionOk && (
          <TouchableOpacity
            onPress={() => router.replace('/login')}
            style={{ backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)' }}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#ef4444" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Sesión caducada</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Pulsa aquí para iniciar sesión de nuevo</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ef4444" />
          </TouchableOpacity>
        )}

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

        {/* Vista previa de confirmación inline */}
        {confirmando && (
          <View style={{ backgroundColor: tipo === 'entrada' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: tipo === 'entrada' ? '#10b981' : '#ef4444' }}>
            <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
              {tipo === 'entrada' ? '+ Añadir' : '− Retirar'} {cantidad} ud(s). de {pieza.nombre}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 13 }}>
              Stock resultante: {tipo === 'entrada' ? pieza.stockDisponible + parseInt(cantidad || '0') : pieza.stockDisponible - parseInt(cantidad || '0')} uds.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => setConfirmando(false)}
                style={{ flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <Text style={{ color: '#94a3b8', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={ejecutarMovimiento}
                disabled={saving}
                style={{ flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, backgroundColor: tipo === 'entrada' ? '#10b981' : '#ef4444' }}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="checkmark-circle" size={18} color="#fff" />}
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  {saving ? 'Registrando...' : 'Confirmar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Botón principal */}
        {!confirmando && (
          <TouchableOpacity
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              elevation: 4,
            }}
            onPress={prepararMovimiento}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Registrar movimiento
            </Text>
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
    </View>
  );
}
