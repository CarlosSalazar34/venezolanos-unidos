import os
import uuid
import datetime
import random
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Base, engine
import models

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

load_dotenv()

app = FastAPI(title="Venezolanos Unidos API")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since this is local, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Data
RESOURCES = [
    { "category": "Personas desaparecidas", "name": "Venezuela Reporta", "url": "https://venezuelareporta.org/", "description": "Plataforma para reportar y buscar personas desaparecidas." },
    { "category": "Personas desaparecidas", "name": "Venezuela Te Busca", "url": "https://venezuelatebusca.com/", "description": "Base de datos de búsqueda familiar." },
    { "category": "Personas desaparecidas", "name": "Desaparecidos Terremoto Venezuela", "url": "https://desaparecidosterremotovenezuela.com/", "description": "Registro específico post-terremoto." },
    { "category": "Rescate y emergencia", "name": "Rescate VE", "url": "https://rescate-ve.vercel.app/", "description": "Información sobre operaciones de rescate activo." },
    { "category": "Daños estructurales", "name": "Terremoto Venezuela", "url": "https://terremotovenezuela.com/", "description": "Reporte de daños a infraestructura." },
    { "category": "Habitabilidad y evaluación", "name": "Habitable", "url": "https://habitable.lovable.app/", "description": "App para solicitar revisión de habitabilidad." },
    { "category": "Habitabilidad y evaluación", "name": "Grupo Ávila VE", "url": "https://www.instagram.com/grupoavila.ve", "description": "Expertos estructurales." },
    { "category": "Habitabilidad y evaluación", "name": "Guías JAQ Ingenieros (Guía)", "url": "https://drive.google.com/file/d/1MkdU19NXTHa92V2kf38OZXCdFt-zGLOn/view", "description": "Guía de Inspección Visual de Estructuras para No Ingenieros." },
    { "category": "Habitabilidad y evaluación", "name": "Guías JAQ Ingenieros (Planilla)", "url": "https://drive.google.com/file/d/1hHTXnc9bhDKI0u9aXh2dUbv8731LN1db/view", "description": "Planilla de Evaluación Visual Rápida." },
    { "category": "Centros de acopio", "name": "Ayuda para Venezuela", "url": "https://ayudaparavenezuela.com/", "description": "Mapa y lista de centros de acopio." },
    { "category": "Centros de acopio", "name": "VeneConnect", "url": "https://www.veneconnect.com/apoyo-terremoto", "description": "Conexión para enviar insumos y donaciones." },
    { "category": "Centros de acopio", "name": "Zona Segura", "url": "https://zonasegura.up.railway.app/", "description": "Identificación de zonas seguras y refugios." },
    { "category": "Alimentación y refugios", "name": "Refugios Venezuela", "url": "https://refugiosvenezuela.com/", "description": "Ubicación de refugios temporales activos." },
    { "category": "Alimentación y refugios", "name": "Zona Segura", "url": "https://zonasegura.up.railway.app/", "description": "Directorio de campamentos seguros." },
    { "category": "Apoyo médico y psicológico", "name": "Pacientes Terremoto VZLA", "url": "https://pacientesterremotovzla.lovable.app/", "description": "Solicitud de insumos y apoyo a pacientes afectados." },
    { "category": "Apoyo médico y psicológico", "name": "NueveOnce", "url": "https://www.nueveonce.com/", "description": "Servicios de paramédicos y ambulancias." },
    { "category": "Apoyo médico y psicológico", "name": "VenEmergencia", "url": "https://venemergencia.com/", "description": "Orientación médica de emergencia." },
    { "category": "Mascotas", "name": "HuellasCan", "url": "https://www.huellascan.com/terremoto", "description": "Rescate y refugio para mascotas extraviadas." },
    { "category": "Alimentación y refugios", "name": "Refugio San Bernardino", "url": "#", "description": "Complejo Cultural y Deportivo Guayana Esequiba" },
    { "category": "Alimentación y refugios", "name": "Refugio 23 de Enero", "url": "#", "description": "Estadio Chato Candela" },
    { "category": "Alimentación y refugios", "name": "Refugio El Paraíso", "url": "#", "description": "Sede del Instituto Nacional de Deportes" },
    { "category": "Alimentación y refugios", "name": "Refugio San Juan", "url": "#", "description": "Sede de Ipostel" },
    { "category": "Alimentación y refugios", "name": "Refugio Catia (Caro)", "url": "#", "description": "Liceo Miguel Antonio Caro" },
    { "category": "Alimentación y refugios", "name": "Parque Alí Primera (Catia)", "url": "#", "description": "Recepción, atención médica y traslados de La Guaira" },
    { "category": "Alimentación y refugios", "name": "Parque del Este", "url": "#", "description": "Parque Generalísimo Francisco de Miranda (Mcpio. Sucre) - Resguardo vecinos del este" },
    { "category": "Alimentación y refugios", "name": "Plaza Altamira", "url": "#", "description": "Resguardo y asistencia médica móvil (Mcpio. Chacao)" },
    { "category": "Alimentación y refugios", "name": "Refugio Santa Teresa", "url": "#", "description": "Unidad Educativa Nacional Francisco Pimentel" },
    { "category": "Alimentación y refugios", "name": "Refugio Santa Rosalía", "url": "#", "description": "Unidad Educativa Nacional Gran Colombia" },
    { "category": "Alimentación y refugios", "name": "Refugio El Junquito", "url": "#", "description": "Unidad Educativa Nacional Luís Hurtado Higuera" },
    { "category": "Centros de acopio", "name": "Plaza Bolívar de Chacao", "url": "#", "description": "Carpas, insumos y centro de acopio" },
    { "category": "Alimentación y refugios", "name": "Coliseo de Petare", "url": "#", "description": "Coliseo de La Urbina (La Urbina)" }
]

