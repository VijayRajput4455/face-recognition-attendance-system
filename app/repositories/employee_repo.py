from uuid import UUID

from sqlalchemy.orm import Session

from app.models.employee import Employee


class EmployeeRepository:

    # ==========================================================
    # Create
    # ==========================================================

    def create(
        self,
        db: Session,
        employee: Employee,
    ) -> Employee:

        db.add(employee)

        db.commit()

        db.refresh(employee)

        return employee

    # ==========================================================
    # Get By Employee Code
    # ==========================================================

    def get_by_employee_code(
        self,
        db: Session,
        employee_code: str,
    ) -> Employee | None:

        return (
            db.query(Employee)
            .filter(
                Employee.employee_code == employee_code
            )
            .first()
        )

    # ==========================================================
    # Get By ID
    # ==========================================================

    def get_by_id(
        self,
        db: Session,
        employee_id: UUID | str,
    ) -> Employee | None:

        return (
            db.query(Employee)
            .filter(
                Employee.id == employee_id
            )
            .first()
        )
    
    # ==========================================================
    # Update Status
    # ==========================================================

    def update_status(
        self,
        db: Session,
        employee_id: UUID | str,
        status: str,
    ) -> Employee | None:

        employee = (
            db.query(Employee)
            .filter(
                Employee.id == employee_id
            )
            .first()
        )

        if employee is None:
            return None

        employee.employment_status = status

        db.commit()

        db.refresh(employee)

        return employee