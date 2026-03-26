# Guión — Video Avance 2: API REST Completa + RabbitMQ
**Fecha:** 27 Marzo 2026
**Autor:** Yalil Musa Talhaoui — TFG · 2º DAM · IES P. Hermenegildo Lanz, Granada

---

## Qué se muestra en este vídeo

API REST completamente implementada con todos los endpoints del ecosistema AutoCiclo, seguridad por roles con JWT y sistema de mensajería RabbitMQ integrado en el código Spring Boot.

---

## 1. Introducción (30 seg)

> "En este segundo vídeo de avance muestro la API REST de AutoCiclo completamente implementada. Desde la entrega anterior teníamos la base: BD con 11 tablas, Spring Boot arrancando y autenticación JWT. Ahora tenemos todos los CRUDs con seguridad por roles y RabbitMQ integrado para notificaciones asíncronas entre plataformas."

---

## 2. Estructura del proyecto (1 min)

Mostrar en el IDE (IntelliJ / VSCode) el árbol de carpetas del proyecto:

```
src/main/java/com/autociclo/
├── config/
│   ├── SecurityConfig.java       — JWT + CORS + @EnableMethodSecurity
│   ├── RabbitMQConfig.java       — Colas, exchange y bindings
│   └── GlobalExceptionHandler.java
├── controllers/
│   ├── AuthController.java
│   ├── VehiculoController.java
│   ├── PiezaController.java
│   ├── InventarioController.java
│   ├── UsuarioController.java
│   ├── SolicitudController.java
│   ├── StockController.java
│   ├── NotificacionController.java
│   └── CodigoQRController.java
├── messaging/
│   ├── RabbitMQPublisher.java    — Publica en colas
│   └── RabbitMQConsumer.java     — Consumidor de prueba (log)
├── models/          — 10 entidades JPA (todas las tablas)
├── repositories/    — 9 repositorios Spring Data
├── services/        — Lógica de negocio por dominio
├── security/        — JWT filter + UserDetails
└── dto/             — Request/Response objects
```

> "La arquitectura sigue el patrón Controller → Service → Repository. La seguridad se aplica a nivel de método con `@PreAuthorize` según el rol del token JWT."

---

## 3. Endpoints implementados (repaso rápido)

| Módulo | Endpoints | Roles |
|--------|-----------|-------|
| Auth | POST /api/auth/login, /register | Público |
| Vehículos | GET, POST, PUT, DELETE /api/vehiculos | AUTH / ADMIN |
| Piezas | GET, buscar, POST, PUT, DELETE /api/piezas | AUTH / ADMIN |
| Inventario | GET, POST, PUT /api/inventario | AUTH / ADMIN+EMPLEADO |
| Usuarios | GET, POST, PUT, DELETE /api/usuarios | ADMIN |
| Solicitudes | POST, GET, aprobar, rechazar | CLIENTE / ADMIN |
| Stock | POST /movimiento, GET /alertas | ADMIN+EMPLEADO |
| Notificaciones | GET, PUT /leer | Autenticado |
| Códigos QR | GET, POST | ADMIN+EMPLEADO |

---

## 4. Demo en Postman

### 4.1 — Sin token (401)
```
GET http://localhost:8080/api/vehiculos
→ 401 Unauthorized
```
> "Sin token la API rechaza cualquier petición protegida con 401."

### 4.2 — Login como ADMIN
```
POST http://localhost:8080/api/auth/login
{
  "email": "admin@autociclo.es",
  "password": "Autociclo2026!"
}
→ 200 OK  { "token": "eyJ...", "rol": "ADMIN" }
```
Copiar el token para las siguientes llamadas.

### 4.3 — CRUD Vehículos (ADMIN)
```
GET  /api/vehiculos              → Lista los 5 vehículos de prueba
POST /api/vehiculos              → Crear nuevo vehículo
PUT  /api/vehiculos/3            → Actualizar estado a 'desguazado'
```

### 4.4 — Búsqueda de piezas (público)
```
GET /api/piezas/buscar?q=motor        → Devuelve MOT-001 y MOT-002
GET /api/piezas/buscar?categoria=ruedas → Devuelve discos y neumáticos
```

### 4.5 — Seguridad por roles (403)
```
# Logearse como CLIENTE
POST /api/auth/login  { "email": "cliente@autociclo.com", ... }

# Intentar crear un vehículo
POST /api/vehiculos  (con token de CLIENTE)
→ 403 Forbidden
```
> "Un cliente con token válido recibe 403 si intenta acceder a un endpoint de ADMIN. Aquí se ve la seguridad por roles funcionando."

### 4.6 — Crear solicitud como CLIENTE → RabbitMQ
```
POST /api/solicitudes  (token CLIENTE)
{
  "detalles": [
    { "idPieza": 1, "cantidad": 1 },
    { "idPieza": 5, "cantidad": 2, "notas": "Para Ford Focus 2016" }
  ]
}
→ 201 Created
```
> "Al crear la solicitud, el servicio publica automáticamente un mensaje en la cola `solicitudes.nueva`."

