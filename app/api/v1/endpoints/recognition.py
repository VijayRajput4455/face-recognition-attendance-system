import cv2
import numpy as np

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.core.logger import get_logger
from app.orchestrators.recognition_orchestrator import (
    RecognitionOrchestrator,
)

logger = get_logger(__name__)

router = APIRouter(
    prefix="/recognition",
    tags=["Recognition"],
)

orchestrator = RecognitionOrchestrator()


@router.post(
    "/image",
    summary="Recognize Faces From Image",
)
async def recognize_image(
    file: UploadFile = File(...),
):

    logger.info(
        "Recognition request received.",
        extra={
            "uploaded_file": file.filename,
        },
    )

    try:

        if not file.content_type.startswith("image/"):

            raise HTTPException(

                status_code=status.HTTP_400_BAD_REQUEST,

                detail="Only image files are allowed.",

            )

        contents = await file.read()

        image = cv2.imdecode(

            np.frombuffer(
                contents,
                np.uint8,
            ),

            cv2.IMREAD_COLOR,

        )

        if image is None:

            raise HTTPException(

                status_code=status.HTTP_400_BAD_REQUEST,

                detail="Unable to decode image.",

            )

        response = orchestrator.recognize(
            image=image,
        )

        logger.info(
            "Recognition request completed successfully.",
            extra={
                "uploaded_file": file.filename,
                "recognized_faces": response.total_faces,
            },
        )

        return response

    except HTTPException:

        raise

    except Exception:

        logger.exception(
            "Recognition API failed."
        )

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail="Internal Server Error",

        )