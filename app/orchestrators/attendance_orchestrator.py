from uuid import UUID

from fastapi import HTTPException
from fastapi import status

from app.core.database import SessionLocal
from app.core.logger import get_logger

from app.models.attendance import Attendance

from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.employee_repo import EmployeeRepository

from app.schemas.attendance import (
    AttendanceResponse,
    AttendanceUpdateRequest,
)

logger = get_logger(__name__)


class AttendanceOrchestrator:

    def __init__(self):

        self.attendance_repository = AttendanceRepository()

        self.employee_repository = EmployeeRepository()

    # ==========================================================
    # Get All Attendance
    # ==========================================================

    def get_all(
        self,
    ) -> list[AttendanceResponse]:

        db = SessionLocal()

        try:

            return self.attendance_repository.get_all(
                db=db,
            )

        finally:

            db.close()

    # ==========================================================
    # Get Attendance By ID
    # ==========================================================

    def get_by_id(
        self,
        attendance_id: UUID,
    ) -> AttendanceResponse:

        db = SessionLocal()

        try:

            attendance = self.attendance_repository.get_by_id(
                db=db,
                attendance_id=attendance_id,
            )

            if attendance is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance not found.",
                )

            return attendance

        finally:

            db.close()

    # ==========================================================
    # Get Attendance By Employee
    # ==========================================================

    def get_by_employee(
        self,
        employee_id: UUID,
    ) -> list[AttendanceResponse]:

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

            return self.attendance_repository.get_by_employee(
                db=db,
                employee_id=employee_id,
            )

        finally:

            db.close()

    # ==========================================================
    # Update Attendance
    # ==========================================================

    def update(
        self,
        attendance_id: UUID,
        request: AttendanceUpdateRequest,
    ) -> AttendanceResponse:

        db = SessionLocal()

        try:

            attendance = self.attendance_repository.get_by_id(
                db=db,
                attendance_id=attendance_id,
            )

            if attendance is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance not found.",
                )

            attendance.check_in_time = request.check_in_time

            attendance.check_out_time = request.check_out_time

            attendance.remarks = request.remarks

            attendance = self.attendance_repository.update(
                db=db,
                attendance=attendance,
            )

            logger.info(
                "Attendance updated successfully.",
                extra={
                    "attendance_id": str(attendance.id),
                },
            )

            return attendance

        finally:

            db.close()

    # ==========================================================
    # Delete Attendance
    # ==========================================================

    def delete(
        self,
        attendance_id: UUID,
    ) -> None:

        db = SessionLocal()

        try:

            attendance = self.attendance_repository.get_by_id(
                db=db,
                attendance_id=attendance_id,
            )

            if attendance is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance not found.",
                )

            self.attendance_repository.delete(
                db=db,
                attendance=attendance,
            )

            logger.info(
                "Attendance deleted successfully.",
                extra={
                    "attendance_id": str(attendance.id),
                },
            )

        finally:

            db.close()

# ==========================================================
# Mark Attendance
# ==========================================================

    def mark_attendance(
        self,
        employee_id: UUID,
        recognition_score: float,
    ):

        db = SessionLocal()

        try:

            # --------------------------------------------------
            # Validate Employee
            # --------------------------------------------------

            employee = self.employee_repository.get_by_id(
                db=db,
                employee_id=employee_id,
            )

            if employee is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found.",
                )

            # --------------------------------------------------
            # Current Date & Time
            # --------------------------------------------------

            current_time = datetime.now(timezone.utc)

            today = current_time.date()

            # --------------------------------------------------
            # Today's Attendance
            # --------------------------------------------------

            attendance = (
                self.attendance_repository.get_today_by_employee(
                    db=db,
                    employee_id=employee_id,
                    attendance_date=today,
                )
            )

            # --------------------------------------------------
            # First Attendance
            # --------------------------------------------------

            if attendance is None:

                attendance = Attendance(

                    employee_id=employee.id,

                    attendance_date=today,

                    check_in_time=current_time,

                    status="PRESENT",

                    recognition_score=recognition_score,

                )

                attendance = self.attendance_repository.create(
                    db=db,
                    attendance=attendance,
                )

                logger.info(
                    "Employee checked in.",
                    extra={
                        "employee_id": str(employee.id),
                    },
                )

                return {
                    "attendance_type": "CHECK_IN",
                    "attendance": attendance,
                }

            # --------------------------------------------------
            # Check-Out
            # --------------------------------------------------

            if attendance.check_out_time is None:

                attendance.check_out_time = current_time

                attendance.recognition_score = recognition_score

                attendance = self.attendance_repository.update(
                    db=db,
                    attendance=attendance,
                )

                logger.info(
                    "Employee checked out.",
                    extra={
                        "employee_id": str(employee.id),
                    },
                )

                return {
                    "attendance_type": "CHECK_OUT",
                    "attendance": attendance,
                }

            # --------------------------------------------------
            # Already Completed
            # --------------------------------------------------

            logger.info(
                "Attendance already completed.",
                extra={
                    "employee_id": str(employee.id),
                },
            )

            return {
                "attendance_type": "ALREADY_COMPLETED",
                "attendance": attendance,
            }

        finally:

            db.close()