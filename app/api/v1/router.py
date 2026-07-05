from fastapi import APIRouter

from app.api.v1.endpoints.employee import (
    router as employee_router,
)

from app.api.v1.endpoints.recognition import (
    router as recognition_router,
)

from app.api.v1.endpoints.milvus_admin import (
    router as milvus_admin_router,
)

from app.api.v1.endpoints.department import (
    router as department_router,
)

from app.api.v1.endpoints.shift import (
    router as shift_router,
)

from app.api.v1.endpoints import enrollment


api_router = APIRouter()

api_router.include_router(
    employee_router,
    prefix="/employees",
    tags=["Employees"],
)

api_router.include_router(
    recognition_router,
    prefix="/recognition",
    tags=["Recognition"],
)

api_router.include_router(
    milvus_admin_router,
    prefix="/milvus",
    tags=["Milvus Admin"],
)

api_router.include_router(
    department_router,
    prefix="/departments",
    tags=["Departments"],
)

api_router.include_router(
    shift_router,
    prefix="/shifts",
    tags=["Shifts"],
)

api_router.include_router(
    enrollment.router,
    prefix="/enrollments",
    tags=["Enrollments"],
)