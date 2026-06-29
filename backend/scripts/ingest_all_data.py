import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal, engine, Base
import models
from normalize import clean_cedula as normalize_cedula

URLS = [
    "https://docs.google.com/spreadsheets/d/1wzpm_7pd0fC4hFou5FzppMNeZkd6J6NvrPqy-PWNvRY/export?format=csv",
    "https://docs.google.com/spreadsheets/d/1EQ-_ENQUhtLaTdZtyhLZuSJZ7WG4RUuyc7ipGc7emhM/export?format=csv&gid=717213385",
    "https://docs.google.com/spreadsheets/d/1qp8auzPK5d_hH5cPpTBhlKOpVDNeO0SiXT-aJmTE3ek/export?format=csv&gid=1503366664",
    "https://docs.google.com/spreadsheets/d/1WpmBGPv74EDZxI-Q7YWVAMTO60Kcozg4aRr5tzLTVjs/export?format=csv&gid=0",
    "https://docs.google.com/spreadsheets/d/1Nl6YeTjYQUNrdFsq88hhuq5SCxFIP5TfimOkhslEKE8/export?format=csv&gid=0",
    "https://docs.google.com/spreadsheets/d/1k0Nwl7Hk2b5ZQNwYfjtkHOKm_4v2ZkVakj5qlcsggeM/export?format=csv&gid=0",
    "https://docs.google.com/spreadsheets/d/15rPT2geAQLirrpCKN8a4YruE5SuyIOl21BSSMJ9cGR4/export?format=csv&gid=16072054",
    "https://docs.google.com/spreadsheets/d/1VUxxtjBXhBptsdz4hoj-Su1rt1ve_hEu8S4xJb_lu-E/export?format=csv&gid=1811788722",
    "https://drive.google.com/uc?export=download&id=1l8ZU8BJva6dCSMALF3nacH4c9tr9VPQF",
    "https://drive.google.com/uc?export=download&id=15gUXyoBjsZK8RlixGotv635uY4t1m5Wu",
    "https://drive.google.com/uc?export=download&id=1FPDaQY7RKk5HkyjFTE63MH1lBHymxRMg"
]

def clean_cedula(val):
    # Delega en la normalización canónica compartida (devuelve None si no hay cédula).
    if pd.isna(val):
        return None
    return normalize_cedula(val)

def get_col(row, possible_names):
    for name in possible_names:
        if name in row and not pd.isna(row[name]):
            return row[name]
    return None

