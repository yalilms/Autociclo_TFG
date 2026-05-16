# AUTOCICLO — Contexto completo para Claude

> **TFG 2º DAM · Yalil Musa Talhaoui · IES P. Hermenegildo Lanz, Granada**
> Entrega código: 19 Mayo 2026 · Defensa: 20-21 Mayo 2026
> Este documento es para dar contexto a un chat nuevo de Claude sin contexto previo.

---

## 1. DESCRIPCIÓN DEL PROYECTO

**AutoCiclo** es un ecosistema multiplataforma para la gestión de un desguace de vehículos. Consta de 4 componentes integrados:

| Componente | Tecnología | Estado |
|---|---|---|
| **API REST** | Spring Boot 3 + Java 21 + JWT | ✅ Completo y desplegado |
| **Web Shop** | React 19 + TypeScript + Vite + Tailwind | ✅ Completo y desplegado |
| **Desktop** | Java 21 + JavaFX + Gradle | ✅ Funcional (entregado Interfaces) |
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

### Nginx — ruta del config
```
/etc/nginx/sites-enabled/  (buscar el config de autociclo)
Web root: /var/www/autociclo-shop/
```

### Servicio systemd de la API
```bash
systemctl status autociclo-api
systemctl restart autociclo-api
journalctl -u autociclo-api -n 50 --no-pager
```

### Deploy del frontend (patrón que funciona)
```python
# Siempre usar este patrón SSH con Python para la contraseña
import subprocess, tempfile, os

password = 'holanda1200372'
with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, dir='/tmp') as f:
    ask_script = f.name
    f.write('#!/usr/bin/env python3\n')
    f.write(f'print("{password}")\n')
os.chmod(ask_script, 0o700)
env = os.environ.copy()
env['SSH_ASKPASS'] = ask_script
env['SSH_ASKPASS_REQUIRE'] = 'force'
env['DISPLAY'] = 'none:0'

# SCP
subprocess.run(['scp', '-o', 'StrictHostKeyChecking=no', '-r', 'dist', 'root@109.123.247.31:/var/www/autociclo-shop/'],
    env=env, capture_output=True, text=True, start_new_session=True)

# SSH command
subprocess.run(['ssh', '-o', 'StrictHostKeyChecking=no', 'root@109.123.247.31', 'comando'],
    env=env, capture_output=True, text=True, start_new_session=True)
```

### Deploy frontend completo
```bash
# 1. Dentro de Web/autociclo-shop/
npm run build
# 2. SCP del dist al servidor (ver patrón arriba)
# 3. SSH: rm -rf /var/www/autociclo-shop/assets && cp -r /var/www/autociclo-shop/dist/* /var/www/autociclo-shop/
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

### Schema (12 tablas)

```sql
-- 1. ROLES
CREATE TABLE `ROLES` (
    `id_rol`      INT NOT NULL AUTO_INCREMENT,
    `nombre`      VARCHAR(50) NOT NULL,  -- 'ADMIN','EMPLEADO','CLIENTE'
    `descripcion` VARCHAR(255),
    PRIMARY KEY (`id_rol`)
);

-- 2. VEHICULOS
CREATE TABLE `VEHICULOS` (
    `id_vehiculo`    INT NOT NULL AUTO_INCREMENT,
    `matricula`      VARCHAR(10) NOT NULL UNIQUE,
    `marca`          VARCHAR(50) NOT NULL,
    `modelo`         VARCHAR(50) NOT NULL,
    `anio`           INT NOT NULL,
    `color`          VARCHAR(30),
    `fecha_entrada`  DATE NOT NULL,
    `estado`         ENUM('completo','desguazando','desguazado') NOT NULL,
    `precio_compra`  DECIMAL(10,2) NOT NULL,
    `kilometraje`    INT,
    `ubicacion_gps`  VARCHAR(50),
    `observaciones`  TEXT,
    PRIMARY KEY (`id_vehiculo`)
);

