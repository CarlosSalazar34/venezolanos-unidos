from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Date, Time, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import uuid

# --- Valores canónicos (ver scripts/INFORME_DATOS.md) ---
# Distingue a quien está bajo cuidado en un centro de quien está siendo buscado.
TIPO_PACIENTE = "PACIENTE"
TIPO_DESAPARECIDO = "DESAPARECIDO"

# Conjunto controlado para condicion_actual (antes era texto libre con sinónimos).
CONDICIONES = ("Ingresado", "Alta", "Fallecido", "Rescatado", "Desaparecido", "Desconocida")

# Placeholder único para "sin cédula" (antes había 3: 'No documentado', 'NO_REGISTRA', '').
CEDULA_AUSENTE = None  # se almacena como NULL

class CentroSalud(Base):
    __tablename__ = "centros_salud"

    id_centro = Column(Integer, primary_key=True, index=True)
    nombre_centro = Column(String, unique=True, index=True)
    tipo_centro = Column(String) # Hospital, Clínica, Refugio, Centro de Acopio
    ciudad_zona = Column(String)

    pacientes = relationship("Paciente", back_populates="centro")

class Paciente(Base):
    __tablename__ = "pacientes"

    id_paciente = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    nombres = Column(String, index=True)
    apellidos = Column(String, index=True)
    cedula_id = Column(String, index=True) # Normalized CI
    edad = Column(Integer, nullable=True)
    es_menor = Column(Boolean, default=False)
    sexo = Column(String, nullable=True)
    procedencia = Column(String, nullable=True)
    
    id_ubicacion = Column(Integer, ForeignKey("centros_salud.id_centro"), nullable=True)
    area_servicio = Column(String, nullable=True)
    piso_cama = Column(String, nullable=True)
    
    diagnostico = Column(Text, nullable=True)
    condicion_actual = Column(String(50))
    # PACIENTE (en un centro) vs DESAPARECIDO (persona buscada). Ver INFORME_DATOS.md
    tipo_registro = Column(String(20), default=TIPO_PACIENTE, index=True)

    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    hora_registro = Column(Time, server_default=func.now())
    plataforma_origen = Column(String(250))

    centro = relationship("CentroSalud", back_populates="pacientes")
    contactos = relationship("ContactoEmergencia", back_populates="paciente")

class Traductor(Base):
    __tablename__ = "traductores"
    
    id_traductor = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nombres = Column(String(100), nullable=False)
    idiomas = Column(String(250), nullable=False)
    telefono = Column(String(20), nullable=False)
    zona = Column(String(100))
    disponibilidad = Column(String(100))
    pin_seguridad = Column(String(20), nullable=False) # For simple deletion verification
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())

class ContactoEmergencia(Base):
    __tablename__ = "contactos_emergencia"

    id_contacto = Column(Integer, primary_key=True, index=True)
    id_paciente = Column(String, ForeignKey("pacientes.id_paciente"))
    nombre_familiar = Column(String)
    tiene_familiar = Column(Boolean, default=False)
    telefono = Column(String, nullable=True)

    paciente = relationship("Paciente", back_populates="contactos")
