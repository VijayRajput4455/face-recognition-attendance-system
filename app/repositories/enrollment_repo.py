from sqlalchemy.orm import Session
from uuid import UUID

from app.models.employee_enrollment import (
    EmployeeEnrollment
)


class EnrollmentRepository:

    def create(
        self,
        db: Session,
        enrollment: EmployeeEnrollment
    ):

        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)

        return enrollment

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