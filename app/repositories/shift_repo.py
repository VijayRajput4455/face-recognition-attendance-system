from uuid import UUID

from sqlalchemy.orm import Session

from app.models.shift import Shift
from app.schemas.shift import (
    ShiftCreate,
    ShiftUpdate,
)


class ShiftRepository:

    # ==========================================================
    # Create
    # ==========================================================

    def create(
        self,
        db: Session,
        shift: ShiftCreate,
    ) -> Shift:

        db_shift = Shift(

            shift_name=shift.shift_name,

            start_time=shift.start_time,

            end_time=shift.end_time,

            grace_minutes=shift.grace_minutes,

        )

        db.add(db_shift)

        db.commit()

        db.refresh(db_shift)

        return db_shift

    # ==========================================================
    # Get All
    # ==========================================================

    def get_all(
        self,
        db: Session,
    ) -> list[Shift]:

        return (

            db.query(Shift)

            .order_by(
                Shift.shift_name
            )

            .all()

        )

    # ==========================================================
    # Get By ID
    # ==========================================================

    def get_by_id(
        self,
        db: Session,
        shift_id: UUID | str,
    ) -> Shift | None:

        return (

            db.query(Shift)

            .filter(
                Shift.id == shift_id
            )

            .first()

        )

    # ==========================================================
    # Get By Name
    # ==========================================================

    def get_by_name(
        self,
        db: Session,
        shift_name: str,
    ) -> Shift | None:

        return (

            db.query(Shift)

            .filter(
                Shift.shift_name == shift_name
            )

            .first()

        )

    # ==========================================================
    # Update
    # ==========================================================

    def update(
        self,
        db: Session,
        shift: Shift,
        request: ShiftUpdate,
    ) -> Shift:

        shift.shift_name = request.shift_name

        shift.start_time = request.start_time

        shift.end_time = request.end_time

        shift.grace_minutes = request.grace_minutes

        db.commit()

        db.refresh(shift)

        return shift

    # ==========================================================
    # Delete
    # ==========================================================

    def delete(
        self,
        db: Session,
        shift: Shift,
    ) -> None:

        db.delete(shift)

        db.commit()