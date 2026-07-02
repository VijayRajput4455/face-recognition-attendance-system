import shutil
from pathlib import Path
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

        logger.info(
            "Starting cleanup..."
        )

        self.delete_file(
            video_path,
        )

        self.delete_directory(
            frames_directory,
        )

        logger.info(
            "Cleanup completed."
        )

    # ---------------------------------------------------------

    @staticmethod
    def exists(
        path: str | Path,
    ) -> bool:

        return Path(path).exists()