from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logger import setup_logging, get_logger
from app.core.startup import initialize_master_data


# ==========================================================
# Configure Logging
# ==========================================================

setup_logging(
    level=settings.LOG_LEVEL,
    log_directory=settings.LOG_STORAGE_PATH,
    service="api",
    environment=settings.APP_ENV,
)

logger = get_logger(__name__)


# ==========================================================
# Lifespan
# ==========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info(
        "Starting Face Recognition API."
    )

    try:

        initialize_master_data()

        logger.info(
            "Master data initialized successfully."
        )

    except Exception:

        logger.exception(
            "Failed to initialize master data."
        )

        raise

    yield

    logger.info(
        "Shutting down Face Recognition API."
    )


# ==========================================================
# FastAPI Application
# ==========================================================

app = FastAPI(

    title=settings.APP_NAME,
    lifespan=lifespan,

)


# ==========================================================
# API Routes
# ==========================================================

app.include_router(

    api_router,

    prefix="/api/v1",

)


logger.info(
    "API routes registered."
)