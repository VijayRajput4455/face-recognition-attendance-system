from uuid import UUID

from fastapi import HTTPException, status

from app.core.database import SessionLocal
from app.core.logger import get_logger
from app.repositories.designation_repo import DesignationRepository
from app.schemas.designation import (
    DesignationCreate,
    DesignationUpdate,
    DesignationResponse,
    DesignationBulkResponse,
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
    # Bulk Create (JSON List)
    # ==========================================================

    def bulk_create(
        self,
        items: list[DesignationCreate],
    ) -> DesignationBulkResponse:

        db = SessionLocal()
        successful_list = []
        errors = []

        try:
            for idx, item in enumerate(items, start=1):
                name = item.designation_name.strip() if item.designation_name else ""
                if not name:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=item.designation_name,
                            error="Designation name cannot be empty.",
                        )
                    )
                    continue

                existing = self.designation_repository.get_by_name(
                    db=db,
                    designation_name=name,
                )
                if existing:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=name,
                            error=f"Designation '{name}' already exists.",
                        )
                    )
                    continue

                try:
                    desig = self.designation_repository.create(
                        db=db,
                        designation=DesignationCreate(
                            designation_name=name,
                            description=item.description,
                        ),
                    )
                    successful_list.append(DesignationResponse.model_validate(desig))
                except Exception as e:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=name,
                            error=str(e),
                        )
                    )

            logger.info(
                f"Designation bulk creation complete: {len(successful_list)} created, {len(errors)} failed."
            )

            return DesignationBulkResponse(
                total_records=len(items),
                successful_count=len(successful_list),
                failed_count=len(errors),
                errors=errors,
                inserted_designations=successful_list,
            )

        finally:
            db.close()

    # ==========================================================
    # Bulk Upload CSV
    # ==========================================================

    def bulk_upload_csv(
        self,
        file_content: bytes,
    ) -> DesignationBulkResponse:

        import csv
        import io

        text_content = file_content.decode("utf-8-sig", errors="replace")
        csv_reader = csv.DictReader(io.StringIO(text_content))

        items = []
        for row in csv_reader:
            name = (
                row.get("designation_name")
                or row.get("name")
                or row.get("Designation")
                or row.get("Designation Name")
                or ""
            ).strip()
            desc = (
                row.get("description")
                or row.get("Description")
                or None
            )
            if name:
                items.append(
                    DesignationCreate(
                        designation_name=name,
                        description=desc.strip() if desc else None,
                    )
                )

        if not items:
            return DesignationBulkResponse(
                total_records=0,
                successful_count=0,
                failed_count=0,
                errors=[
                    BulkErrorDetail(
                        row=0,
                        identifier=None,
                        error="CSV file is empty or missing 'designation_name' header.",
                    )
                ],
                inserted_designations=[],
            )

        return self.bulk_create(items=items)

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

