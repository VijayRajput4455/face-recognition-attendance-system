import threading
from pathlib import Path

import cv2
import numpy as np
from insightface.app import FaceAnalysis

from app.core.config import settings
from app.schemas.pipeline.face import (
    FaceDetectionBatchResult,
    FaceDetectionResult,
)

from app.core.logger import get_logger
logger = get_logger(__name__)


class InsightFaceService:
    """
    Production InsightFace Service

    Responsibilities:
        - Load model once
        - Detect faces
        - Generate embeddings
        - Return structured schemas

    Not Responsible For:
        - Quality filtering
        - Database
        - Milvus
        - RabbitMQ
        - Frame extraction
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):

        if cls._instance is None:

            with cls._lock:

                if cls._instance is None:

                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False

        return cls._instance

    def __init__(self):

        if self._initialized:
            return

        logger.info("=" * 60)
        logger.info("Initializing InsightFace Service")
        logger.info("=" * 60)

        self._load_model()

        self._initialized = True

    # ------------------------------------------------------------------
    # Initialization
    # ------------------------------------------------------------------

    def _load_model(self):

        try:

            logger.info(
                "Loading InsightFace model: %s",
                settings.INSIGHTFACE_MODEL_NAME,
            )

            self._model = FaceAnalysis(
                name=settings.INSIGHTFACE_MODEL_NAME
            )

            self._model.prepare(
                ctx_id=settings.INSIGHTFACE_GPU_ID,
                det_size=(
                    settings.INSIGHTFACE_DET_SIZE,
                    settings.INSIGHTFACE_DET_SIZE,
                ),
            )

            logger.info("InsightFace model loaded successfully.")

        except Exception:

            logger.exception(
                "Failed to initialize InsightFace."
            )

            raise

    # ------------------------------------------------------------------
    # Public APIs
    # ------------------------------------------------------------------

    def analyze_image(
        self,
        image: np.ndarray,
    ) -> list[FaceDetectionResult]:

        if image is None:
            raise ValueError("Image cannot be None.")

        faces = self._detect_faces(image)

        return [
            self._convert_face(face)
            for face in faces
            if face.det_score >= settings.INSIGHTFACE_DETECTION_THRESHOLD
        ]

    def analyze_image_file(
        self,
        image_path: str | Path,
    ) -> FaceDetectionBatchResult:

        image_path = Path(image_path)

        if not image_path.exists():

            raise FileNotFoundError(
                f"{image_path} does not exist."
            )

        image = cv2.imread(str(image_path))

        if image is None:

            raise RuntimeError(
                f"Unable to load image: {image_path}"
            )

        return FaceDetectionBatchResult(

            image_path=str(image_path),

            faces=self.analyze_image(image),

        )

    def analyze_directory(
        self,
        directory: str | Path,
    ) -> list[FaceDetectionBatchResult]:

        directory = Path(directory)

        if not directory.exists():

            raise FileNotFoundError(directory)

        results = []

        for image_path in sorted(directory.glob("*.jpg")):

            results.append(
                self.analyze_image_file(image_path)
            )

        return results

    def get_largest_face(
        self,
        faces: list[FaceDetectionResult],
    ) -> FaceDetectionResult | None:

        if not faces:
            return None

        return max(
            faces,
            key=self._face_area,
        )

    def is_ready(self) -> bool:

        return hasattr(self, "_model")

    def model_name(self) -> str:

        return settings.INSIGHTFACE_MODEL_NAME

    # ------------------------------------------------------------------
    # Private Helpers
    # ------------------------------------------------------------------

    def _detect_faces(
        self,
        image: np.ndarray,
    ):

        try:

            return self._model.get(image)

        except Exception:

            logger.exception(
                "Face detection failed."
            )

            raise

    def _convert_face(
        self,
        face,
    ) -> FaceDetectionResult:

        return FaceDetectionResult(

            bbox=face.bbox.tolist(),

            confidence=float(face.det_score),

            embedding=face.embedding,

            landmarks=face.kps.tolist(),

            age=getattr(face, "age", None),

            gender=getattr(face, "gender", None),

            pose=getattr(face, "pose", None),

        )

    @staticmethod
    def _face_area(
        face: FaceDetectionResult,
    ) -> float:

        return (
            (face.bbox[2] - face.bbox[0])
            *
            (face.bbox[3] - face.bbox[1])
        )

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------

    def __repr__(self):

        return (
            f"InsightFaceService("
            f"model={settings.INSIGHTFACE_MODEL_NAME})"
        )