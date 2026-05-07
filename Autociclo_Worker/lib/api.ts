import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: 'http://109.123.247.31:8080',
  timeout: 10000,
});

// Interceptor: añade el JWT en cada petición automáticamente
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Ayuda segura para formatear BigDecimal de Java
export function formatPrecio(val: number | string | undefined): string {
  if (val === undefined || val === null) return '—';
  return Number(val).toFixed(2);
}
