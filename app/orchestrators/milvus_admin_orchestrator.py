from app.core.logger import get_logger
from app.services.milvus_service import MilvusService

logger = get_logger(__name__)


class MilvusAdminOrchestrator:

    def __init__(
        self,
    ):

        self.milvus_service = MilvusService()

    # ==========================================================
    # Count
    # ==========================================================

    def count(
        self,
    ) -> int:

        logger.info(
            "Fetching Milvus vector count."
        )

        return self.milvus_service.count()

    # ==========================================================
    # Get All
    # ==========================================================

    def get_all(
        self,
    ) -> list[dict]:

        logger.info(
            "Fetching all Milvus records."
        )

        return self.milvus_service.get_all()

    # ==========================================================
    # Get By Employee ID
    # ==========================================================

    def get_by_employee_id(
        self,
        employee_id: str,
    ) -> dict | None:

        logger.info(
            "Fetching employee from Milvus by employee_id.",
            extra={
                "employee_id": employee_id,
            },
        )

        return self.milvus_service.get_by_employee_id(
            employee_id
        )

    # ==========================================================
    # Get By Employee Code
    # ==========================================================

    def get_by_employee_code(
        self,
        employee_code: str,
    ) -> dict | None:

        logger.info(
            "Fetching employee from Milvus by employee_code.",
            extra={
                "employee_code": employee_code,
            },
        )

        return self.milvus_service.get_by_employee_code(
            employee_code
        )

    # ==========================================================
    # Collection Info
    # ==========================================================

    def collection_info(
        self,
    ) -> dict:

        logger.info(
            "Fetching Milvus collection information."
        )

        return self.milvus_service.collection_info()
    
    # ==========================================================
    # Delete Employee
    # ==========================================================

    def delete(
        self,
        employee_id: str,
    ) -> bool:

        logger.info(
            "Deleting employee from Milvus.",
            extra={
                "employee_id": employee_id,
            },
        )

        return self.milvus_service.delete(
            employee_id=employee_id,
        )
    
    # ==========================================================
    # Delete All
    # ==========================================================

    def delete_all(
        self,
    ) -> bool:

        logger.warning(
            "Deleting all vectors from Milvus."
        )

        return self.milvus_service.delete_all()
    
    # ==========================================================
    # Index Information
    # ==========================================================

    def index_info(
        self,
    ) -> dict:

        logger.info(
            "Fetching Milvus index information."
        )

        return self.milvus_service.index_info()
    

    # ==========================================================
    # Health Check
    # ==========================================================

    def health(
        self,
    ) -> dict:

        logger.info(
            "Fetching Milvus health."
        )

        return self.milvus_service.health()