**En los logs de Spring Boot:**
```
[RabbitMQ] Publicado en solicitudes.nueva: solicitud #2 de Cliente Demo
[Consumer] Nueva solicitud recibida — idSolicitud=2 cliente=Cliente Demo email=cliente@autociclo.com
```

### 4.7 — Movimiento de stock → Alerta RabbitMQ
```
POST /api/stock/movimiento  (token ADMIN)
{
  "idPieza": 1,
  "tipo": "salida",
  "cantidad": 3,
  "notas": "Venta a taller externo"
}
→ 201 Created
```
> "Como el MOT-001 tiene stock_minimo=1 y bajamos a 0, se dispara la alerta."

**En los logs:**
```
[RabbitMQ] ALERTA STOCK en stock.alerta: Motor 1.6 TDI (MOT-001) stock=0 < mínimo=1
[Consumer] ALERTA STOCK — pieza=Motor 1.6 TDI (MOT-001) stock=0 mínimo=1
```

### 4.8 — Aprobar solicitud como ADMIN
```
PUT /api/solicitudes/2/aprobar  (token ADMIN)
{
  "respuestaAdmin": "Solicitud aprobada, piezas disponibles.",
  "precioTotal": 2620.00
}
→ 200 OK  { "estado": "aprobada", "precioTotal": 2620.00 }
```

### 4.9 — Ver notificaciones del cliente
```
GET /api/notificaciones  (token CLIENTE)
→ [
    { "tipo": "solicitud_actualizada", "mensaje": "Tu solicitud #2 ha sido aprobada. Precio total: 2620.0€", "leida": false }
  ]
```

---

## 5. RabbitMQ Management UI (si el servidor está configurado)

> "La UI de gestión de RabbitMQ en el puerto 15672 muestra las colas `solicitudes.nueva` y `stock.alerta` con los mensajes publicados. Se puede ver el mensaje JSON con todos los datos del evento."

**URL:** `http://<IP-IONOS>:15672`
**Colas visibles:**
- `solicitudes.nueva` — mensajes de nuevas solicitudes
- `stock.alerta` — mensajes de stock por debajo del mínimo

> Nota: la instalación del servidor RabbitMQ está pendiente de configurar en el Ubuntu Server IONOS. El código está listo y conectará automáticamente con las variables de entorno `RABBITMQ_HOST`, `RABBITMQ_USER`, `RABBITMQ_PASS`.

---

## 6. Cierre (20 seg)

> "Esto es todo para la Entrega 2. La API REST está completa con todos los endpoints necesarios para el ecosistema AutoCiclo, seguridad JWT por roles funcionando correctamente, y la integración con RabbitMQ implementada en código. En la próxima entrega (10 de abril) veremos el Desktop JavaFX conectado a esta API con login real, gestión de usuarios y las notificaciones en tiempo real mediante el consumer de RabbitMQ."

---

## Checklist previo a grabar

- [ ] `mvn clean install` pasa sin errores
- [ ] Servidor MySQL corriendo y accesible (localhost:3306 o IONOS)
- [ ] Datos de prueba cargados (`autociclo_db_v2.sql`)
- [ ] Spring Boot arrancando en puerto 8080 (`mvn spring-boot:run`)
- [ ] Colección Postman preparada con los requests del guión
- [ ] RabbitMQ corriendo (local o servidor IONOS) para mostrar colas
- [ ] Logs de Spring Boot visibles en la terminal

---

## Variables de entorno para arrancar localmente

```bash
export DB_HOST=localhost
export DB_USER=autociclo
export DB_PASS=autociclo1234
export JWT_SECRET=autociclo-secret-key-minimo-32-caracteres-cambiar
export RABBITMQ_HOST=localhost   # o IP del servidor IONOS si ya está instalado

mvn spring-boot:run
```

---

## Archivos clave creados en esta entrega

| Archivo | Descripción |
|---------|-------------|
| `models/Vehiculo.java` | Entidad JPA vehículos |
| `models/Pieza.java` | Entidad JPA piezas con búsqueda |
| `models/InventarioPieza.java` | Inventario con clave compuesta |
| `models/SolicitudPresupuesto.java` | Solicitudes de clientes |
| `models/DetalleSolicitud.java` | Líneas de solicitud |
| `models/MovimientoStock.java` | Historial de stock |
| `models/Notificacion.java` | Alertas en BD |
| `models/CodigoQR.java` | QR para piezas/vehículos |
| `config/RabbitMQConfig.java` | Exchange + 2 colas AMQP |
| `messaging/RabbitMQPublisher.java` | Publica en `solicitudes.nueva` y `stock.alerta` |
| `messaging/RabbitMQConsumer.java` | Consumer de prueba (log consola) |
| `services/SolicitudService.java` | Crea solicitud + publica RabbitMQ + notifica |
| `services/StockService.java` | Registra movimiento + alerta si stock bajo |
| `controllers/` (7 nuevos) | Todos los endpoints REST con `@PreAuthorize` |
