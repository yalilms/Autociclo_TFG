# Prompt para Claude — Diseño de la Presentación TFG AutoCiclo

Copia este prompt completo y pégalo a Claude para que te genere el contenido de las diapositivas.

---

## PROMPT

Eres un diseñador de presentaciones técnicas para FP. Necesito que me generes el **contenido completo** de una presentación de defensa de TFG para el ciclo CFGS DAM (Desarrollo de Aplicaciones Multiplataforma) con estas características:

**Proyecto:** AutoCiclo — Ecosistema multiplataforma de gestión de desguace de vehículos  
**Centro:** IES P. Hermenegildo Lanz, Granada  
**Alumno:** Yalil Musa Talhaoui  
**Duración total:** ~15 minutos (presentación + demo en vivo)  
**Formato:** Alterno entre diapositivas y demo en directo de la aplicación

---

### ESTRUCTURA DE LA PRESENTACIÓN

La presentación tiene **6 bloques** que siguen exactamente este orden. En cada bloque habrá diapositivas que enmarcan la demo en vivo — el tribunal ve las slides mientras yo cambio a la app real.

Genera el contenido diapositiva a diapositiva. Para cada slide indica:
- **Título** de la diapositiva
- **Contenido** (bullets cortos, máximo 5 líneas, sin texto largo)
- **Nota del orador** (lo que digo yo en voz, 2-3 frases)
- Si hay una transición a demo, añade un bloque `🖥️ DEMO EN VIVO →` con una línea describiendo qué enseño

---

### BLOQUE 1 — Portada e introducción (0:00 – 1:00) · 2 slides

**Slide 1 — Portada**
- Título: AutoCiclo
- Subtítulo: Ecosistema multiplataforma de gestión de desguace
- Alumno, centro, curso 2025/26

**Slide 2 — ¿Qué es AutoCiclo?**
- Problema que resuelve: los desguaces gestionan piezas, clientes y empleados con sistemas desconectados o en papel
- Solución: tres apps interconectadas sobre una API REST central
- Stack a mencionar de forma breve (sin entrar en detalle todavía)

`🖥️ DEMO EN VIVO →` Mostrar las tres apps abiertas a la vez durante 5 segundos como vista general

---

### BLOQUE 2 — Arquitectura del sistema (1:00 – 2:30) · 2 slides

**Slide 3 — Diagrama de arquitectura**
- Diagrama visual con las tres apps (Shop, Desktop, Worker) apuntando a la API REST
- La API conecta con: MySQL, Odoo 17, RabbitMQ (mencionar pero no demostrar), Stripe
- Servidor real en Contabo (Ubuntu Server)

**Slide 4 — Stack tecnológico**
- Tabla o lista visual con las 4 capas:
  - API: Spring Boot 3, JWT, MySQL 8
  - Shop: React + Vite + TypeScript + Tailwind + Stripe
  - Desktop: Java 21 + JavaFX + Gradle
  - Worker: React Native + Expo

---

### BLOQUE 3 — Web Shop: el cliente (2:30 – 6:00) · 2 slides + 2 demos

**Slide 5 — Web Shop — Cliente**
- Acceso público con login JWT
- Catálogo de piezas con filtros
- Sistema de solicitud de presupuesto (el cliente negocia el precio)

`🖥️ DEMO EN VIVO →` Login en la Shop → catálogo → ficha de pieza → crear solicitud de presupuesto → aparece en "Mis solicitudes" con estado Pendiente

**Slide 6 — Flujo de negociación**
- El cliente no paga precio fijo: propone un precio
- El admin puede aprobar, rechazar o hacer contraoferta
- El estado de la solicitud se actualiza en tiempo real para ambos lados

`🖥️ DEMO EN VIVO →` Cambiar al Desktop: mostrar que la solicitud ya apareció en la bandeja del admin

---

### BLOQUE 4 — Desktop: el administrador (6:00 – 9:30) · 3 slides + 1 demo

**Slide 7 — Aplicación Desktop (JavaFX)**
- Rol: administrador del desguace
- Dashboard con estadísticas: solicitudes activas, stock bajo, últimos movimientos
- Hecho en Java 21 + JavaFX, instalador .deb para Linux (no requiere Java instalado)

**Slide 8 — Gestión de solicitudes**
- El admin ve todas las solicitudes entrantes en tiempo real
- Puede aprobar con precio propuesto o lanzar contraoferta
- Historial de negociación completo por solicitud

**Slide 9 — Inventario y stock**
- Módulo de piezas y vehículos
- Control de stock con movimientos de entrada/salida
- Se actualiza automáticamente cuando el Worker recoge piezas

