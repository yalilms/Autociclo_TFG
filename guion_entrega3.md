# Entrega 3 · AutoCiclo · 10 Abril 2026

---

## ✅ Lo que Claude ha implementado (no tienes que tocar nada)

| Archivo | Qué hace |
|---|---|
| `api/ApiClient.java` | Cliente HTTP centralizado con JWT automático en cada petición |
| `api/SessionManager.java` | Singleton que guarda token, email, nombre y rol del usuario logueado |
| `fxml/Login.fxml` | Pantalla de login con diseño glassmorphism igual al resto de la app |
| `controllers/LoginController.java` | Llama a `POST /api/auth/login`, guarda la sesión y abre la pantalla principal |
| `Main.java` | Modificado: splash → Login → Listado principal (antes iba directo al listado) |
| `utils/AppConstants.java` | Añadidas rutas: `PATH_LOGIN_FXML`, `FXML_USUARIOS`, `FXML_SOLICITUDES`, `API_BASE_URL` |
| `fxml/Usuarios.fxml` | Pantalla de gestión de usuarios con tabla y barra de herramientas |
| `controllers/UsuariosController.java` | CRUD completo de usuarios contra la API (GET/POST/PUT/DELETE) |
| `rabbitmq/RabbitMQListener.java` | Consumer AMQP que escucha la cola `solicitudes.nueva` en segundo plano |
| `fxml/Solicitudes.fxml` | Pantalla de solicitudes de presupuesto con botones Aprobar / Rechazar |
| `controllers/SolicitudesController.java` | Aprobar/Rechazar solicitudes via API → desencadena flujo Odoo |
| `fxml/ListadosController.fxml` | Añadidos botones "Usuarios" y "Solicitudes" + badge rojo de notificaciones |
| `controllers/ListadoMaestroController.java` | Carga de vehículos/piezas/inventario migrada de JDBC a API REST; RabbitMQ badge |
| `utils/OdooClient.java` (API) | Cliente JSON-RPC para Odoo 17: authenticate, crear partner, crear pedido, confirmar |
| `services/SolicitudService.java` (API) | Al aprobar una solicitud, llama a OdooClient para crear el pedido de venta en Odoo |
| `application.properties` (API) | Añadidas propiedades: `odoo.url`, `odoo.db`, `odoo.user`, `odoo.password` |
| `build.gradle` (Desktop) | Añadida dependencia `com.rabbitmq:amqp-client:5.20.0` |

---

## 🔧 Lo que tienes que hacer TÚ

### 1. Recargar Gradle en el IDE (2 minutos)
Hay errores rojos en `RabbitMQListener.java` porque el IDE no ha cargado aún la nueva dependencia de RabbitMQ.

> En IntelliJ: botón derecho sobre `build.gradle` → **Reload Gradle Project**
> En VS Code: clic en el icono de Gradle en la barra lateral → **Refresh**

Después de recargar, los errores desaparecen solos.

---

### 2. Instalar Odoo 17 Community en el servidor IONOS (30-60 min)
Esto es trabajo en el servidor, Claude no puede hacerlo remotamente.

```bash
# En el servidor Ubuntu IONOS:
sudo apt update
sudo apt install -y postgresql postgresql-contrib python3-pip python3-dev \
    build-essential libxml2-dev libxslt1-dev zlib1g-dev libsasl2-dev \
    libldap2-dev libssl-dev libffi-dev

# Crear usuario postgres para Odoo
sudo -u postgres createuser -s odoo
sudo -u postgres createdb odoo17

# Descargar Odoo 17 CE
git clone https://github.com/odoo/odoo --depth 1 --branch 17.0 /opt/odoo17
cd /opt/odoo17
pip3 install -r requirements.txt

# Iniciar Odoo
python3 odoo-bin -c /etc/odoo.conf
```

Después de instalarlo:
- Activar módulos: **Ventas**, **Facturación**, **Contactos**
- Crear usuario API con permisos de ventas
- Probar que responde en `http://IP_SERVIDOR:8069`

Configurar en el servidor las variables de entorno de la API:
```bash
export ODOO_URL=http://localhost:8069
export ODOO_DB=odoo17
export ODOO_USER=admin
export ODOO_PASSWORD=tu_password
```

---

### 3. Configurar Nginx para Odoo (10 min)
```nginx
server {
    listen 80;
    server_name tu-servidor.ionos.com;
    location / {
        proxy_pass http://localhost:8069;
        proxy_set_header Host $host;
    }
}
```

---

### 4. Probar el flujo completo antes de grabar el vídeo
1. Arrancar MySQL + RabbitMQ + API Spring Boot
2. Arrancar la app Desktop → debería aparecer el Login
3. Iniciar sesión con `admin@autociclo.com` (o el usuario que tengas en la BD)
4. Desde Postman, crear una solicitud con un usuario CLIENTE → el badge del Desktop debe subir
5. Aprobar la solicitud desde el Desktop → se crea el pedido en Odoo

