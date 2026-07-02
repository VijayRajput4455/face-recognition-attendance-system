import cv2
import numpy as np

from app.core.config import settings
from app.schemas.pipeline.face import FaceDetectionResult
from app.schemas.pipeline.quality import FaceQualityResult

from app.core.logger import get_logger
logger = get_logger(__name__)


class FaceQualityService:

    def check(
        self,
        image: np.ndarray,
        face: FaceDetectionResult,
        total_faces: int,
    ) -> FaceQualityResult:

        reasons: list[str] = []

        score = 100.0

        self._check_face_count(
            total_faces,
            reasons,
        )

        self._check_confidence(
            face,
            reasons,
        )

        self._check_face_size(
            face,
            reasons,
        )

        # self._check_blur(
        #     image,
        #     reasons,
        # )

        self._check_brightness(
            image,
            reasons,
        )

        self._check_pose(
            face,
            reasons,
        )

        score = self._calculate_score(reasons)

        return FaceQualityResult(

            passed=len(reasons) == 0,

            score=score,

            reasons=reasons,

        )

    # --------------------------------------------------------

    def _check_face_count(
        self,
        total_faces: int,
        reasons: list[str],
    ):

        if total_faces != 1:
            reasons.append(
                "Multiple faces detected"
            )

    # --------------------------------------------------------

    def _check_confidence(
        self,
        face: FaceDetectionResult,
        reasons: list[str],
    ):

        if (
            face.confidence
            < settings.FACE_MIN_CONFIDENCE
        ):

            reasons.append(
                "Low detection confidence"
            )

    # --------------------------------------------------------

    def _check_face_size(
        self,
        face: FaceDetectionResult,
        reasons: list[str],
    ):

        x1, y1, x2, y2 = face.bbox

        width = x2 - x1

        height = y2 - y1

        if width < settings.FACE_MIN_FACE_WIDTH:

            reasons.append(
                "Face width too small"
            )

        if height < settings.FACE_MIN_FACE_HEIGHT:

            reasons.append(
                "Face height too small"
            )

    # --------------------------------------------------------

    def _check_blur(
        self,
        image: np.ndarray,
        reasons: list[str],
    ):

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )

        blur_score = cv2.Laplacian(
            gray,
            cv2.CV_64F,
        ).var()

        if (
            blur_score
            < settings.FACE_MIN_BLUR_SCORE
        ):

            reasons.append(
                "Blur detected"
            )

    # --------------------------------------------------------

    def _check_brightness(
        self,
        image: np.ndarray,
        reasons: list[str],
    ):

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )

        brightness = np.mean(gray)

        if (
            brightness
            < settings.FACE_MIN_BRIGHTNESS
        ):

            reasons.append(
                "Image too dark"
            )

        if (
            brightness
            > settings.FACE_MAX_BRIGHTNESS
        ):

            reasons.append(
                "Image too bright"
            )

    # --------------------------------------------------------

    def _check_pose(
        self,
        face: FaceDetectionResult,
        reasons: list[str],
    ):

        if face.pose is None:
            return

        pitch, yaw, roll = face.pose

        if abs(yaw) > settings.FACE_MAX_YAW:

            reasons.append(
                "Large yaw angle"
            )

        if abs(pitch) > settings.FACE_MAX_PITCH:

            reasons.append(
                "Large pitch angle"
            )

        if abs(roll) > settings.FACE_MAX_ROLL:

            reasons.append(
                "Large roll angle"
            )

    # --------------------------------------------------------

    @staticmethod
    def _calculate_score(
        reasons: list[str],
    ) -> float:

        deductions = {
            "Multiple faces detected": 40,
            "Low detection confidence": 20,
            "Face width too small": 10,
            "Face height too small": 10,
            "Blur detected": 20,
            "Image too dark": 10,
            "Image too bright": 10,
            "Large yaw angle": 10,
            "Large pitch angle": 10,
            "Large roll angle": 10,
        }

        score = 100

        for reason in reasons:

            score -= deductions.get(
                reason,
                5,
            )

        return max(score, 0)