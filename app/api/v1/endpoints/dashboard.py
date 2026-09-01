from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    EnrollmentOverviewResponse,
    EnrollmentTrendResponse,
    DepartmentAnalyticsItem,
    ShiftAnalyticsItem,
    DesignationAnalyticsItem,
    EmployeeGrowthResponse,
    ActivityItem,
    SystemHealthResponse,
)

router = APIRouter()


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    department_id: Optional[UUID] = Query(None, description="Filter by Department UUID"),
    shift_id: Optional[UUID] = Query(None, description="Filter by Shift UUID"),
    designation_id: Optional[UUID] = Query(None, description="Filter by Designation UUID"),
    status: Optional[str] = Query(None, description="Filter by Employment Status (ACTIVE, INACTIVE)"),
    db: Session = Depends(get_db),
):
    """Retrieve high-performance aggregated workforce & face enrollment KPI summary from database."""
    service = DashboardService(db)
    return service.get_summary(
        department_id=department_id,
        shift_id=shift_id,
        designation_id=designation_id,
        status=status,
    )


@router.get("/enrollment-overview", response_model=EnrollmentOverviewResponse)
def get_enrollment_overview(
    department_id: Optional[UUID] = Query(None),
    shift_id: Optional[UUID] = Query(None),
    designation_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieve live breakdown of enrolled, pending in-flight, failed, and not-started enrollment jobs."""
    service = DashboardService(db)
    return service.get_enrollment_overview(
        department_id=department_id,
        shift_id=shift_id,
        designation_id=designation_id,
        status=status,
    )


@router.get("/enrollment-trend", response_model=EnrollmentTrendResponse)
def get_enrollment_trend(
    timeframe: str = Query("monthly", regex="^(daily|weekly|monthly)$"),
    department_id: Optional[UUID] = Query(None),
    shift_id: Optional[UUID] = Query(None),
    designation_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieve historical time series of total workforce vs face enrolled vs pending."""
    service = DashboardService(db)
    return service.get_enrollment_trend(
        timeframe=timeframe,
        department_id=department_id,
        shift_id=shift_id,
        designation_id=designation_id,
        status=status,
    )


@router.get("/departments", response_model=List[DepartmentAnalyticsItem])
def get_departments_analytics(db: Session = Depends(get_db)):
    """Retrieve real department-wise employee allocation and enrollment health."""
    service = DashboardService(db)
    return service.get_departments()


@router.get("/shifts", response_model=List[ShiftAnalyticsItem])
def get_shifts_analytics(db: Session = Depends(get_db)):
    """Retrieve operational work shifts with staff count and face recognition readiness percentage."""
    service = DashboardService(db)
    return service.get_shifts()


@router.get("/designations", response_model=List[DesignationAnalyticsItem])
def get_designations_analytics(db: Session = Depends(get_db)):
    """Retrieve actual staff headcount per job designation."""
    service = DashboardService(db)
    return service.get_designations()


@router.get("/employee-growth", response_model=EmployeeGrowthResponse)
def get_employee_growth(
    range: str = Query("30d", regex="^(7d|30d|3m|6m|1y)$"),
    db: Session = Depends(get_db),
):
    """Retrieve real employee net count, onboarding, and turnaround time series."""
    service = DashboardService(db)
    return service.get_employee_growth(range_val=range)


@router.get("/activity", response_model=List[ActivityItem])
def get_recent_activity(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Retrieve latest actual enrollment jobs and employee changes."""
    service = DashboardService(db)
    return service.get_activity(limit=limit)


@router.get("/system-health", response_model=SystemHealthResponse)
def get_system_health(db: Session = Depends(get_db)):
    """Retrieve live status of InsightFace AI Engine, Milvus Vector DB, and vector index health."""
    service = DashboardService(db)
    return service.get_system_health()
