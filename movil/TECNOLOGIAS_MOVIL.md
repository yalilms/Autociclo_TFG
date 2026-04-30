# Tecnologías para la App Móvil — Autociclo

---

## 7. Persistencia de Datos Locales

### Async Storage

- Almacenamiento sencillo de **cadenas de texto y objetos JSON** (`JSON.stringify` / `JSON.parse`).
- Casos de uso:
  - Mantener **cachés** de datos consultados.
  - Almacenar **credenciales** del usuario (tokens, sesiones).
  - Crear **funcionalidad offline** cuando no hay conexión.

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar
await AsyncStorage.setItem('usuario', JSON.stringify({ id: 1, nombre: 'Yalil' }));

// Leer
const data = await AsyncStorage.getItem('usuario');
const usuario = JSON.parse(data ?? '{}');
```

---

### Bases de Datos SQLite

#### `react-native-sqlite-storage` — SQL directo

```ts
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'autociclo.db' });

db.transaction(tx => {
  tx.executeSql(
    'SELECT * FROM vehiculos WHERE marca = ?',
    ['Toyota'],
    (_, result) => console.log(result.rows.item(0))
  );
});
```

#### TypeORM — Abstracción orientada a objetos

**Configuración de Entidades:**

```ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @ManyToOne(() => Cliente, cliente => cliente.vehiculos)
  cliente: Cliente;
}
```

**Operaciones CRUD con Repositorios:**

```ts
const repo = dataSource.getRepository(Vehiculo);

// Crear
await repo.save({ marca: 'Toyota', modelo: 'Corolla' });

// Leer
const vehiculos = await repo.find({ where: { marca: 'Toyota' } });

// Actualizar
await repo.update(1, { modelo: 'Yaris' });

// Borrar
await repo.delete(1);
```

**QueryBuilder para consultas complejas:**

```ts
const resultado = await repo
  .createQueryBuilder('v')
  .leftJoinAndSelect('v.cliente', 'c')
  .where('v.marca = :marca', { marca: 'Toyota' })
  .orderBy('v.modelo', 'ASC')
  .getMany();
```

---

## 8. Backend as a Service con Firebase

### Configuración

- Crear proyecto en [Firebase Console](https://console.firebase.google.com/).
- Inicializar en la app:

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
```

---

### Autenticación

```ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Registro
await createUserWithEmailAndPassword(auth, email, password);

// Inicio de sesión
await signInWithEmailAndPassword(auth, email, password);
```

---

### Firestore — Base de Datos Documental

**Diseño:** Colecciones → Documentos → Subcolecciones

```
/usuarios/{userId}
  /vehiculos/{vehiculoId}
  /solicitudes/{solicitudId}
```

**Operaciones CRUD:**

```ts
import {
  collection, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, doc
} from 'firebase/firestore';

const ref = collection(db, 'vehiculos');

// Crear
await addDoc(ref, { marca: 'Toyota', modelo: 'Corolla' });

// Leer colección
const snap = await getDocs(ref);
snap.forEach(d => console.log(d.data()));

// Leer documento individual
const docSnap = await getDoc(doc(db, 'vehiculos', '123'));

// Actualizar
await updateDoc(doc(db, 'vehiculos', '123'), { modelo: 'Yaris' });

// Borrar
await deleteDoc(doc(db, 'vehiculos', '123'));
```

---

### Sincronización en Tiempo Real

`onSnapshot` escucha cambios en vivo y actualiza la UI sin necesidad de refrescar:

```ts
import { onSnapshot } from 'firebase/firestore';

const unsub = onSnapshot(collection(db, 'mensajes'), snapshot => {
  const mensajes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  setMensajes(mensajes); // Actualiza el estado de React Native
});

// Limpiar el listener al desmontar
useEffect(() => () => unsub(), []);
```

Casos de uso: **chats en tiempo real, foros, notificaciones de estado de solicitudes**.

---

## 9. Integración de Módulos Nativos

### Módulo Nativo en Java (Android)

Crear clase en Android Studio heredando de `ReactContextBaseJavaModule`:

```java
// AlgoritmoModule.java
public class AlgoritmoModule extends ReactContextBaseJavaModule {

  AlgoritmoModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() { return "AlgoritmoModule"; }

  @ReactMethod
  public void calcularPesado(int input, Promise promise) {
    new Thread(() -> {
      try {
        int resultado = /* algoritmo pesado */ input * 2;
        promise.resolve(resultado);
      } catch (Exception e) {
        promise.reject("ERROR", e.getMessage());
      }
    }).start();
  }
}
```

---

### Registro del Paquete

```java
// AlgoritmoPackage.java
public class AlgoritmoPackage implements ReactPackage {
  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext ctx) {
    return Arrays.asList(new AlgoritmoModule(ctx));
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext ctx) {
    return Collections.emptyList();
  }
}
```

Inyectar en `MainApplication.kt`:

```kotlin
override fun getPackages(): List<ReactPackage> =
  PackageList(this).packages.apply {
    add(AlgoritmoPackage())
  }
```

---

### Invocación desde TypeScript

```ts
import { NativeModules } from 'react-native';

const { AlgoritmoModule } = NativeModules;

const resultado = await AlgoritmoModule.calcularPesado(42);
console.log('Resultado nativo:', resultado);
```

> El método se ejecuta en un **hilo secundario** en Java y devuelve una `Promise` a JavaScript, evitando bloquear la UI.

---

## Resumen de Tecnologías

| Área                    | Tecnología                        | Uso principal                         |
|-------------------------|-----------------------------------|---------------------------------------|
| Caché / Offline         | Async Storage                     | Tokens, cachés, sesión local          |
| SQL local               | react-native-sqlite-storage       | Consultas SQL directas                |
| ORM local               | TypeORM                           | Entidades, relaciones, QueryBuilder   |
| Auth                    | Firebase Authentication           | Registro e inicio de sesión           |
| Base de datos cloud     | Firestore                         | CRUD de documentos                    |
| Tiempo real             | Firestore `onSnapshot`            | Chats, foros, notificaciones live     |
| Módulos nativos Android | ReactContextBaseJavaModule (Java) | Algoritmos pesados en hilo secundario |
