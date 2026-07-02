from typing import Optional

import numpy as np
from pydantic import BaseModel, ConfigDict


class FaceDetectionResult(BaseModel):

    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )

    bbox: list[float]

    confidence: float

    embedding: np.ndarray

    landmarks: list[list[float]]

    pose: Optional[list[float]] = None

    age: Optional[int] = None

    gender: Optional[int] = None


class FaceDetectionBatchResult(BaseModel):

    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )

    image_path: str

    faces: list[FaceDetectionResult]