# configuration.py
import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Leer variables de entorno (valores por defecto para dev)
username = os.getenv("DB_USER", "dev_user")
userPassword = os.getenv("DB_PASS", "FinanceDB")
server = os.getenv("DB_HOST", "172.22.96.1")        # o IP de Windows si SQL Server corre en Windows
connectionPort = os.getenv("DB_PORT", "1433")
dataBaseName = os.getenv("DB_NAME", "FinanceDB")

# Driver ODBC (asegúrate de tenerlo instalado)
odbc_driver = os.getenv("ODBC_DRIVER", "ODBC Driver 18 for SQL Server")

# driver debe estar url-encoded (espacios -> + o encode)
driver_quoted = urllib.parse.quote_plus(odbc_driver)

# Cadena de conexión SQLAlchemy para SQL Server usando pyodbc
# Nota: usamos SERVER,PORT separados por coma
dataBaseConnection = (
    f"mssql+pyodbc://{username}:{urllib.parse.quote_plus(userPassword)}"
    f"@{server},{connectionPort}/{dataBaseName}?driver={driver_quoted}&TrustServerCertificate=yes"
)

# Crear engine (pool_pre_ping evita conexiones muertas)
engine = create_engine(dataBaseConnection, pool_pre_ping=True, fast_executemany=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()
