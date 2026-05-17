# AUTOCICLO — Contexto completo para Claude

> **TFG 2º DAM · Yalil Musa Talhaoui · IES P. Hermenegildo Lanz, Granada**
> Entrega código: 19 Mayo 2026 · Defensa: 20-21 Mayo 2026
> Este documento es para dar contexto a un chat nuevo de Claude sin contexto previo.
> **Última actualización: 17 Mayo 2026**

---

## 1. DESCRIPCIÓN DEL PROYECTO

**AutoCiclo** es un ecosistema multiplataforma para la gestión de un desguace de vehículos. Consta de 5 componentes integrados:

| Componente | Tecnología | Estado |
|---|---|---|
| **API REST** | Spring Boot 3 + Java 21 + JWT | ✅ Completo y desplegado |
| **Web Shop** | React 19 + TypeScript + Vite + Tailwind | ✅ Completo y desplegado |
| **Desktop** | Java 21 + JavaFX + Gradle | ✅ Funcional |
| **Worker Móvil** | React Native + Expo SDK 54 | ✅ Completo (APK compilado) |
| **Odoo 17** | ERP Community (integración JSON-RPC) | ✅ Integrado |
| **RabbitMQ** | Mensajería async (solicitudes + stock) | ✅ Funcional |

---

## 2. INFRAESTRUCTURA / SERVIDOR

```
Servidor: Contabo Ubuntu Server 22.04
IP pública: 109.123.247.31
RAM: 8 GB · SSD: 150 GB
SSH: root@109.123.247.31
Password SSH: holanda1200372

IMPORTANTE: NO TOCAR /opt/demo/ — hay una app de empresa real en puertos 80/443
```

### Servicios en el servidor

| Servicio | Puerto | Notas |
|---|---|---|
| MySQL 8.0 | 3306 | DB: `autociclo_db` |
| Spring Boot API | 8080 | Servicio: `autociclo-api` |
| React (Nginx) | 8090 | Archivos en `/var/www/autociclo-shop` |
| Odoo 17 CE | 8069 | ERP integrado |
| RabbitMQ | 5672 | guest/guest |
| Nginx | 80, 8090 | Proxy API + sirve React |

### Servicio systemd de la API
```bash
systemctl status autociclo-api
systemctl restart autociclo-api
journalctl -u autociclo-api -n 50 --no-pager
# JAR en: /opt/autociclo/autociclo-api.jar
```

### Deploy del JAR (patrón que funciona)
```bash
# En local (Maven):
cd /home/yalilms/Documentos/Superior/TFG/API/autociclo-api
mvn package -DskipTests -q
# Subir:
sshpass -p 'holanda1200372' scp -o StrictHostKeyChecking=no \
  target/autociclo-api-1.0.0.jar root@109.123.247.31:/opt/autociclo/autociclo-api.jar
sshpass -p 'holanda1200372' ssh -o StrictHostKeyChecking=no root@109.123.247.31 \
  "systemctl restart autociclo-api"
```

### Deploy del frontend
```bash
# 1. Build en local
cd /home/yalilms/Documentos/Superior/TFG/Web/autociclo-shop
npm run build

# 2. SCP + mover en servidor
sshpass -p 'holanda1200372' scp -o StrictHostKeyChecking=no -r dist \
  root@109.123.247.31:/var/www/autociclo-shop/
sshpass -p 'holanda1200372' ssh -o StrictHostKeyChecking=no root@109.123.247.31 \
  "rm -rf /var/www/autociclo-shop/assets && cp -r /var/www/autociclo-shop/dist/* /var/www/autociclo-shop/"
```

### Variables de entorno en el servicio systemd
```ini
# En /etc/systemd/system/autociclo-api.service
Environment="DB_HOST=localhost"
Environment="DB_USER=autociclo"
Environment="DB_PASS=autociclo1234"
Environment="JWT_SECRET=autociclo-secret-key-minimo-32-caracteres-cambiar"
Environment="STRIPE_SECRET_KEY=sk_test_51Rth5Y9Z3elKL1ENfKzjEwK93VDWjfDBw3f6BfoBwtS5DattZzcRbTHAjtaHiws8fVgSfqUwLzmtMSjY8Q7nLoKK00J8GhJDI4"
Environment="RABBITMQ_HOST=localhost"
Environment="ODOO_URL=http://109.123.247.31:8069"
Environment="ODOO_DB=odoo17"
Environment="ODOO_USER=admin"
Environment="ODOO_PASSWORD=admin"
```

