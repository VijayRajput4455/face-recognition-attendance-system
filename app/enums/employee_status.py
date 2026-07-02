from enum import Enum


class EmployeeStatus(str, Enum):
    """
    Represents the employment status of an employee.
    """

    ACTIVE = "ACTIVE"

    INACTIVE = "INACTIVE"

    SUSPENDED = "SUSPENDED"