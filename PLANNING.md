# PLANNING — AUTOCICLO: Ecosistema Multiplataforma de Gestión de Desguace

**Autor:** Yalil Musa Talhaoui
**Centro:** IES P. Hermenegildo Lanz, Granada — CFGS DAM 2º
**Entrega final:** 19 Mayo 2026
**Defensa:** 20-21 Mayo 2026

---

## Calendario de Entregas

| Entrega | Fecha | Días disponibles | Qué mostrar |
|---|---|---|---|
| **Video Avance 1** | 13 Marzo | 5 días ⚠️ | Arquitectura + DB v2 + API base + Auth JWT |
| **Video Avance 2** | 27 Marzo | 14 días | API completa + RabbitMQ funcionando |
| **Video Avance 3** | 10 Abril | 14 días | Desktop: Login + Usuarios + Notificaciones RabbitMQ |
| **Video Avance 4** | 24 Abril | 14 días | Odoo integrado + Web Shop completo |
| **Video Avance 5** | 8 Mayo | 14 días | Móvil Worker completo |
| **Video Avance 6** | 18 Mayo | 10 días | Integración final + Demo completa |
| **ENTREGA FINAL** | 19 Mayo | — | Código + Documentación + Presentación |
| **DEFENSA** | 20-21 Mayo | — | Presentación oral |

---

## Visión General del Ecosistema

| Componente | Tecnología | Estado |
|---|---|---|
| **Autociclo Desktop** | Java 21 + JavaFX | Parcial ✅ |
| **Autociclo Shop** | React + Vite + TypeScript + Tailwind | Por hacer |
| **Autociclo Worker** | React Native + Expo | Por hacer |
| **API REST** | Spring Boot 3 + JWT | Por hacer |
| **Facturación/CRM** | Odoo 17 Community | Por hacer |
| **Mensajería** | RabbitMQ 3.x + Spring AMQP | Por hacer |

---

## Arquitectura del Sistema

```
┌─────────────────────┐
│  Autociclo Desktop  │  (Java/JavaFX)
│  Administradores    │──────┐
└─────────────────────┘      │                          ┌────────────────────┐
                              │                    ┌───►│   Odoo CE          │
                              ▼                    │    │   Facturación/CRM  │
┌─────────────────────┐   ┌──────────────────┐    │    └────────────────────┘
│  Autociclo Shop     │──►│  Spring Boot API │────┤
│  React + Vite       │   │  + JWT Auth      │    │    ┌────────────────────┐
└─────────────────────┘   └──────────────────┘    └───►│   RabbitMQ         │
                              ▲         │               │   Notificaciones   │
┌─────────────────────┐      │          ▼               └────────┬───────────┘
│  Autociclo Worker   │──────┘   ┌─────────────┐                │
│  React Native/Expo  │◄─────────┤  MySQL RDS  │     Desktop y Worker
└─────────────────────┘          │  (11 tablas)│     reciben alertas RT
                                 └─────────────┘
```

### Flujos clave

**RabbitMQ:**
```
Web Shop ──► POST /api/solicitudes ──► Spring Boot ──► [cola: solicitudes.nueva] ──► Desktop (alerta)
Worker   ──► PUT /api/stock        ──► Spring Boot ──► [cola: stock.alerta]      ──► Worker Dashboard
              (si stock < mínimo)
```

**Odoo:**
```
Admin aprueba solicitud en Desktop
  └──► Spring Boot llama Odoo JSON-RPC
         ├──► Crea cliente en Odoo (si no existe)
         ├──► Crea Pedido de Venta
         └──► Odoo genera factura PDF automáticamente
```

---

## Infraestructura Servidor Ubuntu (8 GB / 256 GB)

```
├── MySQL 8.0        ~1.0 GB RAM   puerto 3306
├── Spring Boot API  ~0.5 GB RAM   puerto 8080
├── Odoo 17 CE       ~2.5 GB RAM   puerto 8069
├── RabbitMQ 3.x     ~0.3 GB RAM   puerto 5672 / 15672 (UI)
├── Nginx            ~0.1 GB RAM   puerto 80 / 443
└── SO + overhead    ~1.0 GB RAM
                    ────────────
                     ~5.4 GB ✅
```

