# STATUS — AutoCiclo TFG
**Última actualización:** 29/04/2026 (v2 — post intervención servidor)  
**Autor:** Yalil Musa Talhaoui

---

## 1. Estado del Servidor (informe 29/04/2026)

| Servicio | Estado | Detalle |
|---|---|---|
| MySQL 8.0 | ✅ ACTIVO | Puerto 3306 (solo local), corriendo desde Apr 9 |
| Spring Boot API | ✅ ACTIVO | Puerto 8080, PID 3181244, desde Apr 24, ~570 MB RAM |
| RabbitMQ 3.13.7 | ✅ ACTIVO | Docker `autociclo_rabbitmq`, puertos 5672 / 15672 |
| Odoo 17 CE | ✅ ACTIVO | Puerto 8069, 5 procesos Python desde Apr 23 |
| Nginx | ✅ ACTIVO | Puerto 8090 → AutoCiclo Shop, desde Apr 28 |
| Web Shop (dist) | ✅ DESPLEGADO | `/var/www/autociclo-shop/index.html` — HTTP 200 |

> Puerto 80/443 son de otro proyecto en producción (`tallerHachmi`) — no tocar.

---

## 2. Progreso de Entregas

### Entrega 1 — API base + Auth JWT ✅
- [x] `autociclo_db_v2.sql` — 11 tablas + datos de prueba
- [x] Spring Boot inicializado en `API/autociclo-api/`
- [x] JPA + HikariCP conectado a MySQL
- [x] `POST /api/auth/login` y `POST /api/auth/register` con JWT
- [x] 6 usuarios de prueba (2 admin, 2 empleado, 2 cliente)
- [x] Migración ejecutada en servidor
- [x] `autociclo_db_v2.sql` actualizado con stock real en PIEZAS *(fix 29/04)*
- [x] **Login arreglado en servidor** — hash BCrypt regenerado, 6 usuarios actualizados *(29/04)*

### Entrega 2 — API completa + RabbitMQ ✅
- [x] CRUD completo: Vehículos, Piezas, Inventario, Usuarios, Solicitudes
- [x] Seguridad por roles en todos los endpoints (401/403)
- [x] RabbitMQ instalado y corriendo (Docker)
- [x] Colas `solicitudes.nueva` y `stock.alerta` creadas y activas
- [x] `RabbitMQPublisher` publica al crear solicitud y al bajar stock
- [x] `RabbitMQConsumer` consume y registra en consola

### Entrega 3 — Desktop completo ✅
- [x] `ApiClient.java` con JWT en Desktop
- [x] `LoginController.java` — pantalla de login
- [x] `UsuariosController.java` — CRUD de usuarios
- [x] `SolicitudesController.java` — ver + aprobar + rechazar
- [x] Badge de notificaciones RabbitMQ en `ListadoMaestroController`
- [x] `OdooClient.java` — crea pedido de venta en Odoo al aprobar
- [x] `SolicitudService` llama a Odoo JSON-RPC y notifica al cliente
- [x] Desktop migrado a API REST (sin `ConexionBD` directa)
- [x] Odoo 17 CE corriendo en servidor (HTTP 200 en :8069)

### Entrega 4 — Web Shop completo ✅ *(fixes aplicados 29/04)*
- [x] React + Vite + TypeScript + Tailwind inicializado
- [x] React Router v6 + Axios + Zustand (auth store)
- [x] Página Home con buscador
- [x] Catálogo con filtros (categoría, precio, búsqueda)
- [x] Ficha de Pieza (`/pieza/:id`)
- [x] Login y Registro de clientes
- [x] Formulario Solicitud de Presupuesto
- [x] Mis Solicitudes — estado + precio aprobado + enlace Odoo
- [x] Panel admin: Dashboard, Piezas, Solicitudes, Usuarios, Vehículos
- [x] `nginx.conf` configurado, dist desplegado en `/var/www/autociclo-shop`
- [x] **FIX código:** campo `referencia_odoo` añadido al modelo Java + SQL *(29/04)*
- [x] **FIX código:** `SolicitudService` guarda referencia Odoo en la solicitud *(29/04)*
- [x] **FIX código:** `odoo_pedido` añadido al ENUM de NOTIFICACIONES *(29/04)*
- [x] **FIX código:** estado minúsculas corregido en MisSolicitudes y AdminSolicitudes *(29/04)*
- [x] **FIX BD:** `ALTER TABLE referencia_odoo` ejecutado en servidor *(29/04)*
- [x] **FIX BD:** stock de las 12 piezas actualizado en servidor *(29/04)*
- [x] **Redeploy completado** — JAR y dist subidos por SCP, API en PID 692352, 468 MB RAM *(29/04)*

