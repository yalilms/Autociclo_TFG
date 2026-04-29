# STATUS — AutoCiclo TFG
**Última actualización:** 29/04/2026  
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
- [ ] **⚠️ LOGIN ROTO** — ver Acción 1 más abajo

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
- [x] **FIX:** campo `referencia_odoo` añadido al modelo Java + SQL *(fix 29/04)*
- [x] **FIX:** `SolicitudService` guarda referencia Odoo en la solicitud *(fix 29/04)*
- [x] **FIX:** `odoo_pedido` añadido al ENUM de NOTIFICACIONES *(fix 29/04)*
- [x] **FIX:** estado minúsculas corregido en MisSolicitudes y AdminSolicitudes *(fix 29/04)*
- [ ] **⚠️ REDEPLOY PENDIENTE** — ver Acción 2 más abajo

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

## 3. Acciones Urgentes en el Servidor

### Acción 1 — LOGIN ROTO (CRÍTICO)

El hash `$2y$12$...` del SQL no valida contra "Autociclo2026!" en Spring Security.

**Diagnóstico en el servidor:**
```bash
# Verificar con un hash generado en el momento
# Registra un usuario de prueba con contraseña conocida y copia su hash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"HashTest","email":"hashtest@test.com","password":"Test1234","telefono":"","direccion":"","nif":"00000000T"}'
# Luego obtén su hash de la BD:
mysql autociclo_db -e "SELECT password_hash FROM USUARIOS WHERE email='hashtest@test.com';"
```

**Solución — genera el hash correcto en el servidor:**
```bash
# Opción A (Python con bcrypt):
python3 -c "import bcrypt; print(bcrypt.hashpw(b'Autociclo2026!', bcrypt.gensalt(12)).decode())"

# Opción B (si no tiene bcrypt instalado):
pip3 install bcrypt && python3 -c "import bcrypt; print(bcrypt.hashpw(b'Autociclo2026!', bcrypt.gensalt(12)).decode())"
```

**Una vez tengas el hash, actualiza la BD:**
```sql
UPDATE USUARIOS
SET password_hash = '$2a$12$HASH_GENERADO_AQUI'
WHERE password_hash = '$2y$12$dID1XlvbZRlMayXZuJrrsuaH87YB8fojymyYGVfsHqtLBGV8dYGaK';
```

> Esto actualiza los 6 usuarios originales del SQL (los demás ya tienen hashes correctos).

**Actualizar también el SQL del repo** con el nuevo hash para que próximas instalaciones funcionen.

---

### Acción 2 — REDEPLOY API + WEB (con los fixes del 29/04)

Los commits `248dbed` y `8a03d50` arreglan bugs críticos (estado de solicitudes, referencia Odoo, panel admin). El servidor sigue corriendo el binario antiguo.

```bash
# En el servidor, en el directorio del repo:
git pull

# Rebuild y redeploy API:
cd API/autociclo-api
./gradlew bootJar
sudo systemctl stop autociclo-api   # o como lo tengas configurado
sudo cp build/libs/autociclo-api.jar /opt/autociclo/autociclo-api.jar
sudo systemctl start autociclo-api

# Rebuild y redeploy Web:
cd Web/autociclo-shop
npm install
npm run build
sudo cp -r dist/* /var/www/autociclo-shop/
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

| # | Prioridad | Acción | Tipo |
|---|---|---|---|
| 1 | 🔴 CRÍTICO | Arreglar login — regenerar hash BCrypt | BD servidor |
| 2 | 🔴 CRÍTICO | Redeploy API + Web con commits recientes | Servidor |
| 3 | 🟠 ALTO | `ALTER TABLE SOLICITUDES_PRESUPUESTO ADD COLUMN referencia_odoo` | BD servidor |
| 4 | 🟠 ALTO | UPDATE stock de piezas a valores reales | BD servidor |
| 5 | 🟡 MEDIO | Cerrar puertos RabbitMQ al exterior | Servidor |
| 6 | 🔵 SIGUIENTE | Iniciar Entrega 5 — App Móvil Worker | Desarrollo |

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
