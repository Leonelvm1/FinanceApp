#Data base connection configuration

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker,
from sqlalchemy.engine import Engine

#data to connect to the database

dataBaseName = "financeDB"
username = "root"
userPassword = ""
connetionPort = "3306"
server = "localhost"

#create the connection
dataBaseConnection = f"mysql+pymysql://{username}:{userPassword}@{server}:{connetionPort}/{dataBaseName}"

#create the engine
engine = create_engine(dataBaseConnection)

#session
sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)