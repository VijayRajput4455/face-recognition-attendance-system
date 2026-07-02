from typing import List

import numpy as np

from app.core.logger import get_logger
from app.schemas.recognition import RecognitionResult
from app.services.embedding_service import EmbeddingService
from app.services.face_quality_service import FaceQualityService
from app.services.insightface_service import InsightFaceService
from app.services.milvus_service import MilvusService

logger = get_logger(__name__)


class RecognitionService:

    def __init__(self):

        self.insightface_service = InsightFaceService()

        self.face_quality_service = FaceQualityService()

        self.embedding_service = EmbeddingService()

        self.milvus_service = MilvusService()

    # ==========================================================
    # Public API
    # ==========================================================

    def recognize(
        self,
        image: np.ndarray,
    ) -> List[RecognitionResult]:

        logger.info(
            "Recognition started."
        )

        faces = self._detect_faces(
            image=image
        )

        if not faces:

            logger.info(
                "No faces detected."
            )

            return []

        logger.info(
            "Faces detected.",
            extra={
                "total_faces": len(faces),
            },
        )

        results = []

        for face in faces:

            result = self._recognize_face(
                image=image,
                face=face,
                total_faces=len(faces),
            )

            if result is not None:

                results.append(result)

        logger.info(
            "Recognition completed.",
            extra={
                "recognized_faces": len(results),
            },
        )

        return results

    # ==========================================================
    # Detect Faces
    # ==========================================================

    def _detect_faces(
        self,
        image: np.ndarray,
    ):

        return self.insightface_service.analyze_image(
            image
        )

    # ==========================================================
    # Recognize Single Face
    # ==========================================================

    def _recognize_face(
        self,
        image: np.ndarray,
        face,
        total_faces: int,
    ):

        quality = self.face_quality_service.check(

            image=image,

            face=face,

            total_faces=total_faces,

        )

        if not quality.passed:

            logger.debug(

                "Face rejected.",

                extra={

                    "reasons": quality.reasons,

                },

            )

            return None

        embedding = self._generate_embedding(
            face
        )

        search_result = self._search(
            embedding
        )

        return self._build_result(

            face=face,

            search_result=search_result,

        )

    # ==========================================================
    # Generate Embedding
    # ==========================================================

    def _generate_embedding(
        self,
        face,
    ) -> np.ndarray:

        return self.embedding_service.normalize(

            face.embedding

        )
    
    # ==========================================================
    # Search Milvus
    # ==========================================================

    def _search(
        self,
        embedding: np.ndarray,
    ):

        logger.debug(
            "Searching embedding in Milvus."
        )

        result = self.milvus_service.search(
            embedding=embedding
        )

        return result

    # ==========================================================
    # Build Recognition Result
    # ==========================================================

    def _build_result(
        self,
        face,
        search_result,
    ) -> RecognitionResult:

        bbox = [
            int(face.bbox[0]),
            int(face.bbox[1]),
            int(face.bbox[2]),
            int(face.bbox[3]),
        ]

        if not search_result:

            logger.info(
                "Unknown face detected."
            )

            return RecognitionResult(
                employee_id=None,
                employee_code=None,
                distance=0.0,
                matched=False,
                bbox=bbox,
            )

        distance = float(
            search_result["distance"]
        )

        matched = self._is_match(
            distance
        )

        if matched:

            logger.info(
                "Face matched.",
                extra={
                    "employee_code": search_result["employee_code"],
                    "distance": distance,
                },
            )

            return RecognitionResult(
                employee_id=search_result["employee_id"],
                employee_code=search_result["employee_code"],
                distance=distance,
                matched=True,
                bbox=bbox,
            )

        logger.info(
            "Face did not satisfy threshold.",
            extra={
                "distance": distance,
            },
        )

        return RecognitionResult(
            employee_id=None,
            employee_code=None,
            distance=distance,
            matched=False,
            bbox=bbox,
        )

    # ==========================================================
    # Similarity Threshold
    # ==========================================================

    def _is_match(
        self,
        distance: float,
    ) -> bool:

        """
        Threshold can later come from settings.py.
        """

        return distance >= 0.60

    # ==========================================================
    # Health Check
    # ==========================================================

    def health_check(
        self,
    ) -> bool:

        return self.milvus_service.health_check()

    # ==========================================================
    # Utility
    # ==========================================================

    def __repr__(
        self,
    ) -> str:

        return (
            "RecognitionService("
            f"insightface_service={self.insightface_service.__class__.__name__}, "
            f"face_quality_service={self.face_quality_service.__class__.__name__}, "
            f"embedding_service={self.embedding_service.__class__.__name__}, "
            f"milvus_service={self.milvus_service.__class__.__name__})"
        )