from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True,
    )

    # ==========================================================
    # PostgreSQL
    # ==========================================================

    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    # ==========================================================
    # RabbitMQ
    # ==========================================================

    RABBITMQ_HOST: str
    RABBITMQ_PORT: int
    RABBITMQ_USER: str
    RABBITMQ_PASSWORD: str
    RABBITMQ_VHOST: str = "/"
    RABBITMQ_HEARTBEAT: int = 600
    RABBITMQ_BLOCKED_TIMEOUT: int = 300
    RABBITMQ_EXCHANGE: str = "employee"

    # ==========================================================
    # Redis
    # ==========================================================

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str | None = None

    # ==========================================================
    # Milvus
    # ==========================================================

    MILVUS_URI: str
    MILVUS_COLLECTION: str
    MILVUS_DIMENSION: int
    MILVUS_METRIC_TYPE: str
    MILVUS_INDEX_TYPE: str
    MILVUS_USERNAME: str | None = None
    MILVUS_PASSWORD: str | None = None

    # ==========================================================
    # InsightFace
    # ==========================================================

    INSIGHTFACE_MODEL_NAME: str = "buffalo_l"
    INSIGHTFACE_GPU_ID: int = 0
    INSIGHTFACE_DET_SIZE: int = 640
    INSIGHTFACE_DETECTION_THRESHOLD: float = 0.60
    INSIGHTFACE_MAX_FACES: int = 1

    # ==========================================================
    # Face Quality
    # ==========================================================

    FACE_MIN_CONFIDENCE: float = 0.70
    FACE_MIN_FACE_WIDTH: int = 112
    FACE_MIN_FACE_HEIGHT: int = 112
    FACE_MIN_BRIGHTNESS: int = 50
    FACE_MAX_BRIGHTNESS: int = 220
    FACE_MIN_BLUR_SCORE: float = 100.0
    FACE_MAX_YAW: float = 20.0
    FACE_MAX_PITCH: float = 20.0
    FACE_MAX_ROLL: float = 20.0

    # ==========================================================
    # Face Storage
    # ==========================================================

    STORAGE_ROOT: str = "face_storage"
    UPLOAD_STORAGE_PATH: str = "face_storage/uploads"
    FRAMES_STORAGE_PATH: str = "face_storage/frames"
    FACES_STORAGE_PATH: str = "face_storage/faces"
    EMBEDDING_STORAGE_PATH: str = "face_storage/embeddings"
    TEMP_STORAGE_PATH: str = "face_storage/temp"
    FAILED_STORAGE_PATH: str = "face_storage/failed"
    LOG_STORAGE_PATH: str = "logs"
    KEEP_ENROLLMENT_VIDEO: bool = False
    KEEP_EXTRACTED_FRAMES: bool = False

    # ==========================================================
    # Worker
    # ==========================================================

    WORKER_PREFETCH_COUNT: int = 1

    WORKER_MAX_RETRIES: int = 3

    WORKER_BATCH_SIZE: int = 32

    # ==========================================================
    # API
    # ==========================================================

    API_TITLE: str = "Face Recognition System"

    API_VERSION: str = "1.0.0"

    API_PREFIX: str = "/api/v1"

    DEBUG: bool = True

    # ==========================================================
    # JWT (Future)
    # ==========================================================

    SECRET_KEY: str = "change-this-secret-key"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    ALGORITHM: str = "HS256"

    # ==========================================================
    # Logging
    # ==========================================================

    LOG_LEVEL: str = "INFO"
    LOG_STORAGE_PATH: str = "logs"
    APP_ENV: str = "development"
    APP_NAME: str = "face-recognition-system"

    # ==========================================================
    # Database URL
    # ==========================================================

    @computed_field
    @property
    def DATABASE_URL(self) -> str:

        return (
            f"postgresql://"
            f"{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_HOST}:"
            f"{self.POSTGRES_PORT}/"
            f"{self.POSTGRES_DB}"
        )


settings = Settings()