import numpy as np

from app.core.logger import get_logger
from app.core.database import SessionLocal
from app.repositories.employee_repo import EmployeeRepository
from app.schemas.recognition import RecognitionResponse
from app.services.recognition_service import RecognitionService
from app.schemas.recognition import EmployeeRecognition


logger = get_logger(__name__)


class RecognitionOrchestrator:

    def __init__(
        self,
    ):

        self.recognition_service = RecognitionService()

        self.employee_repository = EmployeeRepository()

    # ==========================================================
    # Public API
    # ==========================================================

    def recognize(
        self,
        image: np.ndarray,
    ) -> RecognitionResponse:

        logger.info(
            "Recognition request started."
        )

        try:

            results = self.recognition_service.recognize(
                image=image,
            )

            self._enrich_results(
                results
            )

            response = RecognitionResponse(

                total_faces=len(results),

                recognized_faces=results,

            )

            logger.info(
                "Recognition completed successfully.",
                extra={
                    "recognized_faces": len(results),
                },
            )

            return response

        except Exception:

            logger.exception(
                "Recognition failed."
            )

            raise

    # ==========================================================
    # Enrich Results
    # ==========================================================

    def _enrich_results(
        self,
        results,
    ) -> None:

        db = SessionLocal()

        try:

            for result in results:

                if not result.matched:
                    continue

                employee = self.employee_repository.get_by_id(

                    db=db,

                    employee_id=result.employee_id,

                )

                if employee is None:

                    logger.warning(
                        "Employee not found.",
                        extra={
                            "employee_id": result.employee_id,
                        },
                    )

                    continue

                logger.info(
                    "Employee fetched successfully.",
                    extra={
                        "employee_code": employee.employee_code,
                    },
                )

                # For now just print
                result.employee = EmployeeRecognition(

                    id=str(employee.id),

                    employee_code=employee.employee_code,

                    first_name=employee.first_name,

                    last_name=employee.last_name,

                    email=employee.email,

                    phone=employee.phone,

                )

        finally:

            db.close()

    # ==========================================================
    # Health Check
    # ==========================================================

    def health_check(
        self,
    ) -> bool:

        return self.recognition_service.health_check()

    # ==========================================================
    # Utility
    # ==========================================================

    def __repr__(
        self,
    ) -> str:

        return (
            "RecognitionOrchestrator("
            f"recognition_service={self.recognition_service.__class__.__name__})"
        )