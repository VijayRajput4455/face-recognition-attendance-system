from app.models.employee import Employee
from app.models.employee_enrollment import EmployeeEnrollment

from app.repositories.employee_repo import EmployeeRepository
from app.repositories.enrollment_repo import EnrollmentRepository

from app.schemas.enrollment import EnrollmentMessage
from app.services.rabbitmq_service import RabbitMQClient

from app.utils.file_handler import FileHandler


class EmployeeService:

    def __init__(self):

        self.employee_repo = EmployeeRepository()

        self.enrollment_repo = EnrollmentRepository()

        self.rabbitmq_service = RabbitMQClient()

    def register_employee(
        self,
        db,
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        video_file
    ):

        employee = Employee(
            employee_code=employee_code,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            employment_status="PENDING"
        )

        employee = self.employee_repo.create(
            db,
            employee
        )

        video_path = FileHandler.save_video(
            employee_code,
            video_file
        )

        enrollment = EmployeeEnrollment(
            employee_id=employee.id,
            video_path=video_path,
            status="PENDING"
        )

        enrollment = self.enrollment_repo.create(
            db,
            enrollment
        )

        # self.rabbitmq_service.publish(
        #     "employee_enrollment",
        #     {
        #         "employee_id": str(employee.id),
        #         "employee_code": employee.employee_code,
        #         "enrollment_id": str(enrollment.id),
        #         "video_path": video_path
        #     }
        # )
        message = EnrollmentMessage(
                        employee_id=str(employee.id),
                        employee_code=employee.employee_code,
                        enrollment_id=str(enrollment.id),
                        video_path=video_path
                    )
        self.rabbitmq_service.publish(
            "employee_enrollment",
            message.model_dump()
        )

        return {
            "employee_id": str(employee.id),
            "enrollment_id": str(enrollment.id),
            "status": "PENDING"
        }