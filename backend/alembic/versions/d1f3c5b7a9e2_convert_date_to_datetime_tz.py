"""Convert Date columns to TIMESTAMP WITH TIME ZONE (UTC-aware)

Revision ID: d1f3c5b7a9e2
Revises: c8c492b3bcbc
Create Date: 2026-02-13 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'd1f3c5b7a9e2'
down_revision = 'c8c492b3bcbc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    dialect = conn.dialect.name

    # Helper: alter a single column using batch (works for sqlite by table recreation)
    def _alter_table_col(table_name, col_name):
        with op.batch_alter_table(table_name, copy_constraints=True) as batch_op:
            batch_op.alter_column(
                col_name,
                existing_type=sa.Date(),
                type_=sa.DateTime(timezone=True),
                existing_nullable=False,
            )

    # For Postgres, perform an in-place conversion using USING expression to set midnight UTC
    if dialect == 'postgresql':
        # users.birth_date
        op.execute(
            """
            ALTER TABLE users
            ALTER COLUMN birth_date TYPE TIMESTAMPTZ
            USING ( (birth_date::timestamp) AT TIME ZONE 'UTC' )
            """
        )
        # categories.date
        op.execute(
            """
            ALTER TABLE categories
            ALTER COLUMN date TYPE TIMESTAMPTZ
            USING ( (date::timestamp) AT TIME ZONE 'UTC' )
            """
        )
        # expenses.date
        op.execute(
            """
            ALTER TABLE expenses
            ALTER COLUMN date TYPE TIMESTAMPTZ
            USING ( (date::timestamp) AT TIME ZONE 'UTC' )
            """
        )
        # incomes.date
        op.execute(
            """
            ALTER TABLE incomes
            ALTER COLUMN date TYPE TIMESTAMPTZ
            USING ( (date::timestamp) AT TIME ZONE 'UTC' )
            """
        )
    else:
        # Other dialects (including sqlite) - use batch_alter_table recreation which handles type changes
        _alter_table_col('users', 'birth_date')
        _alter_table_col('categories', 'date')
        _alter_table_col('expenses', 'date')
        _alter_table_col('incomes', 'date')


def downgrade() -> None:
    conn = op.get_bind()
    dialect = conn.dialect.name

    def _alter_table_col_back(table_name, col_name):
        with op.batch_alter_table(table_name, copy_constraints=True) as batch_op:
            batch_op.alter_column(
                col_name,
                existing_type=sa.DateTime(timezone=True),
                type_=sa.Date(),
                existing_nullable=False,
            )

    if dialect == 'postgresql':
        op.execute(
            """
            ALTER TABLE users
            ALTER COLUMN birth_date TYPE DATE
            USING ( (birth_date AT TIME ZONE 'UTC')::date )
            """
        )
        op.execute(
            """
            ALTER TABLE categories
            ALTER COLUMN date TYPE DATE
            USING ( (date AT TIME ZONE 'UTC')::date )
            """
        )
        op.execute(
            """
            ALTER TABLE expenses
            ALTER COLUMN date TYPE DATE
            USING ( (date AT TIME ZONE 'UTC')::date )
            """
        )
        op.execute(
            """
            ALTER TABLE incomes
            ALTER COLUMN date TYPE DATE
            USING ( (date AT TIME ZONE 'UTC')::date )
            """
        )
    else:
        _alter_table_col_back('users', 'birth_date')
        _alter_table_col_back('categories', 'date')
        _alter_table_col_back('expenses', 'date')
        _alter_table_col_back('incomes', 'date')
