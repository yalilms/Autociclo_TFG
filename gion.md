# Guión — Vídeo E4+E5: Demo completa Web Shop + App Móvil (~12 min)

## Credenciales de demo

### Autociclo Web / API
| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@autociclo.es | Autociclo2026! |
| Empleado | pedro@autociclo.es | Autociclo2026! |
| Cliente | maria.garcia@email.com | Autociclo2026! |
| Cliente demo | cliente@autociclo.com | Autociclo2026! |

### Odoo ERP (`http://109.123.247.31:8069`)
| Usuario | Contraseña |
|---|---|
| admin | admin |

### RabbitMQ Panel (`http://109.123.247.31:15672`)
| Usuario | Contraseña |
|---|---|
| guest | guest |

## URLs del sistema

| Servicio | URL |
|---|---|
| Web Shop | http://109.123.247.31:8090 |
| Odoo ERP | http://109.123.247.31:8069 |
| RabbitMQ Panel | http://109.123.247.31:15672 |

---

## Preparación antes de grabar

1. Abrir el navegador con la web: `http://109.123.247.31:8090`
2. Abrir una segunda pestaña con Odoo: `http://109.123.247.31:8069`
3. Tener el móvil/emulador con la app Worker lista en la pantalla de login
4. Tener la app Desktop abierta en segundo plano (para mostrar RabbitMQ)

---

## [00:00 – 00:30] Intro (30 s)

> "En este vídeo hago la demo completa del ecosistema Autociclo: el portal web para clientes, la app móvil para empleados y la integración con Odoo ERP para la gestión de facturas. Todo conectado al mismo backend en producción."

---

## PARTE 1 — WEB SHOP (5 min)

### [00:30 – 01:15] Catálogo público sin login (45 s)
**Qué hacer:**
- Abrir `http://109.123.247.31:8090` sin iniciar sesión
- Mostrar la página de inicio con el buscador hero
- Ir al **Catálogo** — señalar que los precios ahora aparecen correctamente
- Filtrar por marca (ej. **Seat**) → ver solo piezas compatibles con esa marca
- Filtrar por categoría **Motor** → ver solo motores
- Clicar en una pieza → mostrar ficha de detalle con precio orientativo y stock

---

### [01:15 – 02:15] Login de cliente y solicitar presupuesto (1 min)
**Qué hacer:**
- Pulsar **Iniciar sesión** → email: `maria.garcia@email.com` / contraseña: `Autociclo2026!`
- Desde la ficha de una pieza pulsar **Solicitar Presupuesto**
- Añadir 1 o 2 piezas al formulario
- Escribir una nota: *"Necesito la pieza para un Seat León 2015"*
- Pulsar **Enviar solicitud** → ver la pantalla de confirmación

---

### [02:15 – 02:45] Mis Solicitudes (30 s)
**Qué hacer:**
- Ir a **Mis Solicitudes** en el menú
- Mostrar la solicitud recién enviada con estado **Pendiente**
- Señalar también la solicitud anterior con estado **Aprobada** y su precio definitivo

---

### [03:15 – 05:00] Panel de administración (1 min 45 s)
**Qué hacer:**
- Hacer logout → iniciar sesión como **admin@autociclo.es** / `Autociclo2026!`
- Ir al **Dashboard** de admin → señalar los contadores (piezas, vehículos, solicitudes pendientes, ingresos)
- Ir a **Solicitudes** → ver la solicitud pendiente de María García
- Pulsar **Aprobar** → introducir precio definitivo (ej. 450 €) y un mensaje
- Pulsar **Aprobar y enviar a Odoo** → ver el toast de confirmación
- Ir a **Piezas** → crear una pieza nueva rápida (código, nombre, precio, stock) → guardar
- Ir a **Vehículos** → mostrar el listado con los estados (completo / desguazando / desguazado)

---

## PARTE 2 — ODOO ERP (1 min 30 s)

### [05:00 – 06:30] Ver el pedido creado automáticamente en Odoo
**Qué hacer:**
- Abrir la pestaña de Odoo: `http://109.123.247.31:8069`
- Ir a **Ventas → Pedidos de venta**
- Mostrar el pedido `SO/2026/XXXX` que se creó automáticamente al aprobar la solicitud
- Abrir el pedido → señalar el cliente, las líneas de pieza y el importe total
- Pulsar **Crear factura** si no está creada → mostrar la factura generada