---

## 3. BASE DE DATOS

```
Host: localhost (en servidor) / 109.123.247.31 (externo)
Puerto: 3306
DB: autociclo_db
Usuario: autociclo
Password: autociclo1234
Charset: utf8mb4_unicode_ci
```

### Credenciales de usuarios (estado actual — 17 Mayo 2026)

**IMPORTANTE: La BD fue limpiada el 17 Mayo. Solo hay 3 usuarios con contraseña `admin123`:**

| Rol | Email | Contraseña | id_usuario |
|-----|-------|-----------|-----------|
| ADMIN | admin@autociclo.com | admin123 | 1 |
| EMPLEADO | empleado@autociclo.com | admin123 | 2 |
| CLIENTE | cliente@gmail.com | admin123 | 3 |

```
BCrypt hash de 'admin123' (cost 12) generado en la sesión:
admin:    $2b$12$05ypFOCG.yygm8qxvR2qpewlxGQZ8F3uDaN/ck6pTJcBAmwzHTIJu
empleado: $2b$12$W00PLjZpVMxoFpk8EpGgR.udOGs/XM25ctL4zcs2Ex1UHrwxgMTGS
cliente:  $2b$12$M1951Yxh771TgpXoxsxHjuEAg7B1fFH9n0Nv..uxHiWtOBcL17VOu
```

**Tablas LIMPIAS (vaciadas el 17 Mayo para testing limpio):**
- SOLICITUDES_PRESUPUESTO, DETALLE_SOLICITUD, NEGOCIACION_HISTORIAL
- NOTIFICACIONES, MOVIMIENTOS_STOCK, CODIGOS_QR

**Tablas CON DATOS (datos de demo conservados):**
- PIEZAS (15 piezas), VEHICULOS (8 vehículos), INVENTARIO_PIEZAS, ROLES

### Regenerar hashes BCrypt en Python
```python
import bcrypt
h = bcrypt.hashpw(b'admin123', bcrypt.gensalt(12)).decode()
print(h)
```

### SQL útil para resetear usuarios
```sql
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM USUARIOS;
INSERT INTO USUARIOS (id_usuario, nombre, email, password_hash, id_rol, activo, fecha_alta) VALUES
(1, 'Administrador', 'admin@autociclo.com', '$2b$12$HASH_AQUI', 1, 1, NOW()),
(2, 'Empleado', 'empleado@autociclo.com', '$2b$12$HASH_AQUI', 2, 1, NOW()),
(3, 'Cliente', 'cliente@gmail.com', '$2b$12$HASH_AQUI', 3, 1, NOW());
SET FOREIGN_KEY_CHECKS=1;
```

### Schema (12 tablas)

```sql
ROLES (id_rol, nombre, descripcion)
VEHICULOS (id_vehiculo, matricula, marca, modelo, anio, color, fecha_entrada, estado ENUM('completo','desguazando','desguazado'), precio_compra, kilometraje, ubicacion_gps, observaciones)
PIEZAS (id_pieza, codigo_pieza, nombre, categoria ENUM('motor','carroceria','interior','electronica','ruedas','otros'), precio_venta, stock_disponible, stock_minimo, ubicacion_almacen, compatible_marcas, imagen LONGTEXT, descripcion)
INVENTARIO_PIEZAS (id_vehiculo, id_pieza, cantidad, estado_pieza, fecha_extraccion, precio_unitario, notas)
USUARIOS (id_usuario, nombre, email, password_hash, id_rol, activo, fecha_alta)
CLIENTES (id_cliente, id_usuario UNIQUE, telefono, direccion, nif)
SOLICITUDES_PRESUPUESTO (id_solicitud, id_cliente, fecha_solicitud, estado ENUM('pendiente','en_negociacion','aprobada','rechazada','pagada'), respuesta_admin, precio_total, precio_oferta_cliente, precio_contraoferta, turno ENUM('cliente','admin'), referencia_odoo)
DETALLE_SOLICITUD (id_solicitud, id_pieza, cantidad, notas)
NEGOCIACION_HISTORIAL (id, id_solicitud, ronda, autor ENUM('cliente','admin'), precio, mensaje, fecha)
CODIGOS_QR (id_qr, codigo_unico, tipo ENUM('pieza','vehiculo'), id_referencia, fecha_generacion)
MOVIMIENTOS_STOCK (id_movimiento, id_pieza, tipo ENUM('entrada','salida'), cantidad, id_usuario, fecha, notas)
NOTIFICACIONES (id_notificacion, id_usuario, tipo, mensaje, leida, fecha_creacion)
```

