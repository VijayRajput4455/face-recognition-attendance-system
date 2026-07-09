from datetime import date
from datetime import datetime
from datetime import time
from datetime import timedelta
from uuid import UUID

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.attendance_log import AttendanceLog


class AttendanceLogRepository:

    # ==========================================================
    # Create Attendance Log
    # ==========================================================

    def create(
        self,
        db: Session,
        attendance_log: AttendanceLog,
    ) -> AttendanceLog:

        db.add(attendance_log)

        db.commit()

        db.refresh(attendance_log)

        return attendance_log

    # ==========================================================
    # Get All Attendance Logs
    # ==========================================================

    def get_all(
        self,
        db: Session,
    ) -> list[AttendanceLog]:

        return (
            db.query(AttendanceLog)
            .order_by(
                AttendanceLog.recognition_time.desc(),
            )
            .all()
        )

    # ==========================================================
    # Get Attendance Log By ID
    # ==========================================================

    def get_by_id(
        self,
        db: Session,
        attendance_log_id: UUID | str,
    ) -> AttendanceLog | None:

        return (
            db.query(AttendanceLog)
            .filter(
                AttendanceLog.id == attendance_log_id,
            )
            .first()
        )

    # ==========================================================
    # Get Logs By Employee
    # ==========================================================

    def get_by_employee(
        self,
        db: Session,
        employee_id: UUID | str,
    ) -> list[AttendanceLog]:

        return (
            db.query(AttendanceLog)
            .filter(
                AttendanceLog.employee_id == employee_id,
            )
            .order_by(
                AttendanceLog.recognition_time.desc(),
            )
            .all()
        )

    # ==========================================================
    # Get Latest Log By Employee
    # ==========================================================

    def get_latest_by_employee(
        self,
        db: Session,
        employee_id: UUID | str,
    ) -> AttendanceLog | None:

        return (
            db.query(AttendanceLog)
            .filter(
                AttendanceLog.employee_id == employee_id,
            )
            .order_by(AttendanceLog.recognition_time.desc())
            .first()
        )

    # ==========================================================
    # Get Logs By Employee And Date
    # ==========================================================

    def get_by_employee_and_date(
        self,
        db: Session,
        employee_id: UUID | str,
        attendance_date: date,
    ) -> list[AttendanceLog]:

        start_of_day = datetime.combine(
            attendance_date,
            time.min,
        )

        end_of_day = start_of_day + timedelta(days=1)

        return (
            db.query(AttendanceLog)
            .filter(
                and_(
                    AttendanceLog.employee_id == employee_id,
                    AttendanceLog.recognition_time >= start_of_day,
                    AttendanceLog.recognition_time < end_of_day,
                )
            )
            .order_by(
                AttendanceLog.recognition_time.asc(),
            )
            .all()
        )

    # ==========================================================
    # Get Logs By Employee And Date Range
    # ==========================================================

    def get_by_employee_and_date_range(
        self,
        db: Session,
        employee_id: UUID | str,
        start_date: date,
        end_date: date,
    ) -> list[AttendanceLog]:

        start_of_period = datetime.combine(
            start_date,
            time.min,
        )

        end_of_period = datetime.combine(
            end_date + timedelta(days=1),
            time.min,
        )

        return (
            db.query(AttendanceLog)
            .filter(
                and_(
                    AttendanceLog.employee_id == employee_id,
                    AttendanceLog.recognition_time >= start_of_period,
                    AttendanceLog.recognition_time < end_of_period,
                )
            )
            .order_by(AttendanceLog.recognition_time.asc())
            .all()
        )

    # ==========================================================
    # Delete Attendance Log
    # ==========================================================

    def delete(
        self,
        db: Session,
        attendance_log: AttendanceLog,
    ) -> None:

        db.delete(attendance_log)

        db.commit()