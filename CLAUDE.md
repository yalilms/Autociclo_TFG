# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**Autociclo** is a multi-platform vehicle scrapyard management ecosystem consisting of four independent apps that all talk to a single Spring Boot REST API backed by MySQL.

```
TFG/
├── API/autociclo-api/      ← Spring Boot 3.4 REST API (Maven)
├── Escritorio/AutoCiclo/   ← JavaFX 21 desktop app (Gradle)
├── Web/autociclo-shop/     ← React 19 + Vite web shop (npm)
├── Autociclo_Worker/       ← React Native / Expo mobile app (npm)
└── BaseDatos/              ← MySQL schema files
```

## Commands

### API REST (`API/autociclo-api/`)
```bash
./mvnw spring-boot:run                     # run dev server on :8080
./mvnw clean package -DskipTests           # build fat JAR
./mvnw test                                # run all tests
./mvnw test -Dtest=ClassName#methodName    # run single test
```
Env vars used at runtime: `DB_HOST`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `RABBITMQ_HOST/PORT/USER/PASS`, `ODOO_URL/DB/USER/PASSWORD`. Defaults in `application.properties` point to localhost.

### Web Shop (`Web/autociclo-shop/`)
```bash
npm run dev      # Vite dev server on :5173
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
```

### Worker (`Autociclo_Worker/`)
```bash
npx expo start           # start Expo dev server
npx expo start --android
npx expo start --ios
npm run lint             # ESLint + Prettier check
npm run format           # ESLint fix + Prettier write
```

### Desktop (`Escritorio/AutoCiclo/`)
```bash
./gradlew run            # run JavaFX app
./gradlew build          # build
./gradlew test           # run tests
```

## Architecture

### Auth flow
All clients authenticate via `POST /api/auth/login`, receive a JWT (24 h TTL), and include it as `Authorization: Bearer <token>`. The API is stateless (no sessions). Spring Security's `JwtAuthFilter` validates the token before every request. Public endpoints: `/api/auth/**` and `GET /api/piezas/**`, `GET /api/vehiculos/**`.

### Database
`spring.jpa.hibernate.ddl-auto=validate` — Hibernate never modifies the schema; all DDL changes must be applied manually via the SQL files in `BaseDatos/`. The physical naming strategy is set to `PhysicalNamingStrategyStandardImpl` so table names match exactly what is in `@Table(name=...)` annotations (MySQL on Linux is case-sensitive).

### RabbitMQ messaging
Exchange: `autociclo.exchange` (Topic).  
Two durable queues:
- `solicitudes.nueva` — API publishes when a client submits a budget request → Desktop app consumes and shows a real-time alert.
- `stock.alerta` — API publishes when stock drops below threshold → Worker dashboard consumes.

The Desktop connects directly to RabbitMQ via `amqp-client` in a daemon thread (`RabbitMQListener`). Use `Platform.runLater()` when updating JavaFX UI from that thread.

### Odoo integration
When a Desktop admin approves a budget request, the API calls Odoo 17 JSON-RPC to create a sale order and trigger invoice generation. Config lives in `application.properties` under the `odoo.*` keys.

### Web Shop (`Web/autociclo-shop/`)
State is managed with **Zustand** (`src/store/authStore.ts`, `src/store/client.ts`). Routing uses React Router v7. The `admin/` pages are protected by `AdminRoute.tsx`; general authenticated pages by `PrivateRoute.tsx`.

### Worker (`Autociclo_Worker/`)
File-based routing via **Expo Router** v6. Top-level tabs in `app/(tabs)/`: `dashboard`, `buscar`, `escanear`, `vehiculos`. Auth state in `store/authStore.ts`; API calls in `lib/api.ts` and `lib/auth.ts`. Uses **NativeWind** (Tailwind for React Native), `expo-camera` for QR scanning, and `expo-secure-store` for token persistence.

### Desktop (`Escritorio/AutoCiclo/`)
JavaFX 21 with FXML. Controllers in `controllers/`, models in `models/`, DB access via HikariCP pool in `database/ConexionBD.java`. Icons via Ikonli MaterialDesign2 pack. The app makes HTTP calls to the API using Gson for JSON serialisation (see `api/` package). `enums/` and `utils/` hold shared helpers.

## Key configuration files
- [API/autociclo-api/src/main/resources/application.properties](API/autociclo-api/src/main/resources/application.properties) — all API settings with env-var overrides
- [BaseDatos/autociclo_db_v2.sql](BaseDatos/autociclo_db_v2.sql) — canonical 11-table schema
- [BaseDatos/autociclo_db_demo.sql](BaseDatos/autociclo_db_demo.sql) — demo seed data
