from datetime import time

from app.core.database import SessionLocal
from app.core.logger import get_logger

from app.models.department import Department
from app.models.shift import Shift

logger = get_logger(__name__)


def initialize_master_data() -> None:
    """
    Seed master tables.

    This method is safe to execute every time
    the application starts.
    """

    db = SessionLocal()

    try:

        # ======================================================
        # Departments
        # ======================================================

        departments = [

            {
                "department_name": "AI/ML",
                "description": "Artificial Intelligence & Machine Learning",
            },

            {
                "department_name": "HR",
                "description": "Human Resources",
            },

            {
                "department_name": "Finance",
                "description": "Finance Department",
            },

            {
                "department_name": "Sales",
                "description": "Sales Department",
            },

            {
                "department_name": "IT",
                "description": "Information Technology",
            },

            {
                "department_name": "Operations",
                "description": "Operations Department",
            },

        ]

        inserted_departments = 0

        for department in departments:

            exists = (

                db.query(Department)

                .filter(
                    Department.department_name
                    == department["department_name"]
                )

                .first()

            )

            if exists:
                continue

            db.add(

                Department(

                    department_name=department[
                        "department_name"
                    ],

                    description=department[
                        "description"
                    ],

                )

            )

            inserted_departments += 1

        db.commit()

        logger.info(
            "Departments initialized.",
            extra={
                "inserted": inserted_departments,
            },
        )

        # ======================================================
        # Shifts
        # ======================================================

        shifts = [

            {

                "shift_name": "General Shift",

                "start_time": time(9, 0),

                "end_time": time(18, 0),

                "grace_minutes": 15,

            },

            {

                "shift_name": "Morning Shift",

                "start_time": time(6, 0),

                "end_time": time(14, 0),

                "grace_minutes": 10,

            },

            {

                "shift_name": "Evening Shift",

                "start_time": time(14, 0),

                "end_time": time(22, 0),

                "grace_minutes": 10,

            },

            {

                "shift_name": "Night Shift",

                "start_time": time(22, 0),

                "end_time": time(6, 0),

                "grace_minutes": 15,

            },

        ]

        inserted_shifts = 0

        for shift in shifts:

            exists = (

                db.query(Shift)

                .filter(
                    Shift.shift_name
                    == shift["shift_name"]
                )

                .first()

            )

            if exists:
                continue

            db.add(

                Shift(

                    shift_name=shift["shift_name"],

                    start_time=shift["start_time"],

                    end_time=shift["end_time"],

                    grace_minutes=shift[
                        "grace_minutes"
                    ],

                )

            )

            inserted_shifts += 1

        db.commit()

        logger.info(
            "Shifts initialized.",
            extra={
                "inserted": inserted_shifts,
            },
        )

        logger.info(
            "Master data initialized successfully."
        )

    except Exception:

        db.rollback()

        logger.exception(
            "Failed to initialize master data."
        )

        raise

    finally:

        db.close()