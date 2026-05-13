# AutoCiclo — Guía de Pruebas

> **URLs:** Web `http://109.123.247.31:8090` · Odoo `http://109.123.247.31:8069` · RabbitMQ mgmt `http://109.123.247.31:15672`  
> **Credenciales admin:** `admin@autociclo.es` / `Autociclo2026!`  
> **Credenciales cliente:** `maria.garcia@email.com` / `Autociclo2026!`  
> **Worker:** cualquier usuario con rol EMPLEADO

---

## Fase 0 — Servidor (2 min) · Empezar siempre aquí

Lo primero antes de probar nada. Si algo falla aquí, el resto no tiene sentido.

```bash
ssh root@109.123.247.31
systemctl is-active autociclo-api mysql odoo17 nginx
docker ps | grep autociclo_rabbitmq
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:8090
```

Todo debe devolver `active` / `Up` / `200`. Si la API devuelve `inactive`, hacer `systemctl restart autociclo-api` y esperar 25 segundos.

---

## Fase 1 — API directa (5 min) · La base de todo

Probar la API sola, sin ninguna app. Si algo falla aquí, fallará en todas partes.

```bash
# 1. Login y guardar token
TOKEN=$(curl -s -X POST http://109.123.247.31:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autociclo.es","password":"Autociclo2026!"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Verificar que el token funciona
curl -s http://109.123.247.31:8090/api/solicitudes \
  -H "Authorization: Bearer $TOKEN" | head -c 300

# 3. Verificar endpoint nuevo de historial (debe devolver array)
curl -s http://109.123.247.31:8090/api/solicitudes/4/historial \
  -H "Authorization: Bearer $TOKEN"
```

Resultado esperado paso 2: array JSON con solicitudes. Paso 3: array con 2 rondas de negociación de demo.

---

## Fase 2 — Desktop (20 min) · El más completo, probar segundo

### 2.1 Arranque
Ejecutar `./gradlew run` en `Escritorio/AutoCiclo/`. Splash → login.

### 2.2 Login — probar esto primero
| Prueba | Qué introducir | Resultado esperado |
|--------|---------------|-------------------|
| Credenciales incorrectas | user: `x` pass: `x` | Alerta de error dark, no crash |
| Login correcto | `admin@autociclo.es` / `Autociclo2026!` | Menú principal carga |

### 2.3 Piezas y Vehículos — CRUD rápido
Crea un vehículo nuevo → guarda → aparece en la lista. Crea una pieza → asígnala al vehículo. Estos datos los usarás en el flujo de integración después.

| # | Qué hacer | Resultado esperado |
|---|-----------|-------------------|
| 1 | Crear vehículo "Ford Focus 2016 blanco" | Aparece en listado, paginación funcional (8 por página) |
| 2 | Crear pieza "Alternador 90A" categoría electrónica, precio 95€, stock 3 | Aparece en listado |
| 3 | Asignar esa pieza al vehículo | Aparece en Inventario |
| 4 | Intentar guardar formulario vacío | Validación muestra errores, no crash |

### 2.4 Usuarios — CRUD
| # | Qué hacer | Resultado esperado |
|---|-----------|-------------------|
| 5 | Crear usuario rol EMPLEADO | Aparece en lista con rol correcto |
| 6 | Editar → el email es Label de solo lectura (no editable) | Correcto |
| 7 | Togglear activo/inactivo | Diálogo de confirmación dark aparece |

### 2.5 Solicitudes — lo más importante del Desktop
**Este es el punto central de la demo. Probar en este orden:**

| # | Qué hacer | Resultado esperado |
|---|-----------|-------------------|
| 8 | Abrir "Solicitudes" | Lista carga con columnas: ID, Cliente, Estado, Fecha, **Oferta cliente**, **Contraoferta**, Ref. Odoo, Mensaje |
| 9 | Seleccionar solicitud #4 (En negociación) | Columna "Oferta cliente" muestra 750,00 € · "Contraoferta" muestra 880,00 € |
| 10 | Botón **"🔵 Contraofertar"** con solicitud #4 | Diálogo aparece mostrando la oferta actual del cliente (750€), campo precio, campo mensaje |
| 11 | Enviar contraoferta de 850€ con mensaje | Solicitud queda en_negociacion, turno pasa a cliente |
| 12 | Seleccionar solicitud #1 (Pendiente) y **Aprobar** | Diálogo muestra oferta del cliente, campo precio final, integra con Odoo |
| 13 | Seleccionar solicitud #3 (Rechazada) e intentar Rechazar | Aviso "ya está rechazada", no deja |

