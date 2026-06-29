# Venezolanos Unidos 🇻🇪

Plataforma humanitaria de emergencia para coordinar ayuda tras un terremoto/sismo en
Venezuela. Centraliza recursos dispersos (refugios, centros de acopio, ayuda médica),
un buscador nacional de pacientes/heridos, reporte manual de pacientes, dashboard de
métricas, una red de traductores voluntarios y un chatbot de asistencia con fallback.

## Arquitectura

Monorepo con dos partes independientes:

- **`frontend/`** — Next.js 16 (App Router) + React 19 + TypeScript + TailwindCSS v4 +
  Framer Motion + Recharts + lucide-react + react-markdown. Gestor de paquetes: **pnpm**.
- **`backend/`** — FastAPI (Python) + SQLAlchemy + Pandas. IA vía **Google Gemini**
  (`gemini-2.5-flash`). Base de datos: SQLite en local, PostgreSQL en producción
  (configurable por `DATABASE_URL`).

El frontend consume la API REST del backend vía `NEXT_PUBLIC_API_URL`
(default `http://localhost:8000`). Ambos se despliegan en Vercel.

## Backend (`backend/`)

- **`main.py`** — App FastAPI con CORS abierto (`*`). Contiene:
  - Lista hardcodeada `RESOURCES` (refugios, centros de acopio, médicos, etc.) que
    alimenta tanto `/api/resources` como el `SYSTEM_PROMPT` del chatbot.
  - Endpoints:
    - `GET /api/resources` — devuelve la lista de recursos.
    - `GET /api/pacientes/buscar?q=` — busca por nombre, apellido o cédula (min 3 chars).
    - `GET /api/estadisticas` — totales, breakdown por condición y top 5 hospitales.
    - `POST /api/pacientes` — alta manual de paciente (crea el centro si no existe).
    - `POST /api/traductores` — registra traductor voluntario (protegido por PIN).
    - `GET /api/traductores?q=` — lista/busca traductores por idioma o nombre.
    - `DELETE /api/traductores/{id}?pin_seguridad=` — borra traductor verificando PIN.
    - `POST /api/chat` — chatbot Gemini con **fallback local por palabras clave** si la
      IA falla o está bloqueada regionalmente.
- **`models.py`** — Modelos SQLAlchemy: `CentroSalud`, `Paciente` (PK uuid),
  `Traductor` (PK uuid, PIN de 4 dígitos), `ContactoEmergencia`.
- **`database.py`** — Engine que cambia entre SQLite y PostgreSQL según `DATABASE_URL`.
- **`scripts/ingest_all_data.py`** — ETL clave: descarga ~11 Google Sheets/Drive
  (Excel/CSV) de hospitales, limpia/normaliza cédulas con regex, deduplica por cédula o
  nombre, detecta fallecidos por marcador `(fallecido)`, y repuebla las tablas
  `pacientes` y `centros_salud` (las borra primero). Otros scripts: `ingest_data.py`,
  `check_headers.py`, `dump_db.py`.
- **`.env`** — `GEMINI_API_KEY`, `DATABASE_URL` (no versionado).

## Frontend (`frontend/src/`)

App Router con `lang="es"`. Estética: glassmorphism oscuro, colores de la bandera
(amarillo/azul/rojo), animaciones con Framer Motion.

- **`app/page.tsx`** — Home: hero, buscador de recursos con filtros por categoría, grid
  de `ResourceCard`, botones de navegación y link al grupo de WhatsApp. Monta el Chatbot.
- **`app/buscar/page.tsx`** — Buscador de pacientes/heridos.
- **`app/reportar/page.tsx`** — Formulario de alta manual de pacientes.
- **`app/dashboard/page.tsx`** — Métricas y gráficos (Recharts).
- **`app/traductores/page.tsx`** + **`traductores/registro/page.tsx`** — Directorio y
  registro de traductores voluntarios (contacto por WhatsApp, borrado por PIN).
- **`components/Chatbot.tsx`** — Widget flotante de chat (markdown).
- **`components/ResourceCard.tsx`** — Tarjeta de recurso.

## Comandos

```bash
# Frontend
cd frontend && pnpm install && pnpm dev      # dev en :3000
pnpm build && pnpm start                      # producción
pnpm lint

# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload                     # API en :8000
python scripts/ingest_all_data.py             # repuebla la BD desde Google Sheets
```

## Notas y discrepancias importantes

- **README desactualizado vs. código real**: el README menciona OpenAI y Railway, pero
  el código usa **Gemini** (`google-genai`) y por defecto **SQLite**. El stack real es
  Gemini + SQLite/PostgreSQL en Vercel.
- **Datos sensibles**: la BD contiene datos personales de heridos/fallecidos
  (~940 pacientes, 24 centros en el SQLite local). Tratar con cuidado. Por decisión de
  producto **no hay autenticación** (es una plataforma de información pública), por lo que
  los endpoints de escritura están abiertos.
- **CORS** restringido al dominio oficial (`https://venezolanosunidos.com` y `www`),
  configurable vía la env var `ALLOWED_ORIGINS` (lista separada por comas) para dev local.
- **Tabla `traductores`** no existe aún en el SQLite local (se crea al arrancar la app);
  los datos vivos están en la PostgreSQL de producción.
- El proyecto nació de una motivación personal/humanitaria del autor (ver README).