---

## Base de Datos — v2 (11 tablas)

### Tablas existentes (3)
- `VEHICULOS` — Vehículos del desguace
- `PIEZAS` — Catálogo de piezas
- `INVENTARIO_PIEZAS` — Relación pieza-vehículo con stock

### Tablas nuevas (8)

| Tabla | Descripción |
|---|---|
| `ROLES` | Roles: admin, empleado, cliente |
| `USUARIOS` | Cuentas de acceso vinculadas a un rol |
| `CLIENTES` | Perfil extendido de clientes del Shop |
| `SOLICITUDES_PRESUPUESTO` | Peticiones de presupuesto desde la web |
| `DETALLE_SOLICITUD` | Líneas de piezas por solicitud |
| `CODIGOS_QR` | QR generados para piezas/vehículos |
| `MOVIMIENTOS_STOCK` | Historial de cambios de stock |
| `NOTIFICACIONES` | Alertas de stock bajo y nuevas solicitudes |

```
ROLES ──< USUARIOS ──< CLIENTES ──< SOLICITUDES_PRESUPUESTO ──< DETALLE_SOLICITUD >── PIEZAS
                    ──< NOTIFICACIONES
PIEZAS ──< INVENTARIO_PIEZAS >── VEHICULOS
       ──< CODIGOS_QR
       ──< MOVIMIENTOS_STOCK
```

---

## VIDEO AVANCE 1 — 13 Marzo (5 días)
> **Qué mostrar:** La arquitectura del proyecto, la nueva BD y la API arrancando con auth JWT.

### Tareas (hasta el 13 Marzo)
- [ ] Crear `autociclo_db_v2.sql` con las 8 tablas nuevas + datos de prueba
- [ ] Ejecutar la migración en AWS RDS
- [ ] Inicializar proyecto Spring Boot en `TFG/API/autociclo-api/`
- [ ] Configurar conexión a MySQL (JPA + HikariCP)
- [ ] Implementar `POST /api/auth/login` y `POST /api/auth/register` con JWT
- [ ] Crear usuarios de prueba: 1 admin, 1 empleado, 1 cliente
- [ ] Verificar con Postman que el login devuelve token JWT

**Demo del video:** Mostrar el diagrama de arquitectura → abrir Postman → hacer login con los 3 roles → ver el token JWT → mostrar el nuevo esquema de BD en MySQL Workbench.

---

## VIDEO AVANCE 2 — 27 Marzo (14 días)
> **Qué mostrar:** API REST completa con todos los endpoints + RabbitMQ enviando notificaciones.

### Tareas (14 al 27 Marzo)
- [ ] CRUD completo: Vehículos, Piezas, Inventario, Usuarios, Solicitudes
- [ ] Seguridad por roles en todos los endpoints
- [ ] Instalar RabbitMQ en el servidor Ubuntu
- [ ] Añadir `spring-boot-starter-amqp` al proyecto
- [ ] Configurar colas: `solicitudes.nueva` y `stock.alerta`
- [ ] Publicar mensaje en `solicitudes.nueva` al crear solicitud
- [ ] Publicar mensaje en `stock.alerta` cuando stock < mínimo
- [ ] Crear consumidor de prueba (log en consola) para verificar mensajes

**Demo del video:** Recorrer todos los endpoints en Postman → probar seguridad (401 sin token, 403 sin rol) → crear solicitud y ver en RabbitMQ Management UI que llega el mensaje a la cola → actualizar stock por debajo del mínimo y ver la alerta en la cola.

---

## VIDEO AVANCE 3 — 10 Abril (14 días)
> **Qué mostrar:** Desktop completado con login, gestión de usuarios y notificaciones en tiempo real.

