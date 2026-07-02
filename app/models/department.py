from sqlalchemy import Column
from sqlalchemy import String

from app.models.base import BaseModel


class Department(BaseModel):
    __tablename__ = "departments"

    department_name = Column(
        String(255),
        nullable=False,
        unique=True
    )

    description = Column(String(500))