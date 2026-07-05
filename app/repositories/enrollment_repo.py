from uuid import UUID

from sqlalchemy.orm import Session

from app.models.employee_enrollment import (
    EmployeeEnrollment,
)


class EnrollmentRepository:

    # ==========================================================
    # Create Enrollment
    # ==========================================================

    def create(
        self,
        db: Session,
        enrollment: EmployeeEnrollment,
    ) -> EmployeeEnrollment:

        db.add(enrollment)

        db.commit()

        db.refresh(enrollment)

        return enrollment

    # ==========================================================
    # Get All Enrollments
    # ==========================================================

    def get_all(
        self,
        db: Session,
    ) -> list[EmployeeEnrollment]:

        return (
            db.query(EmployeeEnrollment)
            .order_by(
                EmployeeEnrollment.created_at.desc()
            )
            .all()
        )

    # ==========================================================
    # Get Enrollment By ID
    # ==========================================================

    def get_by_id(
        self,
        db: Session,
        enrollment_id: UUID | str,
    ) -> EmployeeEnrollment | None:

        return (
            db.query(EmployeeEnrollment)
            .filter(
                EmployeeEnrollment.id == enrollment_id
            )
            .first()
        )

    # ==========================================================
    # Get Enrollments By Employee
    # ==========================================================

    def get_by_employee(
        self,
        db: Session,
        employee_id: UUID | str,
    ) -> list[EmployeeEnrollment]:

        return (
            db.query(EmployeeEnrollment)
            .filter(
                EmployeeEnrollment.employee_id == employee_id
            )
            .order_by(
                EmployeeEnrollment.created_at.desc()
            )
            .all()
        )

    # ==========================================================
    # Get Pending Enrollment By Employee
    # ==========================================================

    def get_pending_by_employee(
        self,
        db: Session,
        employee_id: UUID | str,
    ) -> EmployeeEnrollment | None:

        return (
            db.query(EmployeeEnrollment)
            .filter(
                EmployeeEnrollment.employee_id == employee_id,
                EmployeeEnrollment.status.in_(
                    [
                        "PENDING",
                        "PROCESSING",
                    ]
                ),
            )
            .first()
        )

    # ==========================================================
    # Update Enrollment Status
    # ==========================================================

    def update_status(
        self,
        db: Session,
        enrollment_id: UUID | str,
        status: str,
        error_message: str | None = None,
    ) -> EmployeeEnrollment | None:

        enrollment = self.get_by_id(
            db=db,
            enrollment_id=enrollment_id,
        )

        if enrollment is None:

            return None

        enrollment.status = status

        enrollment.error_message = error_message

        db.commit()

        db.refresh(enrollment)

        return enrollment

    # ==========================================================
    # Delete Enrollment
    # ==========================================================

    def delete(
        self,
        db: Session,
        enrollment: EmployeeEnrollment,
    ) -> None:

        db.delete(enrollment)

        db.commit()