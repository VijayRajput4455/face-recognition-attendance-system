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