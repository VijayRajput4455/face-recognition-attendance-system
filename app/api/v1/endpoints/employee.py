from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.employee_service import (
    EmployeeService
)

router = APIRouter()

employee_service = EmployeeService()


@router.post("/register")
async def register_employee(
    employee_code: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(None),
    email: str = Form(None),
    phone: str = Form(None),

    video_file: UploadFile = File(...),

    db: Session = Depends(get_db)
):

    return employee_service.register_employee(
        db=db,
        employee_code=employee_code,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        video_file=video_file
    )