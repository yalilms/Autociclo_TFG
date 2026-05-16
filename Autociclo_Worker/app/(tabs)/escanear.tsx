import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Vibration,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import api, { CodigoQR, Vehiculo } from '@/lib/api';

export default function EscanearScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Activar cámara solo cuando el tab está enfocado → evita cámara en segundo plano
  useFocusEffect(
    useCallback(() => {
      setActive(true);
      setScanned(false);
      return () => setActive(false);
    }, [])
  );

  async function handleScan({ data }: { data: string }) {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);
    Vibration.vibrate(80);

    try {
      // La API devuelve CodigoQR: { tipo, idReferencia, ... }
      const res = await api.get<CodigoQR>(`/api/codigos-qr/${encodeURIComponent(data)}`);
      const { tipo, idReferencia } = res.data;

      if (tipo === 'pieza') {
        // Navegar al detalle de la pieza directamente
        router.push(`/pieza/${idReferencia}`);
        setScanned(false);
      } else {
        // Vehículo: obtener datos y mostrar resumen
        try {
          const vRes = await api.get<Vehiculo>(`/api/vehiculos/${idReferencia}`);
          const v = vRes.data;
          Alert.alert(
            '🚗 Vehículo encontrado',
            `${v.marca} ${v.modelo} (${v.anio})\nMatrícula: ${v.matricula}\nEstado: ${v.estado}\n${v.ubicacionGps ? `Ubicación: ${v.ubicacionGps}` : ''}`,
            [{ text: 'Cerrar', onPress: () => setScanned(false) }]
          );
        } catch {
          Alert.alert('Vehículo', `ID ${idReferencia} — no se pudo cargar el detalle.`, [
            { text: 'OK', onPress: () => setScanned(false) },
          ]);
        }
      }
    } catch (err: any) {
      const status = err.response?.status;
      let titulo = 'Error';
      let mensaje = 'No se pudo conectar con el servidor.';
      if (status === 404) {
        titulo = 'QR no reconocido';
        mensaje = 'Este código QR no está registrado en el sistema.';
      } else if (status === 400) {
        titulo = 'QR inválido';
        mensaje = err.response?.data?.error ?? 'Código QR con formato incorrecto.';
      } else if (!err.response) {
        titulo = 'Sin conexión';
        mensaje = 'Comprueba que tienes conexión a internet.';
      }
      Alert.alert(titulo, mensaje, [{ text: 'Reintentar', onPress: () => setScanned(false) }]);
    } finally {
      setProcessing(false);
    }
  }

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#0f172a' }} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 32, paddingTop: insets.top }}
      >
        <Ionicons name="camera-outline" size={72} color="#334155" />
        <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '700', marginTop: 24, textAlign: 'center' }}>
          Cámara no disponible
        </Text>
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          Necesita acceso a la cámara para escanear códigos QR de piezas y vehículos.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: 14,
            paddingHorizontal: 32,
            paddingVertical: 16,
            marginTop: 32,
          }}
          onPress={requestPermission}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0f172a', paddingHorizontal: 20, paddingVertical: 14 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Escanear QR</Text>
        <Text style={{ color: '#3b82f6', fontSize: 12, marginTop: 2 }}>
          Apunta la cámara al código QR de la pieza o vehículo
        </Text>
      </View>

      {/* Cámara */}
      <View style={{ flex: 1 }}>
        {active && (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />
        )}

        {/* Marco guía QR */}
        <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
          {/* Overlay oscuro alrededor */}
          <View style={{ width: 240, height: 240, position: 'relative' }}>
            {[
              { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
              { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
              { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
              { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
            ].map((style, i) => (
              <View
                key={i}
                style={[
                  { position: 'absolute', width: 40, height: 40, borderColor: scanned ? '#10b981' : '#3b82f6' },
                  style as any,
                ]}
              />
            ))}
          </View>

          {processing && (
            <View
              style={{
                marginTop: 24,
                backgroundColor: 'rgba(15,23,42,0.85)',
                borderRadius: 50,
                paddingHorizontal: 24,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <ActivityIndicator color="#3b82f6" size="small" />
              <Text style={{ color: '#fff', fontSize: 14 }}>Consultando API...</Text>
            </View>
          )}
        </View>

        {/* Instrucción inferior */}
        <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ backgroundColor: 'rgba(15,23,42,0.75)', borderRadius: 50, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Text style={{ color: '#cbd5e1', fontSize: 13, textAlign: 'center' }}>
              {scanned && !processing ? 'Procesando...' : 'Coloca el QR dentro del marco azul'}
            </Text>
          </View>
          {scanned && !processing && (
            <TouchableOpacity
              style={{
                marginTop: 12,
                backgroundColor: '#3b82f6',
                borderRadius: 50,
                paddingHorizontal: 24,
                paddingVertical: 12,
              }}
              onPress={() => setScanned(false)}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Escanear de nuevo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
