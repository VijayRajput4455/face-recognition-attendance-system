from pydantic import BaseModel


class EnrollmentMessage(BaseModel):
    employee_id: str
    employee_code: str
    enrollment_id: str
    video_path: str


# class FaceProcessingMessage(BaseModel):
#     employee_id: str
#     employee_code: str
#     frames_folder: str


# class VectorStorageMessage(BaseModel):
#     employee_id: str
#     employee_code: str
#     embedding_file: str