**NOTA:** El ENUM de `estado` en `SOLICITUDES_PRESUPUESTO` incluye `'pagada'` — si hay error al desplegar, puede que en el servidor falte ese valor. SQL de fix:
```sql
ALTER TABLE SOLICITUDES_PRESUPUESTO MODIFY COLUMN estado ENUM('pendiente','en_negociacion','aprobada','rechazada','pagada') NOT NULL DEFAULT 'pendiente';
```

---

## 4. API REST (Spring Boot)

### Rutas de archivos
```
API/autociclo-api/src/main/java/com/autociclo/
├── controllers/
│   ├── AuthController.java
│   ├── StockController.java       ← MODIFICADO (ver cambios críticos)
│   ├── SolicitudController.java
│   ├── PagoController.java
│   ├── PiezaController.java
│   ├── VehiculoController.java
│   ├── InventarioController.java
│   ├── UsuarioController.java
│   └── NotificacionController.java
├── services/
│   ├── StockService.java          ← MODIFICADO (ver cambios críticos)
│   └── SolicitudService.java
├── messaging/
│   └── RabbitMQPublisher.java     ← MODIFICADO (ver cambios críticos)
├── config/
│   ├── SecurityConfig.java        ← MODIFICADO (ver cambios críticos)
│   └── RabbitMQConfig.java
└── security/
    ├── JwtAuthFilter.java
    └── JwtUtil.java
```

### CAMBIOS CRÍTICOS APLICADOS EN LA API (17 Mayo 2026)

#### SecurityConfig.java — stock endpoint ahora es público
```java
.requestMatchers("/api/auth/**", "/api/pagos/webhook").permitAll()
.requestMatchers(HttpMethod.GET, "/api/piezas", "/api/piezas/**",
    "/api/vehiculos", "/api/vehiculos/**", "/api/inventario/pieza/**",
    "/api/codigos-qr", "/api/codigos-qr/**").permitAll()
// NUEVO: stock POST sin autenticación (para demo TFG con Worker móvil)
.requestMatchers(HttpMethod.POST, "/api/stock/movimiento").permitAll()
.anyRequest().authenticated()
```

#### StockController.java — sin @PreAuthorize + fallback de usuario
```java
@PostMapping("/movimiento")
public ResponseEntity<MovimientoStock> registrar(
        @Valid @RequestBody MovimientoStockRequest req,
        @AuthenticationPrincipal UserDetails userDetails) {
    // Si no hay token, usa empleado@autociclo.com como fallback
    String email = userDetails != null ? userDetails.getUsername() : "empleado@autociclo.com";
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(stockService.registrarMovimiento(req, email));
}
// IMPORTANTE: NO tiene @PreAuthorize — funciona sin JWT
```

#### StockService.java — fallback si el usuario del JWT fue borrado
```java
// Si el usuario del JWT no existe en BD (fue borrado), usa empleado@autociclo.com
Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
        .or(() -> usuarioRepository.findByEmail("empleado@autociclo.com"))
        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
```

#### RabbitMQPublisher.java — errores de RabbitMQ no rompen transacciones
```java
// TODOS los métodos (publicarNuevaSolicitud, publicarContaoferta, publicarAlertaStock)
// están envueltos en try-catch que solo loguea WARN. Si RabbitMQ falla, la operación
// principal (guardar solicitud, registrar movimiento) sigue adelante.
public void publicarAlertaStock(...) {
    try {
        rabbitTemplate.convertAndSend(...);
    } catch (Exception e) {
        log.warn("RabbitMQ no disponible: {}", e.getMessage());
    }
}
```

#### application.properties — timeout RabbitMQ añadido
```properties
spring.rabbitmq.connection-timeout=2000  # fallo rápido si RabbitMQ no responde
```

