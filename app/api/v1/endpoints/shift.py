from uuid import UUID

from fastapi import APIRouter, File, UploadFile, status

from app.core.logger import get_logger
from app.orchestrators.shift_orchestrator import (
    ShiftOrchestrator,
)
from app.schemas.shift import (
    ShiftCreate,
    ShiftUpdate,
    ShiftResponse,
    ShiftBulkCreateRequest,
    ShiftBulkResponse,
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
# Bulk Create Shifts (JSON List)
# ==========================================================

@router.post(
    "/bulk",
    response_model=ShiftBulkResponse,
    status_code=status.HTTP_201_CREATED,
)
def bulk_create_shifts(
    request: ShiftBulkCreateRequest,
):

    logger.info(
        f"Bulk shift creation request received: {len(request.items)} items."
    )

    return shift_orchestrator.bulk_create(
        items=request.items,
    )


# ==========================================================
# Bulk Upload Shifts (CSV File)
# ==========================================================

@router.post(
    "/bulk-upload",
    response_model=ShiftBulkResponse,
    status_code=status.HTTP_201_CREATED,
)
async def bulk_upload_shifts_csv(
    file: UploadFile = File(...),
):

    logger.info(
        f"Bulk shift CSV upload received: {file.filename}"
    )

    content = await file.read()
    return shift_orchestrator.bulk_upload_csv(
        file_content=content,
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