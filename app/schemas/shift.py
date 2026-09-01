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


# ==========================================================
# Bulk Schemas
# ==========================================================

class BulkErrorDetail(BaseModel):
    row: int
    identifier: str | None = None
    error: str


class ShiftBulkCreateRequest(BaseModel):
    items: list[ShiftCreate]


class ShiftBulkResponse(BaseModel):
    total_records: int
    successful_count: int
    failed_count: int
    errors: list[BulkErrorDetail] = []
    inserted_shifts: list[ShiftResponse] = []