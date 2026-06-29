import os
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./venezolanos_unidos.db")

# Si es SQLite, necesitamos connect_args. Si es PostgreSQL, no.
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # En serverless (Vercel) cada instancia es un proceso aparte y efímero. Un pool
    # persistente por instancia multiplica conexiones y puede agotar el límite de
    # Postgres bajo carga. NullPool abre/cierra una conexión por request; pool_pre_ping
    # evita usar conexiones muertas tras un "congelamiento" de la función.
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        poolclass=NullPool,
        pool_pre_ping=True,
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
