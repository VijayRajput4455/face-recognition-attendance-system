from datetime import date
from uuid import UUID

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import EmailStr


# ==========================================================
# Create Employee
# ==========================================================

class EmployeeCreateRequest(BaseModel):

    employee_code: str

    first_name: str

    last_name: str | None = None

    email: EmailStr | None = None

    phone: str | None = None

    joining_date: date

    department_id: UUID | None = None

    designation_id: UUID | None = None

    shift_id: UUID | None = None

    employment_status: str | None = "ACTIVE"


# ==========================================================
# Update Employee
# ==========================================================

class EmployeeUpdateRequest(BaseModel):

    first_name: str | None = None

    last_name: str | None = None

    email: EmailStr | None = None

    phone: str | None = None

    joining_date: date | None = None

    department_id: UUID | None = None

    designation_id: UUID | None = None

    shift_id: UUID | None = None

    employment_status: str | None = None


# ==========================================================
# Employee Response
# ==========================================================

class EmployeeResponse(BaseModel):

    id: UUID

    employee_code: str

    first_name: str

    last_name: str | None = None

    email: EmailStr | None = None

    phone: str | None = None

    joining_date: date | None = None

    department_id: UUID | None = None

    designation_id: UUID | None = None

    shift_id: UUID | None = None

    employment_status: str

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


class EmployeeBulkItem(BaseModel):
    employee_code: str
    first_name: str
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    joining_date: date | None = None
    department_id: UUID | None = None
    department_name: str | None = None
    designation_id: UUID | None = None
    designation_name: str | None = None
    shift_id: UUID | None = None
    shift_name: str | None = None
    employment_status: str | None = "ACTIVE"


class EmployeeBulkCreateRequest(BaseModel):
    items: list[EmployeeBulkItem]


class EmployeeBulkResponse(BaseModel):
    total_records: int
    successful_count: int
    failed_count: int
    errors: list[BulkErrorDetail] = []
    inserted_employees: list[EmployeeResponse] = []