### 2.6 Estadísticas
Abrir → gráficas cargan sin errores en consola.

---

## Fase 3 — Web Shop (15 min) · Lo que ve el cliente

### 3.1 Zona pública — sin login
| # | Qué hacer | Resultado esperado |
|---|-----------|-------------------|
| 1 | Abrir `http://109.123.247.31:8090` | Home carga, sin errores en consola del navegador |
| 2 | Ir a Catálogo | Piezas visibles con imágenes/placeholders |
| 3 | Filtrar por categoría "motor" | Solo muestra motores |
| 4 | Abrir ficha de una pieza | Stock, precio, descripción, botón solicitar |
| 5 | Intentar solicitar sin login | Redirige al login |

### 3.2 Registro y login
| # | Qué hacer | Resultado esperado |
|---|-----------|-------------------|
| 6 | Registrar cliente nuevo con email único | Redirige correctamente |
| 7 | Login con `maria.garcia@email.com` / `Autociclo2026!` | Sesión activa, navbar cambia |
| 8 | Login incorrecto | Mensaje de error, no crash |
| 9 | Recargar página | Sesión persiste (Zustand) |

### 3.3 Solicitar presupuesto — flujo nuevo de negociación
**Esta es la parte nueva más importante de la Web.**

| # | Qué hacer | Resultado esperado |
|---|-----------|-------------------|
| 10 | Ir a "Solicitar presupuesto" | Formulario en 3 columnas |
| 11 | Añadir 2 piezas al pedido | Aparecen en la lista con subtotal |
| 12 | Intentar enviar **sin rellenar "Tu oferta €"** | Error de validación: "Introduce tu precio ofertado" |
| 13 | Rellenar oferta de 200€ y enviar | Pantalla de éxito con animación |
| 14 | Ir a "Mis Solicitudes" | Nueva solicitud en estado 🟡 Pendiente, sin historial aún |

### 3.4 Mis Solicitudes — respuesta a contraoferta
*(Para este paso el admin ya debe haber enviado una contraoferta desde Desktop — ver Fase 5)*

| # | Qué hacer | Resultado esperado |
|---|-----------|-------------------|
| 15 | Ver solicitud en_negociacion con turno=cliente | Panel morado con precio propuesto por AutoCiclo + 3 botones |
| 16 | Historial de rondas visible | Burbujas de chat: cliente (azul, derecha) / admin (morado, izquierda) |
| 17 | Botón **"Aceptar X€"** | Solicitud pasa a Aprobada, se crea pedido en Odoo |
| 18 | En otra solicitud: **"Proponer otro precio"** | Input de precio aparece con animación |
| 19 | Enviar nueva oferta de 220€ | Solicitud queda en_negociacion, turno pasa a admin |
| 20 | Ver solicitud en_negociacion con turno=admin | Mensaje "El equipo de AutoCiclo está revisando tu oferta de 220€" |

### 3.5 Panel Admin Web
| # | Qué hacer | Resultado esperado |
|---|-----------|-------------------|
| 21 | Login como admin y abrir `/admin` | Dashboard con stats |
| 22 | Admin > Solicitudes | Estado "En negociación" en morado, no "En revisión" |
| 23 | Usuario sin admin intenta `/admin` | Redirige, no muestra contenido |

---

## Fase 4 — Worker Mobile (10 min)

> `cd Autociclo_Worker && npx expo start` → Expo Go en el móvil

### 4.1 Login
| # | Prueba | Resultado esperado |
|---|--------|-------------------|
| 1 | Credenciales incorrectas | Error visible, no crash |
| 2 | Login correcto con empleado | Dashboard carga |
| 3 | Cerrar app y reabrir | Sesión persiste (expo-secure-store) |

### 4.2 Dashboard
| # | Prueba | Resultado esperado |
|---|--------|-------------------|
| 4 | Ver alertas de stock bajo | Lista de piezas con stock < mínimo |
| 5 | Esperar 30 segundos | Polling refresca automáticamente |

### 4.3 Escanear QR
| # | Prueba | Resultado esperado |
|---|--------|-------------------|
| 6 | Tab "Escanear" | Solicita permiso cámara |
| 7 | Escanear `QR-PIE-00001` (Motor TDI) | Abre ficha del motor con stock, precio, ubicación |
| 8 | Botón **"+"** añadir stock | Stock sube 1, movimiento guardado en API |
| 9 | Botón **"−"** quitar stock hasta mínimo | Si baja del mínimo → alerta RabbitMQ → aparece en Dashboard |

