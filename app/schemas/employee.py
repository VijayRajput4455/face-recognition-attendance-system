from uuid import UUID

from pydantic import BaseModel
from pydantic import EmailStr
from pydantic import ConfigDict


# ==========================================================
# Register Employee
# ==========================================================

class EmployeeRegisterRequest(BaseModel):

    employee_code: str

    first_name: str

    last_name: str | None = None

    email: EmailStr | None = None

    phone: str | None = None

    department_id: UUID | None = None

    shift_id: UUID | None = None


# ==========================================================
# Update Employee
# ==========================================================

class EmployeeUpdateRequest(BaseModel):

    first_name: str

    last_name: str | None = None

    email: EmailStr | None = None

    phone: str | None = None

    department_id: UUID | None = None

    shift_id: UUID | None = None


# ==========================================================
# Employee Response
# ==========================================================

class EmployeeResponse(BaseModel):

    id: UUID

    employee_code: str

    first_name: str

    last_name: str | None = None

    email: str | None = None

    phone: str | None = None

    department_id: UUID | None = None

    shift_id: UUID | None = None

    employment_status: str

    model_config = ConfigDict(
        from_attributes=True,
    )