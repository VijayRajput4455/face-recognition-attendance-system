from uuid import UUID

from fastapi import APIRouter
from fastapi import status

from app.core.logger import get_logger
from app.orchestrators.attendance_logs_orchestrator import AttendanceLogsOrchestrator
from app.schemas.attendance import AttendanceLogCreateRequest
from app.schemas.attendance import AttendanceLogResponse

router = APIRouter()

logger = get_logger(__name__)

attendance_logs_orchestrator = AttendanceLogsOrchestrator()


# ==========================================================
# Attendance Logs
# ==========================================================

@router.post(
    "/logs",
    response_model=AttendanceLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_attendance_log(
    request: AttendanceLogCreateRequest,
):

    logger.info(
        "Attendance log create request received.",
        extra={
            "employee_id": str(request.employee_id),
            "event_type": request.event_type.value,
        },
    )

    return attendance_logs_orchestrator.create_log(request=request)


@router.get(
    "/logs",
    response_model=list[AttendanceLogResponse],
)
def get_attendance_logs():

    logger.info("Fetching all attendance logs.")

    return attendance_logs_orchestrator.get_all()


@router.get(
    "/logs/employee/{employee_id}",
    response_model=list[AttendanceLogResponse],
)
def get_employee_attendance_logs(
    employee_id: UUID,
):

    logger.info(
        "Fetching employee attendance logs.",
        extra={
            "employee_id": str(employee_id),
        },
    )

    return attendance_logs_orchestrator.get_by_employee(employee_id=employee_id)


@router.get(
    "/logs/{attendance_log_id}",
    response_model=AttendanceLogResponse,
)
def get_attendance_log(
    attendance_log_id: UUID,
):

    logger.info(
        "Fetching attendance log.",
        extra={
            "attendance_log_id": str(attendance_log_id),
        },
    )

    return attendance_logs_orchestrator.get_by_id(attendance_log_id=attendance_log_id)


@router.delete(
    "/logs/{attendance_log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_attendance_log(
    attendance_log_id: UUID,
):

    logger.info(
        "Deleting attendance log.",
        extra={
            "attendance_log_id": str(attendance_log_id),
        },
    )

    attendance_logs_orchestrator.delete(attendance_log_id=attendance_log_id)
