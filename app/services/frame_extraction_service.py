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

        source_path = Path(video_path)

        # ---------------------------------------------------------
        # Case 1: Directory of uploaded face images
        # ---------------------------------------------------------
        if source_path.is_dir() or str(video_path).endswith("images"):
            logger.info("Extracting frames from images directory: %s", video_path)
            frame_paths: list[Path] = []
            image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
            
            if source_path.exists():
                image_files = sorted([
                    f for f in source_path.iterdir()
                    if f.suffix.lower() in image_extensions
                ])
                for idx, img_file in enumerate(image_files):
                    img = cv2.imread(str(img_file))
                    if img is not None:
                        target_path = output_dir / f"frame_{idx:06d}.jpg"
                        cv2.imwrite(str(target_path), img)
                        frame_paths.append(target_path)

            logger.info("Extracted %d frames from images directory", len(frame_paths))
            return frame_paths

        # ---------------------------------------------------------
        # Case 2: Single image file
        # ---------------------------------------------------------
        if source_path.is_file() and source_path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".bmp"}:
            logger.info("Extracting single image frame: %s", video_path)
            frame_paths = []
            img = cv2.imread(str(source_path))
            if img is not None:
                target_path = output_dir / "frame_000000.jpg"
                cv2.imwrite(str(target_path), img)
                frame_paths.append(target_path)
            return frame_paths

        # ---------------------------------------------------------
        # Case 3: Video file (MP4, WebM, AVI, etc.)
        # ---------------------------------------------------------
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