# test_conn.py
import os, pyodbc
server = os.getenv("DB_HOST", "172.22.96.1")
port   = os.getenv("DB_PORT", "1433")
user   = os.getenv("DB_USER", "dev_user")
pwd    = os.getenv("DB_PASS", "FinanceDB")
db     = os.getenv("DB_NAME", "FinanceDB")

conn_str = (
  "DRIVER={ODBC Driver 18 for SQL Server};"
  f"SERVER={server},{port};DATABASE={db};UID={user};PWD={pwd};"
  "TrustServerCertificate=yes;"
)
print("Conn string:", conn_str)
try:
    conn = pyodbc.connect(conn_str, timeout=5)
    cur = conn.cursor()
    cur.execute("SELECT @@VERSION;")
    print("VERSION:", cur.fetchone())
    conn.close()
    print("Conexión OK")
except Exception as e:
    print("ERROR de conexión:", e)
