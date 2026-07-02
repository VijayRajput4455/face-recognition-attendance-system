import json
import socket
from datetime import datetime, timezone
from logging import Formatter, LogRecord
from traceback import format_exception


class JsonFormatter(Formatter):
    """
    Production JSON Formatter

    Converts every LogRecord into JSON.

    Compatible with:
    - Grafana Loki
    - ELK
    - Datadog
    - Splunk
    """

    RESERVED_ATTRS = {

        "args",
        "asctime",
        "created",
        "exc_info",
        "exc_text",
        "filename",
        "funcName",
        "levelname",
        "levelno",
        "lineno",
        "module",
        "msecs",
        "message",
        "msg",
        "name",
        "pathname",
        "process",
        "processName",
        "relativeCreated",
        "stack_info",
        "thread",
        "threadName",

    }

    def __init__(self):

        super().__init__()

        self.hostname = socket.gethostname()

    def format(
        self,
        record: LogRecord,
    ) -> str:

        log = {

            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),

            "level": record.levelname,

            "message": record.getMessage(),

            "logger": record.name,

            "module": record.module,

            "function": record.funcName,

            "line": record.lineno,

            "file": record.filename,

            "hostname": self.hostname,

            "process": record.process,

            "thread": record.threadName,

            "request_id": getattr(
                record,
                "request_id",
                None,
            ),

            "service": getattr(
                record,
                "service",
                None,
            ),

            "environment": getattr(
                record,
                "environment",
                None,
            ),

        }

        if record.exc_info:

            log["exception"] = "".join(

                format_exception(
                    *record.exc_info
                )

            )

        # Include custom metadata
        for key, value in record.__dict__.items():

            if key not in self.RESERVED_ATTRS:

                if key not in log:

                    log[key] = value

        return json.dumps(

            log,

            ensure_ascii=False,

            default=str,

        )