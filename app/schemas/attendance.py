from datetime import date
from datetime import datetime
from datetime import timedelta
from uuid import UUID

from pydantic import BaseModel
from pydantic import ConfigDict

from app.enums.attendance_event_type import AttendanceEventType


# ==========================================================
# Attendance Update Request
# ==========================================================

class AttendanceUpdateRequest(BaseModel):

    check_in_time: datetime | None = None

    check_out_time: datetime | None = None

    remarks: str | None = None


# ==========================================================
# Attendance Log Create Request
# ==========================================================

class AttendanceLogCreateRequest(BaseModel):

    employee_id: UUID

    recognition_score: float

    event_type: AttendanceEventType

    camera_id: str | None = None

    camera_name: str | None = None

    recognition_type: str = "FACE"

    image_path: str | None = None


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
# Attendance Log Response
# ==========================================================

class AttendanceLogResponse(BaseModel):

    id: UUID

    employee_id: UUID

    recognition_time: datetime

    recognition_score: float

    event_type: AttendanceEventType

    camera_id: str | None = None

    camera_name: str | None = None

    recognition_type: str

    image_path: str | None = None

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# Attendance Summary Response
# ==========================================================

class AttendanceSummaryResponse(BaseModel):

    id: UUID

    employee_id: UUID

    attendance_date: date

    first_check_in: datetime | None = None

    last_check_out: datetime | None = None

    total_working_minutes: int

    status: str

    remarks: str | None = None

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# Attendance Summary Update Request
# ==========================================================

class AttendanceSummaryUpdateRequest(BaseModel):

    remarks: str | None = None

    status: str | None = None


# ==========================================================
# Monthly Attendance Summary
# ==========================================================

class MonthlyAttendanceReportRequest(BaseModel):

    month: int

    year: int


class MonthlyAttendanceReportResponse(BaseModel):

    employee_id: UUID

    month: int

    year: int

    present_days: int

    total_working_minutes: int

    total_working_duration: timedelta


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