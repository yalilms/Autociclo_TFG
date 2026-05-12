# AutoCiclo — Guión de Demo (Video Avance 6)

**Duración estimada:** 8-10 minutos  
**Fecha:** 18 Mayo 2026  
**Narrador:** Yalil Musa Talhaoui

---

## Preparación previa

Antes de empezar el vídeo tener abierto:
- [ ] **Chrome** → `http://109.123.247.31:8090` (Web Shop)
- [ ] **Desktop** → AutoCiclo Desktop arrancado, sin sesión
- [ ] **Móvil** → App Worker instalada con Expo Go o APK
- [ ] **Terminal** → conectada al servidor para ver logs de RabbitMQ si hace falta
- [ ] Etiqueta QR impresa de `QR-PIE-00001` (Motor 1.6 TDI)
- [ ] Base de datos con el SQL demo cargado

---

## Parte 1 — Arquitectura (1 min)

> *"AutoCiclo es un ecosistema multiplataforma para la gestión de un desguace de vehículos. Está formado por cuatro componentes: una API REST en Spring Boot, una app Desktop en JavaFX, un Web Shop en React y una app móvil para empleados en React Native con Expo."*

**Mostrar:** Diagrama de arquitectura del documento de documentación.

> *"Todo se despliega en un servidor Ubuntu en Contabo. RabbitMQ corre en Docker para la mensajería asíncrona, Odoo 17 gestiona la facturación y Nginx sirve el frontend web."*

---

## Parte 2 — Web Shop: cliente solicita una pieza (2 min)

**1.** Abrir `http://109.123.247.31:8090`

> *"Esta es la tienda online del desguace. Los clientes pueden buscar piezas por nombre, modelo de coche o categoría sin necesidad de registrarse."*

**2.** Buscar "motor" en el buscador de la Home.

**3.** Clicar en "Motor 1.6 TDI".

> *"Vemos la ficha completa: precio, stock disponible, marcas compatibles y descripción. Con 2 unidades en stock."*

**4.** Clicar "Solicitar presupuesto" → iniciar sesión con `maria.garcia@email.com` / `Autociclo2026!`

**5.** Rellenar el formulario de solicitud, añadir el motor y enviar.

> *"La solicitud se crea en estado 'pendiente' y automáticamente RabbitMQ publica un mensaje en la cola `solicitudes.nueva` para que el administrador sea notificado."*

**6.** Ir a "Mis solicitudes" → ver la solicitud recién creada en estado pendiente.

---

## Parte 3 — Desktop: admin recibe notificación y aprueba (2 min)

**1.** Abrir la app Desktop → login con `admin@autociclo.es` / `Autociclo2026!`

> *"El Desktop es la plataforma de los administradores. Al entrar vemos el badge de notificaciones con la alerta de la solicitud recién recibida vía RabbitMQ."*

**2.** Clicar en el badge → ir al módulo Solicitudes.

**3.** Ver la solicitud pendiente → revisar las piezas y el cliente.

**4.** Clicar "Aprobar" → introducir precio total (2700€) y respuesta al cliente.

> *"Al aprobar, Spring Boot llama a la API de Odoo por JSON-RPC: crea el cliente si no existe, genera el pedido de venta y devuelve la referencia SO/2026/XXXX. Todo automático."*

**5.** Ver que la solicitud pasa a estado "aprobada" con la referencia Odoo visible.

---

## Parte 4 — Web Shop: cliente ve la aprobación (30 seg)

**1.** Volver al Chrome con la sesión de María García.

**2.** Ir a "Mis solicitudes" → refrescar.

> *"La solicitud ahora aparece como 'aprobada' con el precio acordado y el enlace al pedido en Odoo donde se puede ver y descargar la factura."*

---

## Parte 5 — App Worker: empleado gestiona stock (2 min)

**1.** Abrir la app Worker en el móvil → login con `pedro@autociclo.es` / `Autociclo2026!`

> *"Esta es la app para los empleados del almacén. Al entrar vemos el dashboard con las alertas de stock: piezas en rojo (sin stock) y amarillo (por debajo del mínimo)."*

**2.** Mostrar las tarjetas de alerta con contadores (sin stock, stock bajo, alertas totales).

**3.** Clicar en una pieza con alerta → ver el detalle completo.

> *"Vemos el stock actual, el mínimo, la ubicación exacta en el almacén y el vehículo del que se extrajo la pieza."*

**4.** Tocar "Actualizar Stock" → seleccionar Entrada → poner 2 unidades → confirmar.

> *"El movimiento se registra en el servidor y el stock se actualiza inmediatamente."*

**5.** Volver al Dashboard → mostrar que la alerta ha desaparecido o cambiado de color.

---

## Parte 6 — Escáner QR (1 min)

**1.** Ir a la pestaña "Escanear QR" en la app Worker.

**2.** Mostrar la cámara con el marco azul.

**3.** Escanear la etiqueta impresa de `QR-PIE-00001`.

> *"El empleado puede identificar cualquier pieza o vehículo instantáneamente escaneando su código QR. La app consulta la API y navega al detalle automáticamente."*

**4.** La app navega al detalle del Motor 1.6 TDI.

---

## Parte 7 — Seguridad JWT (30 seg)

**1.** Abrir Postman → ejecutar "Sin token → 401".

> *"Todos los endpoints protegidos devuelven 401 si no se incluye el token JWT."*

**2.** Ejecutar "Token de cliente en endpoint ADMIN → 403".

> *"Y 403 si el rol no tiene permisos suficientes. La seguridad está implementada con Spring Security y anotaciones @PreAuthorize."*

---

## Cierre (30 seg)

> *"AutoCiclo demuestra la integración de cuatro plataformas: API REST con Spring Boot y JWT, mensajería asíncrona con RabbitMQ en Docker, facturación con Odoo, interfaz web en React, app de escritorio en JavaFX y app móvil en React Native con Expo. Todo el código está en el repositorio Git y la documentación técnica completa en la carpeta docs/. Gracias."*

---

## Checklist final antes de entregar

- [ ] Ejecutar `BaseDatos/autociclo_db_v2.sql` en el servidor (8 veh · 15 piezas · 9 usuarios · 4 solicitudes)
- [ ] Verificar `GET http://109.123.247.31:8080/api/piezas` → responde 200 con 15 piezas
- [ ] Verificar `http://109.123.247.31:8090` → carga el Web Shop
- [ ] Verificar login con los 3 roles en sus respectivas apps (usuario/contraseña: `Autociclo2026!`)
- [ ] Generar e imprimir etiquetas QR desde `scripts/qr_demo.html` (15 piezas + 8 vehículos)
- [ ] Importar `docs/POSTMAN_COLLECTION.json` en Postman y probar todos los endpoints
- [ ] Verificar que la solicitud #2 ya aparece aprobada con referencia Odoo SO/2026/0042
- [ ] Subir repositorio a GitHub/GitLab (excluir `node_modules/`, `build/`, `dist/`, `.gradle/`)
- [ ] Entregar enlace del repositorio + `docs/DOCUMENTACION_PROYECTO.md` al profesor
