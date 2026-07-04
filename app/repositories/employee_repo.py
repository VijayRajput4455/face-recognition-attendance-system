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
    # Get All
    # ==========================================================

    def get_all(
        self,
        db: Session,
    ) -> list[Employee]:

        return (
            db.query(Employee)
            .order_by(Employee.employee_code)
            .all()
        )

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
    # Get By Department
    # ==========================================================

    def get_by_department(
        self,
        db: Session,
        department_id: UUID | str,
    ) -> list[Employee]:

        return (
            db.query(Employee)
            .filter(
                Employee.department_id == department_id
            )
            .all()
        )

    # ==========================================================
    # Get By Shift
    # ==========================================================

    def get_by_shift(
        self,
        db: Session,
        shift_id: UUID | str,
    ) -> list[Employee]:

        return (
            db.query(Employee)
            .filter(
                Employee.shift_id == shift_id
            )
            .all()
        )

    # ==========================================================
    # Get By Status
    # ==========================================================

    def get_by_status(
        self,
        db: Session,
        employment_status: str,
    ) -> list[Employee]:

        return (
            db.query(Employee)
            .filter(
                Employee.employment_status == employment_status
            )
            .all()
        )

    # ==========================================================
    # Update
    # ==========================================================

    def update(
        self,
        db: Session,
        employee: Employee,
    ) -> Employee:

        db.commit()

        db.refresh(employee)

        return employee

    # ==========================================================
    # Delete
    # ==========================================================

    def delete(
        self,
        db: Session,
        employee: Employee,
    ) -> None:

        db.delete(employee)

        db.commit()

    # ==========================================================
    # Update Employment Status
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