from pydantic import BaseModel


class MilvusSearchResult(BaseModel):

    id: int

    employee_id: str

    employee_code: str

    score: float


class MilvusInsertResult(BaseModel):

    primary_key: int