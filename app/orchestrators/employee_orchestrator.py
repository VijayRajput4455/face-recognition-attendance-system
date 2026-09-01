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

from app.services.milvus_service import MilvusService

logger = get_logger(__name__)


class EmployeeOrchestrator:

    def __init__(self):

        self.employee_repository = EmployeeRepository()
        self.milvus_service = MilvusService()

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

                designation_id=request.designation_id,

                shift_id=request.shift_id,

                employment_status=request.employment_status or "ACTIVE",
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

            if request.first_name is not None:
                employee.first_name = request.first_name

            if request.last_name is not None:
                employee.last_name = request.last_name

            if request.email is not None:
                employee.email = request.email

            if request.phone is not None:
                employee.phone = request.phone

            if request.joining_date is not None:
                employee.joining_date = request.joining_date

            if request.department_id is not None:
                employee.department_id = request.department_id

            if request.designation_id is not None:
                employee.designation_id = request.designation_id

            if request.shift_id is not None:
                employee.shift_id = request.shift_id

            if request.employment_status is not None:
                employee.employment_status = request.employment_status

            employee = self.employee_repository.update(
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

    update = update_employee
    create = create_employee

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

            # Delete Milvus vector embedding
            try:
                self.milvus_service.delete(employee_id=str(employee.id))
            except Exception as e:
                logger.warning(f"Could not delete Milvus embedding for employee {employee.id}: {e}")

            self.employee_repository.delete(
                db=db,
                employee=employee,
            )

            logger.info(
                "Employee and Milvus embedding deleted successfully.",
                extra={
                    "employee_id": str(employee.id),
                    "employee_code": employee.employee_code,
                },
            )

        finally:

            db.close()

    delete = delete_employee

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

    # ==========================================================
    # Bulk Create Employees (JSON List with smart FK resolution)
    # ==========================================================

    def bulk_create(
        self,
        items: list[EmployeeBulkItem],
    ) -> EmployeeBulkResponse:

        import csv
        import io
        from datetime import date, datetime
        from app.models.department import Department
        from app.models.designation import Designation
        from app.models.shift import Shift
        from app.schemas.employee import BulkErrorDetail

        db = SessionLocal()
        successful_list = []
        errors = []

        try:
            # 1. Pre-fetch lookup tables for O(1) matching
            depts = db.query(Department).all()
            dept_by_id = {d.id: d.id for d in depts}
            dept_by_name = {d.department_name.strip().lower(): d.id for d in depts}

            desigs = db.query(Designation).all()
            desig_by_id = {d.id: d.id for d in desigs}
            desig_by_name = {d.designation_name.strip().lower(): d.id for d in desigs}

            shifts = db.query(Shift).all()
            shift_by_id = {s.id: s.id for s in shifts}
            shift_by_name = {s.shift_name.strip().lower(): s.id for s in shifts}

            # 2. Pre-fetch existing employee codes & emails
            existing_employees = db.query(Employee.employee_code, Employee.email).all()
            existing_codes = {e[0] for e in existing_employees if e[0]}
            existing_emails = {e[1].lower() for e in existing_employees if e[1]}

            # In-batch duplicate tracking
            batch_codes = set()
            batch_emails = set()

            for idx, item in enumerate(items, start=1):
                code = item.employee_code.strip() if item.employee_code else ""
                fname = item.first_name.strip() if item.first_name else ""

                if not code:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=None,
                            error="Employee code cannot be empty.",
                        )
                    )
                    continue

                if not fname:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=code,
                            error=f"Employee '{code}' is missing first_name.",
                        )
                    )
                    continue

                # Check duplicates
                if code in existing_codes or code in batch_codes:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=code,
                            error=f"Employee code '{code}' already exists.",
                        )
                    )
                    continue

                email_val = item.email.strip().lower() if item.email else None
                if email_val:
                    if email_val in existing_emails or email_val in batch_emails:
                        errors.append(
                            BulkErrorDetail(
                                row=idx,
                                identifier=code,
                                error=f"Email address '{item.email}' is already registered.",
                            )
                        )
                        continue

                # Resolve Department
                resolved_dept_id = None
                if item.department_id and item.department_id in dept_by_id:
                    resolved_dept_id = item.department_id
                elif item.department_name:
                    d_key = item.department_name.strip().lower()
                    if d_key in dept_by_name:
                        resolved_dept_id = dept_by_name[d_key]
                    else:
                        errors.append(
                            BulkErrorDetail(
                                row=idx,
                                identifier=code,
                                error=f"Department '{item.department_name}' not found.",
                            )
                        )
                        continue

                # Resolve Designation
                resolved_desig_id = None
                if item.designation_id and item.designation_id in desig_by_id:
                    resolved_desig_id = item.designation_id
                elif item.designation_name:
                    d_key = item.designation_name.strip().lower()
                    if d_key in desig_by_name:
                        resolved_desig_id = desig_by_name[d_key]
                    else:
                        errors.append(
                            BulkErrorDetail(
                                row=idx,
                                identifier=code,
                                error=f"Designation '{item.designation_name}' not found.",
                            )
                        )
                        continue

                # Resolve Shift
                resolved_shift_id = None
                if item.shift_id and item.shift_id in shift_by_id:
                    resolved_shift_id = item.shift_id
                elif item.shift_name:
                    s_key = item.shift_name.strip().lower()
                    if s_key in shift_by_name:
                        resolved_shift_id = shift_by_name[s_key]
                    else:
                        errors.append(
                            BulkErrorDetail(
                                row=idx,
                                identifier=code,
                                error=f"Shift '{item.shift_name}' not found.",
                            )
                        )
                        continue

                joining_date = item.joining_date or date.today()

                try:
                    emp = Employee(
                        employee_code=code,
                        first_name=fname,
                        last_name=item.last_name.strip() if item.last_name else None,
                        email=item.email,
                        phone=item.phone.strip() if item.phone else None,
                        joining_date=joining_date,
                        department_id=resolved_dept_id,
                        designation_id=resolved_desig_id,
                        shift_id=resolved_shift_id,
                        employment_status=item.employment_status or "ACTIVE",
                    )
                    created_emp = self.employee_repository.create(db=db, employee=emp)
                    successful_list.append(EmployeeResponse.model_validate(created_emp))
                    batch_codes.add(code)
                    if email_val:
                        batch_emails.add(email_val)
                except Exception as e:
                    errors.append(
                        BulkErrorDetail(
                            row=idx,
                            identifier=code,
                            error=str(e),
                        )
                    )

            logger.info(
                f"Employee bulk creation finished: {len(successful_list)} created, {len(errors)} failed."
            )

            return EmployeeBulkResponse(
                total_records=len(items),
                successful_count=len(successful_list),
                failed_count=len(errors),
                errors=errors,
                inserted_employees=successful_list,
            )

        finally:
            db.close()

    # ==========================================================
    # Bulk Upload CSV for Employees
    # ==========================================================

    def bulk_upload_csv(
        self,
        file_content: bytes,
    ) -> EmployeeBulkResponse:

        import csv
        import io
        from datetime import datetime, date
        from app.schemas.employee import BulkErrorDetail

        text_content = file_content.decode("utf-8-sig", errors="replace")
        csv_reader = csv.DictReader(io.StringIO(text_content))

        def parse_date(date_str: str) -> date | None:
            if not date_str:
                return None
            date_str = date_str.strip()
            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
                try:
                    return datetime.strptime(date_str, fmt).date()
                except ValueError:
                    pass
            try:
                return date.fromisoformat(date_str)
            except Exception:
                return None

        items = []
        errors = []

        for idx, row in enumerate(csv_reader, start=1):
            code = (
                row.get("employee_code")
                or row.get("Employee Code")
                or row.get("code")
                or row.get("Emp Code")
                or row.get("emp_code")
                or ""
            ).strip()

            fname = (
                row.get("first_name")
                or row.get("First Name")
                or row.get("fname")
                or row.get("name")
                or ""
            ).strip()

            lname = (
                row.get("last_name")
                or row.get("Last Name")
                or row.get("lname")
                or ""
            ).strip()

            email = (
                row.get("email")
                or row.get("Email")
                or row.get("email_address")
                or row.get("Email Address")
                or None
            )
            if email:
                email = email.strip()

            phone = (
                row.get("phone")
                or row.get("Phone")
                or row.get("phone_number")
                or row.get("Mobile")
                or None
            )
            if phone:
                phone = phone.strip()

            jdate_raw = (
                row.get("joining_date")
                or row.get("Joining Date")
                or row.get("date_of_joining")
                or row.get("Date of Joining")
                or None
            )
            joining_date = parse_date(jdate_raw) if jdate_raw else None

            dept = (
                row.get("department")
                or row.get("department_name")
                or row.get("Department")
                or row.get("Department Name")
                or None
            )
            if dept:
                dept = dept.strip()

            desig = (
                row.get("designation")
                or row.get("designation_name")
                or row.get("Designation")
                or row.get("Designation Name")
                or row.get("Role")
                or None
            )
            if desig:
                desig = desig.strip()

            shift = (
                row.get("shift")
                or row.get("shift_name")
                or row.get("Shift")
                or row.get("Shift Name")
                or None
            )
            if shift:
                shift = shift.strip()

            status_val = (
                row.get("status")
                or row.get("employment_status")
                or row.get("Status")
                or "ACTIVE"
            ).strip()

            if not code or not fname:
                errors.append(
                    BulkErrorDetail(
                        row=idx,
                        identifier=code or f"Row {idx}",
                        error="Missing required fields: employee_code and first_name are required.",
                    )
                )
                continue

            items.append(
                EmployeeBulkItem(
                    employee_code=code,
                    first_name=fname,
                    last_name=lname if lname else None,
                    email=email if email else None,
                    phone=phone if phone else None,
                    joining_date=joining_date,
                    department_name=dept,
                    designation_name=desig,
                    shift_name=shift,
                    employment_status=status_val,
                )
            )

        if not items and errors:
            return EmployeeBulkResponse(
                total_records=len(errors),
                successful_count=0,
                failed_count=len(errors),
                errors=errors,
                inserted_employees=[],
            )

        if not items and not errors:
            return EmployeeBulkResponse(
                total_records=0,
                successful_count=0,
                failed_count=0,
                errors=[
                    BulkErrorDetail(
                        row=0,
                        identifier=None,
                        error="CSV file is empty or missing required headers ('employee_code', 'first_name').",
                    )
                ],
                inserted_employees=[],
            )

        result = self.bulk_create(items=items)
        result.errors.extend(errors)
        result.failed_count = len(result.errors)
        result.total_records = result.successful_count + result.failed_count
        return result