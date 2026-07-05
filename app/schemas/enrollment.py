from uuid import UUID

from pydantic import BaseModel
from pydantic import ConfigDict


# ==========================================================
# Enrollment Response
# ==========================================================

class EnrollmentResponse(BaseModel):

    id: UUID

    employee_id: UUID

    video_path: str

    status: str

    error_message: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# RabbitMQ Message
# ==========================================================

class EnrollmentMessage(BaseModel):

    employee_id: str

    employee_code: str

    enrollment_id: str

    video_path: str