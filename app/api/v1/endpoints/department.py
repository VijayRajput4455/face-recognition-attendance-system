from uuid import UUID

from fastapi import APIRouter
from fastapi import status

from app.core.logger import get_logger
from app.orchestrators.department_orchestrator import (
    DepartmentOrchestrator,
)
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
)

logger = get_logger(__name__)

router = APIRouter()

department_orchestrator = DepartmentOrchestrator()


# ==========================================================
# Create Department
# ==========================================================

@router.post(
    "",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    request: DepartmentCreate,
):

    logger.info(
        "Department creation request received."
    )

    return department_orchestrator.create(
        request=request,
    )


# ==========================================================
# Get All Departments
# ==========================================================

@router.get(
    "",
    response_model=list[DepartmentResponse],
)
def get_departments():

    logger.info(
        "Fetching all departments."
    )

    return department_orchestrator.get_all()


# ==========================================================
# Get Department By ID
# ==========================================================

@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def get_department(
    department_id: UUID,
):

    logger.info(
        "Fetching department.",
        extra={
            "department_id": str(department_id),
        },
    )

    return department_orchestrator.get_by_id(
        department_id=department_id,
    )


# ==========================================================
# Update Department
# ==========================================================

@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def update_department(
    department_id: UUID,
    request: DepartmentUpdate,
):

    logger.info(
        "Updating department.",
        extra={
            "department_id": str(department_id),
        },
    )

    return department_orchestrator.update(
        department_id=department_id,
        request=request,
    )


# ==========================================================
# Delete Department
# ==========================================================

@router.delete(
    "/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_department(
    department_id: UUID,
):

    logger.info(
        "Deleting department.",
        extra={
            "department_id": str(department_id),
        },
    )

    department_orchestrator.delete(
        department_id=department_id,
    )