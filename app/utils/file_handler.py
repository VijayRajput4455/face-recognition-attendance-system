from pathlib import Path
import shutil


class FileHandler:

    BASE_DIR = Path("face_storage/employees")

    @classmethod
    def save_video(
        cls,
        employee_code: str,
        uploaded_file
    ):

        employee_dir = cls.BASE_DIR / employee_code

        employee_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        video_path = employee_dir / "enrollment.mp4"

        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(
                uploaded_file.file,
                buffer
            )

        return str(video_path)

    @classmethod
    def save_images(
        cls,
        employee_code: str,
        image_files: list,
    ) -> str:

        employee_dir = cls.BASE_DIR / employee_code / "images"

        employee_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        for idx, uploaded_file in enumerate(image_files):
            ext = Path(uploaded_file.filename or "face.jpg").suffix or ".jpg"
            img_path = employee_dir / f"face_{idx:03d}{ext}"
            with open(img_path, "wb") as buffer:
                shutil.copyfileobj(
                    uploaded_file.file,
                    buffer
                )

        return str(employee_dir)