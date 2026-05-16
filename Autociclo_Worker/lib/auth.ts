// expo-secure-store: equivalente a AsyncStorage del curso pero cifrado (apto para JWT)
// El concepto es idéntico: clave → valor persistente entre sesiones
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

export interface UserData {
  email: string;
  nombre: string;
  rol: string;
  token: string;
}

export async function saveAuth(data: UserData): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, data.token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data));
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
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
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? (JSON.parse(raw) as UserData) : null;
}

export async function clearAuth(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
