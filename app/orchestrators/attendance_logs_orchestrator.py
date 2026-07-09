from uuid import UUID

from fastapi import HTTPException
from fastapi import status

from app.core.database import SessionLocal
from app.core.logger import get_logger
from app.enums.attendance_event_type import AttendanceEventType
from app.models.attendance_log import AttendanceLog
from app.repositories.attendance_log_repo import AttendanceLogRepository
from app.repositories.employee_repo import EmployeeRepository
from app.schemas.attendance import AttendanceLogCreateRequest
from app.schemas.attendance import AttendanceLogResponse
from app.schemas.attendance_message import AttendanceLogMessage
from app.services.rabbitmq_service import RabbitMQClient

logger = get_logger(__name__)


class AttendanceLogsOrchestrator:

    def __init__(self):

        self.employee_repository = EmployeeRepository()

        self.attendance_log_repository = AttendanceLogRepository()

        self.rabbitmq = RabbitMQClient()

    # ==========================================================
    # Create Attendance Log
    # ==========================================================

    def create_log(
        self,
        request: AttendanceLogCreateRequest,
    ) -> AttendanceLogResponse:

        db = SessionLocal()

        try:

            employee = self.employee_repository.get_by_id(
                db=db,
                employee_id=request.employee_id,
            )

            if employee is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found.",
                )

            attendance_log = AttendanceLog(
                employee_id=employee.id,
                recognition_score=request.recognition_score,
                event_type=request.event_type,
                camera_id=request.camera_id,
                camera_name=request.camera_name,
                recognition_type=request.recognition_type,
                image_path=request.image_path,
            )

            attendance_log = self.attendance_log_repository.create(
                db=db,
                attendance_log=attendance_log,
            )

            message = AttendanceLogMessage(
                attendance_log_id=str(attendance_log.id),
                employee_id=str(employee.id),
                recognition_time=attendance_log.recognition_time,
                recognition_score=attendance_log.recognition_score,
                event_type=attendance_log.event_type,
                camera_id=attendance_log.camera_id,
                camera_name=attendance_log.camera_name,
                recognition_type=attendance_log.recognition_type,
                image_path=attendance_log.image_path,
            )

            self.rabbitmq.publish(
                queue_name="attendance_logs",
                message=message.model_dump(mode="json"),
            )

            logger.info(
                "Attendance log created and published.",
                extra={
                    "attendance_log_id": str(attendance_log.id),
                    "employee_id": str(employee.id),
                    "event_type": attendance_log.event_type.value,
                },
            )

            return AttendanceLogResponse.model_validate(attendance_log)

        finally:

            db.close()

    # ==========================================================
    # Create Attendance Log For Recognition
    # ==========================================================

    def create_log_for_recognition(
        self,
        employee_id: UUID,
        recognition_score: float,
        camera_id: str | None = None,
        camera_name: str | None = None,
        recognition_type: str = "FACE",
        image_path: str | None = None,
    ) -> AttendanceLogResponse:

        db = SessionLocal()

        try:

            latest_log = self.attendance_log_repository.get_latest_by_employee(
                db=db,
                employee_id=employee_id,
            )

            next_event_type = (
                AttendanceEventType.EXIT
                if latest_log is not None and latest_log.event_type == AttendanceEventType.ENTRY
                else AttendanceEventType.ENTRY
            )

        finally:

            db.close()

        request = AttendanceLogCreateRequest(
            employee_id=employee_id,
            recognition_score=recognition_score,
            event_type=next_event_type,
            camera_id=camera_id,
            camera_name=camera_name,
            recognition_type=recognition_type,
            image_path=image_path,
        )

        return self.create_log(request=request)

    # ==========================================================
    # Get All Attendance Logs
    # ==========================================================

    def get_all(
        self,
    ) -> list[AttendanceLogResponse]:

        db = SessionLocal()

        try:

            logs = self.attendance_log_repository.get_all(db=db)

            return [AttendanceLogResponse.model_validate(log) for log in logs]

        finally:

            db.close()

    # ==========================================================
    # Get Attendance Log By ID
    # ==========================================================

    def get_by_id(
        self,
        attendance_log_id: UUID,
    ) -> AttendanceLogResponse:

        db = SessionLocal()

        try:

            attendance_log = self.attendance_log_repository.get_by_id(
                db=db,
                attendance_log_id=attendance_log_id,
            )

            if attendance_log is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance log not found.",
                )

            return AttendanceLogResponse.model_validate(attendance_log)

        finally:

            db.close()

    # ==========================================================
    # Get Attendance Logs By Employee
    # ==========================================================

    def get_by_employee(
        self,
        employee_id: UUID,
    ) -> list[AttendanceLogResponse]:

        db = SessionLocal()

        try:

            employee = self.employee_repository.get_by_id(
                db=db,
                employee_id=employee_id,
            )

            if employee is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found.",
                )

            logs = self.attendance_log_repository.get_by_employee(
                db=db,
                employee_id=employee_id,
            )

            return [AttendanceLogResponse.model_validate(log) for log in logs]

        finally:

            db.close()

    # ==========================================================
    # Delete Attendance Log
    # ==========================================================

    def delete(
        self,
        attendance_log_id: UUID,
    ) -> None:

        db = SessionLocal()

        try:

            attendance_log = self.attendance_log_repository.get_by_id(
                db=db,
                attendance_log_id=attendance_log_id,
            )

            if attendance_log is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance log not found.",
                )

            self.attendance_log_repository.delete(
                db=db,
                attendance_log=attendance_log,
            )

            logger.info(
                "Attendance log deleted.",
                extra={
                    "attendance_log_id": str(attendance_log.id),
                    "employee_id": str(attendance_log.employee_id),
                },
            )

        finally:

            db.close()
