# Prompt para Claude — Generar presentación AutoCiclo TFG

Usa este prompt en Claude (claude.ai o Claude Code) con capacidad de generar documentos formateados o presentaciones.

---

## PROMPT

```
Eres un diseñador de presentaciones experto. Necesito que crees una presentación profesional y visualmente impactante para la defensa de mi Trabajo de Fin de Grado (TFG) del Ciclo Formativo de Grado Superior de DAM (Desarrollo de Aplicaciones Multiplataforma) en el IES P. Hermenegildo Lanz, Granada.

## CONTEXTO DEL PROYECTO

**Nombre del proyecto:** AutoCiclo — Sistema de gestión para desguace de vehículos

**Idea central:** AutoCiclo es un ecosistema de software multiplataforma diseñado para digitalizar y automatizar la gestión completa de un negocio de desguace de coches. Permite gestionar vehículos, piezas, stock, presupuestos, negociación de precios, pagos y facturación desde cualquier dispositivo.

## COMPONENTES DESARROLLADOS (4 aplicaciones + integraciones)

1. **AutoCiclo Desktop** — Aplicación Java 21 + JavaFX para el personal interno del desguace. Gestión de vehículos, piezas, usuarios, solicitudes de presupuesto con negociación en tiempo real, alertas RabbitMQ y códigos QR.

2. **AutoCiclo Shop** (Web) — Tienda online en React + TypeScript + Tailwind para clientes. Los clientes pueden navegar piezas, solicitar presupuesto personalizado, negociar precios con el desguace y pagar con Stripe.

3. **AutoCiclo Worker** (Móvil) — App React Native + Expo para empleados del almacén. Escaneo de códigos QR, gestión de stock en tiempo real, visualización de vehículos y solicitudes.

4. **API REST** — Backend Spring Boot 3 + JWT + Spring Security. Arquitectura stateless, roles (ADMIN/EMPLEADO/CLIENTE), 10 módulos, ~45 endpoints.

5. **Odoo 17 Community** — ERP integrado para facturación. Cuando el admin aprueba un presupuesto, la API llama automáticamente a Odoo via JSON-RPC y crea el pedido de venta.

6. **RabbitMQ** — Mensajería asíncrona. Eventos en tiempo real: nueva solicitud → Desktop; stock bajo → Worker.

## BASE DE DATOS (MySQL 8.0)

**12 tablas:**
- ROLES, USUARIOS, CLIENTES
- VEHICULOS, PIEZAS, INVENTARIO_PIEZAS
- SOLICITUDES_PRESUPUESTO, DETALLE_SOLICITUD, NEGOCIACION_HISTORIAL
- MOVIMIENTOS_STOCK, CODIGOS_QR, NOTIFICACIONES

## INFRAESTRUCTURA

Servidor Ubuntu en Contabo (8GB RAM, 150GB SSD) con todos los servicios productivos:
- Spring Boot API en puerto 8080
- Nginx como proxy en 8090
- MySQL 8.0
- Odoo 17 Community
- RabbitMQ 3.x

## FLUJO PRINCIPAL (explicar como historia)

1. El cliente entra en la web → busca una pieza → solicita presupuesto con su precio ofertado
2. El admin recibe notificación en Desktop (RabbitMQ) → negocia precio → aprueba o contraoferta
3. Si se aprueba → Odoo crea el pedido de venta automáticamente → cliente paga con Stripe
4. El empleado en almacén recibe alerta en móvil de stock bajo → escanea QR de pieza → actualiza stock

---

## FORMATO DE LA PRESENTACIÓN

- **Duración objetivo:** 15 minutos (aproximadamente 15-18 diapositivas)
- **Estilo visual:** Moderno, oscuro (fondo #0f172a o similar azul oscuro/negro), acentos en azul eléctrico (#3b82f6) y verde (#10b981). Tipografía limpia tipo Inter o Poppins.
- **Tono:** Profesional pero dinámico. Orientado a demostrar valor práctico, no solo código.
- **Idioma:** Español

## ESTRUCTURA REQUERIDA (una sección = una diapositiva a menos que indique)

### DIAPOSITIVA 1 — PORTADA
- Título: "AutoCiclo"
- Subtítulo: "Sistema de gestión multiplataforma para desguace de vehículos"
- Nombre: Yalil Musa Talhaoui
- Centro: IES P. Hermenegildo Lanz — DAM 2025/26
- [ESPACIO IMAGEN: Logo de AutoCiclo — captura circular del logo en fondo blanco]

### DIAPOSITIVA 2 — EL PROBLEMA QUE RESUELVE
- Problema: Los desguaces gestionan todo con papel, hojas Excel o llamadas telefónicas. No hay trazabilidad de piezas, stock desfasado, presupuestos sin seguimiento.
- Solución: AutoCiclo digitaliza todo el flujo, desde la entrada del vehículo hasta el cobro al cliente.
- Icono/gráfico visual de contraste "antes vs. después"

### DIAPOSITIVA 3 — ARQUITECTURA GENERAL
- Diagrama visual con 4 capas:
  - Capa cliente: Desktop (JavaFX) + Web Shop (React) + Mobile Worker (Expo)
  - Capa API: Spring Boot 3 REST + JWT
  - Capa mensajería: RabbitMQ
  - Capa datos/ERP: MySQL 8.0 + Odoo 17
- Flechas mostrando comunicación entre capas
- [ESPACIO IMAGEN: diagrama de arquitectura o screenshot del servidor]

### DIAPOSITIVA 4 — BASE DE DATOS (12 tablas)
- Título: "Base de datos — 12 tablas MySQL"
- Lista organizada por módulos:
  - Usuarios/Roles: ROLES, USUARIOS, CLIENTES
  - Inventario: VEHICULOS, PIEZAS, INVENTARIO_PIEZAS
  - Comercial: SOLICITUDES_PRESUPUESTO, DETALLE_SOLICITUD, NEGOCIACION_HISTORIAL
  - Operaciones: MOVIMIENTOS_STOCK, CODIGOS_QR, NOTIFICACIONES
- Pequeño dato de contexto: "Diseño normalizado en 3FN. Enum para estados y roles."

### DIAPOSITIVA 5 — API REST (Spring Boot 3)
- Título: "API REST — El corazón del sistema"
- Bullets clave:
  - Spring Boot 3 + Spring Security (JWT stateless)
  - 10 módulos: Auth, Piezas, Vehículos, Inventario, Stock, Solicitudes, Notificaciones, Pagos, Usuarios, QR
  - ~45 endpoints REST
  - 3 roles: ADMIN / EMPLEADO / CLIENTE
  - Interceptores de respuesta para manejo automático de sesión
- [ESPACIO IMAGEN: Captura de Postman o tabla de endpoints]

### DIAPOSITIVA 6 — DESKTOP (2 diapositivas)
**6a — Vista general Desktop:**
- JavaFX + Java 21 + Gradle
- Login con autenticación JWT
- Gestión completa: usuarios, vehículos, piezas, solicitudes
- Notificaciones en tiempo real via RabbitMQ
- [ESPACIO IMAGEN: pantalla principal Desktop con solicitudes]

**6b — Negociación en Desktop:**
- Admin recibe solicitud → puede aprobar, rechazar o hacer contraoferta
- Historial de rondas de negociación
- Al aprobar → llamada automática a Odoo (pedido de venta creado)
- [ESPACIO IMAGEN: pantalla de detalle solicitud/negociación Desktop]

### DIAPOSITIVA 7 — WEB SHOP (2 diapositivas)
**7a — Tienda para clientes:**
- React + TypeScript + Tailwind CSS + Vite
- Catálogo de piezas con búsqueda y filtros
- Registro/Login para clientes
- Formulario de solicitud de presupuesto con precio ofertado
- [ESPACIO IMAGEN: página de catálogo o detalle pieza Web]

**7b — Pago y negociación web:**
- Seguimiento de solicitudes en "Mis Solicitudes"
- Chat de negociación: cliente contraoferta ↔ admin responde
- Pago online con Stripe (entorno de pruebas integrado)
- [ESPACIO IMAGEN: pantalla Mis Solicitudes o proceso de pago]

### DIAPOSITIVA 8 — MOBILE WORKER (2 diapositivas)
**8a — App para empleados:**
- React Native + Expo
- Login seguro con JWT (SecureStore cifrado)
- Dashboard con alertas de stock bajo en tiempo real
- Búsqueda de piezas y vehículos
- [ESPACIO IMAGEN: pantalla login o dashboard móvil]

**8b — QR y gestión de stock:**
- Escaneo de códigos QR con cámara → acceso directo a pieza/vehículo
- Detalle de pieza con imagen, stock actual, historial
- Registro de entradas/salidas de stock desde el almacén
- Impresión de etiquetas QR en PDF
- [ESPACIO IMAGEN: pantalla escaneo QR o detalle pieza móvil]

### DIAPOSITIVA 9 — FLUJO END-TO-END
- Diagrama o story board visual del flujo completo:
  1. Cliente solicita presupuesto (web) → 2. Admin negocia (Desktop) → 3. Aprobado → Odoo genera pedido → 4. Cliente paga (Stripe) → 5. Empleado actualiza stock (móvil)
- Destacar la integración real entre componentes
- [ESPACIO IMAGEN: collage de pantallas de las 3 apps]

### DIAPOSITIVA 10 — TECNOLOGÍAS (resumen visual)
- Grid visual con logos/iconos de las tecnologías:
  - Backend: Spring Boot 3, Java 21, JWT, MySQL 8, RabbitMQ, Odoo 17
  - Frontend Desktop: JavaFX, FXML
  - Frontend Web: React, TypeScript, Tailwind, Vite, Stripe
  - Frontend Móvil: React Native, Expo, SecureStore
  - Infraestructura: Ubuntu Server, Nginx, Contabo VPS

### DIAPOSITIVA 11 — RETOS Y APRENDIZAJES
- Retos enfrentados:
  - Sincronización entre 4 plataformas con autenticación unificada
  - Serialización circular en Hibernate/Jackson con relaciones bidireccionales
  - Integración Odoo via JSON-RPC
  - Diseño de flujo de negociación (rondas, estados, turnos)
- Aprendizajes clave:
  - Arquitectura REST stateless con JWT
  - Mensajería asíncrona con RabbitMQ
  - Desarrollo multiplataforma real (3 tecnologías de frontend)

### DIAPOSITIVA 12 — DEMO EN VIVO (placeholder)
- "A continuación — demostración en vivo"
- Guía de la demo:
  1. Login en Web Shop → solicitar presupuesto
  2. Recibir notificación en Desktop → negociar → aprobar
  3. Confirmar pedido en Odoo
  4. Login en Worker móvil → escanear QR → registrar movimiento de stock
- [ESPACIO IMAGEN: QR de acceso a la web demo]

### DIAPOSITIVA 13 — CONCLUSIONES
- Objetivos conseguidos: ecosistema real y funcional, 4 plataformas integradas, desplegado en servidor real
- Líneas futuras: notificaciones push, app offline con sync, módulo de informes con gráficos
- Agradecimientos breves

---

## INSTRUCCIONES PARA EL DISEÑO

1. Usa un esquema de colores oscuro: fondo principal #0f172a (azul marino muy oscuro), tarjetas/secciones en #1e293b, acentos en #3b82f6 (azul) y #10b981 (verde esmeralda).

2. En cada diapositiva que tenga [ESPACIO IMAGEN], deja un recuadro claramente marcado con borde discontinuo o punteado y la etiqueta "📸 [descripción de la captura]" centrada en ese espacio. El recuadro debe tener proporción 16:9 o 4:3 según el contenido.

3. Iconos: usa emojis o iconos simples para los puntos de lista. No sobrecargues con elementos decorativos.

4. Progresión visual: en la diapositiva de arquitectura (diap 3) y el flujo end-to-end (diap 9), crea diagramas con flechas y cajas de colores diferenciados por capa.

5. Para la diapositiva de tecnologías (diap 10), crea un grid de tarjetas con el nombre de la tecnología, su categoría y una frase de una línea de por qué se usó.

6. Tiempo estimado por sección:
   - Portada + problema: 1.5 min
   - Arquitectura + BD + API: 3 min
   - Desktop + Web: 3 min
   - Móvil + Flujo: 2.5 min
   - Tecnologías + Retos: 2 min
   - Demo + Conclusiones: 3 min
   TOTAL: ~15 minutos

7. Genera la presentación como HTML con CSS embebido para que pueda abrirse en cualquier navegador (sin dependencias externas). Alternativamente puedes generarla en formato Markdown con estructura clara que luego yo adapte a PowerPoint/Google Slides.

8. Haz que sea VISUALMENTE IMPACTANTE. Que quien la vea diga "esto es de nivel profesional". Usa gradientes, sombras sutiles, líneas divisoras con color de acento.

Por favor genera ahora la presentación completa con todas las diapositivas, los espacios para imágenes marcados, y el tiempo estimado al pie de cada sección.
```

---

*Nota: Si usas Claude con artifacts (claude.ai), puede generar el HTML directamente y verlo en pantalla. Si lo usas en Claude Code, generará el archivo HTML o MD.*
