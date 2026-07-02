from uuid import UUID
from pydantic import BaseModel, EmailStr


class EmployeeRegisterRequest(BaseModel):
    employee_code: str
    first_name: str
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None

    department_id: UUID | None = None
    shift_id: UUID | None = None


class EmployeeResponse(BaseModel):
    id: UUID
    employee_code: str
    first_name: str
    last_name: str | None = None
    email: str | None = None
    employment_status: str

    class Config:
        from_attributes = True