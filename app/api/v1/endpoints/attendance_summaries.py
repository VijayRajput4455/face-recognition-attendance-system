from uuid import UUID

from fastapi import APIRouter
from fastapi import Query

from app.core.logger import get_logger
from app.orchestrators.attendance_summaries_orchestrator import AttendanceSummariesOrchestrator
from app.schemas.attendance import AttendanceSummaryResponse
from app.schemas.attendance import AttendanceSummaryUpdateRequest
from app.schemas.attendance import MonthlyAttendanceReportResponse

router = APIRouter()

logger = get_logger(__name__)

attendance_summaries_orchestrator = AttendanceSummariesOrchestrator()


# ==========================================================
# Attendance Summaries
# ==========================================================

@router.get(
    "/summaries",
    response_model=list[AttendanceSummaryResponse],
)
def get_attendance_summaries():

    logger.info("Fetching all attendance summaries.")

    return attendance_summaries_orchestrator.get_all()


@router.get(
    "/summaries/employee/{employee_id}",
    response_model=list[AttendanceSummaryResponse],
)
def get_employee_attendance_summaries(
    employee_id: UUID,
):

    logger.info(
        "Fetching employee attendance summaries.",
        extra={
            "employee_id": str(employee_id),
        },
    )

    return attendance_summaries_orchestrator.get_by_employee(employee_id=employee_id)


@router.get(
    "/summaries/reports/monthly/{employee_id}",
    response_model=MonthlyAttendanceReportResponse,
)
def get_monthly_attendance_report(
    employee_id: UUID,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
):

    logger.info(
        "Fetching monthly attendance report.",
        extra={
            "employee_id": str(employee_id),
            "month": month,
            "year": year,
        },
    )

    return attendance_summaries_orchestrator.get_monthly_report(
        employee_id=employee_id,
        month=month,
        year=year,
    )


@router.get(
    "/summaries/{attendance_summary_id}",
    response_model=AttendanceSummaryResponse,
)
def get_attendance_summary(
    attendance_summary_id: UUID,
):

    logger.info(
        "Fetching attendance summary.",
        extra={
            "attendance_summary_id": str(attendance_summary_id),
        },
    )

    return attendance_summaries_orchestrator.get_by_id(
        attendance_summary_id=attendance_summary_id,
    )


@router.put(
    "/summaries/{attendance_summary_id}",
    response_model=AttendanceSummaryResponse,
)
def update_attendance_summary(
    attendance_summary_id: UUID,
    request: AttendanceSummaryUpdateRequest,
):

    logger.info(
        "Updating attendance summary.",
        extra={
            "attendance_summary_id": str(attendance_summary_id),
        },
    )

    return attendance_summaries_orchestrator.update(
        attendance_summary_id=attendance_summary_id,
        request=request,
    )
