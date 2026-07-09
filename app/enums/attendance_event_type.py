from enum import Enum


class AttendanceEventType(str, Enum):

    ENTRY = "ENTRY"

    EXIT = "EXIT"