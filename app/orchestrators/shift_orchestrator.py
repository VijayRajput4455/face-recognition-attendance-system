from uuid import UUID

from fastapi import HTTPException
from fastapi import status

from app.core.database import SessionLocal
from app.core.logger import get_logger

from app.repositories.shift_repo import ShiftRepository

from app.schemas.shift import (
    ShiftCreate,
    ShiftUpdate,
    ShiftResponse,
    ShiftBulkResponse,
)

logger = get_logger(__name__)


class ShiftOrchestrator:

    def __init__(self):

        self.shift_repository = ShiftRepository()

    # ==========================================================
    # Create
    # ==========================================================

    def create(
        self,
        request: ShiftCreate,
    ) -> ShiftResponse:

        db = SessionLocal()

        try:

            existing = self.shift_repository.get_by_name(

                db=db,

                shift_name=request.shift_name,

            )

            if existing:

                raise HTTPException(

                    status_code=status.HTTP_409_CONFLICT,

                    detail="Shift already exists.",

                )

            shift = self.shift_repository.create(

                db=db,

                shift=request,

            )

            logger.info(

                "Shift created.",

                extra={
                    "shift_name": shift.shift_name,
                },

            )

            return ShiftResponse.model_validate(
                shift
            )

        finally:

            db.close()

    # ==========================================================
    # Get All
    # ==========================================================

    def get_all(
        self,
    ) -> list[ShiftResponse]:

        db = SessionLocal()

        try:

            shifts = self.shift_repository.get_all(
                db=db,
            )

            return [

                ShiftResponse.model_validate(
                    shift
                )

                for shift in shifts

            ]

        finally:

            db.close()

    # ==========================================================
    # Get By ID
    # ==========================================================

    def get_by_id(
        self,
        shift_id: UUID,
    ) -> ShiftResponse:

        db = SessionLocal()

        try:

            shift = self.shift_repository.get_by_id(

                db=db,

                shift_id=shift_id,

            )

            if shift is None:

                raise HTTPException(

                    status_code=status.HTTP_404_NOT_FOUND,

                    detail="Shift not found.",

                )

            return ShiftResponse.model_validate(
                shift
            )

        finally:

            db.close()

    # ==========================================================
    # Update
    # ==========================================================

    def update(
        self,
        shift_id: UUID,
        request: ShiftUpdate,
    ) -> ShiftResponse:

        db = SessionLocal()

        try:

            shift = self.shift_repository.get_by_id(

                db=db,

                shift_id=shift_id,

            )

            if shift is None:

                raise HTTPException(

                    status_code=status.HTTP_404_NOT_FOUND,

                    detail="Shift not found.",

                )

            shift = self.shift_repository.update(

                db=db,

                shift=shift,

                request=request,

            )

            logger.info(

                "Shift updated.",

                extra={
                    "shift_name": shift.shift_name,
                },

            )

            return ShiftResponse.model_validate(
                shift
            )

        finally:

            db.close()

    # ==========================================================
    # Bulk Create (JSON List)
    # ==========================================================

    def bulk_create(
        self,
        items: list[ShiftCreate],
    ) -> ShiftBulkResponse:

        db = SessionLocal()
        successful_list = []
        errors = []

        try:
            for idx, item in enumerate(items, start=1):
                name = item.shift_name.strip() if item.shift_name else ""
                if not name:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=item.shift_name,
                            error="Shift name cannot be empty.",
                        )
                    )
                    continue

                existing = self.shift_repository.get_by_name(
                    db=db,
                    shift_name=name,
                )
                if existing:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=name,
                            error=f"Shift '{name}' already exists.",
                        )
                    )
                    continue

                try:
                    shift = self.shift_repository.create(
                        db=db,
                        shift=ShiftCreate(
                            shift_name=name,
                            start_time=item.start_time,
                            end_time=item.end_time,
                            grace_minutes=item.grace_minutes if item.grace_minutes is not None else 15,
                        ),
                    )
                    successful_list.append(ShiftResponse.model_validate(shift))
                except Exception as e:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=name,
                            error=str(e),
                        )
                    )

            logger.info(
                f"Shift bulk creation complete: {len(successful_list)} created, {len(errors)} failed."
            )

            return ShiftBulkResponse(
                total_records=len(items),
                successful_count=len(successful_list),
                failed_count=len(errors),
                errors=errors,
                inserted_shifts=successful_list,
            )

        finally:
            db.close()

    # ==========================================================
    # Bulk Upload CSV
    # ==========================================================

    def bulk_upload_csv(
        self,
        file_content: bytes,
    ) -> ShiftBulkResponse:

        import csv
        import io
        from datetime import datetime, time

        text_content = file_content.decode("utf-8-sig", errors="replace")
        csv_reader = csv.DictReader(io.StringIO(text_content))

        def parse_time(time_str: str) -> time | None:
            if not time_str:
                return None
            time_str = time_str.strip()
            for fmt in ("%H:%M:%S", "%H:%M", "%I:%M %p", "%I:%M:%S %p", "%I:%M%p"):
                try:
                    return datetime.strptime(time_str, fmt).time()
                except ValueError:
                    pass
            try:
                return time.fromisoformat(time_str)
            except Exception:
                return None

        items = []
        errors = []

        for idx, row in enumerate(csv_reader, start=1):
            name = (
                row.get("shift_name")
                or row.get("name")
                or row.get("Shift")
                or row.get("Shift Name")
                or ""
            ).strip()

            if not name:
                errors.append(
                    BulkErrorDetail(
                        row=idx,
                        identifier=None,
                        error="Missing shift_name in row.",
                    )
                )
                continue

            start_raw = row.get("start_time") or row.get("Start Time") or row.get("start")
            end_raw = row.get("end_time") or row.get("End Time") or row.get("end")

            start_time = parse_time(start_raw)
            end_time = parse_time(end_raw)

            if not start_time or not end_time:
                errors.append(
                    BulkErrorDetail(
                        row=idx,
                        identifier=name,
                        error=f"Invalid time format (start: '{start_raw}', end: '{end_raw}'). Use HH:MM:SS or HH:MM.",
                    )
                )
                continue

            grace_raw = row.get("grace_minutes") or row.get("Grace Minutes") or row.get("grace") or 15
            try:
                grace_minutes = int(grace_raw)
            except (ValueError, TypeError):
                grace_minutes = 15

            items.append(
                ShiftCreate(
                    shift_name=name,
                    start_time=start_time,
                    end_time=end_time,
                    grace_minutes=grace_minutes,
                )
            )

        if not items and errors:
            return ShiftBulkResponse(
                total_records=len(errors),
                successful_count=0,
                failed_count=len(errors),
                errors=errors,
                inserted_shifts=[],
            )

        if not items and not errors:
            return ShiftBulkResponse(
                total_records=0,
                successful_count=0,
                failed_count=0,
                errors=[
                    BulkErrorDetail(
                        row=0,
                        identifier=None,
                        error="CSV file is empty or missing required headers ('shift_name', 'start_time', 'end_time').",
                    )
                ],
                inserted_shifts=[],
            )

        result = self.bulk_create(items=items)
        result.errors.extend(errors)
        result.failed_count = len(result.errors)
        result.total_records = result.successful_count + result.failed_count
        return result

    # ==========================================================
    # Delete
    # ==========================================================

    def delete(
        self,
        shift_id: UUID,
    ) -> None:

        db = SessionLocal()

        try:

            shift = self.shift_repository.get_by_id(

                db=db,

                shift_id=shift_id,

            )

            if shift is None:

                raise HTTPException(

                    status_code=status.HTTP_404_NOT_FOUND,

                    detail="Shift not found.",

                )

            self.shift_repository.delete(

                db=db,

                shift=shift,

            )

            logger.info(

                "Shift deleted.",

                extra={
                    "shift_name": shift.shift_name,
                },

            )

        finally:

            db.close()