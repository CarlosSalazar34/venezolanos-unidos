# Informe de datos: fuentes, calidad y mejoras del modelo

> Análisis read-only de la base de datos de pacientes. **No se escribió nada en la BD
> durante el análisis**; los cambios se aplicaron después con `migrate_normalize.py`.

## 1. De dónde vienen los datos (método)

La base se alimenta de dos vías legítimas, **sin web scraping**:

1. **Consolidación de hojas colaborativas** (`ingest_all_data.py`): voluntarios y hospitales
   mantienen planillas en **Google Sheets / Google Drive** (Excel/CSV). El script las
   descarga, las limpia con Pandas (detecta columnas aunque cada hoja tenga formato
   distinto), normaliza, deduplica e inserta en la base central.
2. **Reporte manual** (`POST /api/pacientes`): rescatistas y familiares ingresan personas
   directamente desde el formulario web `/reportar`.

Para incorporar más fuentes, el camino recomendado es **solicitar el feed/export oficial**
a cada proyecto aliado (acuerdo de compartición de datos), no extraer datos de sus sitios.
Es más confiable, respeta la privacidad de las personas y es como ya se alimenta la base hoy.

## 2. Hallazgo: pacientes vs. desaparecidos

Las fuentes mezclan dos entidades distintas: **pacientes** (alguien ingresado en un centro)
y **desaparecidos** (personas que están siendo buscadas). La BD ya los tenía mezclados:
1.942 registros eran `No ingresado / Desaparecido` y 283 `Rescatado` dentro de `pacientes`.
Mezclarlos sin distinción ensucia la búsqueda; por eso se separó con `tipo_registro`.

## 3. Calidad de datos (BD de producción, 9.407 registros)

| Métrica | Valor | Problema |
|---------|-------|----------|
| Cédula ausente | **87%** (3.978 `No documentado` + 3.770 `NO_REGISTRA` + 468 `""`) | **3 placeholders distintos** para "sin cédula" → el dedup por cédula estaba roto |
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
Unificar a un conjunto fijo: `Ingresado`, `Alta`, `Fallecido`, `Rescatado`, `Desaparecido`,
`Desconocida`. (`Internado`→`Ingresado`, `Alta Médica`→`Alta`). **Hecho** vía `normalize.py`.

### 4.2 Un solo placeholder para cédula ausente
Migrar `NO_REGISTRA` y `""` → `NULL`. El dedup fallaba porque 3.770 registros "compartían"
la cédula `NO_REGISTRA`. **Hecho**: ahora la cédula ausente es `NULL`. Además `clean_cedula`
tolera separadores (`V-12.345.678` → `V12345678`), recuperando cédulas que antes se botaban.

### 4.3 Separar paciente de desaparecido
Campo `tipo_registro` (`PACIENTE` | `DESAPARECIDO`). **Hecho**.

### 4.4 Eliminar o poblar `sexo`
Está 100% NULL. O se borra la columna, o se empieza a capturar. **Pendiente**.

### 4.5 Integridad a nivel de BD (pendiente)
- Índice único parcial sobre `cedula_id` real (Postgres: `WHERE cedula_id IS NOT NULL`).
- `condicion_actual` / `tipo_centro` como valores controlados (Enum/CHECK).

### 4.6 Trazabilidad de origen (pendiente)
`plataforma_origen` guarda URLs crudas. Conviene una tabla `fuentes` (id, nombre, tipo) con
FK desde `pacientes`, para auditar de dónde vino cada registro.

### 4.7 Aprovechar `ContactoEmergencia` (pendiente)
La tabla existe pero tiene **0 filas**. Es justo lo que serviría para la reunificación
familiar (teléfono del reportante). Hoy se desaprovecha.

## 5. Resultado de la normalización aplicada (`migrate_normalize.py`)

Migración no destructiva (solo `ALTER`/`UPDATE`, nunca `DELETE`), con respaldo previo:
- **Cédula:** 8.216 placeholders → NULL. Las cédulas reales quedaron intactas.
- **condicion_actual:** 4.596 valores renombrados a su forma canónica.
- **tipo_registro:** 1.942 registros marcados `DESAPARECIDO`; el resto `PACIENTE`.
- Sin pérdida de registros (9.407 antes y después).
