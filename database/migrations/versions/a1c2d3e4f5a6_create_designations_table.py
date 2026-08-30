"""create designations table and add designation_id to employees

Revision ID: a1c2d3e4f5a6
Revises: 9b0f6a2d4c11
Create Date: 2026-08-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "a1c2d3e4f5a6"
down_revision: Union[str, Sequence[str], None] = "9b0f6a2d4c11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create designations table
    op.create_table(
        "designations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("designation_name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # 2. Add designation_id to employees
    op.add_column(
        "employees",
        sa.Column("designation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("designations.id", ondelete="SET NULL"), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("employees", "designation_id")
    op.drop_table("designations")