### Entrega 5 — App Móvil Worker ❌ NO INICIADA
- [ ] Inicializar `App_Movil/autociclo-worker/` (React Native + Expo)
- [ ] Pantalla Login con JWT en AsyncStorage
- [ ] Dashboard con alertas de stock bajo
- [ ] Escáner QR con Expo Camera
- [ ] Buscar pieza por QR o nombre
- [ ] Detalle de Pieza (stock, ubicación, estado)
- [ ] Actualizar stock (+/−) con confirmación
- [ ] Listado de vehículos en patio
- [ ] Probar en dispositivo Android

### Entrega 6 — Demo Final ❌ NO INICIADA
- [ ] Tests end-to-end del flujo completo
- [ ] Datos de demo completos y coherentes
- [ ] Generar QR reales para las piezas de demo
- [ ] Pulir UI de las 3 plataformas
- [ ] Colección Postman documentada
- [ ] Documentación técnica
- [ ] APK de Autociclo Worker

---

## 3. Acciones en el Servidor

### ✅ Acción 1 — LOGIN — RESUELTA (29/04)
Hash BCrypt regenerado con Python en el servidor. 6 usuarios actualizados.
Hash aplicado: `$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW`
Login verificado: JWT devuelto correctamente para `admin@autociclo.es`.

> **Actualizar el SQL del repo** con este hash para que próximas instalaciones funcionen:
> reemplaza todos los `$2y$12$dID1XlvbZRlMayXZuJrrsuaH87YB8fojymyYGVfsHqtLBGV8dYGaK`
> por `$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW`

---

### ✅ Acción 3 — ALTER TABLE referencia_odoo — RESUELTA (29/04)
Columna creada correctamente. Verificado en INFORMATION_SCHEMA.

---

### ✅ Acción 4 — Stock piezas — RESUELTA (29/04)
12 piezas actualizadas. Verificado via API: stocks [2, 1, 3, ...].

---

### ⚠️ Acción 2 — REDEPLOY API + WEB (pendiente desde PC local)

El servidor NO tiene el código fuente, solo el JAR compilado y el dist.
Hay que compilar en local (tu PC) y subir los artefactos por SCP.

```bash
# ── Desde tu PC, en la raíz del proyecto ──────────────────────────────

# 1. Compilar API (genera el JAR)
cd API/autociclo-api
./gradlew bootJar
# El JAR quedará en: build/libs/autociclo-api-*.jar

# 2. Subir JAR al servidor y reiniciar
scp build/libs/autociclo-api-*.jar root@109.123.247.31:/opt/autociclo/autociclo-api.jar
ssh root@109.123.247.31 "systemctl restart autociclo-api && sleep 10 && \
  curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/api/piezas"
# Debe devolver 200

# 3. Compilar web shop
cd ../../Web/autociclo-shop
npm run build
# El dist quedará en: dist/

# 4. Subir dist al servidor
scp -r dist/* root@109.123.247.31:/var/www/autociclo-shop/
ssh root@109.123.247.31 "curl -s -o /dev/null -w '%{http_code}' http://localhost:8090"
# Debe devolver 200
```

---

### Acción 3 — ALTER TABLE (referencia_odoo)

El ENUM de NOTIFICACIONES ya está correcto. Solo falta la columna `referencia_odoo`:

```sql
ALTER TABLE SOLICITUDES_PRESUPUESTO
  ADD COLUMN referencia_odoo VARCHAR(50) DEFAULT NULL;
```

---

### Acción 4 — Stock = 0 en todas las piezas

El catálogo muestra las 12 piezas (no filtra por stock), pero el precio/stock visible para el cliente es 0.

```sql
UPDATE PIEZAS SET stock_disponible = 2  WHERE id_pieza = 1;   -- Motor 1.6 TDI
UPDATE PIEZAS SET stock_disponible = 1  WHERE id_pieza = 2;   -- Motor 2.0 HDI
UPDATE PIEZAS SET stock_disponible = 3  WHERE id_pieza = 3;   -- Puerta delantera
UPDATE PIEZAS SET stock_disponible = 4  WHERE id_pieza = 4;   -- Capó delantero
UPDATE PIEZAS SET stock_disponible = 1  WHERE id_pieza = 5;   -- Parachoques
UPDATE PIEZAS SET stock_disponible = 1  WHERE id_pieza = 6;   -- Volante
UPDATE PIEZAS SET stock_disponible = 2  WHERE id_pieza = 7;   -- Asientos
UPDATE PIEZAS SET stock_disponible = 2  WHERE id_pieza = 8;   -- Faro LED
UPDATE PIEZAS SET stock_disponible = 5  WHERE id_pieza = 9;   -- Alternador
UPDATE PIEZAS SET stock_disponible = 2  WHERE id_pieza = 10;  -- Disco freno
UPDATE PIEZAS SET stock_disponible = 12 WHERE id_pieza = 11;  -- Neumático
UPDATE PIEZAS SET stock_disponible = 1  WHERE id_pieza = 12;  -- Turbocompresor
```