---

## 🎬 Guión Vídeo 3 — AutoCiclo Entrega 3 (~3:30 min)

---

### [0:00 – 0:20] Intro
*Pantalla: escritorio con el proyecto abierto en el IDE*

> "Hola, soy Yalil, alumno de CFGS DAM en el IES Pedro Hermenegildo Lanz de Granada. Este es el vídeo número 3 de mi TFG: AutoCiclo, un ecosistema multiplataforma para la gestión de desguaces de vehículos. En esta entrega, el objetivo era conectar la aplicación de escritorio Java con la API REST y añadir tres módulos nuevos: autenticación, usuarios y solicitudes, además de notificaciones en tiempo real con RabbitMQ e integración con Odoo 17."

---

### [0:20 – 0:50] Arranque con Login
*Acción: ejecutar la app Desktop*

> "Lo primero que vemos al arrancar la aplicación ahora es la pantalla de login. Antes de esta entrega, la app se conectaba directamente a la base de datos MySQL. Ahora, todo pasa por la API REST con JWT. Introduzco las credenciales de administrador..."

*Escribir email y contraseña, pulsar Acceder*

> "…y la app llama a POST /api/auth/login. El token JWT que devuelve la API se almacena en el SessionManager y se adjunta automáticamente a todas las peticiones siguientes."

---

### [0:50 – 1:25] Vehículos, Piezas e Inventario cargados desde la API
*Acción: navegar entre Vehículos, Piezas, Inventario*

> "Una vez dentro, los datos de vehículos, piezas e inventario ya no se cargan con JDBC directo a la base de datos, sino a través de la API REST. Podemos ver que los datos siguen funcionando exactamente igual, pero ahora cualquier cambio que otro módulo haga en la API se refleja aquí. Hemos creado el ApiClient, un cliente HTTP centralizado basado en el HttpClient de Java 11 que gestiona el token automáticamente."

---

### [1:25 – 2:00] Módulo de Gestión de Usuarios
*Acción: clic en botón "Usuarios" del menú*

> "Nuevo en esta entrega: el módulo de usuarios. Solo visible para administradores. Aquí podemos ver todos los usuarios del sistema con su rol y estado. Puedo crear un nuevo usuario..."

*Clic en Nuevo usuario, rellenar el formulario*

> "…llamando a POST /api/usuarios. También puedo editar o desactivar usuarios con PUT y DELETE sobre la misma API. Todo el CRUD en tiempo real, sin tocar la base de datos directamente."

---

### [2:00 – 2:45] Solicitudes + RabbitMQ Badge + Aprobar con Odoo
*Acción: clic en "Solicitudes"*

> "El módulo más importante de esta entrega es Solicitudes de Presupuesto. La aplicación Desktop recibe alertas en tiempo real gracias a RabbitMQ: cuando un cliente crea una solicitud en la web, la API publica un mensaje en la cola solicitudes.nueva, y el Desktop lo consume en segundo plano. Ese contador rojo que aparece en el botón es el badge de notificaciones."

*Señalar el badge en el botón de Solicitudes*

> "Al entrar a Solicitudes, podemos ver todas las solicitudes pendientes. Selecciono una y pulso Aprobar..."

*Abrir diálogo de aprobación, rellenar precio y respuesta*

> "…el Desktop llama a PUT /api/solicitudes/{id}/aprobar. En la API, este endpoint no solo cambia el estado: también llama a nuestro OdooClient, que mediante JSON-RPC crea un pedido de venta en Odoo 17, con las líneas de la solicitud, y lo confirma. El cliente recibe una notificación automática."

---

### [2:45 – 3:20] Resumen arquitectura
*Acción: mostrar brevemente el código*

> "En resumen, en esta entrega hemos construido: el ApiClient y SessionManager para gestionar el JWT, la pantalla de Login conectada a la API, el módulo de Usuarios, el módulo de Solicitudes, el listener de RabbitMQ para notificaciones en tiempo real, y el OdooClient en la API para la integración con el ERP. La aplicación Desktop ya no tiene ninguna conexión directa a la base de datos."

---

### [3:20 – 3:30] Cierre
*Pantalla: logo AutoCiclo*

> "En el próximo vídeo, el 24 de abril, implementaremos el AutoCiclo Shop: la tienda web en React para que los clientes puedan hacer solicitudes de presupuesto directamente. Hasta la próxima."

---

**Duración estimada: ~3:25 min**

> **Consejo para el vídeo:** el momento más visual y que más le va a gustar al profesor es cuando el badge sube en tiempo real. Intenta grabarlo en vivo: abre Postman en otra ventana, crea una solicitud como CLIENTE, y se ve cómo el número aparece en el Desktop sin recargar nada. Dura 10 segundos pero impresiona mucho.
