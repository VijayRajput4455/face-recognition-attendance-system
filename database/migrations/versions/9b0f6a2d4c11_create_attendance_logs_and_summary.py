"""create attendance logs and summary

Revision ID: 9b0f6a2d4c11
Revises: 350488f0adb1
Create Date: 2026-07-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "9b0f6a2d4c11"
down_revision: Union[str, Sequence[str], None] = "350488f0adb1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    attendance_event_type = postgresql.ENUM(
        "ENTRY",
        "EXIT",
        name="attendanceeventtype",
    )
    attendance_event_type.create(op.get_bind(), checkfirst=True)

    attendance_event_type_ref = postgresql.ENUM(
        "ENTRY",
        "EXIT",
        name="attendanceeventtype",
        create_type=False,
    )

    op.create_table(
        "attendance_logs",
        sa.Column("employee_id", sa.UUID(), nullable=False),
        sa.Column("recognition_time", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("recognition_score", sa.Float(), nullable=False),
        sa.Column("event_type", attendance_event_type_ref, nullable=False),
        sa.Column("camera_id", sa.String(length=100), nullable=True),
        sa.Column("camera_name", sa.String(length=100), nullable=True),
        sa.Column("recognition_type", sa.String(length=30), nullable=False),
        sa.Column("image_path", sa.String(length=500), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_attendance_logs_employee_id"), "attendance_logs", ["employee_id"], unique=False)
    op.create_index(op.f("ix_attendance_logs_recognition_time"), "attendance_logs", ["recognition_time"], unique=False)

    op.create_table(
        "attendance_summary",
        sa.Column("employee_id", sa.UUID(), nullable=False),
        sa.Column("attendance_date", sa.Date(), nullable=False),
        sa.Column("first_check_in", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_check_out", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_working_minutes", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("remarks", sa.String(length=500), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("employee_id", "attendance_date", name="uq_employee_attendance_summary"),
    )
    op.create_index(op.f("ix_attendance_summary_employee_id"), "attendance_summary", ["employee_id"], unique=False)
    op.create_index(op.f("ix_attendance_summary_attendance_date"), "attendance_summary", ["attendance_date"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(op.f("ix_attendance_summary_attendance_date"), table_name="attendance_summary")
    op.drop_index(op.f("ix_attendance_summary_employee_id"), table_name="attendance_summary")
    op.drop_table("attendance_summary")

    op.drop_index(op.f("ix_attendance_logs_recognition_time"), table_name="attendance_logs")
    op.drop_index(op.f("ix_attendance_logs_employee_id"), table_name="attendance_logs")
    op.drop_table("attendance_logs")

    attendance_event_type = sa.Enum(
        "ENTRY",
        "EXIT",
        name="attendanceeventtype",
    )
    attendance_event_type.drop(op.get_bind(), checkfirst=True)