### SecurityConfig — rutas públicas completas
```java
.requestMatchers("/api/auth/**", "/api/pagos/webhook").permitAll()
.requestMatchers(HttpMethod.GET, "/api/piezas", "/api/piezas/**",
    "/api/vehiculos", "/api/vehiculos/**", "/api/inventario/pieza/**",
    "/api/codigos-qr", "/api/codigos-qr/**").permitAll()
.requestMatchers(HttpMethod.POST, "/api/stock/movimiento").permitAll()
.anyRequest().authenticated()
```

### Endpoints completos

**Auth** (sin JWT)
```
POST /api/auth/login      → { token, usuario: {id, nombre, email, rol} }
POST /api/auth/register   → crea usuario con rol CLIENTE
```

**Stock**
```
GET  /api/stock/alertas               → piezas con stock <= stockMinimo (ADMIN/EMPLEADO)
GET  /api/stock/movimientos/{idPieza} → historial movimientos (ADMIN/EMPLEADO)
POST /api/stock/movimiento            → registrar entrada/salida (PÚBLICO — sin token OK)
Body: { idPieza, tipo: 'entrada'|'salida', cantidad, notas? }
```

**Solicitudes**
```
GET  /api/solicitudes              → lista (ADMIN/EMPLEADO: todas; CLIENTE: las suyas)
GET  /api/solicitudes/{id}         → detalle con detalles e historial
POST /api/solicitudes              → crear (solo CLIENTE)
PUT  /api/solicitudes/{id}/aprobar       → ADMIN → estado=aprobada, crea pedido Odoo
PUT  /api/solicitudes/{id}/rechazar      → ADMIN → estado=rechazada
PUT  /api/solicitudes/{id}/contraoferta  → ADMIN → estado=en_negociacion, turno=cliente
PUT  /api/solicitudes/{id}/aceptar-oferta  → CLIENTE acepta
PUT  /api/solicitudes/{id}/rechazar-oferta → CLIENTE rechaza
PUT  /api/solicitudes/{id}/nueva-oferta    → CLIENTE contraoferta
```

**Pagos (Stripe)**
```
POST /api/pagos/intento   → CLIENTE, crea PaymentIntent
Body: { solicitudId }
Respuesta: { clientSecret, importeTotal, solicitudId }
```

**Piezas, Vehículos, Inventario, Usuarios, Notificaciones** → igual que antes

---

## 5. WEB SHOP (React)

### Rutas de archivos
```
Web/autociclo-shop/
├── src/
│   ├── App.tsx
│   ├── types/index.ts
│   ├── api/client.ts              ← Axios con interceptores JWT
│   ├── store/authStore.ts         ← Zustand: token + usuario (localStorage)
│   ├── store/carritoStore.ts
│   └── pages/
│       ├── Home.tsx, Catalogo.tsx, DetallePieza.tsx
│       ├── Login.tsx, Registro.tsx
│       ├── SolicitarPresupuesto.tsx
│       ├── MisSolicitudes.tsx     ← vista CLIENTE
│       ├── Pago.tsx               ← Stripe Elements + PDF factura
│       └── admin/
│           ├── AdminDashboard.tsx
│           ├── AdminSolicitudes.tsx
│           ├── AdminPiezas.tsx, AdminVehiculos.tsx, AdminUsuarios.tsx
├── .env                           ← VITE_STRIPE_PUBLISHABLE_KEY
└── package.json
```

