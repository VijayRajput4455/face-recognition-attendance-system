from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import status

from app.core.logger import get_logger
from app.orchestrators.milvus_admin_orchestrator import (
    MilvusAdminOrchestrator,
)

logger = get_logger(__name__)

router = APIRouter()

orchestrator = MilvusAdminOrchestrator()


# ==========================================================
# Count
# ==========================================================

@router.get(
    "/count",
)
async def count_vectors():

    logger.info(
        "Milvus count requested."
    )

    try:

        total = orchestrator.count()

        return {
            "total_vectors": total,
        }

    except Exception:

        logger.exception(
            "Failed to count vectors."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to count vectors.",
        )


# ==========================================================
# Get All
# ==========================================================

@router.get(
    "/employees",
)
async def get_all_employees():

    logger.info(
        "Milvus employees requested."
    )

    try:

        return orchestrator.get_all()

    except Exception:

        logger.exception(
            "Failed to fetch employees."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch employees.",
        )


# ==========================================================
# Get By Employee ID
# ==========================================================

@router.get(
    "/employee/{employee_id}",
)
async def get_employee(
    employee_id: str,
):

    logger.info(
        "Milvus employee lookup.",
        extra={
            "employee_id": employee_id,
        },
    )

    try:

        employee = orchestrator.get_by_employee_id(
            employee_id
        )

        if employee is None:

            raise HTTPException(

                status_code=status.HTTP_404_NOT_FOUND,

                detail="Employee not found.",

            )

        return employee

    except HTTPException:

        raise

    except Exception:

        logger.exception(
            "Employee lookup failed."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch employee.",
        )


# ==========================================================
# Get By Employee Code
# ==========================================================

@router.get(
    "/employee/code/{employee_code}",
)
async def get_employee_by_code(
    employee_code: str,
):

    logger.info(
        "Milvus employee lookup by code.",
        extra={
            "employee_code": employee_code,
        },
    )

    try:

        employee = orchestrator.get_by_employee_code(
            employee_code
        )

        if employee is None:

            raise HTTPException(

                status_code=status.HTTP_404_NOT_FOUND,

                detail="Employee not found.",

            )

        return employee

    except HTTPException:

        raise

    except Exception:

        logger.exception(
            "Employee lookup failed."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch employee.",
        )


# ==========================================================
# Collection Info
# ==========================================================

@router.get(
    "/info",
)
async def collection_info():

    logger.info(
        "Milvus collection info requested."
    )

    try:

        return orchestrator.collection_info()

    except Exception:

        logger.exception(
            "Failed to fetch collection information."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch collection information.",
        )
    
# ==========================================================
# Delete Employee
# ==========================================================

@router.delete(
    "/employee/{employee_id}",
)
async def delete_employee(
    employee_id: str,
):

    logger.info(
        "Delete employee requested.",
        extra={
            "employee_id": employee_id,
        },
    )

    try:

        orchestrator.delete(
            employee_id
        )

        return {
            "message": "Employee vector deleted successfully."
        }

    except Exception:

        logger.exception(
            "Failed to delete employee."
        )

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail="Unable to delete employee.",

        )
    
# ==========================================================
# Delete All
# ==========================================================

@router.delete(
    "/all",
)
async def delete_all():

    logger.warning(
        "Delete all vectors requested."
    )

    try:

        orchestrator.delete_all()

        return {

            "message": "All vectors deleted successfully."

        }

    except Exception:

        logger.exception(
            "Failed to delete all vectors."
        )

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail="Unable to delete vectors.",

        )
    

# ==========================================================
# Index Information
# ==========================================================

@router.get(
    "/config",
)
async def index_info():

    logger.info(
        "Milvus index information requested."
    )

    try:

        return orchestrator.index_info()

    except Exception:

        logger.exception(
            "Failed to fetch index information."
        )

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail="Unable to fetch index information.",

        )
    
# ==========================================================
# Health Check
# ==========================================================

@router.get(
    "/health",
)
async def health():

    logger.info(
        "Milvus health requested."
    )

    return orchestrator.health()