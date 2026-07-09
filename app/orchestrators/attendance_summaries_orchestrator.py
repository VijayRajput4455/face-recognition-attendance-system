from datetime import timedelta
from uuid import UUID

from fastapi import HTTPException
from fastapi import status

from app.core.database import SessionLocal
from app.core.logger import get_logger
from app.enums.attendance_status import AttendanceStatus
from app.models.attendance_summary import AttendanceSummary
from app.repositories.attendance_log_repo import AttendanceLogRepository
from app.repositories.attendance_summary_repo import AttendanceSummaryRepository
from app.repositories.employee_repo import EmployeeRepository
from app.schemas.attendance import AttendanceSummaryResponse
from app.schemas.attendance import AttendanceSummaryUpdateRequest
from app.schemas.attendance import MonthlyAttendanceReportResponse
from app.schemas.attendance_message import AttendanceLogMessage
from app.services.attendance_service import AttendanceCalculationService

logger = get_logger(__name__)


class AttendanceSummariesOrchestrator:

    def __init__(self):

        self.employee_repository = EmployeeRepository()

        self.attendance_log_repository = AttendanceLogRepository()

        self.attendance_summary_repository = AttendanceSummaryRepository()

        self.attendance_calculation_service = AttendanceCalculationService()

    # ==========================================================
    # Process Attendance Log Message
    # ==========================================================

    def process_log_message(
        self,
        message: AttendanceLogMessage,
    ) -> AttendanceSummaryResponse:

        db = SessionLocal()

        try:

            employee = self.employee_repository.get_by_id(
                db=db,
                employee_id=message.employee_id,
            )

            if employee is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found for attendance summary.",
                )

            attendance_date = message.recognition_time.date()

            logs = self.attendance_log_repository.get_by_employee_and_date(
                db=db,
                employee_id=message.employee_id,
                attendance_date=attendance_date,
            )

            first_check_in, last_check_out, total_minutes = (
                self.attendance_calculation_service.calculate_working_window(logs)
            )

            status_value = (
                AttendanceStatus.PRESENT.value
                if first_check_in is not None
                else AttendanceStatus.ABSENT.value
            )

            summary = self.attendance_summary_repository.get_by_employee_and_date(
                db=db,
                employee_id=message.employee_id,
                attendance_date=attendance_date,
            )

            if summary is None:

                summary = AttendanceSummary(
                    employee_id=employee.id,
                    attendance_date=attendance_date,
                    first_check_in=first_check_in,
                    last_check_out=last_check_out,
                    total_working_minutes=total_minutes,
                    status=status_value,
                )

                summary = self.attendance_summary_repository.create(
                    db=db,
                    attendance_summary=summary,
                )

                logger.info(
                    "Attendance summary created.",
                    extra={
                        "employee_id": str(employee.id),
                        "attendance_date": str(attendance_date),
                        "total_working_minutes": total_minutes,
                    },
                )

            else:

                summary.first_check_in = first_check_in
                summary.last_check_out = last_check_out
                summary.total_working_minutes = total_minutes
                summary.status = status_value

                summary = self.attendance_summary_repository.update(
                    db=db,
                    attendance_summary=summary,
                )

                logger.info(
                    "Attendance summary updated.",
                    extra={
                        "attendance_summary_id": str(summary.id),
                        "employee_id": str(employee.id),
                        "attendance_date": str(attendance_date),
                        "total_working_minutes": total_minutes,
                    },
                )

            return AttendanceSummaryResponse.model_validate(summary)

        finally:

            db.close()

    # ==========================================================
    # Get All Attendance Summaries
    # ==========================================================

    def get_all(
        self,
    ) -> list[AttendanceSummaryResponse]:

        db = SessionLocal()

        try:

            summaries = self.attendance_summary_repository.get_all(db=db)

            return [AttendanceSummaryResponse.model_validate(item) for item in summaries]

        finally:

            db.close()

    # ==========================================================
    # Get Attendance Summary By ID
    # ==========================================================

    def get_by_id(
        self,
        attendance_summary_id: UUID,
    ) -> AttendanceSummaryResponse:

        db = SessionLocal()

        try:

            summary = self.attendance_summary_repository.get_by_id(
                db=db,
                attendance_summary_id=attendance_summary_id,
            )

            if summary is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance summary not found.",
                )

            return AttendanceSummaryResponse.model_validate(summary)

        finally:

            db.close()

    # ==========================================================
    # Get Attendance Summaries By Employee
    # ==========================================================

    def get_by_employee(
        self,
        employee_id: UUID,
    ) -> list[AttendanceSummaryResponse]:

        db = SessionLocal()

        try:

            employee = self.employee_repository.get_by_id(
                db=db,
                employee_id=employee_id,
            )

            if employee is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found.",
                )

            summaries = self.attendance_summary_repository.get_by_employee(
                db=db,
                employee_id=employee_id,
            )

            return [AttendanceSummaryResponse.model_validate(item) for item in summaries]

        finally:

            db.close()

    # ==========================================================
    # Update Attendance Summary
    # ==========================================================

    def update(
        self,
        attendance_summary_id: UUID,
        request: AttendanceSummaryUpdateRequest,
    ) -> AttendanceSummaryResponse:

        db = SessionLocal()

        try:

            summary = self.attendance_summary_repository.get_by_id(
                db=db,
                attendance_summary_id=attendance_summary_id,
            )

            if summary is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance summary not found.",
                )

            if request.status is not None:
                summary.status = request.status

            if request.remarks is not None:
                summary.remarks = request.remarks

            summary = self.attendance_summary_repository.update(
                db=db,
                attendance_summary=summary,
            )

            logger.info(
                "Attendance summary updated manually.",
                extra={
                    "attendance_summary_id": str(summary.id),
                    "employee_id": str(summary.employee_id),
                },
            )

            return AttendanceSummaryResponse.model_validate(summary)

        finally:

            db.close()

    # ==========================================================
    # Monthly Attendance Report
    # ==========================================================

    def get_monthly_report(
        self,
        employee_id: UUID,
        month: int,
        year: int,
    ) -> MonthlyAttendanceReportResponse:

        if month < 1 or month > 12:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Month must be between 1 and 12.",
            )

        db = SessionLocal()

        try:

            employee = self.employee_repository.get_by_id(
                db=db,
                employee_id=employee_id,
            )

            if employee is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found.",
                )

            monthly_summaries = self.attendance_summary_repository.get_by_employee_and_month(
                db=db,
                employee_id=employee_id,
                month=month,
                year=year,
            )

            present_days = sum(
                1
                for summary in monthly_summaries
                if summary.status == AttendanceStatus.PRESENT.value
            )

            total_working_minutes = sum(
                summary.total_working_minutes
                for summary in monthly_summaries
            )

            return MonthlyAttendanceReportResponse(
                employee_id=employee_id,
                month=month,
                year=year,
                present_days=present_days,
                total_working_minutes=total_working_minutes,
                total_working_duration=timedelta(minutes=total_working_minutes),
            )

        finally:

            db.close()
