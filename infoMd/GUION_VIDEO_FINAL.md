# Guión — Video Final TFG AutoCiclo
**Duración objetivo: 12–14 minutos** (dejas margen de sobra)

---

## Antes de grabar — prepara esto

| Qué | Cómo dejarlo |
|---|---|
| Web Shop | Abierta en `/mis-solicitudes` con sesión de cliente iniciada (`yalil.ms72@gmail.com` / `admin123`) |
| Desktop | Abierto y logado como admin |
| Móvil/Emulador | Worker abierto en la tab Pedidos |
| Odoo (opcional) | Abierto en `localhost:8069 > Ventas > Pedidos` para mostrar la integración al final |
| Solicitud de prueba | Crea UNA nueva antes de grabar para tenerla en estado `pendiente` lista para demostrar |

> **Truco**: ten el Desktop y la Web Shop en pantallas distintas o usa Alt+Tab fluido. El móvil grábalo en paralelo con grabación de pantalla del dispositivo o emulador en pantalla.

---

## BLOQUE 1 — Introducción (0:00 – 0:45)

**Qué decir:**
> "AutoCiclo es un ecosistema completo para la gestión de un desguace de vehículos. Está compuesto por tres aplicaciones conectadas a una misma API REST con Spring Boot: una tienda web para clientes, una aplicación de escritorio para administradores y una app móvil para los trabajadores del almacén."

**Qué mostrar:**
- Diagrama de arquitectura si lo tienes, o simplemente las tres apps abiertas a la vez en pantalla dividida 3 segundos
- La API corriendo (una petición en Postman o simplemente menciona que está en el servidor Contabo)

---

## BLOQUE 2 — Web Shop: el cliente solicita (0:45 – 4:00)

### 2.1 — Login y catálogo (0:45 – 1:30)
- Muestra la pantalla de login de la Shop → entra como cliente
- Navega al catálogo de piezas
- Haz clic en una pieza → muestra la ficha con precio, stock, compatibilidad

### 2.2 — Crear solicitud de presupuesto (1:30 – 3:00)
- Desde la ficha de pieza, añádela al carrito / pulsa "Solicitar presupuesto"
- Rellena el formulario: precio que ofrece el cliente
- Envía la solicitud
- **Muestra en pantalla que aparece en "Mis solicitudes" con estado `Pendiente`**

> Punto a destacar en voz: *"El cliente no paga precio de catálogo, negocia directamente con AutoCiclo."*

### 2.3 — Notificación recibida (3:00 – 4:00)
- Cambia al Desktop: muestra que **ya aparece la solicitud** en la bandeja del admin
- Vuelve un segundo a la Shop → muestra el estado sigue en `Pendiente`

---

## BLOQUE 3 — Desktop: el admin gestiona (4:00 – 8:30)

### 3.1 — Vista general del Desktop (4:00 – 4:45)
- Muestra el dashboard de admin: estadísticas, total solicitudes, stock bajo, etc.
- Menciona que está hecho en JavaFX + Java 21

### 3.2 — Negociación (4:45 – 6:30)
- Abre la solicitud que acaba de llegar
- **Opción A (más rápida para el video):** pulsa directamente "Aprobar" con el precio que ofreció el cliente
- **Opción B (más completa):** haz una contraoferta → muestra que el cliente recibe la propuesta
  - Vuelve a la Shop → el cliente ve la contraoferta y la acepta
  - El estado cambia a `Aprobada`

> Recomendación: usa **Opción B** si tienes soltura, es más impresionante. Si no, ve directo a aprobar.

### 3.3 — Gestión de stock (6:30 – 7:30)
- Sin salir del Desktop muestra el módulo de inventario/stock
- Muestra una pieza con su stock actual
- Muestra un movimiento de entrada (o el histórico de movimientos)
- Menciona: *"El stock se actualiza automáticamente cuando el trabajador recoge las piezas desde la app móvil"*

### 3.4 — Gestión de usuarios / vehículos (opcional, 7:30 – 8:30)
- Si te queda tiempo muestra 15 segundos el panel de usuarios o el de vehículos
- Si vas justo de tiempo **sáltate este punto** y pasa directo al pago

