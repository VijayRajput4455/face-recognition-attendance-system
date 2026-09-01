from uuid import UUID

from fastapi import HTTPException, status

from app.core.database import SessionLocal
from app.core.logger import get_logger

from app.repositories.department_repo import DepartmentRepository

from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
)

logger = get_logger(__name__)


class DepartmentOrchestrator:

    def __init__(self):

        self.department_repository = DepartmentRepository()

    # ==========================================================
    # Create
    # ==========================================================

    def create(
        self,
        request: DepartmentCreate,
    ) -> DepartmentResponse:

        db = SessionLocal()

        try:

            existing = (
                self.department_repository.get_by_name(
                    db=db,
                    department_name=request.department_name,
                )
            )

            if existing:

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Department already exists.",
                )

            department = (
                self.department_repository.create(
                    db=db,
                    department=request,
                )
            )

            logger.info(
                "Department created.",
                extra={
                    "department_name": department.department_name,
                },
            )

            return DepartmentResponse.model_validate(
                department
            )

        finally:

            db.close()

    # ==========================================================
    # Get All
    # ==========================================================

    def get_all(
        self,
    ) -> list[DepartmentResponse]:

        db = SessionLocal()

        try:

            departments = (
                self.department_repository.get_all(
                    db=db,
                )
            )

            return [
                DepartmentResponse.model_validate(
                    department
                )
                for department in departments
            ]

        finally:

            db.close()

    # ==========================================================
    # Get By ID
    # ==========================================================

    def get_by_id(
        self,
        department_id: UUID,
    ) -> DepartmentResponse:

        db = SessionLocal()

        try:

            department = (
                self.department_repository.get_by_id(
                    db=db,
                    department_id=department_id,
                )
            )

            if department is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Department not found.",
                )

            return DepartmentResponse.model_validate(
                department
            )

        finally:

            db.close()

    # ==========================================================
    # Update
    # ==========================================================

    def update(
        self,
        department_id: UUID,
        request: DepartmentUpdate,
    ) -> DepartmentResponse:

        db = SessionLocal()

        try:

            department = (
                self.department_repository.get_by_id(
                    db=db,
                    department_id=department_id,
                )
            )

            if department is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Department not found.",
                )

            department = (
                self.department_repository.update(
                    db=db,
                    department=department,
                    request=request,
                )
            )

            logger.info(
                "Department updated.",
                extra={
                    "department_name": department.department_name,
                },
            )

            return DepartmentResponse.model_validate(
                department
            )

        finally:

            db.close()

    # ==========================================================
    # Bulk Create (JSON List)
    # ==========================================================

    def bulk_create(
        self,
        items: list[DepartmentCreate],
    ) -> DepartmentBulkResponse:

        db = SessionLocal()
        successful_list = []
        errors = []

        try:
            for idx, item in enumerate(items, start=1):
                name = item.department_name.strip() if item.department_name else ""
                if not name:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=item.department_name,
                            error="Department name cannot be empty.",
                        )
                    )
                    continue

                existing = self.department_repository.get_by_name(
                    db=db,
                    department_name=name,
                )
                if existing:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=name,
                            error=f"Department '{name}' already exists.",
                        )
                    )
                    continue

                try:
                    dept = self.department_repository.create(
                        db=db,
                        department=DepartmentCreate(
                            department_name=name,
                            description=item.description,
                        ),
                    )
                    successful_list.append(DepartmentResponse.model_validate(dept))
                except Exception as e:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=name,
                            error=str(e),
                        )
                    )

            logger.info(
                f"Department bulk creation complete: {len(successful_list)} created, {len(errors)} failed."
            )

            return DepartmentBulkResponse(
                total_records=len(items),
                successful_count=len(successful_list),
                failed_count=len(errors),
                errors=errors,
                inserted_departments=successful_list,
            )

        finally:
            db.close()

    # ==========================================================
    # Bulk Upload CSV
    # ==========================================================

    def bulk_upload_csv(
        self,
        file_content: bytes,
    ) -> DepartmentBulkResponse:

        import csv
        import io

        text_content = file_content.decode("utf-8-sig", errors="replace")
        csv_reader = csv.DictReader(io.StringIO(text_content))

        items = []
        for row in csv_reader:
            name = (
                row.get("department_name")
                or row.get("name")
                or row.get("Department")
                or row.get("Department Name")
                or ""
            ).strip()
            desc = (
                row.get("description")
                or row.get("Description")
                or None
            )
            if name:
                items.append(
                    DepartmentCreate(
                        department_name=name,
                        description=desc.strip() if desc else None,
                    )
                )

        if not items:
            return DepartmentBulkResponse(
                total_records=0,
                successful_count=0,
                failed_count=0,
                errors=[
                    BulkErrorDetail(
                        row=0,
                        identifier=None,
                        error="CSV file is empty or missing 'department_name' header.",
                    )
                ],
                inserted_departments=[],
            )

        return self.bulk_create(items=items)


    # ==========================================================
    # Delete
    # ==========================================================

    def delete(
        self,
        department_id: UUID,
    ) -> None:

        db = SessionLocal()

        try:

            department = (
                self.department_repository.get_by_id(
                    db=db,
                    department_id=department_id,
                )
            )

            if department is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Department not found.",
                )

            self.department_repository.delete(
                db=db,
                department=department,
            )

            logger.info(
                "Department deleted.",
                extra={
                    "department_name": department.department_name,
                },
            )

        finally:

            db.close()