### .env (Web/autociclo-shop/.env)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Rth5Y9Z3elKL1ENOvYNPKEEcHFQWhfApNXyhaX1YLS30PPpnoasi2FErEZUQks0a60V35J4QPV9rh7j5hjwa6Pm00Zi1cE8Qx
```

### Stripe
```
PK: pk_test_51Rth5Y9Z3elKL1ENOvYNPKEEcHFQWhfApNXyhaX1YLS30PPpnoasi2FErEZUQks0a60V35J4QPV9rh7j5hjwa6Pm00Zi1cE8Qx
SK: sk_test_51Rth5Y9Z3elKL1ENfKzjEwK93VDWjfDBw3f6BfoBwtS5DattZzcRbTHAjtaHiws8fVgSfqUwLzmtMSjY8Q7nLoKK00J8GhJDI4
Tarjeta test: 4242 4242 4242 4242 · Fecha: 12/29 · CVC: 123
Tarjeta sin fondos: 4000 0000 0000 9995
```

### Rutas de la app
```
/                  → Home (público)
/catalogo          → Catálogo (público)
/catalogo/:id      → DetallePieza (público)
/login, /registro
/solicitar         → SolicitarPresupuesto (login requerido)
/mis-solicitudes   → MisSolicitudes (login requerido)
/pagar?id=N        → Pago Stripe (login requerido)
/admin             → AdminDashboard (solo ADMIN)
/admin/solicitudes, /admin/piezas, /admin/vehiculos, /admin/usuarios
```

---

## 6. AUTOCICLO WORKER (React Native + Expo)

### Datos técnicos
```
Framework: React Native 0.81.5 + Expo SDK 54
Ruta local: /home/yalilms/Documentos/Superior/TFG/Autociclo_Worker/
API URL: http://109.123.247.31:8080 (hardcodeado en lib/api.ts)
Package: com.anonymous.Autociclo_Worker
```

### Estructura de archivos
```
Autociclo_Worker/
├── app/                          ← rutas Expo Router
│   ├── (tabs)/
│   │   ├── index.tsx             ← Dashboard alertas de stock
│   │   ├── pedidos.tsx           ← Tab solicitudes aprobadas
│   │   ├── escanear.tsx          ← Tab cámara QR
│   │   └── vehiculos.tsx         ← Tab vehículos
│   ├── pieza/[id].tsx            ← Detalle pieza + movimiento stock ← MODIFICADO
│   ├── pedido/[id].tsx           ← Detalle pedido (preparar)
│   └── login.tsx
├── lib/
│   ├── api.ts                    ← Axios, baseURL, interceptores JWT ← MODIFICADO
│   └── auth.ts                   ← _memToken cache, getTokenSync(), isTokenExpired() ← MODIFICADO
├── store/
│   └── authStore.ts              ← Zustand + expo-secure-store ← MODIFICADO
├── android/                      ← build nativo Android
│   ├── app/build.gradle          ← MODIFICADO (debuggableVariants=[], arm64)
│   └── local.properties          ← sdk.dir=/home/yalilms/Android/Sdk
└── package.json
```

### APK compilado (17 Mayo 2026)
```
Ruta: android/app/build/outputs/apk/debug/app-debug.apk
Tamaño: ~200 MB (arm64-v8a, bundle embebido)
Nota: tiene debuggableVariants=[] → el bundle JS está embebido, no necesita Metro
Disponible en HTTP local: http://192.168.1.216:9090/app-debug.apk
  (solo si el servidor Python está corriendo:
   cd .../android/app/build/outputs/apk/debug && python3 -m http.server 9090)
```

### Cómo recompilar el APK
```bash
cd /home/yalilms/Documentos/Superior/TFG/Autociclo_Worker
# Asegurarse de que local.properties tiene: sdk.dir=/home/yalilms/Android/Sdk
./android/gradlew assembleDebug --project-dir android -x lint
# APK en: android/app/build/outputs/apk/debug/app-debug.apk
```

### Cómo iniciar Metro (para desarrollo)
```bash
cd /home/yalilms/Documentos/Superior/TFG/Autociclo_Worker
npx expo start --lan --clear
# URL local: exp://192.168.1.216:8081
# Para tunnel (si ngrok funciona): npx expo start --tunnel --clear
```

### CAMBIOS CRÍTICOS EN EL WORKER (sesiones 16-17 Mayo 2026)

#### lib/auth.ts — cache en memoria para JWT
```typescript
// _memToken: cache en memoria que sobrevive a Fast Refresh pero NO a reinicio de app
let _memToken: string | null = null;

export async function getToken(): Promise<string | null> { ... }
export function getTokenSync(): string | null { return _memToken; }
export function setMemToken(t: string) { _memToken = t; }
export async function clearAuth() { _memToken = null; await SecureStore.deleteItemAsync('jwt'); }
export function isTokenExpired(token: string): boolean { /* decodifica exp claim */ }
```

#### lib/api.ts — interceptor síncrono
```typescript
const api = axios.create({
  baseURL: 'http://109.123.247.31:8080',
  timeout: 10000,
});

