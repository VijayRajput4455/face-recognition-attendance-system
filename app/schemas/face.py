from typing import Optional

import numpy as np
from pydantic import BaseModel


class FaceDetectionResult(BaseModel):

    bbox: list[float]

    confidence: float

    embedding: np.ndarray

    landmarks: list[list[float]]

    age: Optional[int] = None

    gender: Optional[int] = None

    pose: Optional[list[float]] = None

    class Config:
        arbitrary_types_allowed = True

class FaceQualityResult(BaseModel):
    passed: bool
    score: float
    reasons: list[str]

from pathlib import Path

from pydantic import BaseModel


class FrameExtractionResult(BaseModel):

    frames_directory: Path

    frame_paths: list[Path]

    extracted_frame_count: int

    original_fps: float

    class Config:
        arbitrary_types_allowed = True