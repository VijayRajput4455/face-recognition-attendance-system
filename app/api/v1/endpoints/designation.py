from uuid import UUID

from fastapi import APIRouter
from fastapi import status

from app.core.logger import get_logger
from app.orchestrators.designation_orchestrator import (
    DesignationOrchestrator,
)
from app.schemas.designation import (
    DesignationCreate,
    DesignationUpdate,
    DesignationResponse,
)

logger = get_logger(__name__)

router = APIRouter()

designation_orchestrator = DesignationOrchestrator()


# ==========================================================
# Create Designation
# ==========================================================

@router.post(
    "",
    response_model=DesignationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_designation(
    request: DesignationCreate,
):

    logger.info("Designation creation request received.")

    return designation_orchestrator.create(
        request=request,
    )


# ==========================================================
# Get All Designations
# ==========================================================

@router.get(
    "",
    response_model=list[DesignationResponse],
)
def get_designations():

    logger.info("Fetching all designations.")

    return designation_orchestrator.get_all()


# ==========================================================
# Get Designation By ID
# ==========================================================

@router.get(
    "/{designation_id}",
    response_model=DesignationResponse,
)
def get_designation(
    designation_id: UUID,
):

    logger.info(
        "Fetching designation.",
        extra={
            "designation_id": str(designation_id),
        },
    )

    return designation_orchestrator.get_by_id(
        designation_id=designation_id,
    )


# ==========================================================
# Update Designation
# ==========================================================

@router.put(
    "/{designation_id}",
    response_model=DesignationResponse,
)
def update_designation(
    designation_id: UUID,
    request: DesignationUpdate,
):

    logger.info(
        "Updating designation.",
        extra={
            "designation_id": str(designation_id),
        },
    )

    return designation_orchestrator.update(
        designation_id=designation_id,
        request=request,
    )


# ==========================================================
# Delete Designation
# ==========================================================

@router.delete(
    "/{designation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_designation(
    designation_id: UUID,
):

    logger.info(
        "Deleting designation.",
        extra={
            "designation_id": str(designation_id),
        },
    )

    designation_orchestrator.delete(
        designation_id=designation_id,
    )
