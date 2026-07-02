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