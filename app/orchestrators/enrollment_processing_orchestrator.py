from pathlib import Path

import cv2
import numpy as np
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.logger import get_logger
from app.enums.employee_status import EmployeeStatus
from app.enums.enrollment_status import EnrollmentStatus
from app.repositories.enrollment_repo import EnrollmentRepository
from app.repositories.employee_repo import EmployeeRepository
from app.schemas.enrollment import EnrollmentMessage
from app.services.cleanup_service import CleanupService
from app.services.embedding_service import EmbeddingService
from app.services.face_quality_service import FaceQualityService
from app.services.frame_extraction_service import FrameExtractionService
from app.services.insightface_service import InsightFaceService
from app.services.milvus_service import MilvusService

logger = get_logger(__name__)


class EnrollmentProcessingOrchestrator:

    def __init__(self):

        self.frame_service = FrameExtractionService()

        self.insightface_service = InsightFaceService()

        self.face_quality_service = FaceQualityService()

        self.embedding_service = EmbeddingService()

        self.milvus_service = MilvusService()

        self.cleanup_service = CleanupService()

        self.employee_repository = EmployeeRepository()

        self.enrollment_repository = EnrollmentRepository()

    # ======================================================
    # Public API
    # ======================================================

    def process(
        self,
        message: EnrollmentMessage,
    ) -> None:

        logger.info(
            "Starting enrollment.",
            extra={
                "employee_id": message.employee_id,
                "employee_code": message.employee_code,
            },
        )

        frame_directory = None

        db = SessionLocal()

        try:

            self._mark_processing(
                db,
                message,
            )

            frame_directory = self._extract_frames(
                message,
            )

            embedding = self._generate_embedding(
                frame_directory,
            )

            self._store_embedding(
                message,
                embedding,
            )

            self._mark_completed(
                db,
                message,
            )

            logger.info(
                "Enrollment completed successfully.",
                extra={
                    "employee_id": message.employee_id,
                    "employee_code": message.employee_code,
                },
            )

        except Exception as ex:

            self._mark_failed(
                db,
                message,
                ex,
            )

            raise

        finally:

            db.close()

            if frame_directory is not None:

                self._cleanup(
                    message,
                )

    # ======================================================
    # Frame Extraction
    # ======================================================

    def _extract_frames(
        self,
        message: EnrollmentMessage,
    ) -> Path:

        logger.info(
            "Extracting frames."
        )

        self.frame_service.extract_frames(

            video_path=message.video_path,

            employee_code=message.employee_code,

        )

        return (

            Path(settings.FRAMES_STORAGE_PATH)

            / message.employee_code

        )

    # ======================================================
    # Embedding Generation
    # ======================================================

    def _generate_embedding(
        self,
        frame_directory: Path,
    ) -> np.ndarray:

        embeddings = []

        frame_paths = sorted(
            frame_directory.glob("*.jpg")
        )

        logger.info(
            "Processing frames.",
            extra={
                "total_frames": len(frame_paths),
            },
        )

        for frame_path in frame_paths:

            image = cv2.imread(
                str(frame_path)
            )

            if image is None:

                logger.warning(
                    "Unable to read frame.",
                    extra={
                        "frame": frame_path.name,
                    },
                )

                continue

            batch = (
                self.insightface_service.analyze_image(
                    image
                )
            )

            if not batch:
                continue

            largest_face = (
                self.insightface_service.get_largest_face(
                    batch
                )
            )

            if largest_face is None:
                continue

            quality = self.face_quality_service.check(

                image=image,

                face=largest_face,

                total_faces=len(batch),

            )

            if not quality.passed:

                logger.debug(
                    "Rejected frame.",
                    extra={
                        "frame": frame_path.name,
                        "reasons": quality.reasons,
                    },
                )

                continue

            embeddings.append(
                largest_face.embedding
            )

        if not embeddings:

            raise RuntimeError(
                "No valid face found."
            )

        logger.info(
            "Embeddings generated.",
            extra={
                "valid_embeddings": len(embeddings),
            },
        )

        return self.embedding_service.average(
            embeddings
        )
    
    # ======================================================
    # Store Embedding
    # ======================================================

    def _store_embedding(
        self,
        message: EnrollmentMessage,
        embedding: np.ndarray,
    ) -> None:

        logger.info(
            "Saving embedding into Milvus.",
            extra={
                "employee_id": message.employee_id,
                "employee_code": message.employee_code,
            },
        )

        self.milvus_service.insert(

            employee_id=message.employee_id,

            employee_code=message.employee_code,

            embedding=embedding,

        )

        logger.info(
            "Embedding stored successfully.",
            extra={
                "employee_id": message.employee_id,
                "employee_code": message.employee_code,
            },
        )

    # ======================================================
    # Mark Processing
    # ======================================================

    def _mark_processing(
        self,
        db: Session,
        message: EnrollmentMessage,
    ) -> None:

        employee = self.employee_repository.update_status(

            db=db,

            employee_id=message.employee_id,

            status=EmployeeStatus.ACTIVE,

        )

        if employee is None:

            logger.warning(
                "Employee not found.",
                extra={
                    "employee_id": message.employee_id,
                },
            )

            return

        enrollment = self.enrollment_repository.update_status(
            db=db,
            enrollment_id=message.enrollment_id,
            status=EnrollmentStatus.PROCESSING,
        )

        if enrollment is None:

            logger.warning(
                "Enrollment record not found.",
                extra={
                    "enrollment_id": message.enrollment_id,
                },
            )

        logger.info(
            "Employee status updated.",
            extra={
                "employee_id": message.employee_id,
                "employee_code": message.employee_code,
                "status": EmployeeStatus.ACTIVE.value,
            },
        )

    # ======================================================
    # Mark Completed
    # ======================================================

    def _mark_completed(
        self,
        db: Session,
        message: EnrollmentMessage,
    ) -> None:

        employee = self.employee_repository.update_status(
            db=db,
            employee_id=message.employee_id,
            status=EmployeeStatus.ACTIVE,
        )

        enrollment = self.enrollment_repository.update_status(
            db=db,
            enrollment_id=message.enrollment_id,
            status=EnrollmentStatus.COMPLETED,
        )

        logger.info(
            "Enrollment status updated.",
            extra={
                "employee_id": message.employee_id,
                "employee_status": employee.employment_status if employee else None,
                "enrollment_id": message.enrollment_id,
                "enrollment_status": enrollment.status if enrollment else None,
            },
        )

    # ======================================================
    # Mark Failed
    # ======================================================

    def _mark_failed(
        self,
        db: Session,
        message: EnrollmentMessage,
        exception: Exception,
    ) -> None:

        self.employee_repository.update_status(

            db=db,

            employee_id=message.employee_id,

            status=EmployeeStatus.INACTIVE,

        )

        self.enrollment_repository.update_status(

            db=db,

            enrollment_id=message.enrollment_id,

            status=EnrollmentStatus.FAILED,

            error_message=str(exception),

        )

        logger.exception(
            "Enrollment processing failed.",
            extra={
                "employee_id": message.employee_id,
                "employee_code": message.employee_code,
                "status": EmployeeStatus.INACTIVE.value,
            },
        )

    # ======================================================
    # Cleanup
    # ======================================================

    def _cleanup(
        self,
        message: EnrollmentMessage,
    ) -> None:

        logger.info(
            "Cleaning temporary files.",
            extra={
                "employee_code": message.employee_code,
            },
        )

        self.cleanup_service.cleanup(

            video_path=message.video_path,

            frames_directory=(

                Path(settings.FRAMES_STORAGE_PATH)

                / message.employee_code

            ),

        )

    # ======================================================
    # Health
    # ======================================================

    def is_healthy(
        self,
    ) -> bool:

        return self.milvus_service.is_healthy()

    # ======================================================
    # Utility
    # ======================================================

    def __repr__(
        self,
    ) -> str:

        return (

            "EnrollmentOrchestrator("

            f"frame_service={self.frame_service.__class__.__name__}, "

            f"insightface_service={self.insightface_service.__class__.__name__}, "

            f"milvus_service={self.milvus_service.__class__.__name__})"

        )