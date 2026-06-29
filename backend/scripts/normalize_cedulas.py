"""
Normaliza las cédulas YA guardadas a formato canónico (ej. '22.504.101' -> 'V22504101'),
para que sean buscables. NO destructivo (solo UPDATE de cedula_id no nulas).

Hace el trabajo con UPDATEs masivos del lado del servidor (rápido: 2 statements, no una
consulta por fila). Orientado a PostgreSQL (usa regexp_replace y el operador !~).

Dry-run por defecto:   python scripts/normalize_cedulas.py
Aplicar:               python scripts/normalize_cedulas.py --apply
"""
import os
import sys
import argparse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sqlalchemy import text
from database import engine

# Cédula ya canónica: letra V/E + 6-9 dígitos
CANON = r"'^[VE][0-9]{6,9}$'"
# Dígitos contenidos en el valor, ignorando separadores
DIGITS = r"regexp_replace(cedula_id, '\D', '', 'g')"

# Filtro: no nula, no canónica todavía
NOT_CANON = f"cedula_id IS NOT NULL AND cedula_id !~ {CANON}"

# UPDATE 1: normaliza formato preservando E/V (los crudos sin letra quedan V)
SQL_NORMALIZE = text(rf"""
  UPDATE pacientes
  SET cedula_id =
    (CASE WHEN upper(regexp_replace(cedula_id, '[.\s-]', '', 'g')) LIKE 'E%' THEN 'E' ELSE 'V' END)
    || {DIGITS}
  WHERE {NOT_CANON}
    AND length({DIGITS}) BETWEEN 6 AND 9
""")

# UPDATE 2: valores sin una cédula válida -> NULL
SQL_TO_NULL = text(rf"""
  UPDATE pacientes SET cedula_id = NULL
  WHERE {NOT_CANON}
    AND length({DIGITS}) NOT BETWEEN 6 AND 9
""")


def main(apply: bool):
    print(f"=== Normalización de cédulas existentes — {'APPLY' if apply else 'DRY-RUN'} ===\n")
    conn = engine.connect()
    trans = conn.begin()

    total = conn.execute(text("SELECT count(*) FROM pacientes WHERE cedula_id IS NOT NULL")).scalar()
    a_norm = conn.execute(text(
        f"SELECT count(*) FROM pacientes WHERE {NOT_CANON} AND length({DIGITS}) BETWEEN 6 AND 9")).scalar()
    a_null = conn.execute(text(
        f"SELECT count(*) FROM pacientes WHERE {NOT_CANON} AND length({DIGITS}) NOT BETWEEN 6 AND 9")).scalar()

    print(f"total con cédula no-nula: {total}")
    print(f"  ya canónicas (sin cambio): {total - a_norm - a_null}")
    print(f"  a normalizar (formato):    {a_norm}")
    print(f"  texto inválido -> NULL:    {a_null}")

    # Muestra de cómo quedarían
    muestra = conn.execute(text(rf"""
      SELECT cedula_id,
        (CASE WHEN upper(regexp_replace(cedula_id, '[.\s-]', '', 'g')) LIKE 'E%' THEN 'E' ELSE 'V' END) || {DIGITS}
      FROM pacientes
      WHERE {NOT_CANON} AND length({DIGITS}) BETWEEN 6 AND 9
      LIMIT 8
    """)).all()
    if muestra:
        print("\n  ejemplos:")
        for old, new in muestra:
            print(f"    {old:<16} -> {new}")

    if apply:
        r1 = conn.execute(SQL_NORMALIZE)
        r2 = conn.execute(SQL_TO_NULL)
        trans.commit()
        print(f"\n>>> APLICADO: normalizadas {r1.rowcount}, a NULL {r2.rowcount}.")
    else:
        trans.rollback()
        print("\n>>> DRY-RUN: nada escrito. Re-ejecuta con --apply.")
    conn.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    main(ap.parse_args().apply)
