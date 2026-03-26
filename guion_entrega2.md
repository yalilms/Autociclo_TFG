# Guión — Video Avance 2 (~3 min)
**API REST Completa + RabbitMQ · 27 Marzo 2026**

---

## INTRO (15 seg)
> "Entrega 2 de AutoCiclo. En la anterior entrega teníamos la base de datos y el login con JWT. Hoy muestro la API REST completa con todos los CRUDs, seguridad por roles y RabbitMQ integrado."

---

## 1 — ESTRUCTURA DEL PROYECTO (20 seg)
Mostrar rápido el árbol en el IDE:
- `controllers/` — 8 controladores
- `services/` — lógica de negocio
- `messaging/` — RabbitMQPublisher + Consumer
- `config/RabbitMQConfig.java` — colas y exchange

---

## 2 — LOGIN Y SEGURIDAD (40 seg)

**Sin token → 401**
```
GET /api/vehiculos  (sin Authorization)
→ 401 Unauthorized
```

**Login como ADMIN**
```
POST /api/auth/login
{ "email": "admin@autociclo.es", "password": "Autociclo2026!" }
→ token JWT  (rol: ADMIN)
```

**Token de CLIENTE intentando crear vehículo → 403**
```
POST /api/vehiculos  (token CLIENTE)
→ 403 Forbidden
```
> "401 sin token, 403 sin rol suficiente."

---

## 3 — CRUD RÁPIDO (30 seg)

```
GET  /api/vehiculos              → lista los 5 vehículos
GET  /api/piezas/buscar?q=motor  → devuelve MOT-001 y MOT-002
POST /api/vehiculos              → crear nuevo (ADMIN)
GET  /api/usuarios               → solo ADMIN
```

---

## 4 — ¿QUÉ ES RABBITMQ Y PARA QUÉ LO USAMOS? (25 seg)
> "RabbitMQ es un broker de mensajería: permite que distintas partes del sistema se comuniquen de forma asíncrona sin estar directamente conectadas entre sí. En AutoCiclo lo usamos para dos flujos clave: cuando un cliente web envía una solicitud de presupuesto, RabbitMQ lanza una alerta en tiempo real al Desktop del administrador. Y cuando un operario reduce el stock de una pieza por debajo del mínimo, RabbitMQ avisa automáticamente a la app móvil del trabajador. Así cada plataforma reacciona a los eventos sin necesidad de estar constantemente consultando la API."

---

## 5 — RABBITMQ EN ACCIÓN (60 seg)

**Crear solicitud como CLIENTE → mensaje a cola**
```
POST /api/solicitudes  (token CLIENTE)
{ "detalles": [{ "idPieza": 1, "cantidad": 1 }] }
→ 201 Created
```
Log en consola:
```
[RabbitMQ] Publicado en solicitudes.nueva: solicitud #2 de Cliente Demo
[Consumer] Nueva solicitud — idSolicitud=2 cliente=Cliente Demo
```

**Movimiento de stock → alerta**
```
POST /api/stock/movimiento  (token ADMIN)
{ "idPieza": 1, "tipo": "salida", "cantidad": 3 }
→ 201 Created
```
Log:
```
[RabbitMQ] ALERTA STOCK: Motor 1.6 TDI (MOT-001) stock=0 < mínimo=1
[Consumer] ALERTA STOCK — pieza=Motor 1.6 TDI stock=0 mínimo=1
```

Mostrar **RabbitMQ Management UI** (`localhost:15672`) con las dos colas y los mensajes.

---

## CIERRE (15 seg)
> "API completa, seguridad por roles funcionando y RabbitMQ enviando eventos entre plataformas. En la próxima entrega, el Desktop JavaFX conectado a esta API con notificaciones en tiempo real."

---

## Checklist antes de grabar
- [ ] `mvn spring-boot:run` arrancado
- [ ] `localhost:15672` accesible (guest/guest)
- [ ] Datos de prueba en BD
- [ ] Postman con los 4 requests del guión listos
