from uuid import UUID

from fastapi import (
    APIRouter,
    File,
    Form,
    UploadFile,
    status,
)

from app.core.logger import get_logger

from app.orchestrators.enrollment_orchestrator import (
    EnrollmentOrchestrator,
)

from app.schemas.enrollment import (
    EnrollmentResponse,
)

router = APIRouter()

logger = get_logger(__name__)

enrollment_orchestrator = EnrollmentOrchestrator()


# ==========================================================
# Start Enrollment
# ==========================================================

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def start_enrollment(

    employee_id: UUID = Form(...),

    video_file: UploadFile = File(...),

):

    logger.info(
        "Enrollment request received.",
        extra={
            "employee_id": str(employee_id),
        },
    )

    return enrollment_orchestrator.start(
        employee_id=employee_id,
        video_file=video_file,
    )


# ==========================================================
# Get All Enrollments
# ==========================================================

@router.get(
    "",
    response_model=list[EnrollmentResponse],
)
def get_enrollments():

    logger.info(
        "Fetching all enrollments."
    )

    return enrollment_orchestrator.get_all()


# ==========================================================
# Get Enrollment By ID
# ==========================================================

@router.get(
    "/{enrollment_id}",
    response_model=EnrollmentResponse,
)
def get_enrollment(
    enrollment_id: UUID,
):

    logger.info(
        "Fetching enrollment.",
        extra={
            "enrollment_id": str(enrollment_id),
        },
    )

    return enrollment_orchestrator.get_by_id(
        enrollment_id=enrollment_id,
    )


# ==========================================================
# Get Employee Enrollments
# ==========================================================

@router.get(
    "/employee/{employee_id}",
    response_model=list[EnrollmentResponse],
)
def get_employee_enrollments(
    employee_id: UUID,
):

    logger.info(
        "Fetching employee enrollments.",
        extra={
            "employee_id": str(employee_id),
        },
    )

    return enrollment_orchestrator.get_by_employee(
        employee_id=employee_id,
    )


# ==========================================================
# Retry Enrollment
# ==========================================================

@router.post(
    "/{enrollment_id}/retry",
)
def retry_enrollment(
    enrollment_id: UUID,
):

    logger.info(
        "Retry enrollment requested.",
        extra={
            "enrollment_id": str(enrollment_id),
        },
    )

    return enrollment_orchestrator.retry(
        enrollment_id=enrollment_id,
    )