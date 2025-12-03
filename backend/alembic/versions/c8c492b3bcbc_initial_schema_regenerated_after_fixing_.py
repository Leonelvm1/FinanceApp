"""Initial schema (regenerated after fixing imports)

Revision ID: c8c492b3bcbc
Revises: 
Create Date: 2025-10-23 16:47:00.706702

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# revision identifiers, used by Alembic.
revision: str = 'c8c492b3bcbc'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # intentionally left empty (no structural changes)

def downgrade() -> None:
    """Downgrade schema."""
    # intentionally left empty

