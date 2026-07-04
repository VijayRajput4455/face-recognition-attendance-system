from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    status,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.logger import get_logger

from app.orchestrators.employee_orchestrator import (
    EmployeeOrchestrator,
)

from app.schemas.employee import (
    EmployeeResponse,
    EmployeeUpdateRequest,
)

from app.services.employee_service import (
    EmployeeService,
)

router = APIRouter()

logger = get_logger(__name__)

employee_service = EmployeeService()

employee_orchestrator = EmployeeOrchestrator()


# ==========================================================
# Register Employee
# ==========================================================

@router.post("/register")
async def register_employee(
    employee_code: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(None),
    email: str = Form(None),
    phone: str = Form(None),

    video_file: UploadFile = File(...),

    db: Session = Depends(get_db),
):

    return employee_service.register_employee(
        db=db,
        employee_code=employee_code,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        video_file=video_file,
    )


# ==========================================================
# Get All Employees
# ==========================================================

@router.get(
    "",
    response_model=list[EmployeeResponse],
)
def get_employees():

    logger.info("Fetching all employees.")

    return employee_orchestrator.get_all()


# ==========================================================
# Get Employee By ID
# ==========================================================

@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def get_employee(
    employee_id: UUID,
):

    logger.info(
        "Fetching employee.",
        extra={
            "employee_id": str(employee_id),
        },
    )

    return employee_orchestrator.get_by_id(
        employee_id=employee_id,
    )


# ==========================================================
# Update Employee
# ==========================================================

@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def update_employee(
    employee_id: UUID,
    request: EmployeeUpdateRequest,
):

    logger.info(
        "Updating employee.",
        extra={
            "employee_id": str(employee_id),
        },
    )

    return employee_orchestrator.update(
        employee_id=employee_id,
        request=request,
    )


# ==========================================================
# Delete Employee
# ==========================================================

@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_employee(
    employee_id: UUID,
):

    logger.info(
        "Deleting employee.",
        extra={
            "employee_id": str(employee_id),
        },
    )

    employee_orchestrator.delete(
        employee_id=employee_id,
    )


# ==========================================================
# Get Employee By Employee Code
# ==========================================================

@router.get(
    "/code/{employee_code}",
    response_model=EmployeeResponse,
)
def get_employee_by_code(
    employee_code: str,
):

    logger.info(
        "Fetching employee by code.",
        extra={
            "employee_code": employee_code,
        },
    )

    return employee_orchestrator.get_by_employee_code(
        employee_code=employee_code,
    )


# ==========================================================
# Get Employees By Department
# ==========================================================

@router.get(
    "/department/{department_id}",
    response_model=list[EmployeeResponse],
)
def get_employees_by_department(
    department_id: UUID,
):

    return employee_orchestrator.get_by_department(
        department_id=department_id,
    )


# ==========================================================
# Get Employees By Shift
# ==========================================================

@router.get(
    "/shift/{shift_id}",
    response_model=list[EmployeeResponse],
)
def get_employees_by_shift(
    shift_id: UUID,
):

    return employee_orchestrator.get_by_shift(
        shift_id=shift_id,
    )


# ==========================================================
# Get Employees By Status
# ==========================================================

@router.get(
    "/status/{employment_status}",
    response_model=list[EmployeeResponse],
)
def get_employees_by_status(
    employment_status: str,
):

    return employee_orchestrator.get_by_status(
        employment_status=employment_status,
    )