### Tareas (27 Marzo al 10 Abril)
- [ ] Instalar Odoo 17 CE en el servidor Ubuntu
- [ ] Configurar módulos Odoo: Ventas, Facturación, Contactos
- [ ] Crear `ApiClient.java` en Desktop (HTTP client con JWT)
- [ ] Pantalla Login (`Login.fxml` + `LoginController.java`)
- [ ] Módulo Gestión de Usuarios (`Usuarios.fxml` + `UsuariosController.java`)
- [ ] Badge de notificaciones en menú lateral (consume cola RabbitMQ)
- [ ] Vista de Solicitudes con botón "Aprobar"
- [ ] Al aprobar: Spring Boot llama Odoo JSON-RPC → crea pedido → genera factura
- [ ] Integrar resto del Desktop con la API (reemplazar conexión directa)

**Demo del video:** Login en Desktop → navegar por módulo usuarios (crear, editar) → abrir Autociclo Shop en el navegador → enviar solicitud como cliente → ver en tiempo real cómo aparece la notificación en Desktop → aprobar solicitud → mostrar la factura generada en Odoo.

---

## VIDEO AVANCE 4 — 24 Abril (14 días)
> **Qué mostrar:** Autociclo Shop web completo (catálogo, login, solicitudes).

### Tareas (10 al 24 Abril)
- [ ] Inicializar `TFG/Web/autociclo-shop/` (React + Vite + TypeScript)
- [ ] Configurar React Router v6 + Axios + Tailwind CSS + Context JWT
- [ ] Página Home con buscador de piezas
- [ ] Página Catálogo con filtros (marca, categoría, precio)
- [ ] Ficha de Pieza con foto, stock y compatibilidad
- [ ] Login y Registro de clientes
- [ ] Formulario Solicitud de Presupuesto
- [ ] Página Mis Solicitudes (con estado: pendiente / aprobada + factura)
- [ ] Desplegar en servidor con Nginx

**Demo del video:** Abrir la web → buscar pieza por marca/modelo → ver ficha → registrarse como cliente → enviar solicitud → ir al Desktop y ver la notificación → aprobar → volver a la web y ver la solicitud aprobada con enlace a factura PDF.

---

## VIDEO AVANCE 5 — 8 Mayo (14 días)
> **Qué mostrar:** Autociclo Worker móvil completo (QR scanner, stock, alertas).

### Tareas (24 Abril al 8 Mayo)
- [ ] Inicializar `TFG/App_Movil/autociclo-worker/` (React Native + Expo)
- [ ] Pantalla Login con JWT en AsyncStorage
- [ ] Dashboard con alertas de stock bajo (polling a `/api/stock/alertas`)
- [ ] Escaner QR con Expo Camera
- [ ] Buscar pieza por QR o nombre
- [ ] Detalle de Pieza: stock, ubicación, estado
- [ ] Actualizar stock (+/-) con confirmación
- [ ] Listado de vehículos en patio
- [ ] Probar en dispositivo Android físico o emulador

**Demo del video:** Login en la app → ver Dashboard con alertas → escanear QR de una pieza → ver su ficha → reducir stock → mostrar que la alerta desaparece o cambia → buscar vehículo y ver su estado.

---

## VIDEO AVANCE 6 — 18 Mayo (10 días)
> **Qué mostrar:** Demo completa end-to-end de todo el ecosistema funcionando junto.

### Tareas (8 al 18 Mayo)
- [ ] Tests end-to-end del flujo completo
- [ ] Datos de demo completos y coherentes en BD
- [ ] Generar QR reales para las piezas de demo
- [ ] Pulir UI de las 3 plataformas (detalles visuales)
- [ ] Colección Postman documentada con todos los endpoints
- [ ] Documentación técnica del proyecto
- [ ] Preparar guion de la demo

**Demo del video:** Demo fluida y guionizada mostrando el ciclo completo: entrada de vehículo (Desktop) → extracción de pieza por operario (Worker) → cliente busca pieza en web (Shop) → solicita presupuesto → admin aprueba (Desktop, notificación RabbitMQ) → Odoo genera factura → cliente la recibe en la web.

---

