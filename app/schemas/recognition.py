from pydantic import BaseModel


# ==========================================================
# Employee Details
# ==========================================================

class EmployeeRecognition(BaseModel):

    id: str

    employee_code: str

    first_name: str

    last_name: str

    email: str | None = None

    phone: str | None = None


# ==========================================================
# Recognition Result
# ==========================================================

class RecognitionResult(BaseModel):

    employee_id: str | None = None

    employee_code: str | None = None

    distance: float

    matched: bool

    bbox: list[int]

    employee: EmployeeRecognition | None = None


# ==========================================================
# Recognition Response
# ==========================================================

class RecognitionResponse(BaseModel):

    total_faces: int

    recognized_faces: list[RecognitionResult]