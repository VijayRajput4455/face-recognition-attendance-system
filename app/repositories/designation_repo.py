from uuid import UUID

from sqlalchemy.orm import Session

from app.models.designation import Designation
from app.schemas.designation import (
    DesignationCreate,
    DesignationUpdate,
)


class DesignationRepository:

    # ==========================================================
    # Create
    # ==========================================================

    def create(
        self,
        db: Session,
        designation: DesignationCreate,
    ) -> Designation:

        db_designation = Designation(
            designation_name=designation.designation_name,
            description=designation.description,
        )

        db.add(db_designation)
        db.commit()
        db.refresh(db_designation)

        return db_designation

    # ==========================================================
    # Get All
    # ==========================================================

    def get_all(
        self,
        db: Session,
    ) -> list[Designation]:

        return (
            db.query(Designation)
            .order_by(Designation.designation_name)
            .all()
        )

    # ==========================================================
    # Get By ID
    # ==========================================================

    def get_by_id(
        self,
        db: Session,
        designation_id: UUID | str,
    ) -> Designation | None:

        return (
            db.query(Designation)
            .filter(Designation.id == designation_id)
            .first()
        )

    # ==========================================================
    # Get By Name
    # ==========================================================

    def get_by_name(
        self,
        db: Session,
        designation_name: str,
    ) -> Designation | None:

        return (
            db.query(Designation)
            .filter(Designation.designation_name == designation_name)
            .first()
        )

    # ==========================================================
    # Update
    # ==========================================================

    def update(
        self,
        db: Session,
        designation: Designation,
        request: DesignationUpdate,
    ) -> Designation:

        designation.designation_name = request.designation_name
        designation.description = request.description

        db.commit()
        db.refresh(designation)

        return designation

    # ==========================================================
    # Delete
    # ==========================================================

    def delete(
        self,
        db: Session,
        designation: Designation,
    ) -> None:

        db.delete(designation)
        db.commit()