// Interceptor síncrono: _memToken → zustand → null
api.interceptors.request.use((config) => {
  const token = getTokenSync() ?? useAuthStore.getState().user?.token ?? null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401/403 → clearAuth() + Alert "Sesión caducada" + router.replace('/login')
// Retorna Promise.reject(AUTH_REDIRECT) — los catch locales detectan AUTH_REDIRECT y no muestran error
```

#### app/pieza/[id].tsx — movimiento de stock simplificado
```typescript
// ANTES: botón → pantalla de confirmación inline → Cancelar / Confirmar
// AHORA: botón llama directamente a ejecutarMovimiento() sin confirmación

async function ejecutarMovimiento() {
  const qty = parseInt(cantidad);
  // Validación inline (antes en prepararMovimiento)
  if (!qty || qty < 1) { Alert.alert('Cantidad inválida', ...); return; }
  if (tipo === 'salida' && qty > pieza!.stockDisponible) { Alert.alert('Stock insuficiente', ...); return; }
  setSaving(true);
  try {
    const res = await api.post('/api/stock/movimiento', {
      idPieza: pieza!.idPieza, tipo, cantidad: qty,
      notas: notas.trim() || undefined,
    });
    // Actualiza stock localmente (no hace fetchPieza() que podría fallar y mostrar "Error")
    const nuevoStock = tipo === 'entrada'
      ? pieza!.stockDisponible + qty
      : pieza!.stockDisponible - qty;
    setPieza((prev) => prev ? { ...prev, stockDisponible: nuevoStock } : prev);
    setCantidad('1'); setNotas('');
    Alert.alert('Movimiento registrado', `${qty} ud(s) ${tipo === 'entrada' ? 'añadidas' : 'retiradas'} correctamente.`);
  } catch (err: any) {
    if (err === AUTH_REDIRECT) return;
    const msg = err.response?.data?.error ?? err.response?.data?.message
      ?? (err.code === 'ECONNABORTED' ? 'Tiempo de espera agotado.' : 'Error de red.');
    Alert.alert('Error en movimiento', `${msg}${err.response?.status ? ` [${err.response.status}]` : ''}`);
  } finally { setSaving(false); }
}
// Botón: verde="Añadir stock" / rojo="Retirar stock" — siempre visible, sin confirmación
```

### Por qué el stock fallaba (historia del bug)
1. **Causa raíz 1**: UI con confirmación en dos pasos — el usuario pulsaba "Registrar" pero veía una pantalla de confirmación adicional y no pulsaba "Confirmar"
2. **Causa raíz 2**: `fetchPieza()` se llamaba dentro del `try` de `ejecutarMovimiento` y tenía su propio `try-catch` que mostraba "Error: No se pudo cargar la pieza" aunque el POST había tenido éxito
3. **Causa raíz 3**: Al limpiar la BD, se borró `pedro@autociclo.es` que era el fallback hardcodeado → "Usuario no encontrado" 500
4. **Causa raíz 4**: JWTs viejos de usuarios borrados → el fallback del servicio soluciona esto

---

## 7. FLUJO COMPLETO DE NEGOCIACIÓN

```
1. Cliente crea solicitud → estado=pendiente, turno=admin
   → RabbitMQ publica en solicitudes.nueva
   → Se notifica a todos los ADMIN

2. Admin puede:
   a) Aprobar → estado=aprobada, precioTotal=acordado
      → Se crea pedido de venta en Odoo → referenciaOdoo='SO/2026/XXXX'
   b) Rechazar → estado=rechazada
   c) Contraofertar → estado=en_negociacion, turno=cliente

3. Cliente puede:
   a) Aceptar oferta → estado=aprobada → pedido Odoo
   b) Rechazar oferta → estado=rechazada
   c) Nueva oferta → turno=admin

4. Cuando estado=aprobada:
   → Cliente ve botón "Pagar X€"
   → POST /api/pagos/intento → clientSecret
   → Stripe Elements → confirmCardPayment()
   → Éxito → estado=pagada → genera PDF factura con jsPDF
```

---

## 8. DESKTOP (JavaFX)

### Rutas
```
Escritorio/AutoCiclo/app/src/main/java/com/autociclo/
├── controllers/
│   ├── SolicitudesController.java  ← gestión solicitudes + historial dialog
│   ├── UsuariosController.java
│   └── ...
└── utils/
    ├── ApiClient.java      ← HTTP wrapper con JWT
    └── AppConstants.java
