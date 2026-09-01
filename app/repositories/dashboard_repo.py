from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case, distinct

from app.models.employee import Employee
from app.models.employee_enrollment import EmployeeEnrollment
from app.models.department import Department
from app.models.shift import Shift
from app.models.designation import Designation


class DashboardRepository:

    def __init__(self, db: Session):
        self.db = db

    def _apply_employee_filters(
        self,
        query,
        department_id: Optional[UUID] = None,
        shift_id: Optional[UUID] = None,
        designation_id: Optional[UUID] = None,
        status: Optional[str] = None,
    ):
        if department_id:
            query = query.filter(Employee.department_id == department_id)
        if shift_id:
            query = query.filter(Employee.shift_id == shift_id)
        if designation_id:
            query = query.filter(Employee.designation_id == designation_id)
        if status and status != "ALL":
            query = query.filter(Employee.employment_status == status)
        return query

    def get_summary_metrics(
        self,
        department_id: Optional[UUID] = None,
        shift_id: Optional[UUID] = None,
        designation_id: Optional[UUID] = None,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        # Subquery for distinct enrolled employee IDs (status == 'COMPLETED')
        enrolled_subquery = (
            self.db.query(EmployeeEnrollment.employee_id)
            .filter(EmployeeEnrollment.status == "COMPLETED")
            .distinct()
            .subquery()
        )

        emp_query = self.db.query(
            func.count(Employee.id).label("total"),
            func.count(case((Employee.employment_status == "ACTIVE", 1))).label("active"),
            func.count(case((Employee.employment_status != "ACTIVE", 1))).label("inactive"),
        )
        emp_query = self._apply_employee_filters(emp_query, department_id, shift_id, designation_id, status)
        emp_stats = emp_query.first()

        total = emp_stats.total if emp_stats else 0
        active = emp_stats.active if emp_stats else 0
        inactive = emp_stats.inactive if emp_stats else 0

        # Enrolled count matching filters
        enrolled_query = self.db.query(func.count(distinct(Employee.id))).filter(
            Employee.id.in_(self.db.query(enrolled_subquery.c.employee_id))
        )
        enrolled_query = self._apply_employee_filters(enrolled_query, department_id, shift_id, designation_id, status)
        enrolled = enrolled_query.scalar() or 0

        pending = max(0, total - enrolled)
        enrollment_pct = round((enrolled / total) * 100, 1) if total > 0 else 0.0

        # Pending aging calculations (>7 days, >30 days) based on created_at or joining_date
        now = datetime.utcnow()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

        # Unenrolled employees
        unenrolled_base = self.db.query(Employee).filter(
            ~Employee.id.in_(self.db.query(enrolled_subquery.c.employee_id))
        )
        unenrolled_base = self._apply_employee_filters(unenrolled_base, department_id, shift_id, designation_id, status)

        pending_7 = (
            unenrolled_base.filter(
                or_(
                    and_(Employee.joining_date != None, Employee.joining_date <= seven_days_ago.date()),
                    Employee.created_at <= seven_days_ago,
                )
            ).count()
        )

        pending_30 = (
            unenrolled_base.filter(
                or_(
                    and_(Employee.joining_date != None, Employee.joining_date <= thirty_days_ago.date()),
                    Employee.created_at <= thirty_days_ago,
                )
            ).count()
        )

        return {
            "total_employees": total,
            "active_employees": active,
            "inactive_employees": inactive,
            "face_enrolled": enrolled,
            "pending_face_enrollment": pending,
            "enrollment_percentage": enrollment_pct,
            "recognition_ready": enrolled,
            "pending_7_days": pending_7,
            "pending_30_days": pending_30,
        }

    def get_enrollment_overview(
        self,
        department_id: Optional[UUID] = None,
        shift_id: Optional[UUID] = None,
        designation_id: Optional[UUID] = None,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        summary = self.get_summary_metrics(department_id, shift_id, designation_id, status)
        total = summary["total_employees"]
        enrolled = summary["face_enrolled"]

        # Enrollments in-flight vs failed
        enr_query = self.db.query(
            func.count(case((or_(EmployeeEnrollment.status == "PENDING", EmployeeEnrollment.status == "PROCESSING"), 1))).label("pending_jobs"),
            func.count(case((EmployeeEnrollment.status == "FAILED", 1))).label("failed_jobs"),
        ).join(Employee, EmployeeEnrollment.employee_id == Employee.id)

        enr_query = self._apply_employee_filters(enr_query, department_id, shift_id, designation_id, status)
        enr_stats = enr_query.first()

        in_flight = enr_stats.pending_jobs if enr_stats else 0
        failed = enr_stats.failed_jobs if enr_stats else 0
        not_started = max(0, summary["pending_face_enrollment"] - in_flight - failed)

        return {
            "enrolled": enrolled,
            "pending": in_flight,
            "failed": failed,
            "not_started": not_started,
            "total": total,
            "enrollment_percentage": summary["enrollment_percentage"],
        }

    def get_departments_analytics(self) -> List[Dict[str, Any]]:
        departments = self.db.query(Department).all()
        enrolled_subquery = (
            self.db.query(EmployeeEnrollment.employee_id)
            .filter(EmployeeEnrollment.status == "COMPLETED")
            .distinct()
            .subquery()
        )

        results = []
        for dept in departments:
            total = self.db.query(func.count(Employee.id)).filter(Employee.department_id == dept.id).scalar() or 0
            enrolled = (
                self.db.query(func.count(distinct(Employee.id)))
                .filter(
                    Employee.department_id == dept.id,
                    Employee.id.in_(self.db.query(enrolled_subquery.c.employee_id)),
                )
                .scalar()
                or 0
            )
            pending = max(0, total - enrolled)
            pct = round((enrolled / total) * 100, 1) if total > 0 else 0.0

            health = "high"
            if pct < 70.0:
                health = "low"
            elif pct < 85.0:
                health = "moderate"

            results.append({
                "id": dept.id,
                "department_name": dept.department_name,
                "total": total,
                "enrolled": enrolled,
                "pending": pending,
                "completion_percentage": pct,
                "health": health,
            })

        return results

    def get_shifts_analytics(self) -> List[Dict[str, Any]]:
        shifts = self.db.query(Shift).all()
        enrolled_subquery = (
            self.db.query(EmployeeEnrollment.employee_id)
            .filter(EmployeeEnrollment.status == "COMPLETED")
            .distinct()
            .subquery()
        )

        results = []
        for s in shifts:
            total = self.db.query(func.count(Employee.id)).filter(Employee.shift_id == s.id).scalar() or 0
            enrolled = (
                self.db.query(func.count(distinct(Employee.id)))
                .filter(
                    Employee.shift_id == s.id,
                    Employee.id.in_(self.db.query(enrolled_subquery.c.employee_id)),
                )
                .scalar()
                or 0
            )
            pending = max(0, total - enrolled)
            pct = round((enrolled / total) * 100, 1) if total > 0 else 0.0

            results.append({
                "id": s.id,
                "shift_name": s.shift_name,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "grace_minutes": s.grace_minutes or 0,
                "total": total,
                "enrolled": enrolled,
                "pending": pending,
                "completion_percentage": pct,
            })

        return results

    def get_designations_analytics(self) -> List[Dict[str, Any]]:
        designations = self.db.query(Designation).all()
        results = []
        for d in designations:
            count = self.db.query(func.count(Employee.id)).filter(Employee.designation_id == d.id).scalar() or 0
            results.append({
                "id": d.id,
                "designation_name": d.designation_name,
                "employee_count": count,
            })
        return results

    def get_recent_activity(self, limit: int = 8) -> List[Dict[str, Any]]:
        # Fetch latest enrollments and employee creations
        enrollments = (
            self.db.query(EmployeeEnrollment, Employee)
            .join(Employee, EmployeeEnrollment.employee_id == Employee.id)
            .order_by(EmployeeEnrollment.created_at.desc())
            .limit(limit)
            .all()
        )

        activities = []
        for enr, emp in enrollments:
            emp_name = f"{emp.first_name} {emp.last_name or ''}".strip()
            is_completed = enr.status == "COMPLETED"
            is_failed = enr.status == "FAILED"

            activities.append({
                "id": str(enr.id),
                "type": "face_enrolled" if is_completed else ("enrollment_failed" if is_failed else "enrollment_processing"),
                "title": "Face Enrolled" if is_completed else ("Enrollment Failed" if is_failed else "Enrollment Processing"),
                "description": f"{emp_name} ({emp.employee_code}) - {enr.video_path}" if not is_failed else f"{emp_name} ({emp.employee_code}) - {enr.error_message or 'Video verification error'}",
                "timestamp": enr.created_at or datetime.utcnow(),
                "status": enr.status,
            })

        return activities