> "Cuando el admin aprueba una solicitud desde la web, el sistema llama automáticamente a Odoo por JSON-RPC y crea el pedido de venta. El admin no tiene que hacer nada en Odoo manualmente."

---

## PARTE 3 — APP MÓVIL WORKER (4 min)

### [06:30 – 07:15] Login de empleado (45 s)
**Qué hacer:**
- Mostrar la app en el móvil/emulador
- Intentar login con contraseña incorrecta → ver el mensaje de error
- Login correcto: `pedro@autociclo.es` / `Autociclo2026!` → entrar al dashboard

---

### [07:15 – 08:15] Dashboard de stock y alertas — RabbitMQ (1 min)
**Qué hacer:**
- Mostrar el dashboard con las piezas en rojo (sin stock) y naranja (stock bajo)
- Señalar los contadores de resumen arriba
- Hacer **pull-to-refresh** para recargar en tiempo real

> "Cuando el stock baja del mínimo, la API publica un mensaje en RabbitMQ. La app móvil lo recibe y actualiza el dashboard automáticamente para que el empleado vea la alerta."

- Si la app Desktop está abierta: mostrar que la **notificación también llega al escritorio** en tiempo real (solicitud nueva)

---

### [08:15 – 09:00] Detalle de pieza y actualizar stock (45 s)
**Qué hacer:**
- Pulsar sobre una alerta → ir al detalle de la pieza
- Mostrar stock actual, ubicación en almacén y vehículo de origen
- Seleccionar **Entrada**, cantidad 5 → confirmar
- Ver el stock actualizado en pantalla

---

### [09:00 – 09:45] Escáner QR (45 s)
**Qué hacer:**
- Abrir pestaña **Escanear**
- Enfocar un QR de pieza (código `QR-PIE-00001` al `QR-PIE-00012`) → ver que navega automáticamente al detalle
- Enfocar un QR de vehículo (`QR-VEH-00003`) → ver los datos del vehículo

---

### [09:45 – 10:30] Búsqueda y vehículos (45 s)
**Qué hacer:**
- Abrir pestaña **Buscar** → escribir "motor" → resultados en tiempo real con debounce
- Abrir pestaña **Vehículos** → mostrar el listado del patio
- Señalar badges de color: verde (completo), naranja (desguazando), gris (desguazado)
- Filtrar por marca para ver que el buscador funciona

---

## [10:30 – 11:00] Cierre (30 s)

> "Esto es el ecosistema Autociclo completo: web de cliente, app móvil para empleados y ERP integrado, todo sobre el mismo backend. El flujo va desde que el cliente solicita una pieza hasta que el admin la aprueba y Odoo genera la factura, con notificaciones en tiempo real vía RabbitMQ."

---

## Tabla de tiempos

| Sección | Tiempo |
|---|---|
| Intro | 0:30 |
| Web — Catálogo y filtros | 0:45 |
| Web — Login cliente + solicitud | 1:00 |
| Web — Mis solicitudes | 0:30 |
| Web — Panel admin + aprobar | 1:45 |
| Odoo — Ver pedido automático | 1:30 |
| Móvil — Login | 0:45 |
| Móvil — Dashboard + RabbitMQ | 1:00 |
| Móvil — Stock + detalle | 0:45 |
| Móvil — QR | 0:45 |
| Móvil — Búsqueda + vehículos | 0:45 |
| Cierre | 0:30 |
| **Total** | **~10:30** |

---

## Notas importantes

- **RabbitMQ**: corriendo como contenedor Docker (`autociclo_rabbitmq`). Panel web en `http://109.123.247.31:15672`
- **Odoo 17**: corriendo como servicio `odoo17.service`. Acceso directo en `http://109.123.247.31:8069`
- **Todo activo** — no hace falta arrancar nada antes de grabar
- Para los QR del escáner: imprimir o mostrar en pantalla los códigos `QR-PIE-00001` a `QR-PIE-00012`
