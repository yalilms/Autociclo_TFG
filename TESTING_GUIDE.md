# AutoCiclo — Guía Completa de Pruebas TFG

> **Versión:** Mayo 2026 | **Servidor:** `109.123.247.31` | **API:** `:8080` | **Web:** `:8090`

---

## Índice

1. [Verificación del servidor](#1-verificación-del-servidor)
2. [API REST — pruebas aisladas](#2-api-rest--pruebas-aisladas)
3. [Web Shop — pruebas aisladas](#3-web-shop--pruebas-aisladas)
4. [Desktop — pruebas aisladas](#4-desktop--pruebas-aisladas)
5. [Worker Móvil — pruebas aisladas](#5-worker-móvil--pruebas-aisladas)
6. [Integración completa end-to-end](#6-integración-completa-end-to-end)
7. [Verificación RabbitMQ](#7-verificación-rabbitmq)
8. [Verificación Odoo](#8-verificación-odoo)
9. [Pago con Stripe](#9-pago-con-stripe)
10. [Checklist pre-defensa](#10-checklist-pre-defensa)

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | `admin@autociclo.com` | `Autociclo2026!` |
| Empleado | `empleado@autociclo.com` | `Autociclo2026!` |
| Cliente | `cliente@autociclo.com` | `Autociclo2026!` |

**Tarjeta Stripe test:** `4242 4242 4242 4242` · Fecha: `12/29` · CVC: `123`

---

## 1. Verificación del servidor

**Empezar siempre aquí.** Si algo falla en este paso, el resto no tiene sentido.

### 1.1 Comprobar servicios activos

```bash
# Verificar que la API Spring Boot responde
curl -s http://109.123.247.31:8080/actuator/health
# Resultado esperado: {"status":"UP"}

# Verificar que el Web Shop carga
curl -o /dev/null -s -w "%{http_code}" http://109.123.247.31:8090
# Resultado esperado: 200
```

### 1.2 Comprobaciones visuales

- [ ] Abrir `http://109.123.247.31:8090` en el navegador → carga la página de inicio del Web Shop
- [ ] Abrir `http://109.123.247.31:8080/api/piezas` → devuelve JSON (array de piezas)
- [ ] No hay errores 5xx ni pantalla en blanco

### 1.3 Si la API no responde

```bash
# Reiniciar el servicio Spring Boot (solo si es necesario)
ssh root@109.123.247.31
systemctl restart autociclo-api
# Esperar 25 segundos y volver a verificar
```

---

## 2. API REST — pruebas aisladas

Usar Postman, Insomnia o `curl`. Probar la API directamente para confirmar que todos los endpoints funcionan antes de probar las apps.

### 2.1 Autenticación — Login

**Login como admin:**
```bash
curl -s -X POST http://109.123.247.31:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autociclo.com","password":"Autociclo2026!"}'
```
- [ ] Respuesta `200` con `{"token":"eyJ...","email":"admin@autociclo.com","rol":"ADMIN"}`
- [ ] Copiar el valor de `token` para las siguientes peticiones

**Login como cliente:**
```bash
curl -s -X POST http://109.123.247.31:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@autociclo.com","password":"Autociclo2026!"}'
```
- [ ] Respuesta `200` con `rol: "CLIENTE"`

**Login con credenciales incorrectas:**
```bash
curl -s -X POST http://109.123.247.31:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"noexiste@mail.com","password":"wrong"}'
```
- [ ] Respuesta `401 Unauthorized`

---

### 2.2 Piezas (endpoints públicos)

```bash
# Listar todas las piezas
curl http://109.123.247.31:8080/api/piezas

# Buscar por texto (nombre/código)
curl "http://109.123.247.31:8080/api/piezas?search=motor"

# Detalle de una pieza (usar id real de la lista)
curl http://109.123.247.31:8080/api/piezas/1
```
- [ ] Lista devuelve array JSON con: `idPieza`, `nombre`, `codigoPieza`, `precioVenta`, `stockDisponible`
- [ ] Búsqueda filtra por texto correctamente
- [ ] Detalle devuelve objeto completo con `ubicacionAlmacen`, `compatibleMarcas`, `descripcion`

---

### 2.3 Stock y alertas (requiere token ADMIN o EMPLEADO)

Sustituir `TU_TOKEN` por el JWT obtenido en el login de admin:

```bash
# Ver alertas de stock bajo
curl http://109.123.247.31:8080/api/stock/alertas \
  -H "Authorization: Bearer TU_TOKEN"
```
- [ ] Devuelve array de piezas con `stockDisponible <= stockMinimo`

```bash
# Registrar salida de stock (recoger pieza)
curl -X POST http://109.123.247.31:8080/api/stock/movimiento \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idPieza":1,"tipo":"salida","cantidad":1,"notas":"Prueba salida test"}'
```
- [ ] El `stockDisponible` de la pieza 1 baja en 1

```bash
# Registrar entrada de stock (reposición)
curl -X POST http://109.123.247.31:8080/api/stock/movimiento \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idPieza":1,"tipo":"entrada","cantidad":1,"notas":"Reposicion test"}'
```
- [ ] El `stockDisponible` de la pieza 1 sube en 1 (vuelve al original)

---

### 2.4 Vehículos (requiere token)

```bash
curl http://109.123.247.31:8080/api/vehiculos \
  -H "Authorization: Bearer TU_TOKEN"
```
- [ ] Lista de vehículos con: `matricula`, `marca`, `modelo`, `estado` (completo/desguazando/desguazado)

---

### 2.5 Solicitudes de presupuesto

**Crear solicitud como cliente:**
```bash
# Primero obtener token de cliente
TOKEN_CLIENTE=$(curl -s -X POST http://109.123.247.31:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@autociclo.com","password":"Autociclo2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

curl -X POST http://109.123.247.31:8080/api/solicitudes \
  -H "Authorization: Bearer $TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"detalles":[{"idPieza":1,"cantidad":1,"notas":"Prueba directa API"}]}'
```
- [ ] Respuesta `201` con `idSolicitud` y `estado: "pendiente"`
- [ ] Guardar el `idSolicitud` para el resto de pruebas (ej. `ID=5`)

**Listar solicitudes:**
```bash
# Admin ve todas
curl http://109.123.247.31:8080/api/solicitudes \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"

# Cliente solo ve las suyas
curl http://109.123.247.31:8080/api/solicitudes \
  -H "Authorization: Bearer $TOKEN_CLIENTE"
```
- [ ] Admin ve todas las solicitudes del sistema
- [ ] Cliente solo ve las propias

**Aprobar solicitud (admin):**
```bash
curl -X PUT http://109.123.247.31:8080/api/solicitudes/ID/aprobar \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"precioTotal":150.00,"respuestaAdmin":"Aprobado. Piezas disponibles."}'
```
- [ ] Estado cambia a `aprobada`
- [ ] `referenciaOdoo` tiene valor si Odoo está disponible

**Rechazar solicitud:**
```bash
curl -X PUT http://109.123.247.31:8080/api/solicitudes/ID/rechazar \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"respuestaAdmin":"Lo sentimos, piezas no disponibles."}'
```
- [ ] Estado cambia a `rechazada`

---

### 2.6 Códigos QR

```bash
# Generar QR para una pieza
curl -X POST http://109.123.247.31:8080/api/codigos-qr \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"pieza","idReferencia":1}'
```
- [ ] Devuelve objeto con `codigoUnico` (string UUID o similar)

```bash
# Consultar QR por código único (usar el valor de codigoUnico obtenido arriba)
curl http://109.123.247.31:8080/api/codigos-qr/CODIGO_UNICO \
  -H "Authorization: Bearer TU_TOKEN"
```
- [ ] Devuelve `tipo: "pieza"` e `idReferencia: 1`

---

### 2.7 Usuarios (solo ADMIN)

```bash
curl http://109.123.247.31:8080/api/usuarios \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```
- [ ] Lista de usuarios con roles

```bash
# Un CLIENTE no puede ver la lista de usuarios
curl http://109.123.247.31:8080/api/usuarios \
  -H "Authorization: Bearer $TOKEN_CLIENTE"
```
- [ ] Respuesta `403 Forbidden`

---

## 3. Web Shop — pruebas aisladas

Abrir `http://109.123.247.31:8090` en el navegador. Tener la consola del navegador (F12) abierta para detectar errores JS.

### 3.1 Acceso público (sin login)

- [ ] Página de inicio carga correctamente sin errores en consola
- [ ] Catálogo de piezas visible con imágenes o placeholders
- [ ] Clic en una pieza → abre detalle con nombre, precio, stock, descripción
- [ ] Búsqueda en catálogo filtra las piezas (escribir "motor")
- [ ] Botón "Iniciar sesión" en el header lleva a `/login`
- [ ] Intentar acceder a `/mis-solicitudes` sin login → redirige a `/login`
- [ ] Intentar acceder a `/admin` sin login → redirige a `/login`

### 3.2 Registro de nuevo cliente

1. Ir a la página de registro (enlace desde login)
2. Rellenar con un email nuevo: `nuevo_test@mail.com`, nombre, contraseña `Autociclo2026!`, teléfono, NIF
3. Clic "Registrarse"

- [ ] Redirige al inicio con sesión iniciada
- [ ] Nombre del usuario visible en el header
- [ ] Sin errores en consola

### 3.3 Login y sesión

- [ ] Login con `cliente@autociclo.com` / `Autociclo2026!` → sesión activa
- [ ] Recargar página (F5) → sesión persiste
- [ ] Login con contraseña incorrecta → mensaje de error claro (no crash, no pantalla blanca)
- [ ] Cerrar sesión → vuelve al inicio, las rutas protegidas redirigen al login

### 3.4 Solicitar presupuesto (flujo completo)

1. Login como cliente
2. Abrir catálogo, clic en una pieza con stock ≥ 1
3. Clic "Solicitar presupuesto"
4. Verificar que la pieza aparece en el formulario `/solicitar`
5. Añadir una nota opcional
6. Enviar la solicitud

- [ ] Confirmación de envío visible (no queda en blanco)
- [ ] Ir a "Mis solicitudes" → la nueva solicitud aparece con estado `Pendiente`
- [ ] La solicitud muestra la pieza seleccionada y la fecha

### 3.5 Mis Solicitudes — visualización correcta

- [ ] Cada solicitud muestra: fecha, estado (badge con color), lista de piezas, precio si lo hay
- [ ] Badge de color por estado:
  - Pendiente → gris o amarillo claro
  - En negociación → naranja o amarillo
  - Aprobada → verde
  - Rechazada → rojo
  - Pagada → morado, azul oscuro o verde oscuro
- [ ] Solicitud aprobada muestra botón "Pagar"
- [ ] Solicitud pagada NO muestra botón "Pagar"
- [ ] Solicitud rechazada muestra la razón del rechazo si la hay

### 3.6 Panel de administración (como admin)

1. Cerrar sesión del cliente
2. Login como `admin@autociclo.com`
3. Acceder a `/admin` o al enlace de administración

- [ ] Dashboard carga con métricas: total solicitudes, pendientes, aprobadas, etc.
- [ ] Listado de solicitudes con columnas visibles
- [ ] Se puede filtrar o buscar solicitudes por estado
- [ ] Seleccionar una solicitud `pendiente` → formulario para responder con precio
- [ ] Enviar respuesta con precio → estado cambia a `en_negociacion`
- [ ] Puede rechazar solicitudes en estado pendiente o en_negociacion
- [ ] NO puede rechazar solicitudes `aprobada` o `pagada` (botón deshabilitado o error)
- [ ] Solicitudes pagadas muestran estado "Pagada" correctamente (no "Aprobada")

---

## 4. Desktop — pruebas aisladas

Ejecutar desde la raíz del proyecto:
```bash
cd /home/yalilms/Documentos/Superior/TFG/Escritorio/AutoCiclo
./gradlew run
```
O desde IntelliJ/VSCode usando el task Gradle `run`.

### 4.1 Login

| Prueba | Credenciales | Resultado esperado |
|--------|-------------|-------------------|
| Login correcto admin | `admin@autociclo.com` / `Autociclo2026!` | Entra al panel principal |
| Login empleado | `empleado@autociclo.com` / `Autociclo2026!` | Entra (puede tener vista limitada) |
| Login incorrecto | `fake@mail.com` / `wrong` | Mensaje de error visible, sin crash |
| Campo vacío | (dejar en blanco) | Validación sin crash |

### 4.2 Gestión de piezas y vehículos

- [ ] Pestaña/sección de piezas carga la lista desde la API
- [ ] Búsqueda o filtro de piezas funciona
- [ ] Detalle de pieza muestra todos los campos (stock, ubicación, precio)
- [ ] Lista de vehículos carga correctamente
- [ ] Estados de vehículo: completo / desguazando / desguazado visibles

### 4.3 Gestión de usuarios (solo ADMIN)

- [ ] Lista de usuarios carga correctamente
- [ ] Puede crear nuevo usuario con email único y rol asignado
- [ ] Puede modificar rol de usuario existente
- [ ] Puede activar/desactivar usuario (con confirmación)
- [ ] El email del usuario propio aparece en la pantalla

### 4.4 Gestión de solicitudes — parte central del Desktop

Este es el módulo más importante. Probar en este orden:

| # | Acción | Resultado esperado |
|---|--------|-------------------|
| 1 | Abrir sección "Solicitudes" | Lista con todas las solicitudes del sistema |
| 2 | Ver solicitud con estado `pendiente` | Muestra cliente, piezas, fecha, sin precio aún |
| 3 | Seleccionar solicitud `pendiente` → responder con precio `150.00` y mensaje | Estado cambia a `en_negociacion` |
| 4 | Seleccionar solicitud `en_negociacion` → Aprobar | Diálogo, confirmar precio final → estado `aprobada` |
| 5 | Ver campo `referenciaOdoo` después de aprobar | Tiene valor si Odoo está activo, vacío si no lo está |
| 6 | Seleccionar solicitud `en_negociacion` → Rechazar | Estado cambia a `rechazada` |
| 7 | Intentar rechazar solicitud `aprobada` | Aviso "ya está aprobada, no se puede rechazar" |
| 8 | Intentar rechazar solicitud `rechazada` | Aviso "ya está rechazada" |
| 9 | Ver solicitud con estado `pagada` | Muestra "💰 Pagada" (o texto equivalente) |
| 10 | Intentar rechazar solicitud `pagada` | Aviso "ya está pagada, no se puede rechazar" |

### 4.5 Notificaciones

- [ ] Crear una nueva solicitud desde el Web Shop (otro navegador o pestaña)
- [ ] Esperar hasta 30 segundos en el Desktop
- [ ] La nueva solicitud aparece en el listado sin recargar manualmente
- [ ] (Si hay notificaciones visuales) aparece alguna alerta o badge

---

## 5. Worker Móvil — pruebas aisladas

Iniciar la app con Expo Go:
```bash
cd /home/yalilms/Documentos/Superior/TFG/Autociclo_Worker
npx expo start
```
Escanear el QR con la app **Expo Go** en el móvil (Android o iOS).

### 5.1 Login

| Prueba | Credenciales | Resultado esperado |
|--------|-------------|-------------------|
| Login correcto | `empleado@autociclo.com` / `Autociclo2026!` | Accede al dashboard |
| Login como admin | `admin@autociclo.com` / `Autociclo2026!` | También accede |
| Login incorrecto | email/password incorrectos | Mensaje de error, no crash |
| Cerrar y reabrir app | — | Sesión persiste (no pide login de nuevo) |
| Logout | Icono en header | Vuelve al login |

### 5.2 Dashboard — alertas de stock

- [ ] Carga la lista de piezas con stock bajo o sin stock
- [ ] Tarjeta en **rojo** = sin stock (`stockDisponible = 0`)
- [ ] Tarjeta en **naranja/amarillo** = stock bajo (`0 < stockDisponible ≤ stockMinimo`)
- [ ] Contador "Sin stock" en el header coincide con el número de tarjetas rojas
- [ ] Contador "Stock bajo" coincide con las tarjetas naranjas
- [ ] Contador "Pedidos" muestra el número de solicitudes `aprobadas`
- [ ] Pull-to-refresh (deslizar hacia abajo) actualiza la lista
- [ ] Sin interacción, la lista se refresca sola cada 30 segundos
- [ ] Clic en una tarjeta de pieza → navega al detalle de esa pieza
- [ ] Clic en el contador "Pedidos" → va al tab de Pedidos

### 5.3 Detalle de pieza

- [ ] Muestra: nombre, código de pieza, categoría, stock disponible, stock mínimo, ubicación en almacén
- [ ] Precio de venta formateado con 2 decimales (ej. "95,00 €")
- [ ] Marcas compatibles visibles
- [ ] Botón "Ver QR" visible
- [ ] Clic "Ver QR" → se genera y muestra un código QR en un modal
- [ ] El modal QR tiene botón "Cerrar" que funciona
- [ ] El QR generado es un código válido que se puede escanear con cualquier lector QR

### 5.4 Tab Escanear (cámara)

- [ ] Abre la cámara del móvil (solicita permiso si es la primera vez)
- [ ] Aceptar permiso → cámara activa con marco de escaneo
- [ ] Escanear un QR de tipo `pieza` → navega al detalle de esa pieza
- [ ] Escanear un QR de tipo `vehiculo` → navega al detalle del vehículo
- [ ] QR inválido o desconocido → mensaje de error visible, no crash, puede escanear de nuevo

### 5.5 Tab Pedidos (solicitudes aprobadas)

- [ ] Lista SOLO solicitudes con estado `aprobada`
- [ ] Cada tarjeta muestra: ID del pedido, nombre del cliente, número de piezas, precio total
- [ ] Referencia Odoo visible en la tarjeta si está disponible
- [ ] Pull-to-refresh actualiza la lista
- [ ] Lista vacía → mensaje "No hay pedidos pendientes de preparar" (o similar)
- [ ] Clic en un pedido → navega al detalle para preparar el pedido

### 5.6 Preparar pedido (detalle de solicitud)

1. Entrar al detalle de una solicitud aprobada
2. Ver la lista de piezas a recoger

- [ ] Cada pieza muestra: nombre, código, ubicación en almacén, cantidad solicitada, stock actual
- [ ] Si `cantidad > stockDisponible`: aviso "Stock insuficiente" visible
- [ ] Botón "Recoger X ud(s)" aparece para cada pieza con stock suficiente
- [ ] Clic "Recoger" → diálogo de confirmación ("¿Confirmar recogida?")
- [ ] Confirmar → se llama a `POST /api/stock/movimiento` con tipo `salida`
- [ ] La pieza recogida queda marcada visualmente (check verde, fondo diferente)
- [ ] No se puede pulsar "Recoger" de nuevo en una pieza ya recogida
- [ ] Cuando TODAS las piezas están recogidas → banner/mensaje "¡Todas las piezas recogidas!"
- [ ] Verificar en la API que el stock bajó: `curl http://109.123.247.31:8080/api/piezas/ID`

### 5.7 Tab Vehículos

- [ ] Lista de vehículos con matrícula, marca, modelo, año, estado
- [ ] Filtro por estado funciona (si existe)
- [ ] Detalle del vehículo muestra información completa

---

## 6. Integración completa end-to-end

Tener abiertas simultáneamente:
- Ventana 1: **Web Shop** como cliente (`http://109.123.247.31:8090`)
- Ventana 2: **Web Shop** como admin (pestaña de incógnito o navegador diferente)
- App: **Desktop** con login admin
- Móvil: **Worker** con login empleado

---

### Paso 1 — Cliente solicita presupuesto (Web Shop)

1. Web Shop → login como `cliente@autociclo.com`
2. Catálogo → seleccionar una pieza con stock ≥ 1
3. Clic "Solicitar presupuesto"
4. Rellenar formulario con nota: "Solicitud de prueba end-to-end"
5. Enviar

**Verificar:**
- [ ] Solicitud creada con estado `Pendiente` en "Mis solicitudes"
- [ ] La pieza y cantidad son correctas

---

### Paso 2 — Desktop recibe la solicitud

1. En el Desktop (ya logueado como admin), ir a Solicitudes
2. Esperar hasta 30 segundos o refrescar manualmente

**Verificar:**
- [ ] La nueva solicitud aparece en el listado
- [ ] Estado visible: "Pendiente"
- [ ] Datos correctos: cliente, pieza(s), fecha de hoy

---

### Paso 3 — Admin propone precio (Desktop)

1. En el Desktop, seleccionar la solicitud pendiente
2. Escribir precio: `150.00` y mensaje: "Precio acordado. Piezas revisadas."
3. Enviar respuesta

**Verificar:**
- [ ] Estado cambia a `en_negociacion` en el Desktop
- [ ] En el Web Shop (cliente), "Mis solicitudes" muestra `En negociación` con el precio propuesto
- [ ] El precio `150.00` aparece en la solicitud del cliente

---

### Paso 4 — (Opcional) Contraoferta del cliente

1. Web Shop como cliente → ver la solicitud en negociación
2. Si la UI lo permite: enviar contraoferta con precio diferente (ej. `130.00`)

**Verificar:**
- [ ] Solicitud sigue en `en_negociacion`
- [ ] La nueva oferta del cliente es visible para el admin

---

### Paso 5 — Admin aprueba la solicitud (Desktop)

1. Desktop → seleccionar la solicitud en negociación
2. Clic "Aprobar" con precio final `150.00`
3. Confirmar

**Verificar:**
- [ ] Estado cambia a `aprobada` en el Desktop
- [ ] En Web Shop cliente: solicitud muestra `Aprobada` y botón "Pagar"
- [ ] Si Odoo activo: campo `referenciaOdoo` tiene valor (ej. `S00001`)
- [ ] Si Odoo no activo: campo vacío, pero la aprobación se completó igualmente (sin error 500)

---

### Paso 6 — Worker prepara el pedido (Móvil)

1. Worker → Dashboard → contador "Pedidos" muestra ≥ 1
2. Clic en "Pedidos" → tab de pedidos
3. La solicitud aprobada aparece en la lista
4. Clic en el pedido → detalle del pedido

**Verificar:**
- [ ] Lista de piezas del pedido visible con ubicaciones
- [ ] Para cada pieza: clic "Recoger X ud(s)" → confirmar
- [ ] Pieza marcada como recogida
- [ ] El stock de la pieza baja en la API (verificar en Web Shop o con curl)
- [ ] Si el stock baja del mínimo: la pieza aparece en el Dashboard de alertas del Worker
- [ ] Banner "¡Todas las piezas recogidas!" cuando están todas marcadas

---

### Paso 7 — Cliente paga (Web Shop)

1. Web Shop como cliente → "Mis solicitudes"
2. La solicitud aprobada tiene botón "Pagar"
3. Clic "Pagar" → pantalla de pago con formulario Stripe
4. Introducir datos:
   - Número: `4242 4242 4242 4242`
   - Fecha: `12/29`
   - CVC: `123`
5. Confirmar pago

**Verificar:**
- [ ] Formulario de Stripe carga sin errores CORS
- [ ] El importe mostrado coincide con el `precioTotal` aprobado (`150.00`)
- [ ] Pago procesado → mensaje de confirmación
- [ ] Estado de la solicitud cambia a `pagada`
- [ ] Badge de "Pagada" visible en "Mis solicitudes" (distinto color)
- [ ] Botón "Pagar" desaparece de esa solicitud

---

### Paso 8 — Verificación final en Desktop y Worker

**Desktop:**
- [ ] La solicitud aparece con estado `💰 Pagada` (o texto equivalente)
- [ ] Intentar rechazar la solicitud pagada → aviso "ya está pagada, no se puede rechazar"

**Worker:**
- [ ] La solicitud desaparece del tab "Pedidos" (ya no está en `aprobada`)
- [ ] El stock actualizado es visible en el detalle de la pieza

---

## 7. Verificación RabbitMQ

### 7.1 Panel de administración RabbitMQ (si está disponible)

Acceder a `http://109.123.247.31:15672` con usuario `guest` / `guest`:
- [ ] Exchange `autociclo.exchange` de tipo `topic` existe
- [ ] Cola `solicitudes.nueva` existe y está enlazada al exchange
- [ ] Cola `stock.alerta` existe y está enlazada al exchange

### 7.2 Verificar mensajes en los logs

Después de ejecutar el flujo de integración completo, revisar los logs de Spring Boot:

```bash
# Conectar por SSH y revisar logs
ssh root@109.123.247.31
journalctl -u autociclo-api -n 100 --no-pager | grep -i rabbit
```

Buscar estas líneas (pueden variar según implementación):
- Al crear solicitud (Paso 1): mensaje publicado a `solicitudes.nueva`
- Al aprobar/contraofertar (Paso 3): mensaje publicado a `solicitudes.nueva`
- Al bajar stock del mínimo (Paso 6): mensaje publicado a `stock.alerta`
- Consumer recibiendo mensajes: log confirmando recepción

**Verificar:**
- [ ] Los mensajes se publican en los momentos correctos
- [ ] No hay errores de conexión a RabbitMQ en los logs
- [ ] El consumer registra los mensajes recibidos (solo log, comportamiento correcto)

### 7.3 Comportamiento importante

**El Desktop NO recibe mensajes RabbitMQ directamente.**  
El Desktop hace polling REST cada 30 segundos a la API para detectar cambios. Esto es comportamiento correcto y esperado.

Las alertas de stock en el Worker también llegan por **polling REST** a `/api/stock/alertas`, no por AMQP push directo.

---

## 8. Verificación Odoo

### 8.1 Comprobar que Odoo está activo

```bash
curl -s -o /dev/null -w "%{http_code}" http://109.123.247.31:8069/web/login
# Resultado esperado: 200
```

Si responde `200` → Odoo activo. Si no responde → Odoo no disponible (la integración falla silenciosamente, comportamiento correcto).

### 8.2 Flujo con Odoo activo

1. Ejecutar el Paso 5 de la integración (aprobar solicitud desde Desktop)
2. Esperar la respuesta de la API

**Verificar:**
- [ ] La solicitud aprobada tiene `referenciaOdoo` con un valor (ej. `S00001`)
- [ ] En el Web Shop, "Mis solicitudes" muestra la referencia Odoo junto a la solicitud
- [ ] Acceder a Odoo `http://109.123.247.31:8069` → Ventas → Pedidos → existe el pedido con esa referencia
- [ ] El pedido de Odoo tiene las líneas de producto correspondientes a las piezas solicitadas
- [ ] IVA 21% aplicado en el pedido si está configurado en Odoo

### 8.3 Tolerancia a fallos (Odoo no disponible)

Simular Odoo no disponible y aprobar una solicitud:
- [ ] La API responde correctamente (no devuelve error 500)
- [ ] La solicitud cambia a estado `aprobada` aunque Odoo no esté
- [ ] `referenciaOdoo` es `null` o vacío en la respuesta JSON
- [ ] El cliente puede seguir pagando con Stripe aunque no haya referencia Odoo
- [ ] En los logs aparece el error de Odoo (pero como warning, no como excepción fatal)

---

## 9. Pago con Stripe

### 9.1 Verificar endpoint de intento de pago

```bash
# Obtener token de cliente
TOKEN_CLIENTE=$(curl -s -X POST http://109.123.247.31:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@autociclo.com","password":"Autociclo2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Crear intento de pago (usar id de una solicitud APROBADA con precioTotal > 0)
curl -X POST http://109.123.247.31:8080/api/pagos/intento \
  -H "Authorization: Bearer $TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"solicitudId": ID_SOLICITUD_APROBADA}'
```
- [ ] Respuesta `200` con `clientSecret`, `importeTotal`, `solicitudId`
- [ ] `importeTotal` = `precioTotal * 100` en céntimos (ej. precio 150 → importe 15000)
- [ ] Intentar con solicitud que no sea `aprobada` → error `400` o `409`
- [ ] Intentar con solicitud sin `precioTotal` → error de validación

### 9.2 Pago exitoso con tarjeta de prueba

1. Solicitud con estado `aprobada` y precio configurado
2. Web Shop → "Mis solicitudes" → botón "Pagar"
3. Formulario Stripe Elements carga
4. Introducir: `4242 4242 4242 4242` · `12/29` · `123`
5. Confirmar pago

- [ ] Pago procesado → mensaje de éxito visible
- [ ] Estado de la solicitud cambia a `pagada` automáticamente
- [ ] Redirección correcta después del pago (si la hay)

### 9.3 Tarjeta con fondos insuficientes

1. Misma solicitud (o una nueva aprobada)
2. Introducir: `4000 0000 0000 9995`
3. Confirmar pago

- [ ] Aparece mensaje de error de Stripe: "Tu tarjeta no tiene fondos suficientes"
- [ ] La solicitud **permanece en `aprobada`** (no cambia a pagada)
- [ ] Se puede intentar pagar de nuevo con otra tarjeta

### 9.4 Guardia contra doble pago

1. Usar una solicitud ya en estado `pagada`
2. Intentar crear un nuevo intento de pago vía API:
   ```bash
   curl -X POST http://109.123.247.31:8080/api/pagos/intento \
     -H "Authorization: Bearer $TOKEN_CLIENTE" \
     -H "Content-Type: application/json" \
     -d '{"solicitudId": ID_SOLICITUD_PAGADA}'
   ```
- [ ] La API devuelve error (`400` o `409`), no crea un nuevo PaymentIntent

---

## 10. Checklist pre-defensa

Ejecutar esto el **día antes de la defensa** para asegurarse de que todo está en orden:

### Servidor
- [ ] API responde: `curl http://109.123.247.31:8080/actuator/health` → `{"status":"UP"}`
- [ ] Web carga: `http://109.123.247.31:8090` → 200 OK en navegador
- [ ] Sin errores recientes en logs: `journalctl -u autociclo-api -n 30 --no-pager`

### Web Shop
- [ ] Login admin funciona
- [ ] Login cliente funciona
- [ ] Catálogo de piezas visible
- [ ] Solicitar presupuesto funciona end-to-end

### Desktop
- [ ] Login admin funciona
- [ ] Lista de solicitudes carga
- [ ] Aprobar solicitud funciona

### Worker Móvil
- [ ] La app conecta a la API
- [ ] Dashboard muestra alertas de stock
- [ ] Escanear QR funciona

### Flujo completo
- [ ] Al menos una solicitud en estado `en_negociacion` (para demostrar el ciclo)
- [ ] Al menos una solicitud en estado `aprobada` (para demostrar el pago)
- [ ] Si Odoo activo: al menos un pedido visible en Odoo

### Datos de demo preparados
- [ ] Hay piezas con stock bajo para mostrar las alertas del Worker
- [ ] Hay solicitudes en distintos estados para mostrar el flujo completo
- [ ] Las piezas tienen imágenes o el catálogo se ve bien sin ellas

---

## Resumen del flujo completo (para la defensa)

```
1. Cliente (Web) → solicita presupuesto con precio ofertado
        ↓
2. Desktop (Admin) → ve la solicitud, propone precio distinto
        ↓
3. Cliente (Web) → ve la contraoferta, acepta o propone otro precio
        ↓ (cuando llegan a un acuerdo)
4. Desktop (Admin) → aprueba → Odoo crea pedido de venta
        ↓
5. Worker (Empleado) → ve el pedido aprobado, recoge las piezas físicamente
        ↓  (el stock baja → puede aparecer alerta si baja del mínimo)
6. Cliente (Web) → paga con Stripe → solicitud queda como "Pagada"
        ↓
7. Desktop → muestra solicitud "💰 Pagada", ya no se puede rechazar
```

**RabbitMQ** publica mensajes en cada cambio de estado → los logs del servidor lo confirman.  
**Odoo** recibe la integración en el paso 4 → el pedido queda en el CRM.

---

*Guía generada para defensa TFG — AutoCiclo — IES P. Hermenegildo Lanz, Granada — Mayo 2026*
