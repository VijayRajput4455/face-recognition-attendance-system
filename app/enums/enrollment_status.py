from enum import Enum


class EnrollmentStatus(str, Enum):
    """
    Represents the lifecycle of an employee face enrollment.
    """

    PENDING = "PENDING"

    PROCESSING = "PROCESSING"

    COMPLETED = "COMPLETED"

    FAILED = "FAILED"