---

## BLOQUE 4 — Web Shop: el cliente paga (8:30 – 10:30)

- Vuelve a la Shop como cliente → la solicitud ahora aparece en estado `Aprobada` con precio final
- Pulsa el botón **"Pagar"**
- Completa el formulario de Stripe (número de tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura, cualquier CVC)
- El pago se procesa → pantalla de confirmación
- Vuelve a "Mis solicitudes" → estado **`Pagada`** con la referencia de Odoo visible (`S000XX`)

> Punto clave a mencionar: *"En el momento del pago, Spring Boot llama automáticamente a Odoo mediante su API JSON-RPC y crea un pedido de venta. Aquí está la referencia generada."*
> Si tienes Odoo abierto, muéstralo 10 segundos: el pedido aparece allí con las líneas de la solicitud.

---

## BLOQUE 5 — Worker móvil: el empleado prepara y envía (10:30 – 13:30)

### 5.1 — Login y tab Pedidos (10:30 – 11:00)
- Muestra el login en el Worker → entra como empleado
- Tab "Pedidos": aparece el pedido recién pagado con badge verde **PAGADO**

### 5.2 — Recoger piezas (11:00 – 12:15)
- Abre el pedido → muestra los detalles: cliente, precio, piezas a preparar con ubicación en almacén
- Pulsa "Recoger X ud(s)." en cada pieza → confirma
- Muestra que el badge de la pieza cambia a **"Recogida ✓"**
- Muestra que el stock de esa pieza ha bajado (si puedes tenerlo visible en el Desktop al mismo tiempo, es un efecto visual muy bueno)

> Punto a destacar: *"Si el empleado sale de la pantalla y vuelve, las piezas recogidas siguen marcadas. No se puede registrar dos veces el mismo movimiento de stock."*

### 5.3 — Marcar como enviado (12:15 – 13:00)
- Cuando todas las piezas están recogidas aparece el botón **"Marcar pedido como enviado"**
- Confírmalo → alerta de éxito
- Vuelve a la tab Pedidos → el pedido aparece ahora con badge **ENVIADO**

### 5.4 — Cierre del loop: la Shop refleja el estado (13:00 – 13:30)
- Cambia rápidamente a la Web Shop como cliente → la solicitud muestra estado **`Enviado`** con icono de camión
- Frase de cierre: *"El cliente ve en tiempo real el estado de su pedido."*

---

## BLOQUE 6 — Cierre (13:30 – 14:30)

**Qué mostrar:**
- Vuelve a la vista de las tres apps a la vez (o simplemente el Desktop)
- Si quieres, abre el Swagger/API un segundo para mostrar los endpoints

**Qué decir:**
> "AutoCiclo integra tres plataformas — web, escritorio y móvil — sobre una API REST con Spring Boot y JWT. Los datos fluyen en tiempo real: el stock, los estados de solicitud y la facturación en Odoo se sincronizan automáticamente. La base de datos MySQL está desplegada en un servidor real en Contabo, igual que la API."

**Stack final (di esto o ponlo en pantalla):**
- API: Spring Boot 3 · JWT · MySQL 8 · Odoo 17 JSON-RPC
- Shop: React + Vite + TypeScript + Tailwind + Stripe
- Desktop: Java 21 + JavaFX + Gradle
- Worker: React Native + Expo

---

## Cronograma resumen

| # | Bloque | Tiempo |
|---|---|---|
| 1 | Introducción | 0:00 – 0:45 |
| 2 | Web Shop — cliente solicita | 0:45 – 4:00 |
| 3 | Desktop — admin gestiona y aprueba | 4:00 – 8:30 |
| 4 | Web Shop — cliente paga (+ Odoo) | 8:30 – 10:30 |
| 5 | Worker — recoge y envía | 10:30 – 13:30 |
| 6 | Cierre y stack técnico | 13:30 – 14:30 |

**Total estimado: ~14 minutos**

---

## Lo que NO enseñas (y está bien así)
- RabbitMQ (flujo interno, no es visible para el usuario)
- Código fuente
- Configuración del servidor / Nginx
- Proceso de build / despliegue
- Gestión de roles en detalle
