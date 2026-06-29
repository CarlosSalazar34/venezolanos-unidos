"""
Normaliza y limpia la BD de pacientes. NO destructivo (solo ALTER/UPDATE, nunca DELETE).

Por defecto corre en DRY-RUN: reporta qué cambiaría sin tocar nada.
Para aplicar de verdad:  python scripts/migrate_normalize.py --apply

Usa SQL crudo a propósito, para no depender del ORM mientras el schema y el modelo
difieren (la columna tipo_registro puede no existir aún en la BD).

Operaciones:
  1. Agrega la columna tipo_registro si no existe (PACIENTE | DESAPARECIDO).
  2. Unifica los placeholders de cédula ausente ('No documentado', 'NO_REGISTRA', '', ...)
     a NULL, para arreglar el dedup roto.
  3. Normaliza condicion_actual a un conjunto canónico (sinónimos -> valor único) y
     marca tipo_registro = DESAPARECIDO para los reportes de búsqueda.
"""
import os
import sys
import argparse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sqlalchemy import text, inspect
from database import engine

CEDULA_PLACEHOLDERS = ["no documentado", "no_registra", "no registra", "", "n/a", "-", "s/c"]

# condicion_actual (en minúsculas) -> (condicion_canonica, tipo_registro)
CONDICION_MAP = {
    "ingresado": ("Ingresado", "PACIENTE"),
    "internado": ("Ingresado", "PACIENTE"),
    "alta": ("Alta", "PACIENTE"),
    "alta médica": ("Alta", "PACIENTE"),
    "alta medica": ("Alta", "PACIENTE"),
    "fallecido": ("Fallecido", "PACIENTE"),
    "rescatado": ("Rescatado", "PACIENTE"),
    "no ingresado / desaparecido": ("Desaparecido", "DESAPARECIDO"),
    "desaparecido": ("Desaparecido", "DESAPARECIDO"),
    "desconocida": ("Desconocida", "PACIENTE"),
}


def column_exists(table, col):
    return col in [c["name"] for c in inspect(engine).get_columns(table)]


def main(apply: bool):
    print(f"=== Normalización de BD — modo: {'APPLY (escribe)' if apply else 'DRY-RUN (no escribe)'} ===\n")
    conn = engine.connect()
    trans = conn.begin()

    # 1) columna tipo_registro
    has_col = column_exists("pacientes", "tipo_registro")
    print(f"[1] columna tipo_registro existe: {has_col}")
    if not has_col:
        print("    -> ALTER TABLE pacientes ADD COLUMN tipo_registro VARCHAR(20) DEFAULT 'PACIENTE'")
        if apply:
            conn.execute(text("ALTER TABLE pacientes ADD COLUMN tipo_registro VARCHAR(20) DEFAULT 'PACIENTE'"))
            has_col = True
            print("    -> aplicado.")

    # 2) cédula ausente -> NULL
    print("\n[2] cédula ausente -> NULL")
    total_ced = 0
    for ph in CEDULA_PLACEHOLDERS:
        n = conn.execute(text("SELECT count(*) FROM pacientes WHERE lower(trim(cedula_id)) = :ph"),
                         {"ph": ph}).scalar()
        if n:
            total_ced += n
            label = repr(ph) if ph else "'' (vacío)"
            print(f"    {label}: {n}")
            if apply:
                conn.execute(text("UPDATE pacientes SET cedula_id = NULL WHERE lower(trim(cedula_id)) = :ph"),
                             {"ph": ph})
    print(f"    TOTAL -> NULL: {total_ced}")

    # 3) condicion_actual canónica + tipo_registro
    print("\n[3] condicion_actual -> canónica (+ tipo_registro)")
    rows = conn.execute(text(
        "SELECT condicion_actual, count(*) FROM pacientes GROUP BY condicion_actual ORDER BY count(*) DESC")).all()
    cambios_cond = 0
    desaparecidos = 0
    for cond, n in rows:
        key = (cond or "").strip().lower()
        canon, tipo = CONDICION_MAP.get(key, ("Desconocida", "PACIENTE"))
        marca = ""
        if canon != (cond or ""):
            cambios_cond += n
            marca = f" -> '{canon}'"
        if tipo == "DESAPARECIDO":
            desaparecidos += n
            marca += "  [DESAPARECIDO]"
        print(f"    {repr(cond)} x{n}{marca}")
        if apply and has_col:
            if cond is None:
                conn.execute(text("UPDATE pacientes SET condicion_actual=:c, tipo_registro=:t WHERE condicion_actual IS NULL"),
                             {"c": canon, "t": tipo})
            else:
                conn.execute(text("UPDATE pacientes SET condicion_actual=:c, tipo_registro=:t WHERE condicion_actual=:old"),
                             {"c": canon, "t": tipo, "old": cond})
    print(f"    a renombrar: {cambios_cond} | a marcar DESAPARECIDO: {desaparecidos}")

    if apply:
        trans.commit()
        print("\n>>> CAMBIOS APLICADOS Y COMMITEADOS.")
    else:
        trans.rollback()
        print("\n>>> DRY-RUN: nada escrito. Re-ejecuta con --apply para aplicar.")
    conn.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="aplica los cambios (sin esto es dry-run)")
    main(ap.parse_args().apply)
