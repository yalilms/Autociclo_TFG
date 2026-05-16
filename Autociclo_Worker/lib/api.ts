import axios from 'axios';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { getToken, clearAuth } from './auth';

// Marcador para que los catch locales sepan que ya se redirigió al login y no muestren error
export const AUTH_REDIRECT = '__authRedirect__';

const api = axios.create({
  baseURL: 'http://109.123.247.31:8080',
  timeout: 10000,
});

// Interceptor: añade el JWT en cada petición
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: si la API devuelve 401 o 403 por token expirado/inválido → limpiar sesión y login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    // 401 = sin token; 403 = token expirado (body vacío) o rol incorrecto — en ambos casos, login
    if (status === 401 || status === 403) {
      await clearAuth();
      Alert.alert(
        'Sesión caducada',
        'Tu sesión ha expirado. Inicia sesión de nuevo para continuar.',
        [{ text: 'Iniciar sesión', onPress: () => router.replace('/login') }]
      );
      return Promise.reject(AUTH_REDIRECT);
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Tipos alineados con los modelos Java de la API ────────────────────────────

export interface Pieza {
  idPieza: number;
  codigoPieza: string;
  nombre: string;
  categoria: string;
  precioVenta: number | string; // BigDecimal → puede llegar como number o string
  stockDisponible: number;
  stockMinimo: number;
  ubicacionAlmacen: string;
  compatibleMarcas: string;
  descripcion?: string;
  imagen?: string;
}

export interface Vehiculo {
  idVehiculo: number;
  matricula: string;
  marca: string;
  modelo: string;
  anio: number;
  color?: string;
  estado: 'completo' | 'desguazando' | 'desguazado'; // enum real de la BD
  precioCompra?: number | string;
  kilometraje?: number;
  ubicacionGps: string;
  observaciones: string;
}

// GET /api/codigos-qr/{codigo} → devuelve CodigoQR (solo tipo + idReferencia)
export interface CodigoQR {
  idQr: number;
  codigoUnico: string;
  tipo: 'pieza' | 'vehiculo';
  idReferencia: number;
  fechaGeneracion: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  nombre: string;
  rol: string;
}

export interface DetalleSolicitud {
  id?: { idSolicitud: number; idPieza: number };
  cantidad: number;
  notas?: string;
  pieza?: Pieza;
}

export interface SolicitudCliente {
  idCliente: number;
  usuario?: { idUsuario: number; nombre: string; email: string };
  telefono?: string;
  direccion?: string;
  nif?: string;
}

export interface SolicitudPresupuesto {
  idSolicitud: number;
  fechaSolicitud: string;
  estado: 'pendiente' | 'en_negociacion' | 'aprobada' | 'rechazada' | 'pagada';
  respuestaAdmin?: string;
  referenciaOdoo?: string;
  precioTotal?: number | string;
  precioOfertaCliente?: number | string;
  precioContraoferta?: number | string;
  turno?: 'cliente' | 'admin';
  cliente?: SolicitudCliente;
  detalles: DetalleSolicitud[];
}

// Ayuda segura para formatear BigDecimal de Java
export function formatPrecio(val: number | string | undefined): string {
  if (val === undefined || val === null) return '—';
  return Number(val).toFixed(2);
}
