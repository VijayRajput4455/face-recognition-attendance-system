from datetime import date
from uuid import UUID

from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.models.attendance_summary import AttendanceSummary


class AttendanceSummaryRepository:

    # ==========================================================
    # Create Summary
    # ==========================================================

    def create(
        self,
        db: Session,
        attendance_summary: AttendanceSummary,
    ) -> AttendanceSummary:

        db.add(attendance_summary)

        db.commit()

        db.refresh(attendance_summary)

        return attendance_summary

    # ==========================================================
    # Get All Summaries
    # ==========================================================

    def get_all(
        self,
        db: Session,
    ) -> list[AttendanceSummary]:

        return (
            db.query(AttendanceSummary)
            .order_by(
                AttendanceSummary.attendance_date.desc(),
            )
            .all()
        )

    # ==========================================================
    # Get Summary By ID
    # ==========================================================

    def get_by_id(
        self,
        db: Session,
        attendance_summary_id: UUID | str,
    ) -> AttendanceSummary | None:

        return (
            db.query(AttendanceSummary)
            .filter(
                AttendanceSummary.id == attendance_summary_id,
            )
            .first()
        )

    # ==========================================================
    # Get Employee Summary By Date
    # ==========================================================

    def get_by_employee_and_date(
        self,
        db: Session,
        employee_id: UUID | str,
        attendance_date: date,
    ) -> AttendanceSummary | None:

        return (
            db.query(AttendanceSummary)
            .filter(
                AttendanceSummary.employee_id == employee_id,
                AttendanceSummary.attendance_date == attendance_date,
            )
            .first()
        )

    # ==========================================================
    # Get Employee Summaries
    # ==========================================================

    def get_by_employee(
        self,
        db: Session,
        employee_id: UUID | str,
    ) -> list[AttendanceSummary]:

        return (
            db.query(AttendanceSummary)
            .filter(
                AttendanceSummary.employee_id == employee_id,
            )
            .order_by(
                AttendanceSummary.attendance_date.desc(),
            )
            .all()
        )

    # ==========================================================
    # Get Employee Summaries By Month
    # ==========================================================

    def get_by_employee_and_month(
        self,
        db: Session,
        employee_id: UUID | str,
        month: int,
        year: int,
    ) -> list[AttendanceSummary]:

        return (
            db.query(AttendanceSummary)
            .filter(
                AttendanceSummary.employee_id == employee_id,
                extract("month", AttendanceSummary.attendance_date) == month,
                extract("year", AttendanceSummary.attendance_date) == year,
            )
            .order_by(AttendanceSummary.attendance_date.asc())
            .all()
        )

    # ==========================================================
    # Update Summary
    # ==========================================================

    def update(
        self,
        db: Session,
        attendance_summary: AttendanceSummary,
    ) -> AttendanceSummary:

        db.commit()

        db.refresh(attendance_summary)

        return attendance_summary

    # ==========================================================
    # Delete Summary
    # ==========================================================

    def delete(
        self,
        db: Session,
        attendance_summary: AttendanceSummary,
    ) -> None:

        db.delete(attendance_summary)

        db.commit()