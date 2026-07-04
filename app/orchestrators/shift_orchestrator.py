from uuid import UUID

from fastapi import HTTPException
from fastapi import status

from app.core.database import SessionLocal
from app.core.logger import get_logger

from app.repositories.shift_repo import ShiftRepository

from app.schemas.shift import (
    ShiftCreate,
    ShiftUpdate,
    ShiftResponse,
)

logger = get_logger(__name__)


class ShiftOrchestrator:

    def __init__(self):

        self.shift_repository = ShiftRepository()

    # ==========================================================
    # Create
    # ==========================================================

    def create(
        self,
        request: ShiftCreate,
    ) -> ShiftResponse:

        db = SessionLocal()

        try:

            existing = self.shift_repository.get_by_name(

                db=db,

                shift_name=request.shift_name,

            )

            if existing:

                raise HTTPException(

                    status_code=status.HTTP_409_CONFLICT,

                    detail="Shift already exists.",

                )

            shift = self.shift_repository.create(

                db=db,

                shift=request,

            )

            logger.info(

                "Shift created.",

                extra={
                    "shift_name": shift.shift_name,
                },

            )

            return ShiftResponse.model_validate(
                shift
            )

        finally:

            db.close()

    # ==========================================================
    # Get All
    # ==========================================================

    def get_all(
        self,
    ) -> list[ShiftResponse]:

        db = SessionLocal()

        try:

            shifts = self.shift_repository.get_all(
                db=db,
            )

            return [

                ShiftResponse.model_validate(
                    shift
                )

                for shift in shifts

            ]

        finally:

            db.close()

    # ==========================================================
    # Get By ID
    # ==========================================================

    def get_by_id(
        self,
        shift_id: UUID,
    ) -> ShiftResponse:

        db = SessionLocal()

        try:

            shift = self.shift_repository.get_by_id(

                db=db,

                shift_id=shift_id,

            )

            if shift is None:

                raise HTTPException(

                    status_code=status.HTTP_404_NOT_FOUND,

                    detail="Shift not found.",

                )

            return ShiftResponse.model_validate(
                shift
            )

        finally:

            db.close()

    # ==========================================================
    # Update
    # ==========================================================

    def update(
        self,
        shift_id: UUID,
        request: ShiftUpdate,
    ) -> ShiftResponse:

        db = SessionLocal()

        try:

            shift = self.shift_repository.get_by_id(

                db=db,

                shift_id=shift_id,

            )

            if shift is None:

                raise HTTPException(

                    status_code=status.HTTP_404_NOT_FOUND,

                    detail="Shift not found.",

                )

            shift = self.shift_repository.update(

                db=db,

                shift=shift,

                request=request,

            )

            logger.info(

                "Shift updated.",

                extra={
                    "shift_name": shift.shift_name,
                },

            )

            return ShiftResponse.model_validate(
                shift
            )

        finally:

            db.close()

    # ==========================================================
    # Delete
    # ==========================================================

    def delete(
        self,
        shift_id: UUID,
    ) -> None:

        db = SessionLocal()

        try:

            shift = self.shift_repository.get_by_id(

                db=db,

                shift_id=shift_id,

            )

            if shift is None:

                raise HTTPException(

                    status_code=status.HTTP_404_NOT_FOUND,

                    detail="Shift not found.",

                )

            self.shift_repository.delete(

                db=db,

                shift=shift,

            )

            logger.info(

                "Shift deleted.",

                extra={
                    "shift_name": shift.shift_name,
                },

            )

        finally:

            db.close()