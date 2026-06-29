# Informe de investigación: scraping de fuentes externas + revisión de datos

> Rama `data/external-scrapers`. Investigación read-only. **No se escribió nada en la BD.**

## 1. Mapa de fuentes externas (qué se puede sacar de cada sitio)

Investigué cada web de la lista `RESOURCES`. La realidad: **no hay un scraper único**;
cada sitio está hecho distinto y la mayoría son SPAs cuya data viene de una API privada.

| Sitio | Entidad | Tecnología | Acceso a la data | Viabilidad |
|-------|---------|-----------|------------------|-----------|
| venezuelareporta.org | Desaparecidos (con foto) | Next.js + Supabase (server-side) | Data en payload RSC; Supabase llamado desde el servidor, **sin anon key en el cliente** | 🟡 Media — requiere parsear el RSC flight (frágil) |
| venezuelatebusca.com | Desaparecidos | React+Vite SPA | API privada no localizada en bundle | 🔴 Requiere navegador headless |
| desaparecidosterremotovenezuela.com | Desaparecidos | SPA | No localizada | 🔴 Headless |
| pacientesterremotovzla.lovable.app | Pacientes | Lovable (Supabase) | anon key/endpoint no extraídos del bundle | 🟡 Posible si se ubica el endpoint |
| hospitalesenvenezuela.com | Centros (directorio) | Next.js | Server-rendered (HTML con texto) | 🟢 Scraping HTML viable |
| refugiosvenezuela.com | Refugios | Next.js (client) | API `/api/...` no expuesta en HTML | 🟡 Headless o ubicar API |
| ayudaparavenezuela.com | Centros de acopio | SPA pura | No localizada | 🔴 Headless |
| zonasegurave.com | Lugares/zonas | Express API | `/api/places?lat=&lng=` → devuelve **elementos OSM** (OpenStreetMap), necesita coordenadas | 🟢 API, pero es data OSM, no curada |

**Conclusión:** el camino más confiable NO es scrapear, es **pedir el feed/export oficial**
a cada proyecto (varios ya comparten Google Sheets, que es como alimentamos la BD hoy).
El scraping queda como plan B y requiere trabajo bespoke por sitio (y headless para varios).

## 2. Hallazgo crítico: estos sitios son de DESAPARECIDOS, no de pacientes

La mayoría de las fuentes con "datos de personas" listan **desaparecidos / personas buscadas**,
que es una **entidad distinta** a nuestro `Paciente` (alguien ingresado en un centro de salud).
Mezclarlos sin distinción corrompe la semántica de la búsqueda. De hecho **nuestra BD ya los
mezcla**: hay 1.942 `No ingresado / Desaparecido` y 283 `Rescatado` dentro de `pacientes`.

## 3. Calidad de datos actual (BD de producción, 9.407 registros)

Análisis read-only sobre la BD real:

| Métrica | Valor | Problema |
|---------|-------|----------|
| Cédula ausente | **87%** (3.978 `No documentado` + 3.770 `NO_REGISTRA` + 468 `""`) | **3 placeholders distintos** para "sin cédula" → el dedup por cédula está roto |
| `sexo` | **100% NULL** | Columna muerta, nunca se llena |
| `edad` NULL | 61% | |
| `procedencia` NULL | 59% | |
| `diagnostico` NULL | 48% | |
| `id_ubicacion` (centro) NULL | 46% | casi la mitad sin centro asignado |
| Centros con `ciudad_zona` NULL | 25 de 35 | la "zona" en búsqueda/dashboard casi siempre vacía |
| Grupos de cédula duplicada | 180 | sin unicidad a nivel de BD |
| `condicion_actual` | texto libre inconsistente | `Ingresado` vs `Internado` (sinónimos), `Alta` vs `Alta Médica` |

## 4. Revisión del modelo y mejoras propuestas

### 4.1 Normalizar `condicion_actual` (hoy texto libre)
Unificar a un conjunto fijo: `INGRESADO`, `ALTA`, `FALLECIDO`, `RESCATADO`, `DESAPARECIDO`,
`DESCONOCIDA`. (`Internado`→`INGRESADO`, `Alta Médica`→`ALTA`).

### 4.2 Un solo placeholder para cédula ausente
Migrar `NO_REGISTRA` y `""` → `NULL` (o un único `"No documentado"`). Hoy el dedup falla
porque 3.770 registros "comparten" la cédula `NO_REGISTRA`. Idealmente `cedula_id` = `NULL`
cuando no hay, y un índice único parcial sobre cédulas reales.

### 4.3 Separar "estado del paciente" de "tipo de registro"
Modelar explícitamente si el registro es un **paciente en centro** vs un **desaparecido
buscado**, en vez de mezclarlos en `condicion_actual`. Sugerencia: campo `tipo_registro`
(`PACIENTE` | `DESAPARECIDO`) o tabla aparte para reportes de búsqueda.

### 4.4 Eliminar o poblar `sexo`
Está 100% NULL. O se borra la columna, o se empieza a capturar/inferir.

### 4.5 Integridad a nivel de BD
- Índice único parcial sobre `cedula_id` real (Postgres: `WHERE cedula_id IS NOT NULL`).
- `condicion_actual` como `Enum`/`CHECK`.
- `tipo_centro` y `condicion_actual` con valores controlados.

### 4.6 Trazabilidad de origen
`plataforma_origen` hoy guarda URLs crudas largas. Conviene una tabla `fuentes` (id, nombre,
url, tipo) y FK desde `pacientes`, para auditar de dónde vino cada registro.

### 4.7 Aprovechar `ContactoEmergencia`
La tabla existe pero tiene **0 filas**. Es justo lo que serviría para la reunificación
familiar (teléfono de contacto del reportante). Hoy se desaprovecha.

## 5. Recomendación de ejecución (segura y no destructiva)

1. **Pedir feeds oficiales** a los proyectos hermanos (vía WhatsApp/correo) — más confiable
   y ético que scrapear PII. Es como ya se alimenta la BD.
2. Para fuentes sin feed, construir **adaptadores bespoke** (uno por sitio) que desemboquen
   en un **merge solo-inserta-si-no-existe** (nunca borra), con dry-run previo.
3. Antes de tocar producción: ejecutar en **dry-run** y revisar el conteo de "nuevos".
4. Modelar `DESAPARECIDO` como entidad/estado propio para no contaminar la búsqueda de pacientes.