-- 3. PIEZAS
CREATE TABLE `PIEZAS` (
    `id_pieza`          INT NOT NULL AUTO_INCREMENT,
    `codigo_pieza`      VARCHAR(20) NOT NULL UNIQUE,
    `nombre`            VARCHAR(100) NOT NULL,
    `categoria`         ENUM('motor','carroceria','interior','electronica','ruedas','otros') NOT NULL,
    `precio_venta`      DECIMAL(10,2) NOT NULL,
    `stock_disponible`  INT NOT NULL DEFAULT 0,
    `stock_minimo`      INT NOT NULL DEFAULT 1,
    `ubicacion_almacen` VARCHAR(50),
    `compatible_marcas` TEXT,
    `imagen`            LONGTEXT,   -- base64 o URL
    `descripcion`       TEXT,
    PRIMARY KEY (`id_pieza`)
);

-- 4. INVENTARIO_PIEZAS (many-to-many VEHICULOS <-> PIEZAS)
CREATE TABLE `INVENTARIO_PIEZAS` (
    `id_vehiculo`      INT NOT NULL,
    `id_pieza`         INT NOT NULL,
    `cantidad`         INT NOT NULL,
    `estado_pieza`     ENUM('nueva','usada','reparada') NOT NULL,
    `fecha_extraccion` DATE NOT NULL,
    `precio_unitario`  DECIMAL(10,2) NOT NULL,
    `notas`            VARCHAR(255),
    PRIMARY KEY (`id_vehiculo`, `id_pieza`)
);

-- 5. USUARIOS
CREATE TABLE `USUARIOS` (
    `id_usuario`    INT NOT NULL AUTO_INCREMENT,
    `nombre`        VARCHAR(100) NOT NULL,
    `email`         VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,  -- BCrypt cost 12
    `id_rol`        INT NOT NULL,
    `activo`        TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_alta`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_usuario`)
);

-- 6. CLIENTES (perfil extendido para rol CLIENTE)
CREATE TABLE `CLIENTES` (
    `id_cliente`  INT NOT NULL AUTO_INCREMENT,
    `id_usuario`  INT NOT NULL UNIQUE,
    `telefono`    VARCHAR(20),
    `direccion`   VARCHAR(255),
    `nif`         VARCHAR(15) UNIQUE,
    PRIMARY KEY (`id_cliente`)
);

