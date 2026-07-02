from pydantic import BaseModel


class FaceQualityResult(BaseModel):

    passed: bool

    score: float

    reasons: list[str]