> El `autociclo_db_v2.sql` ya fue actualizado con estos valores. Solo hace falta ejecutar estos UPDATEs en el servidor.

---

### Acción 5 — Seguridad RabbitMQ

Los puertos 5672 y 15672 están expuestos a internet con credenciales `guest/guest`.

```bash
# Bloquear con iptables (solo acceso local y desde la API):
sudo iptables -A INPUT -p tcp --dport 5672  -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5672  -j DROP
sudo iptables -A INPUT -p tcp --dport 15672 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 15672 -j DROP

# O cambiar las credenciales del usuario guest:
docker exec autociclo_rabbitmq rabbitmqctl change_password guest NUEVA_CONTRASEÑA_SEGURA
# Y actualizar application.properties con la nueva contraseña
```

---

## 4. Bugs conocidos (resueltos en código, pendientes de redeploy)

| Bug | Archivo | Commit | Estado |
|---|---|---|---|
| Estado solicitudes siempre "Pendiente" | `MisSolicitudes.tsx`, `AdminSolicitudes.tsx` | `8a03d50` | ✅ Código arreglado, pendiente redeploy |
| "Ver en Odoo" nunca aparece | `SolicitudPresupuesto.java`, `SolicitudService.java` | `8a03d50` | ✅ Código arreglado, pendiente ALTER TABLE + redeploy |
| `odoo_pedido` causa error en BD | `autociclo_db_v2.sql` (NOTIFICACIONES ENUM) | `8a03d50` | ✅ ENUM ya correcto en servidor |
| Stock = 0 en catálogo | `autociclo_db_v2.sql` (datos PIEZAS) | `8a03d50` | ✅ SQL actualizado, pendiente UPDATE en servidor |
| Carpeta prototipo en repositorio | `scrap-pro-*/` | `248dbed` | ✅ Eliminada |

---

## 5. Resumen de Acciones por Prioridad

| # | Prioridad | Acción | Tipo | Estado |
|---|---|---|---|---|
| 1 | 🔴 CRÍTICO | Arreglar login — hash BCrypt | BD servidor | ✅ Hecho 29/04 |
| 2 | 🔴 CRÍTICO | Redeploy API + Web (desde PC local) | Local → servidor | ✅ Hecho 29/04 |
| 3 | 🟠 ALTO | `ALTER TABLE referencia_odoo` | BD servidor | ✅ Hecho 29/04 |
| 4 | 🟠 ALTO | UPDATE stock de piezas | BD servidor | ✅ Hecho 29/04 |
| 5 | 🟡 MEDIO | Cerrar puertos RabbitMQ al exterior | Servidor | ⚠️ Pendiente |
| 6 | 🔵 SIGUIENTE | Iniciar Entrega 5 — App Móvil Worker | Desarrollo | ❌ No iniciado |

---

## 6. Infraestructura del Servidor

```
Puerto 8080  →  Spring Boot API (JAR en /opt/autociclo/)
Puerto 8090  →  Nginx → /var/www/autociclo-shop (React dist)
Puerto 8069  →  Odoo 17 CE (PostgreSQL backend)
Puerto 5672  →  RabbitMQ AMQP (Docker)  ⚠️ expuesto
Puerto 15672 →  RabbitMQ Management UI  ⚠️ expuesto
Puerto 3306  →  MySQL 8.0 (solo localhost)
Puerto 80/443 → tallerHachmi (otro proyecto — NO TOCAR)
```

**Usuarios de prueba** (password: `Autociclo2026!` — pendiente de arreglar):
| Email | Rol |
|---|---|
| admin@autociclo.es | ADMIN |
| admin@autociclo.com | ADMIN |
| pedro@autociclo.es | EMPLEADO |
| operario@autociclo.com | EMPLEADO |
| maria.garcia@email.com | CLIENTE |
| cliente@autociclo.com | CLIENTE |