```

### SolicitudesController — funciones clave
```java
// TableView: ID, Cliente, Estado, Fecha, Oferta, Contraoferta, Ref.Odoo, Turno
// Turno formateado: "⏳ Pendiente" / "⚡ Tu turno" / "⏳ Turno del cliente" / "✅ Cerrado" / "❌ Cerrada"
// Double-click → mostrarHistorial(sol) — dialog 620x500 con burbujas de chat
// Aprobar: Alert.CONFIRMATION → crea pedido Odoo
// TRUCO lambda effectively final:
//   double _pa = 0.0; try { _pa = ...; } catch(e){} final double precioAcordado = _pa;
```

---

## 9. ODOO — Integración

```java
// OdooClient.java → crearPedidoVenta(nombreCliente, emailCliente, lineas)
// JSON-RPC 2.0 → http://109.123.247.31:8069/jsonrpc
// Credenciales: admin / admin
// Retorna referencia: "S00001" etc. o null si falla (fallo silencioso)
// La referencia se guarda en SOLICITUDES_PRESUPUESTO.referencia_odoo
```

---

## 10. RABBITMQ — Eventos

```
Exchange: autociclo.exchange (TopicExchange)
Queues:
  - solicitudes.nueva → cliente crea/modifica solicitud → Desktop polling lo detecta
  - stock.alerta → stock < mínimo → Worker Dashboard
Credenciales: guest / guest
Panel admin: http://109.123.247.31:15672
```

**IMPORTANTE**: El Desktop NO recibe RabbitMQ directamente. Hace polling REST cada 30 segundos. Los errores de RabbitMQ están silenciados en `RabbitMQPublisher.java` (envueltos en try-catch).

---

## 11. GOTCHAS Y PROBLEMAS CONOCIDOS

### BCrypt en MySQL por SSH — escapar el $
```bash
# INCORRECTO ($ se interpreta como variable shell):
mysql -e "UPDATE USUARIOS SET password_hash='$2b$12$...'"
# CORRECTO: usar heredoc o Python
sshpass -p 'holanda1200372' ssh root@109.123.247.31 "mysql -u autociclo -pautociclo1234 autociclo_db" << 'ENDSQL'
UPDATE USUARIOS SET password_hash='$2b$12$...' WHERE email='...';
ENDSQL
```

### Java lambda effectively final
```java
double _pa = 0.0;
try { _pa = json.get("precio").getAsDouble(); } catch (Exception e) {}
final double precioAcordado = _pa;  // ahora usable en lambda
```

### Estados de solicitudes — siempre minúsculas
```typescript
// API devuelve: 'pendiente', 'en_negociacion', 'aprobada', 'rechazada', 'pagada'
// NO usar mayúsculas en los filtros del frontend
```

### spring.jpa.open-in-view=false
```
La sesión Hibernate se cierra antes de la serialización JSON.
Si una entidad tiene relaciones LAZY no inicializadas → LazyInitializationException.
Solución: usar @ManyToOne(fetch=EAGER) o inicializar dentro de @Transactional.
```

### CORS — rutas nuevas de la API
```java
// Si añades endpoints nuevos, verificar que tienen permitAll() o JWT
// El CORS config permite: GET/POST/PUT/DELETE/PATCH/OPTIONS desde los orígenes configurados
```

### Expo / Metro — arranque en Linux
```bash
# ngrok tunnel puede fallar con "Cannot read properties of undefined (reading 'body')"
# Usar --lan en lugar de --tunnel:
npx expo start --lan --clear
# URL: exp://192.168.1.216:8081
```

### APK Android — HTTP cleartext (HTTP, no HTTPS)
```
Expo Go tiene cleartext traffic habilitado → HTTP funciona.
APK custom: si se construye sin Expo Go, puede necesitar android:usesCleartextTraffic="true"
En este proyecto, el debug APK funciona porque usa la config de Expo prebuild.
```

---

## 12. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
/home/yalilms/Documentos/Superior/TFG/
├── API/
│   └── autociclo-api/                 ← Spring Boot (Maven)
│       ├── src/main/java/com/autociclo/
│       ├── src/main/resources/application.properties
│       └── pom.xml
├── Web/
│   └── autociclo-shop/                ← React + Vite
│       ├── src/, public/logo.png, .env, package.json
├── Escritorio/
│   └── AutoCiclo/                     ← JavaFX (Gradle)
├── Autociclo_Worker/                  ← React Native + Expo
│   ├── app/, lib/, store/, android/
│   └── package.json
├── BaseDatos/
│   └── autociclo_db_v2.sql            ← schema completo con datos demo
├── infoMd/
│   ├── CONTEXTO_CLAUDE.md             ← este archivo
│   ├── TESTING_GUIDE.md               ← guía de testing (credenciales ya actualizadas)
│   ├── STATUS.md
│   └── CAPTURAS_PRESENTACION.md
└── PLANNING.md
```

