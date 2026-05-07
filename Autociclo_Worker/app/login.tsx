import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { LoginResponse } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore((s) => s.login);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Introduce email y contraseña.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', { email, password });
      const { token, nombre, rol } = res.data;

      if (rol === 'CLIENTE') {
        setError('Esta app es solo para empleados y administradores.');
        return;
      }

      await login({ token, email: res.data.email, nombre, rol });
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Email o contraseña incorrectos.');
      } else if (err.code === 'ECONNABORTED' || !err.response) {
        setError('No se puede conectar con el servidor. Comprueba tu red.');
      } else {
        setError('Error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center px-8 pt-16 pb-10">

          {/* Logo oficial con border radius 50% */}
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: '#ffffff',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <Image
              source={require('../assets/logo.png')}
              style={{ width: 84, height: 84, borderRadius: 42 }}
              resizeMode="contain"
            />
          </View>

          <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '900', letterSpacing: 3 }}>
            AutoCiclo
          </Text>
          <Text style={{ color: '#3b82f6', fontSize: 13, marginTop: 4, marginBottom: 36 }}>
            Worker App — Empleados
          </Text>

          {/* Formulario */}
          <View
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
              EMAIL
            </Text>
            <TextInput
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#ffffff',
                marginBottom: 16,
                fontSize: 15,
              }}
              placeholder="empleado@autociclo.es"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
              CONTRASEÑA
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <TextInput
                style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: '#ffffff', fontSize: 15 }}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={{ paddingHorizontal: 14 }} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            {error ? (
              <View
                style={{
                  backgroundColor: 'rgba(239,68,68,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="alert-circle" size={16} color="#f87171" />
                <Text style={{ color: '#f87171', fontSize: 13, flex: 1 }}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={{
                backgroundColor: loading ? '#1d4ed8' : '#3b82f6',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>
                  Iniciar sesión
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#334155', fontSize: 12, marginTop: 32 }}>
            IES P. Hermenegildo Lanz — DAM 2025/26
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
