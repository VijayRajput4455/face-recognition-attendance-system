from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.employee_enrollment import EmployeeEnrollment

from app.repositories.enrollment_repo import EnrollmentRepository

from app.schemas.enrollment import EnrollmentMessage

from app.services.rabbitmq_service import RabbitMQClient

from app.utils.file_handler import FileHandler


class EnrollmentService:

    def __init__(self):

        self.enrollment_repository = EnrollmentRepository()

        self.rabbitmq_service = RabbitMQClient()

    # ==========================================================
    # Start Employee Enrollment
    # ==========================================================

    def start_enrollment(
        self,
        db: Session,
        employee: Employee,
        video_file,
    ):

        # ======================================================
        # Save Uploaded Video
        # ======================================================

        video_path = FileHandler.save_video(
            employee.employee_code,
            video_file,
        )

        # ======================================================
        # Create Enrollment Record
        # ======================================================

        enrollment = EmployeeEnrollment(
            employee_id=employee.id,
            video_path=video_path,
            status="PENDING",
        )

        enrollment = self.enrollment_repository.create(
            db=db,
            enrollment=enrollment,
        )

        # ======================================================
        # Publish RabbitMQ Message
        # ======================================================

        message = EnrollmentMessage(
            employee_id=str(employee.id),
            employee_code=employee.employee_code,
            enrollment_id=str(enrollment.id),
            video_path=video_path,
        )

        self.rabbitmq_service.publish(
            "employee_enrollment",
            message.model_dump(),
        )

        # ======================================================
        # Response
        # ======================================================

        return {
            "employee_id": str(employee.id),
            "enrollment_id": str(enrollment.id),
            "status": "PENDING",
        }