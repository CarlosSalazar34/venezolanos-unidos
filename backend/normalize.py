"""
Normalización canónica de datos de pacientes. Fuente única de verdad para la API y la
ingesta, para que la BD no se vuelva a ensuciar (ver scripts/INFORME_DATOS.md).
"""
import re

# Valores que significan "sin cédula" -> se almacenan como NULL (None)
CEDULA_PLACEHOLDERS = {
    "", "no documentado", "no_registra", "no registra", "n/a", "na",
    "-", "s/c", "sc", "nan", "none", "null", "0",
}

# condicion_actual (en minúsculas) -> (condicion_canonica, tipo_registro)
_CONDICION_MAP = {
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


def clean_cedula(val):
    """Devuelve la cédula canónica (ej. 'V12345678') o None si no hay una válida.

    Tolera separadores comunes en Venezuela: 'V-12.345.678' -> 'V12345678'.
    """
    if val is None:
        return None
    s = str(val).strip()
    if s.lower() in CEDULA_PLACEHOLDERS:
        return None
    up = s.upper()
    # Quita puntos, espacios y guiones (separadores de miles) antes de buscar dígitos.
    cleaned = re.sub(r'[.\s\-]', '', up)
    m = re.search(r'(\d{6,9})', cleaned)
    if m:
        num = m.group(1)
        letra = 'E' if 'E' in cleaned[:m.start() + 1] else 'V'
        return f"{letra}{num}"
    return None


def canonical_condicion(val):
    """Devuelve (condicion_canonica, tipo_registro) para un texto de condición libre."""
    key = (val or "").strip().lower()
    return _CONDICION_MAP.get(key, ("Desconocida", "PACIENTE"))
