from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import Boolean
from sqlalchemy import ForeignKey

from app.models.base import BaseModel


class FaceProfile(BaseModel):
    __tablename__ = "face_profiles"

    employee_id = Column(
        ForeignKey("employees.id"),
        nullable=False
    )

    face_id = Column(
        String(255),
        unique=True,
        nullable=False
    )

    embedding_version = Column(
        String(50)
    )

    embedding_count = Column(
        Integer,
        default=0
    )

    is_active = Column(
        Boolean,
        default=True
    )