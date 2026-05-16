// expo-secure-store: equivalente a AsyncStorage del curso pero cifrado (apto para JWT)
// El concepto es idéntico: clave → valor persistente entre sesiones
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

// Token en memoria: escritura síncrona en login, lectura síncrona en interceptor
let _memToken: string | null = null;
let _memUser: UserData | null = null;

// Acceso síncrono para el interceptor de Axios (no necesita await)
export function getTokenSync(): string | null {
  return _memToken;
}

export interface UserData {
  email: string;
  nombre: string;
  rol: string;
  token: string;
}

export async function saveAuth(data: UserData): Promise<void> {
  // Escribir en memoria PRIMERO (síncrono) para que getToken() funcione de inmediato
  _memToken = data.token;
  _memUser = data;
  // SecureStore puede fallar en algunos dispositivos — la sesión en memoria sigue activa
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data));
  } catch {
    // No relanzar: la sesión funciona con el token en memoria durante esta ejecución
  }
}

export async function getToken(): Promise<string | null> {
  if (_memToken) return _memToken;
  const stored = await SecureStore.getItemAsync(TOKEN_KEY);
  if (stored) _memToken = stored;
  return stored;
}

// Devuelve true si el token existe y no ha caducado (JWT exp en payload)
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    // JWT usa base64url (- y _); atob necesita base64 estándar (+ y /) con padding
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export async function getUserData(): Promise<UserData | null> {
  if (_memUser) return _memUser;
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (raw) {
    _memUser = JSON.parse(raw) as UserData;
    // También poblar _memToken desde el objeto usuario (evita leer SecureStore dos veces)
    if (_memUser.token && !_memToken) _memToken = _memUser.token;
  }
  return _memUser;
}

export async function clearAuth(): Promise<void> {
  _memToken = null;
  _memUser = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
