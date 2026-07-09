from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Date
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Employee(BaseModel):
    __tablename__ = "employees"

    employee_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    first_name = Column(
        String(100),
        nullable=False
    )

    last_name = Column(
        String(100),
        nullable=True
    )

    email = Column(
        String(255),
        unique=True,
        nullable=True
    )

    phone = Column(
        String(20),
        nullable=True
    )

    joining_date = Column(
        Date,
        nullable=True
    )

    # PENDING -> PROCESSING -> ACTIVE
    employment_status = Column(
        String(50),
        nullable=False,
        default="PENDING"
    )

    department_id = Column(
        ForeignKey("departments.id"),
        nullable=True
    )

    shift_id = Column(
        ForeignKey("shifts.id"),
        nullable=True
    )

    department = relationship(
        "Department"
    )

    shift = relationship(
        "Shift"
    )

    enrollments = relationship(
        "EmployeeEnrollment",
        back_populates="employee",
        cascade="all, delete-orphan"
    )

    attendances = relationship(
        "Attendance",
        back_populates="employee",
    )

    attendance_logs = relationship(
        "AttendanceLog",
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    attendance_summaries = relationship(
        "AttendanceSummary",
        back_populates="employee",
        cascade="all, delete-orphan",
    )