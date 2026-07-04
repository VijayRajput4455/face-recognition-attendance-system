from datetime import time
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ==========================================================
# Create
# ==========================================================

class ShiftCreate(BaseModel):

    shift_name: str

    start_time: time

    end_time: time

    grace_minutes: int = 15


# ==========================================================
# Update
# ==========================================================

class ShiftUpdate(BaseModel):

    shift_name: str

    start_time: time

    end_time: time

    grace_minutes: int


# ==========================================================
# Response
# ==========================================================

class ShiftResponse(BaseModel):

    id: UUID

    shift_name: str

    start_time: time

    end_time: time

    grace_minutes: int

    model_config = ConfigDict(
        from_attributes=True,
    )