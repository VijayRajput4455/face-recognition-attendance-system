from pathlib import Path

import cv2

from app.core.config import settings
from app.core.logger import get_logger
logger = get_logger(__name__)


class FrameExtractionService:

    def extract_frames(
        self,
        video_path: str,
        employee_code: str,
    ) -> list[Path]:

        output_dir = (
            Path(settings.FRAMES_STORAGE_PATH)
            / employee_code
        )

        output_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise RuntimeError(
                f"Unable to open video: {video_path}"
            )

        try:

            fps = cap.get(cv2.CAP_PROP_FPS)

            if fps <= 0:
                fps = 30

            frame_interval = max(1, int(fps))

            frame_paths: list[Path] = []

            frame_index = 0
            saved_frame_index = 0

            logger.info(
                "Extracting frames from %s",
                video_path,
            )

            while True:

                success, frame = cap.read()

                if not success:
                    break

                if frame_index % frame_interval == 0:

                    frame_path = (
                        output_dir
                        / f"frame_{saved_frame_index:06d}.jpg"
                    )

                    cv2.imwrite(
                        str(frame_path),
                        frame,
                    )

                    frame_paths.append(frame_path)

                    saved_frame_index += 1

                frame_index += 1

            logger.info(
                "Extracted %d frames",
                len(frame_paths),
            )

            return frame_paths

        finally:
            cap.release()