SYSTEM_PROMPT = f"""
Eres un asistente virtual de emergencia altamente empático, claro y directo. 
Tu propósito es ayudar a los venezolanos afectados por el reciente terremoto.
Tienes acceso a la siguiente lista de recursos y organizaciones: {RESOURCES}.
Si alguien te pregunta cómo encontrar a un familiar, diles qué links usar.
Si alguien necesita evaluación estructural o médica, dales los recursos apropiados.
Responde SIEMPRE de manera breve, compasiva y útil. No inventes información que no esté en la lista, pero si la situación lo requiere, aconseja mantener la calma y seguir a las autoridades.
Menciona el nombre del recurso y su URL para que el usuario pueda hacer clic.
"""

class ChatMessage(BaseModel):
    message: str

@app.get("/")
def root():
    return {"status": "ok", "message": "Backend running"}

@app.get("/api/resources")
def get_resources():
    return {"resources": RESOURCES}

@app.get("/api/pacientes/buscar")
def buscar_pacientes(
    q: str = Query(None, description="Término de búsqueda (Nombre, Apellido o Cédula)"),
    db: Session = Depends(get_db)
):
    if not q or len(q) < 3:
        return {"pacientes": []}

    q_lower = q.lower()
    
    # Try exact match for Cedula first (ignoring non-alphanumerics)
    cedula_q = ''.join(e for e in q.upper() if e.isalnum())
    
    # Query with SQLAlchemy ORM
    query = db.query(models.Paciente, models.CentroSalud).outerjoin(
        models.CentroSalud, models.Paciente.id_ubicacion == models.CentroSalud.id_centro
    ).filter(
        (models.Paciente.nombres.ilike(f"%{q_lower}%")) |
        (models.Paciente.apellidos.ilike(f"%{q_lower}%")) |
        (models.Paciente.cedula_id.ilike(f"%{cedula_q}%"))
    )

    results = query.all()
    
    pacientes_list = []
    for paciente, centro in results:
        pacientes_list.append({
            "id": paciente.id_paciente,
            "nombres": paciente.nombres,
            "apellidos": paciente.apellidos,
            "cedula": paciente.cedula_id,
            "edad": paciente.edad,
            "condicion": paciente.condicion_actual,
            "procedencia": paciente.procedencia,
            "fecha_reporte": paciente.fecha_registro,
            "centro_nombre": centro.nombre_centro if centro else "Desconocido",
            "centro_zona": centro.ciudad_zona if centro else "Desconocida",
        })

    return {"pacientes": pacientes_list}

@app.get("/api/estadisticas")
def get_estadisticas(db: Session = Depends(get_db)):
    total_pacientes = db.query(models.Paciente).count()
    total_centros = db.query(models.CentroSalud).count()
    
    # Condicion breakdown
    condiciones = db.query(
        models.Paciente.condicion_actual, 
        func.count(models.Paciente.id_paciente)
    ).group_by(models.Paciente.condicion_actual).all()
    
    condicion_data = [{"name": c[0] or "Desconocido", "value": c[1]} for c in condiciones]
    
    # Top 5 hospitals
    hospitales = db.query(
        models.CentroSalud.nombre_centro,
        func.count(models.Paciente.id_paciente)
    ).join(
        models.Paciente, models.Paciente.id_ubicacion == models.CentroSalud.id_centro
    ).group_by(models.CentroSalud.nombre_centro).order_by(
        func.count(models.Paciente.id_paciente).desc()
    ).limit(5).all()
    
    hospitales_data = [{"name": h[0], "pacientes": h[1]} for h in hospitales]
    
    return {
        "total_pacientes": total_pacientes,
        "total_centros": total_centros,
        "condiciones": condicion_data,
        "hospitales": hospitales_data
    }

