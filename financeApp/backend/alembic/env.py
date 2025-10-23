import os
import sys
from logging.config import fileConfig
from dotenv import load_dotenv

# load .env so configuration.py picks DB_* variables if you keep them in a .env file
# (safe: if you set env vars externally, load_dotenv does no harm)
load_dotenv()

from sqlalchemy import pool
from alembic import context

# ensure backend root is on sys.path (env.py sits at: backend/alembic/env.py)
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# import configuration (this builds engine and dataBaseConnection)
from app.dataBase.configuration import Base, engine, dataBaseConnection

# Force import of all modules that define ORM models so they register on Base.metadata
# Adjust this import to match where your models actually live
from app.api.models import tablesSQL  # noqa: F401
# or if you have several modules:
# from app.api.models import tablesSQL, other_models  # noqa: F401

# Alembic config object
config = context.config

# allow explicit override via ALEMBIC_DATABASE_URL
alembic_url_override = os.getenv("ALEMBIC_DATABASE_URL")
if alembic_url_override:
    config.set_main_option("sqlalchemy.url", alembic_url_override)
else:
    config.set_main_option("sqlalchemy.url", dataBaseConnection)

# logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target metadata for autogenerate
target_metadata = Base.metadata


# ----------------------------------------------------------
# Run migrations (offline / online)
# ----------------------------------------------------------
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode using the backend's engine."""
    # We import the engine from configuration.py and use it directly.
    connectable = engine

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


# Choose mode and run
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
