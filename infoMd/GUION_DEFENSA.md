# GUIÓN — AutoCiclo · Defensa TFG · ≤15 min

**Alumno:** Yalil Musa Talhaoui  
**Centro:** IES P. Hermenegildo Lanz · Granada  
**Fecha:** 20 Mayo 2026  

---

## ANTES DE EMPEZAR — checklist

- [ ] Presentación abierta en el navegador (archivo local o bundle)
- [ ] Web Shop abierta en otra pestaña: http://109.123.247.31:8090
- [ ] Desktop arrancado y logueado con `pedro@autociclo.es` / `Autociclo2026!`
- [ ] Odoo abierto en otra pestaña: http://109.123.247.31:8069
- [ ] Worker en el móvil o emulador listo
- [ ] Tarjeta de prueba Stripe a mano: `4242 4242 4242 4242`

---

## BLOQUE 1 — INTRO (3 min)

### [00:00 — 00:30] Slide 1 · Portada

> "Buenos días. Soy Yalil Musa Talhaoui, segundo de DAM. Mi TFG se llama AutoCiclo: un ecosistema multiplataforma para gestionar un desguace de vehículos. Lo tenéis desplegado en un servidor real, no en localhost."

---

### [00:30 — 01:30] Slide 2 · ¿Qué es AutoCiclo?

> "El problema es sencillo: los desguaces gestionan piezas, clientes y empleados con sistemas que no hablan entre sí. La solución que he construido son tres aplicaciones interconectadas sobre una API REST central. Una Web Shop para el cliente, una app Desktop para el administrador, y una app móvil Worker para el operario del almacén. Todo en tiempo real, una única base de datos."

---

### [01:30 — 02:30] Slide 3 · Arquitectura

> "Aquí está el diagrama completo. Los tres clientes hablan con la API mediante JWT. La API orquesta MySQL para los datos, Odoo para la facturación y Stripe para los pagos. Todo desplegado en Ubuntu Server en Contabo con Nginx."

---

### [02:30 — 03:00] Slides 4 y 5 · Stack y Base de datos *(pasar rápido)*

> "Cuatro capas tecnológicas: Spring Boot 3, React, JavaFX y React Native. La base de datos tiene 12 tablas divididas en cuatro áreas: catálogo, usuarios, solicitudes y operativa. Cuando una solicitud se paga, el stock baja automáticamente."

---

## BLOQUE 2 — WEB SHOP (2:30 min)

### [03:00 — 03:30] Slide 6 · Web Shop

> "El cliente entra en la Web Shop desde el navegador. Login con JWT, catálogo filtrable por categoría y marca, y puede solicitar presupuesto con su precio propuesto — no hay precio fijo."

### [03:30 — 05:30] ⏭ DEMO EN VIVO — Web Shop

**Abrir:** http://109.123.247.31:8090

1. Loguéate como cliente
2. Muestra el catálogo con filtros activos
3. Haz clic en una pieza y envía una solicitud con un precio propuesto

---

## BLOQUE 3 — NEGOCIACIÓN + DESKTOP (4 min)

### [05:30 — 06:00] Slide 7 · Flujo de negociación

> "La solicitud no tiene precio fijo. El cliente propone, el administrador acepta o contraoferta. Cada movimiento queda auditado en el historial."

### [06:00 — 07:30] ⏭ DEMO EN VIVO — Negociación Desktop ↔ Web Shop

1. Abre el Desktop → pestaña Solicitudes
2. Muestra que la solicitud que acabas de hacer aparece en estado Pendiente
3. Acepta o manda una contraoferta desde el Desktop
4. Vuelve a la Web Shop y muestra que el estado cambió

### [07:30 — 09:00] Slides 8, 9 y 10 · Desktop (hablar mientras enseñas la app abierta)

> "El administrador trabaja desde la aplicación JavaFX. Aquí ve las estadísticas del negocio: vehículos, piezas, ingresos. En la pestaña de solicitudes tiene la bandeja con toda la negociación. Y en inventario, el stock se actualiza solo cada vez que una pieza se vende o se registra un movimiento."

---

## BLOQUE 4 — PAGO + ODOO (2 min)

### [09:00 — 09:30] Slide 11 · Stripe

> "Cuando el administrador aprueba la solicitud, el cliente puede pagar directamente desde la Web Shop con Stripe. Tarjeta real, integración completa con PaymentIntent."

### [09:30 — 10:30] ⏭ DEMO EN VIVO — Pago con Stripe

1. En la Web Shop, ve a Mis Solicitudes
2. Pulsa Pagar en la solicitud aprobada
3. Introduce `4242 4242 4242 4242`, cualquier fecha y CVC
4. Muestra que el estado pasa a Pagada

### [10:30 — 11:00] Slide 12 · Odoo

> "En el momento en que Stripe confirma el pago, la API llama automáticamente a Odoo 17 por JSON-RPC y crea el pedido de venta. El administrador no hace nada, la factura aparece sola."

### [11:00 — 11:30] ⏭ DEMO EN VIVO — Odoo

1. Abre Odoo → Ventas → Pedidos
2. Muestra el pedido recién creado automáticamente

---

## BLOQUE 5 — WORKER MÓVIL (1:30 min)

### [11:30 — 12:00] Slides 13 y 14 · Worker

> "El operario del almacén trabaja con la app móvil Worker. Solo ve los pedidos pagados. Cuando recoge la pieza, marca el estado — el stock baja en ese momento."

### [12:00 — 13:00] ⏭ DEMO EN VIVO — Worker

1. Abre la app Worker en el móvil
2. Muestra la lista de pedidos pagados — aparece el que acabas de pagar
3. Marca como preparado/enviado
4. Abre el Desktop → Inventario y muestra el movimiento de stock registrado

---

## BLOQUE 6 — CIERRE (2 min)

### [13:00 — 14:00] Slide 15 · Conclusiones

> "He construido un ecosistema real: cuatro tecnologías distintas que comparten una única fuente de verdad. Todo desplegado, todo funcional. El mayor reto técnico fue sincronizar los estados entre tres interfaces distintas sin inconsistencias."

### [14:00 — 15:00] Slide 16 · Gracias

> "Eso es todo. Quedo a vuestra disposición para preguntas."

---

## RESUMEN DE TIEMPOS

| Bloque | Contenido | Tiempo |
|---|---|---|
| 1 | Intro + arquitectura | 3:00 min |
| 2 | Web Shop + demo catálogo | 2:30 min |
| 3 | Negociación + Desktop | 3:30 min |
| 4 | Stripe + Odoo + demos | 2:30 min |
| 5 | Worker + demo | 1:30 min |
| 6 | Cierre | 2:00 min |
| **Total** | | **~15 min** |

---

## SI EL TIEMPO APRIETA — prioridad de demos

1. **Solicitud de presupuesto** desde la Web Shop ← imprescindible
2. **Pago con Stripe** y estado que cambia ← imprescindible
3. **Pedido en Odoo** apareciendo automático ← imprescindible
4. Negociación Desktop ↔ Web Shop ← si hay tiempo
5. Worker móvil ← si hay tiempo

---

## CREDENCIALES RÁPIDAS

| App | URL | Usuario | Contraseña |
|---|---|---|---|
| Web Shop | http://109.123.247.31:8090 | cliente registrado | — |
| Desktop | app local | pedro@autociclo.es | Autociclo2026! |
| Odoo | http://109.123.247.31:8069 | admin | — |
| Stripe test | — | `4242 4242 4242 4242` | cualquier fecha/CVC |
