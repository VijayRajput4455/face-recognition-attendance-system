from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Time
from sqlalchemy import Integer

from app.models.base import BaseModel


class Shift(BaseModel):
    __tablename__ = "shifts"

    shift_name = Column(String(100))

    start_time = Column(Time)

    end_time = Column(Time)

    grace_minutes = Column(
        Integer,
        default=15
    )