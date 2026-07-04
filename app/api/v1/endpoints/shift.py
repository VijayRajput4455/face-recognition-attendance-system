from uuid import UUID

from fastapi import APIRouter
from fastapi import status

from app.core.logger import get_logger
from app.orchestrators.shift_orchestrator import (
    ShiftOrchestrator,
)
from app.schemas.shift import (
    ShiftCreate,
    ShiftUpdate,
    ShiftResponse,
)

logger = get_logger(__name__)

router = APIRouter()

shift_orchestrator = ShiftOrchestrator()


# ==========================================================
# Create Shift
# ==========================================================

@router.post(
    "",
    response_model=ShiftResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_shift(
    request: ShiftCreate,
):

    logger.info(
        "Shift creation request received."
    )

    return shift_orchestrator.create(
        request=request,
    )


# ==========================================================
# Get All Shifts
# ==========================================================

@router.get(
    "",
    response_model=list[ShiftResponse],
)
def get_shifts():

    logger.info(
        "Fetching all shifts."
    )

    return shift_orchestrator.get_all()


# ==========================================================
# Get Shift By ID
# ==========================================================

@router.get(
    "/{shift_id}",
    response_model=ShiftResponse,
)
def get_shift(
    shift_id: UUID,
):

    logger.info(
        "Fetching shift.",
        extra={
            "shift_id": str(shift_id),
        },
    )

    return shift_orchestrator.get_by_id(
        shift_id=shift_id,
    )


# ==========================================================
# Update Shift
# ==========================================================

@router.put(
    "/{shift_id}",
    response_model=ShiftResponse,
)
def update_shift(
    shift_id: UUID,
    request: ShiftUpdate,
):

    logger.info(
        "Updating shift.",
        extra={
            "shift_id": str(shift_id),
        },
    )

    return shift_orchestrator.update(
        shift_id=shift_id,
        request=request,
    )


# ==========================================================
# Delete Shift
# ==========================================================

@router.delete(
    "/{shift_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_shift(
    shift_id: UUID,
):

    logger.info(
        "Deleting shift.",
        extra={
            "shift_id": str(shift_id),
        },
    )

    shift_orchestrator.delete(
        shift_id=shift_id,
    )