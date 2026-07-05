from uuid import UUID

from fastapi import HTTPException
from fastapi import UploadFile
from fastapi import status

from app.core.database import SessionLocal
from app.core.logger import get_logger

from app.models.employee_enrollment import EmployeeEnrollment

from app.repositories.employee_repo import EmployeeRepository
from app.repositories.enrollment_repo import EnrollmentRepository

from app.schemas.enrollment import EnrollmentMessage, EnrollmentResponse

from app.services.rabbitmq_service import RabbitMQClient

from app.utils.file_handler import FileHandler


logger = get_logger(__name__)


class EnrollmentOrchestrator:

    def __init__(self):

        self.employee_repository = EmployeeRepository()

        self.enrollment_repository = EnrollmentRepository()

        self.rabbitmq = RabbitMQClient()

    # ==========================================================
    # Start Enrollment
    # ==========================================================

    def start(
        self,
        employee_id: UUID,
        video_file: UploadFile,
    ):

        db = SessionLocal()

        try:

            # --------------------------------------------------
            # Validate Employee
            # --------------------------------------------------

            employee = self.employee_repository.get_by_id(
                db=db,
                employee_id=employee_id,
            )

            if employee is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found.",
                )

            # --------------------------------------------------
            # Check Pending Enrollment
            # --------------------------------------------------

            existing = (
                self.enrollment_repository
                .get_pending_by_employee(
                    db=db,
                    employee_id=employee_id,
                )
            )

            if existing:

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Employee already has a pending enrollment.",
                )

            # --------------------------------------------------
            # Save Video
            # --------------------------------------------------

            video_path = FileHandler.save_video(
                employee.employee_code,
                video_file,
            )

            # --------------------------------------------------
            # Create Enrollment
            # --------------------------------------------------

            enrollment = EmployeeEnrollment(

                employee_id=employee.id,

                video_path=video_path,

                status="PENDING",
            )

            enrollment = self.enrollment_repository.create(
                db=db,
                enrollment=enrollment,
            )

            # --------------------------------------------------
            # Publish RabbitMQ
            # --------------------------------------------------

            message = EnrollmentMessage(

                employee_id=str(employee.id),

                employee_code=employee.employee_code,

                enrollment_id=str(enrollment.id),

                video_path=video_path,
            )

            self.rabbitmq.publish(
                "employee_enrollment",
                message.model_dump(),
            )

            logger.info(
                "Enrollment started successfully.",
                extra={
                    "employee_id": str(employee.id),
                    "enrollment_id": str(enrollment.id),
                },
            )

            return {
                "employee_id": str(employee.id),
                "enrollment_id": str(enrollment.id),
                "status": "PENDING",
            }

        finally:

            db.close()

    # ==========================================================
    # Get All Enrollments
    # ==========================================================

    def get_all(
        self,
    ) -> list[EnrollmentResponse]:

        db = SessionLocal()

        try:

            enrollments = self.enrollment_repository.get_all(
                db=db,
            )

            return [

                EnrollmentResponse.model_validate(
                    enrollment
                )

                for enrollment in enrollments

            ]

        finally:

            db.close()

    # ==========================================================
    # Get Enrollment By ID
    # ==========================================================

    def get_by_id(
        self,
        enrollment_id: UUID,
    ) -> EnrollmentResponse:

        db = SessionLocal()

        try:

            enrollment = self.enrollment_repository.get_by_id(
                db=db,
                enrollment_id=enrollment_id,
            )

            if enrollment is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Enrollment not found.",
                )

            return EnrollmentResponse.model_validate(
                enrollment
            )

        finally:

            db.close()

    # ==========================================================
    # Get Employee Enrollments
    # ==========================================================

    def get_by_employee(
        self,
        employee_id: UUID,
    ) -> list[EnrollmentResponse]:

        db = SessionLocal()

        try:

            enrollments = self.enrollment_repository.get_by_employee(
                db=db,
                employee_id=employee_id,
            )

            return [
                EnrollmentResponse.model_validate(
                    enrollment
                )
                for enrollment in enrollments
            ]

        finally:

            db.close()

    # ==========================================================
    # Retry Enrollment
    # ==========================================================

    def retry(
        self,
        enrollment_id: UUID,
    ):

        db = SessionLocal()

        try:

            enrollment = self.enrollment_repository.get_by_id(
                db=db,
                enrollment_id=enrollment_id,
            )

            if enrollment is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Enrollment not found.",
                )

            employee = self.employee_repository.get_by_id(
                db=db,
                employee_id=enrollment.employee_id,
            )

            if employee is None:

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found.",
                )

            enrollment = self.enrollment_repository.update_status(
                db=db,
                enrollment_id=enrollment.id,
                status="PENDING",
                error_message=None,
            )

            message = EnrollmentMessage(
                employee_id=str(employee.id),
                employee_code=employee.employee_code,
                enrollment_id=str(enrollment.id),
                video_path=enrollment.video_path,
            )

            self.rabbitmq.publish(
                "employee_enrollment",
                message.model_dump(),
            )

            logger.info(
                "Enrollment retry started.",
                extra={
                    "employee_id": str(employee.id),
                    "enrollment_id": str(enrollment.id),
                },
            )

            return {
                "message": "Enrollment retry started successfully.",
                "enrollment_id": str(enrollment.id),
                "status": enrollment.status,
            }

        finally:

            db.close()