## ENTREGA FINAL — 19 Mayo
- [ ] Código fuente completo en repositorio Git
- [ ] `autociclo_db_v2.sql` con datos de demo
- [ ] Documentación técnica (arquitectura, APIs, instalación)
- [ ] Manual de usuario básico por plataforma
- [ ] Colección Postman exportada
- [ ] APK de Autociclo Worker

---

## Detalle de Endpoints API

```
POST /api/auth/login
POST /api/auth/register

GET|POST|PUT|DELETE /api/vehiculos
GET|POST|PUT        /api/vehiculos/{id}

GET         /api/piezas
GET         /api/piezas/buscar?q=&marca=&categoria=
POST|PUT    /api/piezas/{id}       (ADMIN)

GET|POST|PUT /api/inventario
PUT          /api/inventario/{vid}/{pid}   (ADMIN, EMPLEADO)

GET|POST|PUT /api/usuarios         (ADMIN)

POST        /api/solicitudes                  (CLIENTE)
GET         /api/solicitudes                  (ADMIN: todas / CLIENTE: las suyas)
PUT         /api/solicitudes/{id}/aprobar     (ADMIN → flujo Odoo + RabbitMQ)
PUT         /api/solicitudes/{id}/rechazar    (ADMIN)

GET|POST    /api/codigos-qr
GET         /api/codigos-qr/{codigo}

POST        /api/stock/movimiento    (EMPLEADO, ADMIN)
GET         /api/stock/alertas       (EMPLEADO, ADMIN)

GET         /api/notificaciones
PUT         /api/notificaciones/{id}/leer
```

---

## Pantallas por Plataforma

### Desktop (añadir a lo existente)
| Fichero | Descripción |
|---|---|
| `Login.fxml` + `LoginController.java` | Pantalla de login |
| `Usuarios.fxml` + `UsuariosController.java` | CRUD usuarios |
| `SolicitudesController.java` | Ver solicitudes + aprobar (→ Odoo) |
| Badge en `ListadoMaestroController.java` | Notificaciones RabbitMQ |

### Web Shop
| Ruta | Descripción |
|---|---|
| `/` | Home con buscador |
| `/catalogo` | Listado con filtros |
| `/pieza/:id` | Ficha de pieza |
| `/login` `/registro` | Autenticación |
| `/solicitar` | Formulario presupuesto |
| `/mis-solicitudes` | Historial + facturas |

### Worker (React Native)
| Pantalla | Descripción |
|---|---|
| Login | Acceso con JWT |
| Dashboard | Alertas de stock bajo |
| EscanearQR | Cámara + lector |
| BuscarPieza | Búsqueda manual |
| DetallePieza | Stock + ubicación |
| ActualizarStock | +/- unidades |
| ListadoVehiculos | Estado patio |

---

## Checklist Verificación Final

- [ ] Login funciona en las 3 plataformas con el mismo usuario
- [ ] CRUD Desktop se refleja en la web en tiempo real
- [ ] QR generado en Desktop es escaneable desde móvil
- [ ] Solicitud web → RabbitMQ → notificación Desktop (tiempo real)
- [ ] Stock bajo → RabbitMQ → alerta en Worker Dashboard
- [ ] Aprobar solicitud → Odoo crea pedido y genera factura PDF
- [ ] Catálogo web solo muestra piezas con stock > 0
- [ ] API devuelve 401 sin JWT y 403 sin rol suficiente

---

## Tecnologías

| Componente | Tecnología | Versión |
|---|---|---|
| Desktop | Java + JavaFX | 21 / 21.0.5 |
| Backend API | Spring Boot | 3.x |
| Autenticación | JWT (jjwt) | 0.12.x |
| Mensajería | RabbitMQ + Spring AMQP | 3.x |
| ERP/Facturación | Odoo Community | 17 |
| Web | React + Vite + TypeScript | 18 / 5.x |
| Estilos web | Tailwind CSS | 3.x |
| Móvil | React Native + Expo | SDK 51 |
| Base de datos | MySQL | 8.0 (AWS RDS) |
| Proxy | Nginx | latest |
| Build Desktop | Gradle | 8.x |
