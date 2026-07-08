from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.attendance import Attendance


class AttendanceRepository:

    # ==========================================================
    # Create Attendance
    # ==========================================================

    def create(
        self,
        db: Session,
        attendance: Attendance,
    ) -> Attendance:

        db.add(attendance)

        db.commit()

        db.refresh(attendance)

        return attendance

    # ==========================================================
    # Get All Attendance
    # ==========================================================

    def get_all(
        self,
        db: Session,
    ) -> list[Attendance]:

        return (
            db.query(Attendance)
            .order_by(
                Attendance.attendance_date.desc(),
                Attendance.check_in_time.desc(),
            )
            .all()
        )

    # ==========================================================
    # Get Attendance By ID
    # ==========================================================

    def get_by_id(
        self,
        db: Session,
        attendance_id: UUID | str,
    ) -> Attendance | None:

        return (
            db.query(Attendance)
            .filter(
                Attendance.id == attendance_id,
            )
            .first()
        )

    # ==========================================================
    # Get Today's Attendance
    # ==========================================================

    def get_today_by_employee(
        self,
        db: Session,
        employee_id: UUID | str,
        attendance_date: date,
    ) -> Attendance | None:

        return (
            db.query(Attendance)
            .filter(
                Attendance.employee_id == employee_id,
                Attendance.attendance_date == attendance_date,
            )
            .first()
        )

    # ==========================================================
    # Get Attendance By Employee
    # ==========================================================

    def get_by_employee(
        self,
        db: Session,
        employee_id: UUID | str,
    ) -> list[Attendance]:

        return (
            db.query(Attendance)
            .filter(
                Attendance.employee_id == employee_id,
            )
            .order_by(
                Attendance.attendance_date.desc(),
            )
            .all()
        )

    # ==========================================================
    # Update Attendance
    # ==========================================================

    def update(
        self,
        db: Session,
        attendance: Attendance,
    ) -> Attendance:

        db.commit()

        db.refresh(attendance)

        return attendance

    # ==========================================================
    # Delete Attendance
    # ==========================================================

    def delete(
        self,
        db: Session,
        attendance: Attendance,
    ) -> None:

        db.delete(attendance)

        db.commit()