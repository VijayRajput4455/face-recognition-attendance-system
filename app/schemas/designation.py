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


# ==========================================================
# Bulk Schemas
# ==========================================================

class BulkErrorDetail(BaseModel):
    row: int
    identifier: str | None = None
    error: str


class DesignationBulkCreateRequest(BaseModel):
    items: list[DesignationCreate]


class DesignationBulkResponse(BaseModel):
    total_records: int
    successful_count: int
    failed_count: int
    errors: list[BulkErrorDetail] = []
    inserted_designations: list[DesignationResponse] = []

