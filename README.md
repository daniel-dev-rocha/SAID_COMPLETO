# SAID · Sistema de Aprendizaje Interactivo Digital

Proyecto actualizado por completo con base en el documento de sustentación
y la presentación entregados. Incluye **todos los módulos** descritos
(Usuario, Tareas, Estado de tarea, Prioridad, Categoría, Calendario,
Recordatorios y Notificaciones), más un módulo de **Seguimiento**
(historial) para verificar el comportamiento de la base de datos.

```
SAID/
├── database/
│   ├── said_db.sql                 -> Script corregido y adaptado (antes coreccion_DB.sql)
│   └── consultas_verificacion.sql  -> Consultas MULTITABLA para probar la BD
├── backend/                        -> API en FastAPI (Python)
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── core/            (config, conexión a BD, seguridad, dependencias)
│       ├── schemas/         (modelos Pydantic de entrada/salida)
│       ├── repositories/    (SQL puro con psycopg2)
│       ├── services/        (reglas de negocio / historias de usuario)
│       └── routers/         (endpoints HTTP)
└── frontend/                       -> React + TypeScript
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/            (clientes tipados hacia el backend)
        ├── context/        (Auth, Theme/oscuro, Tasks, Modal, Toast)
        ├── components/
        │   ├── auth/       (Login, Registro)
        │   ├── layout/     (Sidebar, Topbar, AppLayout)
        │   ├── views/      (Dashboard, Tareas, Calendario, Recordatorios,
        │   │                Notificaciones, Seguimiento, Perfil, Configuración)
        │   ├── modals/     (Crear/editar tarea, Detalle de tarea)
        │   └── common/     (Badges, TaskRow)
        └── styles.css      (paleta oficial SAID + modo oscuro)
```

---

## 1. ¿Qué se corrigió/adaptó del script SQL original?

Archivo: `database/said_db.sql` (parte de `coreccion_DB.sql`)

- Los `CREATE TYPE` ahora están envueltos en bloques `DO $$ ... EXCEPTION
  WHEN duplicate_object THEN NULL; END $$;` para poder **volver a correr
  el script sin que falle** si los tipos ya existen (Postgres no soporta
  `CREATE TYPE IF NOT EXISTS`).
- Se corrigió el nombre mal escrito `periosidad` → **`periodicidad`** en
  `notificaciones`, y se le agregó un `CHECK` para limitar sus valores.
- Se agregó `color_categoria` a `tipo_tarea` (para que el frontend pinte
  cada categoría con un color, como pide el diseño).
- Se agregó `id_usuario` directo a `tareas` (antes solo se llegaba al
  usuario indirectamente por `tipo_tarea`), y `titulo` como campo
  obligatorio independiente de la descripción larga (exigido por HU01).
- Se agregó `fecha_actualizacion` en `tareas` + un **trigger** que la
  actualiza automáticamente en cada `UPDATE` (soporta HU06 - editar tarea).
- Se agregaron más índices y una **restricción única** para que un mismo
  usuario no repita el nombre de una categoría.
- Se agregaron **datos de prueba (seed)** al final del script para poder
  probar el backend/frontend y las consultas de verificación de inmediato.

El archivo `database/consultas_verificacion.sql` contiene **7 consultas
multitabla** (JOIN entre `tareas`, `usuario`, `tipo_tarea`, `notas`,
`notificaciones` e `historial`) que confirman que las relaciones
funcionan correctamente.

---

## 2. Backend (FastAPI)

Arquitectura por capas, para que el código sea fácil de leer y de
extender:

- **`core/`** – configuración (`.env`), pool de conexiones psycopg2,
  seguridad (hash de contraseñas + JWT), dependencia de autenticación.
- **`schemas/`** – los `BaseModel` de Pydantic (qué entra y qué sale de
  cada endpoint).
- **`repositories/`** – el único lugar del proyecto que escribe SQL.
  Cada función hace una sola cosa (crear, listar, actualizar, eliminar).
- **`services/`** – las reglas de negocio (por ejemplo: "no puedes crear
  una tarea con una categoría que no es tuya", o "al cambiar el estado
  de una tarea, registra el cambio en el historial"). Aquí se
  implementan las historias de usuario HU01 a HU09 del documento.
- **`routers/`** – solo reciben la petición HTTP, llaman al servicio, y
  devuelven la respuesta. No tienen lógica de negocio ni SQL.

Dependencias (`backend/requirements.txt`): `fastapi`, `uvicorn`,
`pydantic` + `pydantic-settings`, `psycopg2-binary`, `passlib[bcrypt]`
y `python-jose` (para el login con JWT), `python-dotenv` y `autopep8`.

### Endpoints principales

| Módulo | Endpoints |
|---|---|
| Usuario | `POST /api/auth/registro`, `POST /api/auth/login`, `GET/PUT /api/auth/perfil` |
| Categoría | `GET/POST /api/categorias`, `PUT/DELETE /api/categorias/{id}` |
| Tareas | `GET/POST /api/tareas`, `GET/PUT/DELETE /api/tareas/{id}`, `PATCH /api/tareas/{id}/estado` |
| Calendario | `GET /api/tareas/calendario?anio=&mes=` |
| Dashboard | `GET /api/tareas/dashboard/resumen` |
| Recordatorios | `GET /api/tareas/recordatorios/proximos?dias=` |
| Notas | `GET/POST /api/tareas/{id}/notas` |
| Notificaciones | `GET/POST /api/notificaciones`, `PUT/DELETE /api/notificaciones/{id}` |
| Seguimiento | `GET /api/historial`, `GET /api/historial/tarea/{id}` |

La documentación interactiva completa (Swagger) queda disponible en
`http://localhost:8000/docs` una vez el servidor está corriendo.

---

## 3. Frontend (React + TypeScript)

- **Colores oficiales de SAID** aplicados en toda la interfaz: azul
  `#0001F0`, amarillo `#FFF251`, rojo `#FF0000`, blanco `#FFFFFF`, gris
  `#D9D9D9`, azul claro `#E4ECF4` y negro `#000000` (ver
  `src/styles.css`, bloque `:root`).
- **Modo oscuro** incluido y persistente (botón 🌙/☀️ en la barra
  superior o en Configuración), respeta también la preferencia del
  sistema operativo la primera vez.
- **Módulos** (todos los del documento, más el MVP de tareas):
  - Iniciar sesión / Registro
  - Dashboard (resumen con datos reales del backend)
  - Tareas (crear, ver detalle, editar, eliminar, buscar y filtrar por
    estado/prioridad/categoría — HU01 a HU08)
  - Calendario (HU09, con creación rápida al hacer clic en un día)
  - Recordatorios (tareas próximas a vencer)
  - Notificaciones (marcar como leída / eliminar)
  - Seguimiento (bitácora de historial, consulta multitabla)
  - Perfil (editar nombre/apellido/correo)
  - Configuración (modo oscuro + administrar categorías)
- Todo tipado con TypeScript (`src/types/index.ts` refleja exactamente
  los esquemas del backend) y con clientes API dedicados en `src/api/`.

---

## 4. Paso a paso para ejecutar el proyecto

### Requisitos previos
- **PostgreSQL** instalado (v13+ recomendado)
- **Python 3.11+**
- **Node.js 18+** (incluye npm)

### Paso 1 — Crear y cargar la base de datos

```bash
# Abre psql o tu cliente de PostgreSQL favorito y crea la base de datos:
createdb said

# Carga el script corregido (crea tablas + datos de prueba):
psql -d said -f database/said_db.sql

# (Opcional) prueba las consultas multitabla de verificación:
psql -d said -f database/consultas_verificacion.sql
```

### Paso 2 — Levantar el backend (FastAPI)

```bash
cd backend

# Crea y activa un entorno virtual
python -m venv venv
source venv/bin/activate        # En Windows: venv\Scripts\activate

# Instala las dependencias
pip install -r requirements.txt

# Copia el archivo de variables de entorno y ajústalo a tu PostgreSQL local
cp .env.example .env
# Edita .env: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY

# Levanta el servidor de desarrollo
uvicorn main:app --reload
```

El backend queda disponible en `http://localhost:8000` (documentación
en `http://localhost:8000/docs`).

> Los usuarios de prueba que trae el seed usan una contraseña "hasheada"
> ficticia (no funcional para login). Para probar el login real, regístrate
> desde el frontend (`POST /api/auth/registro`) o desde `/docs`.

### Paso 3 — Levantar el frontend (React + TypeScript)

```bash
cd frontend

# Instala las dependencias
npm install

# Copia el archivo de variables de entorno
cp .env.example .env
# Verifica que VITE_API_URL apunte a tu backend (por defecto http://localhost:8000)

# Levanta el servidor de desarrollo
npm run dev
```

Abre `http://localhost:5173` en el navegador. Regístrate desde la
pantalla de "Crear cuenta" y comienza a usar SAID.

### Paso 4 — Compilar para producción (opcional)

```bash
cd frontend
npm run build     # genera la carpeta dist/ lista para desplegar
npm run preview   # sirve la build de producción localmente
```

---

## 5. Notas de arquitectura y decisiones tomadas

- Se usó **psycopg2 puro** (sin ORM) tal como se pidió, organizado en
  una capa de "repositorios" para mantener el SQL centralizado, legible
  y fácil de auditar — cada consulta se puede copiar y ejecutar
  directamente en `psql` para depurarla.
- La autenticación usa **JWT** (`python-jose`) + **bcrypt**
  (`passlib`) para el hash de contraseñas: es el estándar razonable
  para un login real sin añadir un ORM completo.
- El color de "prioridad media / pendiente" en el frontend se pintó en
  tono amarillo (coherente con la paleta SAID); "alta prioridad /
  vencida" en rojo; "en proceso" en azul SAID. Se agregó un verde
  neutro solo para el estado "terminada", ya que la paleta oficial no
  incluye un color de éxito y es un estándar universalmente reconocido
  en interfaces de tareas.
- El módulo **Categoría** corresponde a la tabla `tipo_tarea` del script
  (tal como está nombrada en el diagrama relacional entregado); en la
  interfaz se le llama "Categoría" porque así se describe su
  funcionalidad en el documento de sustentación.
