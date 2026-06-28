import os
import pandas as pd
import sqlite3

# Usamos ruta relativa o absoluta para la BD
db_path = "/Users/carlossalazar/proyectos/venezolanos-unidos/backend/venezolanos_unidos.db"
conn = sqlite3.connect(db_path)

# Obtener los datos
df_centros = pd.read_sql_query("SELECT * FROM centros_salud", conn)
df_pacientes = pd.read_sql_query("SELECT * FROM pacientes", conn) 

print("=========================================================")
print(f"TOTAL CENTROS DE SALUD REGISTRADOS: {len(df_centros)}")
print("=========================================================")
print(df_centros.to_markdown(index=False))

print("\n\n=========================================================")
print(f"TOTAL PACIENTES REGISTRADOS: {len(df_pacientes)}")
print("=========================================================")
# Para evitar colapsar la terminal si hay miles, imprimimos todos con to_markdown o to_string
# Puedes cambiar to_markdown por to_string() si prefieres otro formato
print(df_pacientes.to_markdown(index=False))

print("\n--- Fin del reporte ---")
