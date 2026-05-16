# Guía de capturas para la presentación AutoCiclo

Haz todas las capturas en modo pantalla completa o ventana grande. 
Después de hacerlas todas, dáselas a Claude con el prompt de presentación para que las inserte.

---

## CAPTURA 1 — Logo AutoCiclo
**Diapositiva:** Portada  
**Dónde:** Abre la app Worker en el móvil → pantalla de Login  
**Qué capturar:** Solo la parte superior con el logo circular blanco y el texto "AutoCiclo"  
**Tamaño sugerido:** 300x300px cuadrado  

---

## CAPTURA 2 — Arquitectura / Servidor
**Diapositiva:** Arquitectura general  
**Dónde:** No es una pantalla de app — puedes crear un diagrama sencillo en draw.io (diagrams.net) con los 4 bloques: Desktop, Web, Móvil, API → RabbitMQ/Odoo/MySQL  
**Alternativa:** Captura del panel de Contabo o un `htop` del servidor mostrando los procesos corriendo  

---

## CAPTURA 3 — Desktop: pantalla principal
**Diapositiva:** Desktop (6a)  
**Dónde:** Abre AutoCiclo Desktop → entra con `admin@autociclo.es` / `Autociclo2026!`  
**Qué capturar:** La pantalla de **Solicitudes** o **Listado Maestro** (la pantalla principal con la tabla de datos)  
**Qué evitar:** No capturar pantallas con datos de prueba feos; asegúrate de que haya datos reales visibles  

---

## CAPTURA 4 — Desktop: detalle solicitud/negociación
**Diapositiva:** Desktop (6b)  
**Dónde:** Desktop → Solicitudes → abre una solicitud en estado "en_negociacion" o "pendiente"  
**Qué capturar:** La ventana de detalle con el botón de aprobar/rechazar/contraoferta visible  

---

## CAPTURA 5 — Web Shop: catálogo de piezas
**Diapositiva:** Web Shop (7a)  
**Dónde:** Abre el navegador → `http://109.123.247.31:8090` (o localhost:5173 si tienes la web en local)  
**Qué capturar:** La página principal con el listado de piezas, las tarjetas con imágenes y precios  
**Consejo:** Usa el zoom del navegador al 90% para que quepan más tarjetas en pantalla  

---

## CAPTURA 6 — Web Shop: mis solicitudes o pago
**Diapositiva:** Web Shop (7b)  
**Dónde:** Web → Login como cliente → "Mis Solicitudes"  
**Qué capturar:** La pantalla de Mis Solicitudes con una solicitud en estado de negociación (muestra el historial de ofertas y contraofertas)  
**Alternativa:** Captura de la pantalla de pago con Stripe (formulario de tarjeta)  

---

## CAPTURA 7 — Mobile Worker: login o dashboard
**Diapositiva:** Mobile Worker (8a)  
**Dónde:** Abre Expo Go en el móvil → carga la app Worker  
**Opción A:** Pantalla de **Login** con el campo de usuario y el dominio `@autociclo.es` visible  
**Opción B:** Pantalla de **Dashboard** después de iniciar sesión, mostrando las alertas de stock y las solicitudes  
**Cómo capturar en Android:** Botón bajar volumen + botón encendido  

---

## CAPTURA 8 — Mobile Worker: detalle pieza con QR o stock
**Diapositiva:** Mobile Worker (8b)  
**Dónde:** App Worker → Buscar → toca una pieza  
**Qué capturar:** La pantalla de detalle de pieza con el stock visible, o con el modal del QR abierto mostrando el código  
**Alternativa:** La pantalla de Escanear QR con la cámara activa apuntando a un código QR real  

---

## CAPTURA 9 — Collage end-to-end
**Diapositiva:** Flujo End-to-End (9)  
**Qué es:** Una imagen combinada con 3 pantallas juntas (web + desktop + móvil) mostrando el mismo flujo  
**Cómo hacerlo:** Captura las pantallas por separado y úsalas juntas, o usa una herramienta como Canva para combinarlas  
**Alternativa:** Solo una captura representativa de cada plataforma puestas en fila  

---

## CAPTURA 10 — QR de acceso demo (opcional)
**Diapositiva:** Demo en vivo  
**Qué es:** Un QR que apunte a la URL de tu web: `http://109.123.247.31:8090`  
**Cómo generarlo:** Ve a qr-code-generator.com o usa la misma app Worker (pide un QR de cualquier pieza y muestra la URL del servidor)  

---

## RESUMEN DE CAPTURAS (orden para darlas a Claude)

| # | Nombre archivo sugerido | Diapositiva |
|---|---|---|
| 1 | `logo_autociclo.png` | Portada |
| 2 | `arquitectura.png` | Arquitectura |
| 3 | `desktop_solicitudes.png` | Desktop 6a |
| 4 | `desktop_negociacion.png` | Desktop 6b |
| 5 | `web_catalogo.png` | Web 7a |
| 6 | `web_solicitudes.png` | Web 7b |
| 7 | `movil_dashboard.png` | Móvil 8a |
| 8 | `movil_pieza_qr.png` | Móvil 8b |
| 9 | `collage_apps.png` | End-to-End |
| 10 | `qr_demo.png` | Demo (opcional) |

---

## CÓMO DAR LAS IMÁGENES A CLAUDE

Una vez tengas todas las capturas, abre claude.ai (con opción de subir imágenes) y escribe:

> "Aquí tienes las capturas para la presentación AutoCiclo. Insértalas en los espacios correspondientes de la presentación que generaste, en el orden indicado en la guía de capturas. [adjunta las imágenes en orden]"
