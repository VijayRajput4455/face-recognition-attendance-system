from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class EmployeeEnrollment(BaseModel):
    __tablename__ = "employee_enrollments"

    employee_id = Column(
        ForeignKey("employees.id"),
        nullable=False
    )

    video_path = Column(
        String(500),
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False,
        default="PENDING"
    )

    total_frames = Column(
        Integer,
        default=0
    )

    valid_faces = Column(
        Integer,
        default=0
    )

    error_message = Column(
        String(1000),
        nullable=True
    )

    employee = relationship(
        "Employee",
        back_populates="enrollments"
    )