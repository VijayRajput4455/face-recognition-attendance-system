from uuid import UUID

from fastapi import HTTPException
from fastapi import status

from app.core.database import SessionLocal
from app.core.logger import get_logger

from app.models.employee import Employee

from app.repositories.employee_repo import EmployeeRepository

from app.schemas.employee import (
    EmployeeCreateRequest,
    EmployeeUpdateRequest,
    EmployeeResponse,
)

logger = get_logger(__name__)


class EmployeeOrchestrator:

    def __init__(self):

        self.employee_repository = EmployeeRepository()

        # ==========================================================
    # Create Employee
    # ==========================================================

    def create_employee(
        self,
        request: EmployeeCreateRequest,
    ) -> EmployeeResponse:

        db = SessionLocal()

        try:

            existing_employee = (
                self.employee_repository.get_by_employee_code(
                    db=db,
                    employee_code=request.employee_code,
                )
            )

            if existing_employee:

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Employee code already exists.",
                )

            employee = Employee(

                employee_code=request.employee_code,

                first_name=request.first_name,

                last_name=request.last_name,

                email=request.email,

                phone=request.phone,
                
                joining_date=request.joining_date,

                department_id=request.department_id,

                shift_id=request.shift_id,

                employment_status="PENDING",
            )

            employee = self.employee_repository.create(
                db=db,
                employee=employee,
            )

            logger.info(
                "Employee created successfully.",
                extra={
                    "employee_id": str(employee.id),
                    "employee_code": employee.employee_code,
                },
            )

            return EmployeeResponse.model_validate(
                employee,
            )

        finally:

            db.close()

    # ==========================================================
    # Get All Employees
    # ==========================================================

    def get_all(
        self,
    ) -> list[EmployeeResponse]:

        db = SessionLocal()

        try:

            employees = self.employee_repository.get_all(
                db=db,
            )

            return [

                EmployeeResponse.model_validate(employee)

                for employee in employees

            ]

        finally:

            db.close()

    # ==========================================================
    # Get Employee By ID
    # ==========================================================

    def get_by_id(
        self,
        employee_id: UUID,
    ) -> EmployeeResponse:

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

            return EmployeeResponse.model_validate(
                employee
            )

        finally:

            db.close()

    # ==========================================================
    # Update Employee
    # ==========================================================

    def update_employee(
        self,
        employee_id: UUID,
        request: EmployeeUpdateRequest,
    ) -> EmployeeResponse:

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

            employee.first_name = request.first_name

            employee.last_name = request.last_name

            employee.email = request.email

            employee.phone = request.phone

            employee.department_id = request.department_id

            employee.shift_id = request.shift_id

            employee = self.employee_repository.update_employee(

                db=db,

                employee=employee,

            )

            logger.info(

                "Employee updated successfully.",

                extra={

                    "employee_id": str(employee.id),

                    "employee_code": employee.employee_code,

                },

            )

            return EmployeeResponse.model_validate(
                employee
            )

        finally:

            db.close()

    # ==========================================================
    # Delete Employee
    # ==========================================================

    def delete_employee(
        self,
        employee_id: UUID,
    ) -> None:

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

            self.employee_repository.delete_employee(

                db=db,

                employee=employee,

            )

            logger.info(

                "Employee deleted successfully.",

                extra={

                    "employee_id": str(employee.id),

                    "employee_code": employee.employee_code,

                },

            )

        finally:

            db.close()

        # ==========================================================
    # Get Employee By Employee Code
    # ==========================================================

    def get_by_employee_code(
        self,
        employee_code: str,
    ) -> EmployeeResponse:

        db = SessionLocal()

        try:

            employee = self.employee_repository.get_by_employee_code(

                db=db,

                employee_code=employee_code,

            )

            if employee is None:

                raise HTTPException(

                    status_code=status.HTTP_404_NOT_FOUND,

                    detail="Employee not found.",

                )

            return EmployeeResponse.model_validate(
                employee
            )

        finally:

            db.close()

    # ==========================================================
    # Get Employees By Department
    # ==========================================================

    def get_by_department(
        self,
        department_id: UUID,
    ) -> list[EmployeeResponse]:

        db = SessionLocal()

        try:

            employees = self.employee_repository.get_by_department(

                db=db,

                department_id=department_id,

            )

            return [

                EmployeeResponse.model_validate(employee)

                for employee in employees

            ]

        finally:

            db.close()

    # ==========================================================
    # Get Employees By Shift
    # ==========================================================

    def get_by_shift(
        self,
        shift_id: UUID,
    ) -> list[EmployeeResponse]:

        db = SessionLocal()

        try:

            employees = self.employee_repository.get_by_shift(

                db=db,

                shift_id=shift_id,

            )

            return [

                EmployeeResponse.model_validate(employee)

                for employee in employees

            ]

        finally:

            db.close()

    # ==========================================================
    # Get Employees By Status
    # ==========================================================

    def get_by_status(
        self,
        employment_status: str,
    ) -> list[EmployeeResponse]:

        db = SessionLocal()

        try:

            employees = self.employee_repository.get_by_status(

                db=db,

                employment_status=employment_status,

            )

            return [

                EmployeeResponse.model_validate(employee)

                for employee in employees

            ]

        finally:

            db.close()