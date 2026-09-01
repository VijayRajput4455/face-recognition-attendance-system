from datetime import datetime, date, time
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


# ==========================================================
# 1. Summary KPI Response
# ==========================================================
class DashboardSummaryResponse(BaseModel):
    total_employees: int
    active_employees: int
    inactive_employees: int
    face_enrolled: int
    pending_face_enrollment: int
    enrollment_percentage: float
    recognition_ready: int
    pending_7_days: int
    pending_30_days: int
    vector_count: int

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# 2. Face Enrollment Overview
# ==========================================================
class EnrollmentOverviewResponse(BaseModel):
    enrolled: int
    pending: int
    failed: int
    not_started: int
    total: int
    enrollment_percentage: float

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# 3. Face Enrollment Trajectory / Trend
# ==========================================================
class EnrollmentTrendPoint(BaseModel):
    date: str
    label: str
    total_employees: int
    face_enrolled: int
    pending: int


class EnrollmentTrendResponse(BaseModel):
    timeframe: str
    points: List[EnrollmentTrendPoint]


# ==========================================================
# 4. Department Analytics Item
# ==========================================================
class DepartmentAnalyticsItem(BaseModel):
    id: UUID
    department_name: str
    total: int
    enrolled: int
    pending: int
    completion_percentage: float
    health: str  # "high", "moderate", "low"

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# 5. Shift Analytics Item
# ==========================================================
class ShiftAnalyticsItem(BaseModel):
    id: UUID
    shift_name: str
    start_time: time
    end_time: time
    grace_minutes: int
    total: int
    enrolled: int
    pending: int
    completion_percentage: float

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# 6. Designation Analytics Item
# ==========================================================
class DesignationAnalyticsItem(BaseModel):
    id: UUID
    designation_name: str
    employee_count: int

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# 7. Employee Growth Point
# ==========================================================
class EmployeeGrowthPoint(BaseModel):
    label: str
    date: str
    total: int
    added: int
    removed: int


class EmployeeGrowthResponse(BaseModel):
    range: str
    net_workforce: int
    active_count: int
    inactive_count: int
    points: List[EmployeeGrowthPoint]


# ==========================================================
# 8. Activity Item
# ==========================================================
class ActivityItem(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: datetime
    status: Optional[str] = None


# ==========================================================
# 9. System Health Response
# ==========================================================
class SystemHealthResponse(BaseModel):
    engine_status: str
    database_status: str
    face_model: str
    vector_count: int
    accuracy_percentage: float
    success_rate_percentage: float
    is_nominal: bool
