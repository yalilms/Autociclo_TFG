# AutoCiclo

TFG de 2º DAM. Es un sistema para gestionar un desguace de vehículos de principio a fin.

La idea es que un desguace tiene tres tipos de personas: el cliente que busca piezas, el admin que gestiona el negocio y el trabajador del almacén. Cada uno tiene su propia app pero todas comparten los mismos datos a través de una API REST central.

## Las partes del proyecto

**API REST** — Hecha con Spring Boot 3 y Java 21. Es el núcleo de todo. Gestiona la autenticación con JWT, los roles, las solicitudes, el stock y se conecta con Stripe, Odoo y RabbitMQ.

**Web Shop** — La tienda web para el cliente. Hecha con React 19 y TypeScript. Desde aquí el cliente puede ver el catálogo de piezas, hacer una solicitud con el precio que ofrece, negociar con el admin y pagar con tarjeta cuando llegan a un acuerdo.

**Desktop** — La aplicación de escritorio para el administrador del desguace. Hecha en Java con JavaFX. Tiene un panel con estadísticas, gestión de solicitudes, inventario y usuarios. Se distribuye como instalador .deb para Linux y como zip portable para Windows con el JRE incluido.

**Worker** — La app móvil para el operario del almacén. Hecha con React Native y Expo. Desde el móvil puede ver los pedidos que tiene que preparar, escanear códigos QR de las piezas para localizarlas y registrar entradas y salidas de stock.

**Odoo 17** — Un ERP de código abierto que tengo integrado. Cuando el cliente paga, la API crea automáticamente el pedido de venta en Odoo usando su API JSON-RPC.

## El flujo principal

El cliente solicita una pieza con el precio que está dispuesto a pagar. El admin lo ve en el Desktop, puede aceptarlo, rechazarlo o hacer una contraoferta. Si llegan a un acuerdo, el cliente paga con Stripe. El trabajador ve el pedido en el móvil, recoge la pieza y el stock baja automáticamente. Odoo registra el pedido de venta.

## Cómo probarlo

**Web Shop** — Abre el navegador y entra en:

```
http://109.123.247.31
```

Puedes registrarte como cliente nuevo o usar la cuenta de demo:

```
Email:      cliente@autociclo.com
Contraseña: admin123
```

**Desktop (app del admin)** — Hay instaladores listos sin necesidad de tener Java instalado.

- Fedora/RHEL: `sudo dnf install autociclo-1.0.0-1.x86_64.rpm`
- Ubuntu/Debian: `sudo dpkg -i autociclo_1.0.0_amd64.deb`
- Windows: descomprimir el ZIP y ejecutar `AutoCiclo.bat`

Credenciales de acceso:

```
Email:      admin@autociclo.es
Contraseña: admin123
```

**Worker (app del almacén)** — Instala el APK en cualquier Android y accede con:

```
Email:      pedro@autociclo.es
Contraseña: admin123
```

## Stack tecnológico

- API: Java 21, Spring Boot 3, Spring Security, JWT, JPA/Hibernate, MySQL 8
- Web: React 19, TypeScript, Vite, Tailwind CSS, Zustand, Axios, Stripe Elements, jsPDF
- Desktop: Java 21, JavaFX 21, Gradle, Gson, HikariCP
- Móvil: React Native 0.81, Expo SDK 54, Expo Router, NativeWind, expo-secure-store
- Servicios: MySQL 8, RabbitMQ, Odoo 17 CE, Stripe
- Despliegue: Ubuntu Server 22.04 en Contabo, Nginx, systemd

## Despliegue

Todo está desplegado en un VPS de Contabo con Ubuntu Server. La API corre como servicio systemd, el frontend lo sirve Nginx y la base de datos es MySQL 8 corriendo en el mismo servidor.

---

Yalil Musa Talhaoui — IES P. Hermenegildo Lanz, Granada — DAM 2025/26
