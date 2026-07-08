from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)

from sqlalchemy.orm import relationship

from app.enums.attendance_status import AttendanceStatus
from app.models.base import BaseModel


class Attendance(BaseModel):

    __tablename__ = "attendance"

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            "attendance_date",
            name="uq_employee_attendance_date",
        ),
    )

    # ==========================================================
    # Employee
    # ==========================================================

    employee_id = Column(
        ForeignKey("employees.id"),
        nullable=False,
        index=True,
    )

    employee = relationship(
        "Employee",
        back_populates="attendances",
    )

    # ==========================================================
    # Attendance
    # ==========================================================

    attendance_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    check_in_time = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    check_out_time = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default=AttendanceStatus.PRESENT.value,
    )

    # ==========================================================
    # Recognition
    # ==========================================================

    recognition_score = Column(
        Float,
        nullable=True,
    )

    # ==========================================================
    # Remarks
    # ==========================================================

    remarks = Column(
        Text,
        nullable=True,
    )