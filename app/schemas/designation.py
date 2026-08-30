from uuid import UUID
from pydantic import BaseModel, ConfigDict


# ==========================================================
# Create
# ==========================================================

class DesignationCreate(BaseModel):

    designation_name: str

    description: str | None = None


# ==========================================================
# Update
# ==========================================================

class DesignationUpdate(BaseModel):

    designation_name: str

    description: str | None = None


# ==========================================================
# Response
# ==========================================================

class DesignationResponse(BaseModel):

    id: UUID

    designation_name: str

    description: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )
