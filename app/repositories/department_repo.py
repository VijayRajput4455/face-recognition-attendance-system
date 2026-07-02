from uuid import UUID

from sqlalchemy.orm import Session

from app.models.department import Department
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
)


class DepartmentRepository:

    # ==========================================================
    # Create
    # ==========================================================

    def create(
        self,
        db: Session,
        department: DepartmentCreate,
    ) -> Department:

        db_department = Department(

            department_name=department.department_name,

            description=department.description,

        )

        db.add(db_department)

        db.commit()

        db.refresh(db_department)

        return db_department

    # ==========================================================
    # Get All
    # ==========================================================

    def get_all(
        self,
        db: Session,
    ) -> list[Department]:

        return (

            db.query(Department)

            .order_by(
                Department.department_name
            )

            .all()

        )

    # ==========================================================
    # Get By ID
    # ==========================================================

    def get_by_id(
        self,
        db: Session,
        department_id: UUID | str,
    ) -> Department | None:

        return (

            db.query(Department)

            .filter(
                Department.id == department_id
            )

            .first()

        )

    # ==========================================================
    # Get By Name
    # ==========================================================

    def get_by_name(
        self,
        db: Session,
        department_name: str,
    ) -> Department | None:

        return (

            db.query(Department)

            .filter(
                Department.department_name == department_name
            )

            .first()

        )

    # ==========================================================
    # Update
    # ==========================================================

    def update(
        self,
        db: Session,
        department: Department,
        request: DepartmentUpdate,
    ) -> Department:

        department.department_name = (
            request.department_name
        )

        department.description = (
            request.description
        )

        db.commit()

        db.refresh(department)

        return department

    # ==========================================================
    # Delete
    # ==========================================================

    def delete(
        self,
        db: Session,
        department: Department,
    ) -> None:

        db.delete(department)

        db.commit()