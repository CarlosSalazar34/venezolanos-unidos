import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
import math
from datetime import datetime
import re

# Add the parent directory to the sys path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
import models

# Recreate tables (Warning: this deletes existing data for a clean import during dev)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# URL of the Google Sheet we tested
CSV_URL = "https://docs.google.com/spreadsheets/d/1wzpm_7pd0fC4hFou5FzppMNeZkd6J6NvrPqy-PWNvRY/export?format=csv"

def clean_cedula(cedula_raw):
    if pd.isna(cedula_raw) or str(cedula_raw).strip() == "" or str(cedula_raw) == "-":
        return "No documentado"
    
    # Convert to string and remove common symbols
    c = str(cedula_raw).upper()
    c = re.sub(r'[^0-9VE]', '', c) # Keep only numbers, V and E
    
    # Standardize
    if c.startswith('V') or c.startswith('E'):
        return c
    elif len(c) > 0 and c[0].isdigit():
        return 'V' + c # Assume V if it's just numbers, common in Venezuela
    
    return c

def parse_date(date_str):
    if pd.isna(date_str):
        return None
    try:
        # Assuming format like "24-06-26" -> YY-MM-DD or DD-MM-YY
        # Let's try pandas to_datetime which is pretty smart
        dt = pd.to_datetime(date_str, format='mixed', dayfirst=True)
        return dt.date()
    except:
        return None

def main():
    print(f"Descargando datos desde: {CSV_URL}")
    try:
        df = pd.read_csv(CSV_URL)
        print(f"¡Datos descargados! {len(df)} filas encontradas.")
    except Exception as e:
        print(f"Error descargando el CSV: {e}")
        return

    db = SessionLocal()

    try:
        centros_cache = {} # Cache for centros de salud

        for index, row in df.iterrows():
            # Skip empty rows
            if pd.isna(row.get('Nombre')) and pd.isna(row.get('Apellido')):
                continue

            # 1. Handle Centro de Salud
            nombre_centro_raw = str(row.get('Centro donde se encuentra', 'No especificado')).strip()
            
            # Ensure it exists in DB
            if nombre_centro_raw not in centros_cache:
                centro = db.query(models.CentroSalud).filter_by(nombre_centro=nombre_centro_raw).first()
                if not centro:
                    centro = models.CentroSalud(
                        nombre_centro=nombre_centro_raw,
                        tipo_centro="Hospital", # Default
                        ciudad_zona=str(row.get('Procedencia', '')) if not pd.isna(row.get('Procedencia')) else None
                    )
                    db.add(centro)
                    db.commit()
                    db.refresh(centro)
                centros_cache[nombre_centro_raw] = centro.id_centro
            
            centro_id = centros_cache[nombre_centro_raw]

            # 2. Handle Paciente
            nombres = str(row.get('Nombre', '')).strip()
            if pd.isna(row.get('Nombre')) or nombres == "nan": nombres = "ILEGIBLE"

            apellidos = str(row.get('Apellido', '')).strip()
            if pd.isna(row.get('Apellido')) or apellidos == "nan": apellidos = "ILEGIBLE"

            cedula = clean_cedula(row.get('C.I.'))
            
            edad_raw = row.get('Edad')
            edad = None
            if not pd.isna(edad_raw):
                try:
                    edad = int(float(str(edad_raw).replace(',', '.')))
                except ValueError:
                    pass
            
            es_menor = edad is not None and edad < 18
            procedencia = str(row.get('Procedencia', '')) if not pd.isna(row.get('Procedencia')) else None

            # Deduplication Check
            # If a person with the same ID (and not "No documentado") exists, skip
            if cedula != "No documentado":
                exists = db.query(models.Paciente).filter(models.Paciente.cedula_id == cedula).first()
                if exists:
                    continue # Skip duplicate
            else:
                # Deduplicate by exact name and last name
                exists = db.query(models.Paciente).filter(
                    models.Paciente.nombres == nombres,
                    models.Paciente.apellidos == apellidos
                ).first()
                if exists:
                    continue

            # Check for death in Name/Last name fields (common in these lists)
            condicion = "Ingresado"
            if "(Fallecido)" in nombres or "(Fallecido)" in apellidos or "(Fallecido)" in str(procedencia):
                condicion = "Fallecido"
                nombres = nombres.replace("(Fallecido)", "").strip()
                apellidos = apellidos.replace("(Fallecido)", "").strip()
                procedencia = procedencia.replace("(Fallecido)", "").strip() if procedencia else None

            paciente = models.Paciente(
                nombres=nombres,
                apellidos=apellidos,
                cedula_id=cedula,
                edad=edad,
                es_menor=es_menor,
                procedencia=procedencia,
                id_ubicacion=centro_id,
                condicion_actual=condicion,
                fecha_registro=parse_date(row.get('Fecha del reporte')),
                plataforma_origen="Lista Digitalizada Google Sheets"
            )

            db.add(paciente)
        
        db.commit()
        print("¡Ingesta de datos completada exitosamente!")
        print(f"Total de pacientes registrados: {db.query(models.Paciente).count()}")
        print(f"Total de centros registrados: {db.query(models.CentroSalud).count()}")

    except Exception as e:
        print(f"Error procesando los datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