-- 7. SOLICITUDES_PRESUPUESTO
CREATE TABLE `SOLICITUDES_PRESUPUESTO` (
    `id_solicitud`          INT NOT NULL AUTO_INCREMENT,
    `id_cliente`            INT NOT NULL,
    `fecha_solicitud`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `estado`                ENUM('pendiente','en_negociacion','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
    `respuesta_admin`       TEXT,
    `precio_total`          DECIMAL(10,2),   -- precio final acordado
    `precio_oferta_cliente` DECIMAL(10,2),   -- oferta inicial / última oferta cliente
    `precio_contraoferta`   DECIMAL(10,2),   -- última contraoferta admin
    `turno`                 ENUM('cliente','admin') NOT NULL DEFAULT 'admin',
    `referencia_odoo`       VARCHAR(50),     -- ej: 'SO/2026/0042'
    PRIMARY KEY (`id_solicitud`)
);

-- 8. DETALLE_SOLICITUD (piezas de cada solicitud)
CREATE TABLE `DETALLE_SOLICITUD` (
    `id_solicitud` INT NOT NULL,
    `id_pieza`     INT NOT NULL,
    `cantidad`     INT NOT NULL DEFAULT 1,
    `notas`        VARCHAR(255),
    PRIMARY KEY (`id_solicitud`, `id_pieza`)
);

-- 9. NEGOCIACION_HISTORIAL (historial de rondas de negociación)
CREATE TABLE `NEGOCIACION_HISTORIAL` (
    `id`           INT NOT NULL AUTO_INCREMENT,
    `id_solicitud` INT NOT NULL,
    `ronda`        INT NOT NULL,
    `autor`        ENUM('cliente','admin') NOT NULL,
    `precio`       DECIMAL(10,2) NOT NULL,
    `mensaje`      TEXT,
    `fecha`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

-- 10. CODIGOS_QR
-- 11. MOVIMIENTOS_STOCK
-- 12. NOTIFICACIONES
```

### Datos de demo
- **8 vehículos**: Renault Clio, Ford Focus, Honda CBR 600, Toyota Corolla, Peugeot 308, VW Golf VII, Seat Ibiza, BMW Serie 3
- **15 piezas**: motores TDI/HDI, puertas, capós, parachoques, faros LED, alternadores, neumáticos, discos Brembo, turbo Honda, ECU BMW, etc.
- **9 usuarios** (3 por rol)
- **4 solicitudes**: 1 pendiente, 1 aprobada (con ref Odoo S00009), 1 rechazada, 1 en negociación (2 rondas)

### Credenciales de acceso
```
Contraseña de TODOS los usuarios: Autociclo2026!
BCrypt hash: $2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW

ADMIN:    admin@autociclo.es / admin@autociclo.com / supervisor@autociclo.es
EMPLEADO: pedro@autociclo.es / operario@autociclo.com / carlos@autociclo.es
CLIENTE:  maria.garcia@email.com / cliente@autociclo.com / juan.martinez@email.com
```

---

## 4. API REST (Spring Boot)

### Rutas de archivos
```
API/autociclo-api/src/main/java/com/autociclo/
├── controllers/
│   ├── AuthController.java
│   ├── SolicitudController.java
│   ├── PagoController.java
│   ├── PiezaController.java
│   ├── VehiculoController.java
│   ├── InventarioController.java
│   ├── UsuarioController.java
│   └── NotificacionController.java
├── models/
│   ├── Usuario.java, Rol.java, Cliente.java
│   ├── Pieza.java, Vehiculo.java
│   ├── InventarioPieza.java
│   ├── SolicitudPresupuesto.java
│   ├── DetalleSolicitud.java, DetalleSolicitudId.java
│   └── NegociacionHistorial.java
├── services/
│   └── SolicitudService.java  (lógica de negocio principal)
├── config/
│   ├── SecurityConfig.java
│   └── RabbitMQConfig.java
├── security/
│   ├── JwtAuthFilter.java
│   └── JwtUtil.java
└── utils/
    └── OdooClient.java
```

### application.properties (completo)
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:3306/autociclo_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
spring.datasource.username=${DB_USER:autociclo}
spring.datasource.password=${DB_PASS:autociclo1234}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
spring.jpa.open-in-view=false
app.jwt.secret=${JWT_SECRET:autociclo-secret-key-minimo-32-caracteres-cambiar}
app.jwt.expiration=86400000
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173,http://109.123.247.31:3000,http://109.123.247.31:5173,http://109.123.247.31:8090
spring.rabbitmq.host=${RABBITMQ_HOST:localhost}
odoo.url=${ODOO_URL:http://109.123.247.31:8069}
odoo.db=${ODOO_DB:odoo17}
stripe.secret.key=${STRIPE_SECRET_KEY:sk_test_REEMPLAZA}
```

### SecurityConfig — rutas públicas
```java
.requestMatchers("/api/auth/**", "/api/pagos/webhook").permitAll()
.requestMatchers(HttpMethod.GET, "/api/piezas", "/api/piezas/**",
    "/api/vehiculos", "/api/vehiculos/**", "/api/inventario/pieza/**").permitAll()
.anyRequest().authenticated()
```

### Endpoints completos

**Auth** (sin JWT)
```
POST /api/auth/login      → { token, usuario: {id, nombre, email, rol} }
POST /api/auth/register   → crea usuario con rol CLIENTE
```

**Solicitudes**
```
GET  /api/solicitudes              → lista (ADMIN/EMPLEADO: todas; CLIENTE: las suyas)
GET  /api/solicitudes/{id}         → detalle con detalles e historial
GET  /api/solicitudes/{id}/historial → lista de NegociacionHistorial

POST /api/solicitudes              → crear (solo CLIENTE)
Body: { detalles:[{idPieza, cantidad, notas}], precioOfertaCliente, notas }

PUT  /api/solicitudes/{id}/aprobar       → ADMIN → estado=aprobada, crea pedido Odoo
Body: { respuestaAdmin, precioTotal }

PUT  /api/solicitudes/{id}/rechazar      → ADMIN → estado=rechazada
Body: { respuestaAdmin }

PUT  /api/solicitudes/{id}/contraoferta  → ADMIN → estado=en_negociacion, turno=cliente
Body: { precio, mensaje }

PUT  /api/solicitudes/{id}/aceptar-oferta  → CLIENTE acepta contraoferta → estado=aprobada
PUT  /api/solicitudes/{id}/rechazar-oferta → CLIENTE rechaza → estado=rechazada
PUT  /api/solicitudes/{id}/nueva-oferta    → CLIENTE contraoferta → turno=admin
Body: { precio, mensaje }
```

**Pagos (Stripe)**
```
POST /api/pagos/intento   → CLIENTE, crea PaymentIntent
Body: { solicitudId }
Respuesta: { clientSecret, importeTotal, solicitudId }
Requisito: solicitud debe estar en estado 'aprobada' con precioTotal > 0
```

**Piezas** (GET públicos, resto ADMIN)
```
GET  /api/piezas                          → todas las piezas
GET  /api/piezas/{id}                     → detalle
GET  /api/piezas/buscar?q=&categoria=&marca=&maxPrecio=
POST /api/piezas                          → crear (ADMIN)
PUT  /api/piezas/{id}                     → actualizar (ADMIN)
DELETE /api/piezas/{id}                   → eliminar (ADMIN)
```

**Vehículos** (GET públicos)
```
GET  /api/vehiculos         → todos
GET  /api/vehiculos/{id}    → detalle con piezas
POST /api/vehiculos         → crear (ADMIN)
PUT  /api/vehiculos/{id}    → actualizar (ADMIN)
DELETE /api/vehiculos/{id}  → eliminar (ADMIN)
```

**Inventario** (GET /inventario/pieza/** público)
```
GET  /api/inventario                    → todas las asignaciones
GET  /api/inventario/vehiculo/{id}      → piezas de un vehículo
GET  /api/inventario/pieza/{id}         → vehículos que tienen esta pieza (PÚBLICO)
POST /api/inventario                    → asignar pieza a vehículo (ADMIN)
PUT  /api/inventario/{idVeh}/{idPieza}  → actualizar (ADMIN/EMPLEADO)
DELETE /api/inventario/{idVeh}/{idPieza}→ eliminar asignación (ADMIN)
```

**Usuarios** (todo ADMIN)
```
GET  /api/usuarios          → lista todos
GET  /api/usuarios/{id}     → detalle
POST /api/usuarios          → crear
PUT  /api/usuarios/{id}     → actualizar
PUT  /api/usuarios/{id}/password → cambiar contraseña
DELETE /api/usuarios/{id}   → desactivar (activo=false)
```

**Notificaciones**
```
GET /api/notificaciones          → las del usuario autenticado
GET /api/notificaciones/no-leidas → solo no leídas
PUT /api/notificaciones/{id}/leer → marcar leída
```

---

## 5. WEB SHOP (React)

### Rutas de archivos
```
Web/autociclo-shop/
├── src/
│   ├── App.tsx                    ← rutas React Router
│   ├── types/index.ts             ← interfaces TypeScript
│   ├── api/client.ts              ← Axios con interceptores JWT
│   ├── store/
│   │   ├── authStore.ts           ← Zustand: token + usuario
│   │   └── carritoStore.ts        ← Zustand: items del presupuesto
│   ├── lib/utils.ts               ← formatPrice(), cn()
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   └── AdminLayout.tsx
│   └── pages/
│       ├── Home.tsx
│       ├── Catalogo.tsx
│       ├── DetallePieza.tsx
│       ├── Login.tsx
│       ├── Registro.tsx
│       ├── SolicitarPresupuesto.tsx
│       ├── MisSolicitudes.tsx     ← vista del CLIENTE
│       ├── Pago.tsx               ← Stripe Elements + PDF factura
│       └── admin/
│           ├── AdminDashboard.tsx
│           ├── AdminSolicitudes.tsx ← gestión admin solicitudes
│           ├── AdminPiezas.tsx
│           ├── AdminVehiculos.tsx
│           └── AdminUsuarios.tsx
├── .env                           ← VITE_STRIPE_PUBLISHABLE_KEY
└── package.json
```

### .env (Web/autociclo-shop/.env)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Rth5Y9Z3elKL1ENOvYNPKEEcHFQWhfApNXyhaX1YLS30PPpnoasi2FErEZUQks0a60V35J4QPV9rh7j5hjwa6Pm00Zi1cE8Qx
```

### Stripe (entorno de pruebas)
```
PK: pk_test_51Rth5Y9Z3elKL1ENOvYNPKEEcHFQWhfApNXyhaX1YLS30PPpnoasi2FErEZUQks0a60V35J4QPV9rh7j5hjwa6Pm00Zi1cE8Qx
SK: sk_test_51Rth5Y9Z3elKL1ENfKzjEwK93VDWjfDBw3f6BfoBwtS5DattZzcRbTHAjtaHiws8fVgSfqUwLzmtMSjY8Q7nLoKK00J8GhJDI4
Tarjeta de prueba: 4242 4242 4242 4242 / cualquier fecha futura / cualquier CVC
```

### Rutas de la app
```
/                  → Home (público)
/catalogo          → Catálogo (público)
/catalogo/:id      → DetallePieza (público)
/login             → Login
/registro          → Registro
/solicitar         → SolicitarPresupuesto (requiere login)
/mis-solicitudes   → MisSolicitudes (requiere login)
/pagar?id=N        → Pago Stripe (requiere login)
/admin             → AdminDashboard (requiere ADMIN)
/admin/solicitudes → AdminSolicitudes
/admin/piezas      → AdminPiezas
/admin/vehiculos   → AdminVehiculos
/admin/usuarios    → AdminUsuarios
```

### TypeScript — interfaces principales (src/types/index.ts)
```typescript
export interface Usuario { id: number; nombre: string; email: string; rol: string }
export interface AuthState { token: string|null; usuario: Usuario|null; login(...); logout() }

export interface Pieza {
  idPieza: number; codigoPieza: string; nombre: string; descripcion?: string
  categoria: string; precioVenta: number; stockDisponible?: number
  stockMinimo?: number; ubicacionAlmacen?: string; compatibleMarcas?: string; imagen?: string
}
export interface Vehiculo {
  idVehiculo: number; matricula: string; marca: string; modelo: string; anio: number
  color?: string; estado: 'completo'|'desguazando'|'desguazado'
  precioCompra?: number; kilometraje?: number; ubicacionGps?: string; observaciones?: string
}
export interface InventarioPieza {
  id: { idVehiculo: number; idPieza: number }
  cantidad: number; estadoPieza: string; precioUnitario: number
  pieza?: Pieza; vehiculo?: Vehiculo
}
export interface NegociacionRonda {
  id: number; ronda: number; autor: 'cliente'|'admin'
  precio: number; mensaje?: string; fecha: string
}
export interface SolicitudCliente {
  idCliente: number; usuario?: { idUsuario: number; nombre: string; email: string }
  telefono?: string; direccion?: string; nif?: string
}
export interface SolicitudPresupuesto {
  idSolicitud: number; fechaSolicitud: string
  estado: 'pendiente'|'en_negociacion'|'aprobada'|'rechazada'
  respuestaAdmin?: string; referenciaOdoo?: string
  precioTotal?: number; precioOfertaCliente?: number; precioContraoferta?: number
  turno?: 'cliente'|'admin'; cliente?: SolicitudCliente
  detalles: DetalleSolicitud[]; historial?: NegociacionRonda[]
}
export interface DetalleSolicitud {
  id?: { idSolicitud: number; idPieza: number }; cantidad: number; pieza?: Pieza
}
```

### API Client (src/api/client.ts)
```typescript
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(res => res, (error) => {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
  }
  return Promise.reject(error)
})
```

### AuthStore (src/store/authStore.ts)
```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, usuario: null,
      login: (token, usuario) => set({ token, usuario }),
      logout: () => set({ token: null, usuario: null }),
    }),
    { name: 'autociclo-auth' }   // persiste en localStorage
  )
)
```

### Utils (src/lib/utils.ts)
```typescript
export const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
export const cn = (...args: ClassValue[]) => twMerge(clsx(args))
```

---

## 6. FLUJO COMPLETO DE NEGOCIACIÓN

```
1. Cliente crea solicitud → estado=pendiente, turno=admin, precioOfertaCliente=X
   → Se guarda ronda 1 en NEGOCIACION_HISTORIAL (autor=cliente)
   → RabbitMQ publica en solicitudes.nueva
   → Se notifica a todos los ADMIN

2. Admin puede:
   a) Aprobar → estado=aprobada, precioTotal=acordado
      → Se crea pedido de venta en Odoo → referenciaOdoo='SO/2026/XXXX'
      → Se notifica al cliente
   b) Rechazar → estado=rechazada
   c) Contraofertar → estado=en_negociacion, turno=cliente, precioContraoferta=Y
      → Se guarda ronda N en historial (autor=admin)
      → RabbitMQ publica notificación

3. Cliente (turno=cliente) puede:
   a) Aceptar oferta → estado=aprobada, precioTotal=precioContraoferta
      → Se crea pedido en Odoo
   b) Rechazar oferta → estado=rechazada
   c) Nueva oferta → turno=admin, precioOfertaCliente=Z
      → Nueva ronda en historial (autor=cliente)

4. Cuando estado=aprobada:
   → Cliente ve botón "Pagar X€" en MisSolicitudes
   → Navega a /pagar?id=N
   → Frontend llama POST /api/pagos/intento → recibe clientSecret
   → Stripe Elements recoge tarjeta → confirmCardPayment()
   → Éxito → generarFacturaPDF() → descarga PDF con jsPDF
```

---

## 7. PÁGINA DE PAGO (Pago.tsx) — funcionalidad clave

```typescript
// Carga la solicitud + crea PaymentIntent al montar
useEffect(() => {
  client.get(`/solicitudes/${solicitudId}`)
    .then(r => { setSolicitud(r.data); return client.post('/pagos/intento', { solicitudId }) })
    .then(r => setClientSecret(r.data.clientSecret))
}, [solicitudId])

// Stripe Elements usados: CardNumberElement, CardExpiryElement, CardCvcElement
// Tras pago exitoso: generarFacturaPDF(solicitud, usuario, paymentId)

// PDF incluye:
// - Logo AutoCiclo (cargado desde /logo.png via fetch → base64)
// - Header oscuro (#0a1224) con acento azul lateral
// - Número de factura: FAC-00006 (formato)
// - Tabla de piezas con autoTable
// - Desglose: base imponible + IVA 21% + total
// - Sello "PAGADO" en verde
// - Pie con datos empresa
```

---

## 8. ADMIN SOLICITUDES (AdminSolicitudes.tsx) — lógica clave

```typescript
// Muestra solicitudes agrupadas: pendientes primero, luego en negociación, luego resto
// Botones de acción visibles cuando:
//   - estado === 'pendiente'
//   - estado === 'en_negociacion' && turno === 'admin'
// Modal 3 tipos: 'aprobar' | 'contraofertar' | 'rechazar'

// Aprobar: precio precargado con sol.precioOfertaCliente
// Al confirmar aprobar → PUT /solicitudes/{id}/aprobar → crea pedido Odoo

// Historial: accordion expandible por solicitud
// Badges: "N en negociación — tu turno" en el header
// Toast: feedback 3.5s en esquina inferior derecha
```

---

## 9. MIS SOLICITUDES (MisSolicitudes.tsx) — vista cliente

```typescript
// Lista solicitudes del cliente
// Estado 'aprobada' → botón "Pagar X€" → navigate('/pagar?id=N')
// Estado 'en_negociacion' && turno='cliente':
//   → muestra precio de contraoferta del admin
//   → botones: Aceptar / Proponer otro precio / Rechazar
// Estado 'en_negociacion' && turno='admin':
//   → banner "Esperando respuesta del equipo"
// Historial: inline con burbujas (cliente=azul izquierda, admin=púrpura derecha)
// Indicador "Último movimiento" con precio y fecha
// NO muestra "Ver factura en Odoo" (solo el admin la ve)
```

---

## 10. DESKTOP (JavaFX)

### Rutas de archivos
```
Escritorio/AutoCiclo/app/src/main/java/com/autociclo/
├── controllers/
│   ├── SolicitudesController.java  ← gestión solicitudes + historial dialog
│   ├── UsuariosController.java
│   ├── DetalleVehiculoController.java
│   ├── DetallePiezaController.java
│   ├── DetalleInventarioController.java
│   ├── AsignarPiezaVehiculoController.java
│   ├── FormularioPiezaController.java
│   └── ListadoMaestroController.java
└── utils/
    ├── ApiClient.java      ← HTTP wrapper con JWT
    ├── AppConstants.java
    ├── AnimationFactory.java
    └── ValidationUtils.java
```

### SolicitudesController — funciones clave
```java
// TableView columnas: ID, Cliente, Estado, Fecha, Oferta, Contraoferta, Ref.Odoo, Turno
// Turno formateado con formatTurno(): "⏳ Pendiente de revisión" / "⚡ Tu turno" / "⏳ Turno del cliente" / "✅ Trato cerrado" / "❌ Cerrada"

// Double-click en fila → mostrarHistorial(sol)
// Dialog 620x500 con ScrollPane y burbujas de chat
// cliente: izquierda + azul; admin: derecha + púrpura; último: badge ★ ÚLTIMO

// Aprobar: Alert.CONFIRMATION (sin editar precio), auto-message, crea pedido Odoo
// Contraofertar: dialog con TextField precio + TextArea mensaje
// Rechazar: dialog con TextArea mensaje

// TRUCO para lambda effectively final:
// double _pa = 0.0; try { _pa = ...; } catch(e){} final double precioAcordado = _pa;
```

### ApiClient (utils/ApiClient.java)
```java
// Singleton con JWT token header
// Métodos: get(url), post(url, body), put(url, body), delete(url)
// Lee JWT desde sesión activa del usuario logueado
```

---

## 11. ODOO — Integración

```java
// OdooClient.java → crearPedidoVenta(nombreCliente, emailCliente, lineas)
// Usa JSON-RPC 2.0 hacia http://109.123.247.31:8069/jsonrpc
// Autenticación: odoo.user / odoo.password (admin/admin)
// Retorna referencia: "SO/2026/XXXX" o null si falla
// Fallo no crítico: se loguea pero no detiene el flujo
// La referencia se guarda en SOLICITUDES_PRESUPUESTO.referencia_odoo
```

---

## 12. RABBITMQ — Eventos

```java
// RabbitMQConfig.java
// Exchange: autociclo.exchange (TopicExchange)
// Queues:
//   - solicitudes.nueva → cuando cliente crea solicitud → Desktop recibe alerta
//   - stock.alerta → cuando stock < mínimo → Worker Dashboard
// Serialización: Jackson (JSON)

// RabbitMQPublisher:
//   publicarNuevaSolicitud(id, nombreCliente, email)
//   publicarContaoferta(id, nombreCliente, precio)
```

---

## 13. PIEZAS COMUNES / GOTCHAS CONOCIDOS

### BCrypt en servidor
```bash
# Al hacer UPDATE de password_hash via SSH, los $ se interpretan como variables shell
# SIEMPRE escapar como \$ o usar -e con comillas simples o Python para ejecutar SQL
# Hash correcto: $2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW
```

### Java lambda effectively final
```java
// Error: "local variable referenced from lambda must be final"
// Solución:
double _pa = 0.0;
try { _pa = jsonObj.get("precio").getAsDouble(); } catch (Exception e) {}
final double precioAcordado = _pa;
// Ahora precioAcordado es usable en lambda
```

### JSX múltiples raíces
```tsx
// Si el componente tiene modal fuera del div principal, usar Fragment:
return (
  <>
    <div>contenido principal</div>
    {modal && <div>modal</div>}
  </>
)
```

### Estado de solicitudes — mayúsculas/minúsculas
```typescript
// La API devuelve estados en MINÚSCULAS: 'aprobada', 'pendiente', etc.
// NO usar 'APROBADA' (mayúsculas) en los filtros del frontend
// Correcto: .filter(s => s.estado === 'aprobada')
```

### CORS en SecurityConfig
```java
// Si añades nuevos endpoints, verificar que están en la lista permitAll() o tienen JWT
// Para nuevas rutas públicas GET: añadir a requestMatchers(HttpMethod.GET, ...)
// Para webhooks o rutas sin auth: añadir a requestMatchers("/api/nueva-ruta").permitAll()
```

### Rebuild y deploy web
```bash
# Siempre desde Web/autociclo-shop/
npm run build
# Luego SCP del dist y copiar en el servidor (ver sección 2)
# Importante: limpiar assets viejos antes: rm -rf /var/www/autociclo-shop/assets
```

---

## 14. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
/home/yalilms/Documentos/Superior/TFG/
├── API/
│   └── autociclo-api/                 ← Spring Boot
│       ├── src/main/java/com/autociclo/
│       ├── src/main/resources/application.properties
│       └── pom.xml
├── Web/
│   └── autociclo-shop/                ← React + Vite
│       ├── src/
│       ├── public/logo.png            ← logo 256x256 RGBA PNG
│       ├── .env                       ← Stripe PK
│       └── package.json
├── Escritorio/
│   └── AutoCiclo/                     ← JavaFX
│       └── app/src/main/java/com/autociclo/
├── BaseDatos/
│   └── autociclo_db_v2.sql            ← schema completo con datos demo
├── PLANNING.md                        ← planning completo del proyecto
└── CONTEXTO_CLAUDE.md                 ← este archivo
```

---

## 15. ESTADO ACTUAL (15 Mayo 2026)

### ✅ Completado
- API REST completa con todos los endpoints
- Autenticación JWT + roles (ADMIN, EMPLEADO, CLIENTE)
- Sistema de negociación multi-ronda (web + desktop)
- Integración Odoo (creación automática de pedidos de venta)
- RabbitMQ: notificaciones en tiempo real
- Web Shop completo (catálogo, solicitudes, pago, admin panel)
- Pago con Stripe (modo test con claves reales)
- Factura PDF con jsPDF (logo real, IVA, sello PAGADO)
- Desktop: gestión solicitudes con historial dialog (double-click)
- Desktop: turno en tabla, aprobar con confirmación
- Dashboard admin con KPIs correctos

### 🎯 Pendiente / Próximo (Video 6 — 18 Mayo)
- Demo end-to-end integración total para entrega final
- Mobile Worker (React Native + Expo) — no iniciado

### Claves API y accesos
```
Stripe PK (frontend): pk_test_51Rth5Y9Z3el... (en .env)
Stripe SK (servidor):  sk_test_51Rth5Y9Z3el... (en systemd service)
Odoo admin: admin / admin → http://109.123.247.31:8069
```

---

## 16. CÓMO TRABAJAR CON CLAUDE EN ESTE PROYECTO

1. **Comunicación**: español, respuestas directas y concisas
2. **Deploy frontend**: siempre `npm run build` primero, luego SCP + SSH con el patrón Python
3. **Deploy API**: modificar Java → rebuild con Maven/Gradle → SCP del .jar → restart systemd
4. **No mover cards de Trello a "Completado"** — dejarlas en su lista con checks marcados
5. **Verificar estado real** antes de asumir que algo funciona: leer archivos actuales
6. **La web corre en el puerto 8090** (no 80, que está ocupado por la app de empresa)

### Comandos útiles en el servidor
```bash
# Estado de servicios
systemctl status autociclo-api
systemctl status nginx
systemctl status mysql

# Logs de la API
journalctl -u autociclo-api -n 100 --no-pager

# Reiniciar todo
systemctl restart autociclo-api
systemctl restart nginx

# Acceso MySQL
mysql -u autociclo -pautociclo1234 autociclo_db

# Ver config nginx
cat /etc/nginx/sites-enabled/*

# Ver variables de entorno del servicio
systemctl show autociclo-api | grep Environment
```

---

*Generado el 15 de Mayo de 2026 — Proyecto AutoCiclo TFG*
