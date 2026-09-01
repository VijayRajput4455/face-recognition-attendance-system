from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ==========================================================
# Create
# ==========================================================

class DepartmentCreate(BaseModel):

    department_name: str

    description: str | None = None


# ==========================================================
# Update
# ==========================================================

class DepartmentUpdate(BaseModel):

    department_name: str

    description: str | None = None


# ==========================================================
# Response
# ==========================================================

class DepartmentResponse(BaseModel):

    id: UUID

    department_name: str

    description: str | None = None

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


class DepartmentBulkCreateRequest(BaseModel):
    items: list[DepartmentCreate]


class DepartmentBulkResponse(BaseModel):
    total_records: int
    successful_count: int
    failed_count: int
    errors: list[BulkErrorDetail] = []
    inserted_departments: list[DepartmentResponse] = []
