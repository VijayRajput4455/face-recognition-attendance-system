from datetime import datetime

from pydantic import BaseModel

from app.enums.attendance_event_type import AttendanceEventType


class AttendanceLogMessage(BaseModel):

    attendance_log_id: str

    employee_id: str

    recognition_time: datetime

    recognition_score: float

    event_type: AttendanceEventType

    camera_id: str | None = None

    camera_name: str | None = None

    recognition_type: str

    image_path: str | None = None