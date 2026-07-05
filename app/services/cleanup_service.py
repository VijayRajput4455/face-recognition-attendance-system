import shutil
from pathlib import Path
from app.core.config import settings
from app.core.logger import get_logger
logger = get_logger(__name__)


class CleanupService:

    def delete_file(
        self,
        file_path: str | Path,
    ) -> None:

        file_path = Path(file_path)

        if not file_path.exists():
            return

        try:

            file_path.unlink()

            logger.info(
                "Deleted file: %s",
                file_path,
            )

        except Exception:

            logger.exception(
                "Unable to delete file: %s",
                file_path,
            )

            raise

    # ---------------------------------------------------------

    def delete_directory(
        self,
        directory: str | Path,
    ) -> None:

        directory = Path(directory)

        if not directory.exists():
            return

        try:

            shutil.rmtree(directory)

            logger.info(
                "Deleted directory: %s",
                directory,
            )

        except Exception:

            logger.exception(
                "Unable to delete directory: %s",
                directory,
            )

            raise

    # ---------------------------------------------------------

    def cleanup(
        self,
        video_path: str | Path,
        frames_directory: str | Path,
    ) -> None:

        logger.info("Starting cleanup...")

        video_path = Path(video_path)
        frames_directory = Path(frames_directory)

        # ---------------------------------------------------------
        # Delete Video
        # ---------------------------------------------------------

        if not settings.KEEP_ENROLLMENT_VIDEO:

            self.delete_file(video_path)

        else:

            logger.info(
                "Keeping enrollment video: %s",
                video_path,
            )

        # ---------------------------------------------------------
        # Delete Frames
        # ---------------------------------------------------------

        if not settings.KEEP_EXTRACTED_FRAMES:

            self.delete_directory(frames_directory)

        else:

            logger.info(
                "Keeping extracted frames: %s",
                frames_directory,
            )

        # ---------------------------------------------------------
        # Delete Employee Folder if Empty
        # ---------------------------------------------------------

        employee_directory = video_path.parent

        if employee_directory.exists():

            try:

                employee_directory.rmdir()

                logger.info(
                    "Deleted empty employee directory: %s",
                    employee_directory,
                )

            except OSError:

                logger.debug(
                    "Employee directory is not empty."
                )

        logger.info("Cleanup completed.")

    # ---------------------------------------------------------

    @staticmethod
    def exists(
        path: str | Path,
    ) -> bool:

        return Path(path).exists()