class PacienteCreate(BaseModel):
    nombres: str
    apellidos: str
    cedula: str
    edad: int = None
    hospital: str
    condicion: str
    procedencia: str = None

@app.post("/api/pacientes")
def create_paciente(paciente: PacienteCreate, db: Session = Depends(get_db)):
    # Find or create center
    centro = db.query(models.CentroSalud).filter(models.CentroSalud.nombre_centro.ilike(f"%{paciente.hospital}%")).first()
    if not centro:
        centro = models.CentroSalud(nombre_centro=paciente.hospital.title(), tipo_centro="Hospital")
        db.add(centro)
        db.commit()
        db.refresh(centro)
        
    nuevo_paciente = models.Paciente(
        nombres=paciente.nombres.title(),
        apellidos=paciente.apellidos.title(),
        cedula_id=paciente.cedula,
        edad=paciente.edad,
        procedencia=paciente.procedencia.title() if paciente.procedencia else None,
        id_ubicacion=centro.id_centro,
        condicion_actual=paciente.condicion,
        plataforma_origen="Formulario Web Manual"
    )
    
    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente)
    
    return {"status": "success", "paciente_id": nuevo_paciente.id_paciente}

class TraductorCreate(BaseModel):
    nombres: str
    idiomas: str
    telefono: str
    zona: str = None
    disponibilidad: str = None
    pin_seguridad: str

@app.post("/api/traductores")
def create_traductor(traductor: TraductorCreate, db: Session = Depends(get_db)):
    nuevo_traductor = models.Traductor(
        nombres=traductor.nombres.title(),
        idiomas=traductor.idiomas,
        telefono=traductor.telefono,
        zona=traductor.zona.title() if traductor.zona else None,
        disponibilidad=traductor.disponibilidad.title() if traductor.disponibilidad else None,
        pin_seguridad=traductor.pin_seguridad
    )
    db.add(nuevo_traductor)
    db.commit()
    db.refresh(nuevo_traductor)
    return {"status": "success", "traductor_id": nuevo_traductor.id_traductor}

@app.get("/api/traductores")
def get_traductores(q: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Traductor)
    if q:
        query = query.filter(
            (models.Traductor.idiomas.ilike(f"%{q}%")) |
            (models.Traductor.nombres.ilike(f"%{q}%"))
        )
    traductores = query.order_by(models.Traductor.fecha_registro.desc()).all()
    return {"traductores": [
        {
            "id": t.id_traductor,
            "nombres": t.nombres,
            "idiomas": t.idiomas,
            "telefono": t.telefono,
            "zona": t.zona,
            "disponibilidad": t.disponibilidad,
            "fecha_registro": t.fecha_registro
        } for t in traductores
    ]}

@app.delete("/api/traductores/{traductor_id}")
def delete_traductor(traductor_id: str, pin_seguridad: str = Query(...), db: Session = Depends(get_db)):
    traductor = db.query(models.Traductor).filter(models.Traductor.id_traductor == traductor_id).first()
    if not traductor:
        raise HTTPException(status_code=404, detail="Traductor no encontrado")
    if traductor.pin_seguridad != pin_seguridad:
        raise HTTPException(status_code=403, detail="PIN incorrecto")
    
    db.delete(traductor)
    db.commit()
    return {"status": "success"}

@app.post("/api/chat")
def chat_with_ai(chat: ChatMessage):
    try:
        # Create a new chat session to use the system prompt logic
        chat_session = client.chats.create(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3,
            )
        )
        response = chat_session.send_message(chat.message)
        return {"response": response.text}
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Fallback mechanism for any blocks
        msg = chat.message.lower()
        if "buscar" in msg or "desaparecido" in msg or "familiar" in msg:
            fallback = "Puedes buscar a tus familiares en la pestaña 'Buscar Personas' de esta página, o en plataformas como:\n- Venezuela Reporta: https://venezuelareporta.org\n- Venezuela Te Busca: https://venezuelatebusca.com"
        elif "acopio" in msg or "donar" in msg or "ayuda" in msg:
            fallback = "Puedes encontrar centros de acopio en:\n- Ayuda para Venezuela: https://ayudaparavenezuela.com\n- Zona Segura: https://zonasegura.up.railway.app"
        elif "hospital" in msg or "medico" in msg or "médico" in msg or "ambulancia" in msg:
            fallback = "Si necesitas ayuda médica urgente, contacta a NueveOnce (https://www.nueveonce.com) o VenEmergencia (https://venemergencia.com)."
        else:
            fallback = "Hola, soy el asistente virtual de rescate. Lamentablemente los servicios de IA están bloqueados en tu región en este momento, pero mi sistema de emergencia local sigue activo. Pregúntame por: desaparecidos, centros de acopio o ayuda médica."
        return {"response": fallback}
