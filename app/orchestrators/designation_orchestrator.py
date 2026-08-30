from uuid import UUID

from fastapi import HTTPException, status

from app.core.database import SessionLocal
from app.core.logger import get_logger
from app.repositories.designation_repo import DesignationRepository
from app.schemas.designation import (
    DesignationCreate,
    DesignationUpdate,
    DesignationResponse,
)

logger = get_logger(__name__)


class DesignationOrchestrator:

    def __init__(self):
        self.designation_repository = DesignationRepository()

    # ==========================================================
    # Create
    # ==========================================================

    def create(
        self,
        request: DesignationCreate,
    ) -> DesignationResponse:

        db = SessionLocal()

        try:
            existing = (
                self.designation_repository.get_by_name(
                    db=db,
                    designation_name=request.designation_name,
                )
            )

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Designation already exists.",
                )

            designation = (
                self.designation_repository.create(
                    db=db,
                    designation=request,
                )
            )

            logger.info(
                "Designation created.",
                extra={
                    "designation_name": designation.designation_name,
                },
            )

            return DesignationResponse.model_validate(designation)

        finally:
            db.close()

    # ==========================================================
    # Get All
    # ==========================================================

    def get_all(self) -> list[DesignationResponse]:

        db = SessionLocal()

        try:
            designations = self.designation_repository.get_all(db=db)

            return [
                DesignationResponse.model_validate(designation)
                for designation in designations
            ]

        finally:
            db.close()

    # ==========================================================
    # Get By ID
    # ==========================================================

    def get_by_id(
        self,
        designation_id: UUID,
    ) -> DesignationResponse:

        db = SessionLocal()

        try:
            designation = (
                self.designation_repository.get_by_id(
                    db=db,
                    designation_id=designation_id,
                )
            )

            if designation is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Designation not found.",
                )

            return DesignationResponse.model_validate(designation)

        finally:
            db.close()

    # ==========================================================
    # Update
    # ==========================================================

    def update(
        self,
        designation_id: UUID,
        request: DesignationUpdate,
    ) -> DesignationResponse:

        db = SessionLocal()

        try:
            designation = (
                self.designation_repository.get_by_id(
                    db=db,
                    designation_id=designation_id,
                )
            )

            if designation is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Designation not found.",
                )

            designation = (
                self.designation_repository.update(
                    db=db,
                    designation=designation,
                    request=request,
                )
            )

            logger.info(
                "Designation updated.",
                extra={
                    "designation_name": designation.designation_name,
                },
            )

            return DesignationResponse.model_validate(designation)

        finally:
            db.close()

    # ==========================================================
    # Delete
    # ==========================================================

    def delete(
        self,
        designation_id: UUID,
    ) -> None:

        db = SessionLocal()

        try:
            designation = (
                self.designation_repository.get_by_id(
                    db=db,
                    designation_id=designation_id,
                )
            )

            if designation is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Designation not found.",
                )

            self.designation_repository.delete(
                db=db,
                designation=designation,
            )

            logger.info(
                "Designation deleted.",
                extra={
                    "designation_name": designation.designation_name,
                },
            )

        finally:
            db.close()