---

## 13. ESTADO ACTUAL (17 Mayo 2026)

### ✅ Completado
- API REST completa, desplegada y operativa en servidor
- Auth JWT + roles (ADMIN, EMPLEADO, CLIENTE)
- Sistema de negociación multi-ronda (web + desktop)
- Integración Odoo (creación automática de pedidos)
- RabbitMQ: mensajería async con tolerancia a fallos
- Web Shop completo (catálogo, solicitudes, pago Stripe, admin panel)
- Pago con Stripe + factura PDF con jsPDF
- Desktop: gestión solicitudes con historial dialog
- **Worker Móvil**: completo, APK compilado con bundle embebido
  - Dashboard alertas stock, tab pedidos, escaner QR, tab vehículos
  - Detalle pieza con movimiento de stock (entrada/salida)
  - Auth con cache en memoria (_memToken), interceptores Axios

### 🔴 Pendiente de confirmar
- **Movimiento de stock en móvil físico**: el servidor funciona (verificado con curl, 201 OK), el APK tiene el código correcto. Pendiente de que el usuario instale el APK nuevo y confirme que funciona. El bug fue: fallback a usuario borrado → arreglado en StockService con `.or(() -> usuarioRepository.findByEmail("empleado@autociclo.com"))`.

### 📅 Próximo
- Entrega código: 19 Mayo 2026
- Defensa: 20-21 Mayo 2026
- Demo end-to-end para la defensa

### Claves de acceso rápido
```
Servidor SSH: root@109.123.247.31 / holanda1200372
DB: autociclo / autociclo1234
Odoo: admin / admin → http://109.123.247.31:8069
RabbitMQ panel: guest/guest → http://109.123.247.31:15672
Web Shop: http://109.123.247.31:8090
API: http://109.123.247.31:8080
```

---

## 14. CÓMO TRABAJAR CON CLAUDE EN ESTE PROYECTO

1. **Comunicación**: español, respuestas directas y concisas
2. **Deploy API**: modificar Java → `mvn package -DskipTests` → SCP del .jar → restart systemd
3. **Deploy frontend**: `npm run build` → SCP del dist → copiar en `/var/www/autociclo-shop/`
4. **SSH siempre con sshpass**: `sshpass -p 'holanda1200372' ssh -o StrictHostKeyChecking=no root@109.123.247.31 "comando"`
5. **No mover cards de Trello a "Completado"** — dejarlas en su lista con checks marcados
6. **Verificar estado real** antes de asumir que algo funciona

### Comandos útiles en el servidor
```bash
# Estado de servicios
systemctl status autociclo-api | head -20
journalctl -u autociclo-api -n 100 --no-pager | grep -E 'ERROR|Exception|POST|stock'

# Acceso MySQL
sshpass -p 'holanda1200372' ssh root@109.123.247.31 "mysql -u autociclo -pautociclo1234 autociclo_db -e 'SELECT id_usuario,email,id_rol FROM USUARIOS;'"

# Verificar endpoint stock sin token
curl -s -X POST http://109.123.247.31:8080/api/stock/movimiento \
  -H "Content-Type: application/json" \
  -d '{"idPieza":1,"tipo":"entrada","cantidad":1}' -w "\nHTTP %{http_code}"

# Login rápido para obtener token
curl -s -X POST http://109.123.247.31:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autociclo.com","password":"admin123"}'
```

---

*Generado el 17 de Mayo de 2026 — Proyecto AutoCiclo TFG*
