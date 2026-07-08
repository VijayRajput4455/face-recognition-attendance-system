from datetime import date
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel
from pydantic import ConfigDict


# ==========================================================
# Attendance Update Request
# ==========================================================

class AttendanceUpdateRequest(BaseModel):

    check_in_time: datetime | None = None

    check_out_time: datetime | None = None

    remarks: str | None = None


# ==========================================================
# Attendance Response
# ==========================================================

class AttendanceResponse(BaseModel):

    id: UUID

    employee_id: UUID

    attendance_date: date

    check_in_time: datetime | None = None

    check_out_time: datetime | None = None

    status: str

    recognition_score: float | None = None

    remarks: str | None = None

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# Attendance Summary Response
# ==========================================================

class AttendanceSummaryResponse(BaseModel):

    employee_id: UUID

    attendance_date: date

    status: str

    check_in_time: datetime | None = None

    check_out_time: datetime | None = None


# ==========================================================
# Recognition Attendance Response
# ==========================================================

class AttendanceRecognitionResponse(BaseModel):

    employee_id: UUID

    employee_code: str

    employee_name: str

    attendance_type: str

    attendance_time: datetime

    recognition_score: float

    message: str