def process_dataframe(df, db, source_url, existing_cedulas, existing_names, centros_cache):
    # Try to find header row if it's messy (e.g. Unnamed cols)
    if any(col for col in df.columns if 'Unnamed' in str(col)):
        # Search first 5 rows for something that looks like a header
        for i in range(min(5, len(df))):
            row_vals = df.iloc[i].tolist()
            if any('nombre' in str(val).lower() or 'cedula' in str(val).lower() or 'c.i' in str(val).lower() for val in row_vals):
                df.columns = df.iloc[i]
                df = df.iloc[i+1:].reset_index(drop=True)
                break

    # Convert all columns to lowercase string for easier matching
    df.columns = [str(c).lower().strip() for c in df.columns]
    
    # Map possible columns
    col_nombre = next((c for c in df.columns if 'nombre' in c and 'apellido' not in c), None)
    col_apellido = next((c for c in df.columns if 'apellido' in c and 'nombre' not in c), None)
    col_nombre_completo = next((c for c in df.columns if 'nombre y apellido' in c or 'nombres y apellidos' in c or 'paciente' in c), None)
    col_cedula = next((c for c in df.columns if 'c.i' in c or 'cedula' in c or 'cédula' in c or 'id' in c), None)
    col_edad = next((c for c in df.columns if 'edad' in c), None)
    col_hospital = next((c for c in df.columns if 'hospital' in c or 'centro' in c or 'ubicación' in c or 'ubicacion' in c), None)
    col_procedencia = next((c for c in df.columns if 'procedencia' in c or 'origen' in c), None)

    for index, row in df.iterrows():
        nombres = get_col(row, [col_nombre]) if col_nombre else None
        apellidos = get_col(row, [col_apellido]) if col_apellido else None
        
        if col_nombre_completo and not nombres and not apellidos:
            val = str(get_col(row, [col_nombre_completo]) or "").strip()
            parts = val.split(" ", 1)
            if len(parts) == 2:
                nombres, apellidos = parts[0], parts[1]
            else:
                nombres = val
                apellidos = ""

        if pd.isna(nombres) and pd.isna(apellidos) and not nombres:
            continue
            
        nombres_str = str(nombres).strip() if nombres else "ILEGIBLE"
        apellidos_str = str(apellidos).strip() if apellidos and not pd.isna(apellidos) else ""

        cedula_raw = get_col(row, [col_cedula]) if col_cedula else None
        cedula = clean_cedula(cedula_raw)

        edad_raw = get_col(row, [col_edad]) if col_edad else None
        edad = None
        if edad_raw:
            try:
                edad = int(float(str(edad_raw).replace(',', '.')))
            except:
                pass
        
        centro_raw = get_col(row, [col_hospital]) if col_hospital else None
        nombre_centro_raw = str(centro_raw).strip() if centro_raw and not pd.isna(centro_raw) else "No especificado"

        procedencia_raw = get_col(row, [col_procedencia]) if col_procedencia else None
        procedencia = str(procedencia_raw).strip() if procedencia_raw and not pd.isna(procedencia_raw) else None

        if nombre_centro_raw not in centros_cache:
            centro = db.query(models.CentroSalud).filter_by(nombre_centro=nombre_centro_raw).first()
            if not centro:
                centro = models.CentroSalud(nombre_centro=nombre_centro_raw, tipo_centro="Hospital")
                db.add(centro)
                db.commit()
                db.refresh(centro)
            centros_cache[nombre_centro_raw] = centro.id_centro
        
        centro_id = centros_cache[nombre_centro_raw]

        if cedula:
            if cedula in existing_cedulas: continue
            existing_cedulas.add(cedula)
        else:
            name_key = f"{nombres_str}-{apellidos_str}"
            if name_key in existing_names: continue
            existing_names.add(name_key)

        condicion = "Ingresado"
        nombres_lower = str(nombres_str).lower()
        apellidos_lower = str(apellidos_str).lower()
        if "(fallecido)" in nombres_lower or "(fallecido)" in apellidos_lower:
            condicion = "Fallecido"
            nombres_str = re.sub(r'\(fallecido\)', '', str(nombres_str), flags=re.IGNORECASE).strip()
            apellidos_str = re.sub(r'\(fallecido\)', '', str(apellidos_str), flags=re.IGNORECASE).strip()

        paciente = models.Paciente(
            nombres=nombres_str,
            apellidos=apellidos_str,
            cedula_id=cedula,
            edad=edad,
            es_menor=(edad is not None and edad < 18),
            procedencia=procedencia.title() if procedencia else None,
            id_ubicacion=centro_id,
            condicion_actual=condicion,
            tipo_registro="PACIENTE",
            plataforma_origen=source_url
        )
        db.add(paciente)
    
    # Commit a nivel de archivo para evitar transacciones demasiado grandes y locks
    db.commit()

def main():
    db = SessionLocal()
    db.query(models.Paciente).delete()
    db.query(models.CentroSalud).delete()
    db.commit()

    existing_cedulas = set()
    existing_names = set()
    centros_cache = {}

    for url in URLS:
        print(f"Procesando: {url.split('/')[-1]}")
        try:
            if "export=download" in url:
                df = pd.read_excel(url)
            else:
                df = pd.read_csv(url)
            process_dataframe(df, db, url, existing_cedulas, existing_names, centros_cache)
        except Exception as e:
            import traceback
            print(f"  -> Error: {e}")
            print(traceback.format_exc())

    print(f"Total Pacientes en DB: {db.query(models.Paciente).count()}")
    db.close()

if __name__ == "__main__":
    main()