`🖥️ DEMO EN VIVO →` Aprobar la solicitud desde el Desktop → mostrar inventario → el estado en la Shop cambia a "Aprobada"

---

### BLOQUE 5 — Pago con Stripe + Odoo (9:30 – 11:30) · 2 slides + 1 demo

**Slide 10 — Pasarela de pago con Stripe**
- El cliente paga solo cuando la solicitud está aprobada
- Integración real con Stripe: PaymentIntent en el backend, Stripe Elements en el frontend
- No se almacenan datos de tarjeta (PCI compliance delegado a Stripe)

**Slide 11 — Integración con Odoo 17**
- Al confirmar el pago, Spring Boot llama a Odoo mediante JSON-RPC
- Odoo crea automáticamente un pedido de venta con las líneas de la solicitud
- El número de referencia de Odoo (S000XX) queda visible para el cliente

`🖥️ DEMO EN VIVO →` Pagar en la Shop con tarjeta de prueba 4242 4242 4242 4242 → pantalla de éxito → solicitud pasa a estado "Pagada" → (opcional) mostrar el pedido en Odoo

---

### BLOQUE 6 — Worker móvil: el empleado (11:30 – 13:30) · 2 slides + 2 demos

**Slide 12 — Aplicación Worker (React Native)**
- Rol: operario del almacén
- Ve solo los pedidos ya pagados que debe preparar
- Interfaz simple pensada para uso en almacén (pantalla pequeña, acciones claras)

**Slide 13 — Flujo de preparación y envío**
- El empleado abre el pedido → ve las piezas y su ubicación en el almacén
- Marca cada pieza como recogida → el stock baja automáticamente en el sistema
- Cuando todas están recogidas puede marcar el pedido como "Enviado"

`🖥️ DEMO EN VIVO →` Worker: abrir pedido → recoger piezas → marcar como enviado

`🖥️ DEMO EN VIVO →` Volver a la Shop como cliente → solicitud aparece con estado "Enviado" con icono de camión

---

### BLOQUE 7 — Cierre (13:30 – 15:00) · 2 slides

**Slide 14 — Conclusiones**
- AutoCiclo resuelve el ciclo completo: solicitud → negociación → pago → preparación → envío
- Desplegado en servidor real (Contabo), no en localhost
- Tres plataformas distintas con una única fuente de verdad: la API REST

**Slide 15 — Gracias / Preguntas**
- Slide limpia: "¿Preguntas?" + nombre + datos de contacto si quieres
- (Opcional) QR al repositorio GitHub

---

### INSTRUCCIONES DE FORMATO

- Genera el contenido para cada slide con bullets cortos (máximo 4-5 puntos)
- Las notas del orador deben ser frases naturales, no texto formal de memoria
- Donde hay `🖥️ DEMO EN VIVO →` no hay slide visible — yo cambio a la app en directo
- El diseño visual lo haré yo en Canva/PowerPoint — solo necesito el contenido textual
- Usa lenguaje técnico pero accesible para un tribunal de FP
- Total de slides: **15 slides** (sin contar las transiciones de demo)
- **Para imágenes:** indica siempre con un bloque `📷 IMAGEN: [descripción de qué poner]` en la posición exacta donde debe ir dentro de la slide. Especifica si ocupa media slide, toda la slide, o va en un lado junto al texto. Ejemplos de uso:
  - `📷 IMAGEN: captura del dashboard de la app Desktop (media slide, lado derecho)`
  - `📷 IMAGEN: diagrama de arquitectura con las 3 apps apuntando a la API (slide completa, centrado)`
  - `📷 IMAGEN: logo de Stripe + logo de Odoo juntos (pequeño, esquina inferior derecha)`
  - `📷 IMAGEN: captura del formulario de pago en la Web Shop (media slide, lado izquierdo)`

---

### CONTEXTO ADICIONAL

- La API está en Spring Boot 3 con autenticación JWT. Cada app (Shop, Desktop, Worker) se autentica con JWT propio.
- La base de datos es MySQL 8 con 12 tablas. Está en un servidor Ubuntu en Contabo con Nginx como proxy.
- El instalador del Desktop genera un `.deb` (Linux) y un `.zip` portable (Windows) con JRE embebido — no requiere Java instalado.
- El pago con Stripe usa el flujo: frontend llama a `POST /api/pagos/intento` → backend crea PaymentIntent → frontend confirma con Stripe Elements.
- La integración Odoo funciona con JSON-RPC: cuando el pago es `succeeded`, Spring Boot crea el pedido de venta en Odoo automáticamente.
- RabbitMQ está integrado en la API pero NO se va a demostrar en la presentación.
- La defensa es ante un tribunal de IES P. Hermenegildo Lanz (Granada) el 20-21 de Mayo de 2026.