### 4.4 Buscar y Vehículos
| # | Prueba | Resultado esperado |
|---|--------|-------------------|
| 10 | Buscar "motor" | Resultados en <400ms (debounce) |
| 11 | Filtrar vehículos por estado "desguazando" | Solo muestra los correctos |

---

## Fase 5 — Integración total (20 min) · Lo más importante para la defensa

Aquí demuestras que las 3 plataformas funcionan juntas. Tener Desktop, móvil y web abiertos simultáneamente.

---

### FLUJO A — Negociación completa de punta a punta ⭐ (el más innovador)

```
Web (cliente hace oferta) → Desktop (admin contraoferta) → Web (cliente acepta) → Odoo (pedido)
```

| Paso | Quién | Acción |
|------|-------|--------|
| A1 | **Web** · logueado como cliente | Solicitar presupuesto: añadir "Alternador 90A" × 1, **oferta: 70€**, enviar |
| A2 | **Desktop** · refresca Solicitudes | Nueva solicitud aparece, columna "Oferta cliente" = 70,00 € |
| A3 | **Desktop** | Seleccionar solicitud → **Contraofertar** → precio 85€, mensaje "El alternador está revisado y certificado" |
| A4 | **Web** · recargar Mis Solicitudes | Estado morado "En negociación", historial muestra 2 rondas, panel "AutoCiclo propone 85€" con 3 botones |
| A5 | **Web** | Clic **"Aceptar 85,00€"** |
| A6 | Automático | API: estado → aprobada, precioTotal = 85, llama Odoo JSON-RPC |
| A7 | **Web** | Solicitud aparece en verde "Aprobada" con precio 85€ y link "Ver en Odoo" |
| A8 | **Odoo** `http://109.123.247.31:8069` | Pedido de venta visible con las líneas de la solicitud |

---

### FLUJO B — Stock bajo y alerta al Worker

```
Worker (reduce stock) → RabbitMQ → Worker Dashboard (alerta)
```

| Paso | Quién | Acción |
|------|-------|--------|
| B1 | **Worker** | Escanear QR del Volante multifunción (INT-340, stock mínimo = 5, stock actual = 1) |
| B2 | **Worker** | Pulsar **"−"** para reducir stock | Stock baja a 0 |
| B3 | Automático | API publica en cola `stock.alerta` de RabbitMQ |
| B4 | **Worker · Dashboard** | En el próximo polling (≤30s) aparece alerta "Stock bajo: Volante multifunción" |
| B5 | **Desktop · Inventario** | Refresca → stock actualizado coincide |

---

### FLUJO C — Pieza creada visible en toda la plataforma

```
Desktop (crea pieza) → Web (visible en catálogo) → Worker (buscable y escaneable)
```

| Paso | Quién | Acción |
|------|-------|--------|
| C1 | **Desktop** | Crear pieza nueva: "Bomba de agua Toyota", categoría motor, precio 45€, stock 2 |
| C2 | **Web** | Recargar catálogo → pieza aparece, filtrable por "motor" |
| C3 | **Web** | Ficha de la pieza → botón "Solicitar presupuesto" funciona |
| C4 | **Worker** | Buscar "bomba" → aparece en resultados |

---

### FLUJO D — Múltiples rondas de negociación (para impresionar en la defensa)

```
Web → Desktop → Web → Desktop → Web acepta
```

| Paso | Quién | Acción |
|------|-------|--------|
| D1 | **Web** | Solicitar Turbocompresor Honda CBR, **oferta: 650€** |
| D2 | **Desktop** | Contraofertar: 780€ |
| D3 | **Web** | "Proponer otro precio": 720€ con mensaje "¿Puede hacer algo más?" |
| D4 | **Desktop** | Contraofertar: 750€ con mensaje "Precio final, garantía 6 meses" |
| D5 | **Web** | Historial muestra 4 rondas alternadas cliente/admin |
| D6 | **Web** | Aceptar 750€ → aprobada → Odoo |

---

## Checklist pre-defensa (5 min)

Hacer esto el día antes de la defensa:

- [ ] `systemctl is-active autociclo-api mysql odoo17 nginx` → todo active
- [ ] `docker ps | grep autociclo_rabbitmq` → Up
- [ ] Web carga en `http://109.123.247.31:8090`
- [ ] Login admin funciona en Web
- [ ] Login admin funciona en Desktop
- [ ] Solicitud de demo #4 en estado `en_negociacion` con historial visible
- [ ] Odoo tiene al menos un pedido de venta (`http://109.123.247.31:8069`)
- [ ] Worker conecta a la API (buscar cualquier pieza)
- [ ] Logs sin errores: `journalctl -u autociclo-api -n 30 --no-pager`
