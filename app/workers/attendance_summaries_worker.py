from app.core.config import settings
from app.core.logger import get_logger
from app.core.logger import setup_logging
from app.orchestrators.attendance_summaries_orchestrator import AttendanceSummariesOrchestrator
from app.schemas.attendance_message import AttendanceLogMessage
from app.services.rabbitmq_service import get_rabbitmq_client

setup_logging(
    level=settings.LOG_LEVEL,
    log_directory=settings.LOG_STORAGE_PATH,
    service="attendance-summaries-worker",
    environment=settings.APP_ENV,
)

logger = get_logger(__name__)

QUEUE_NAME = "attendance_logs"

orchestrator = AttendanceSummariesOrchestrator()


# ==========================================================
# Callback
# ==========================================================

def callback(
    ch,
    method,
    properties,
    body,
):

    message = None

    try:

        message = AttendanceLogMessage.model_validate_json(body)

        logger.info(
            "Attendance log message received.",
            extra={
                "attendance_log_id": message.attendance_log_id,
                "employee_id": message.employee_id,
                "event_type": message.event_type.value,
            },
        )

        orchestrator.process_log_message(message=message)

        ch.basic_ack(delivery_tag=method.delivery_tag)

        logger.info(
            "Attendance summary processed successfully.",
            extra={
                "attendance_log_id": message.attendance_log_id,
                "employee_id": message.employee_id,
            },
        )

    except Exception:

        logger.exception(
            "Attendance summary processing failed.",
            extra={
                "attendance_log_id": getattr(message, "attendance_log_id", None),
                "employee_id": getattr(message, "employee_id", None),
            },
        )

        ch.basic_nack(
            delivery_tag=method.delivery_tag,
            requeue=False,
        )


# ==========================================================
# Start Consumer
# ==========================================================

def start_consumer():

    rabbitmq_client = get_rabbitmq_client()

    logger.info(
        "Attendance summaries worker started.",
        extra={
            "queue": QUEUE_NAME,
        },
    )

    try:

        rabbitmq_client.consume(
            queue_name=QUEUE_NAME,
            on_message=callback,
            prefetch_count=settings.WORKER_PREFETCH_COUNT,
        )

    except KeyboardInterrupt:

        logger.info("Attendance summaries worker stopped.")

    except Exception:

        logger.exception("Attendance summaries worker crashed.")

    finally:

        rabbitmq_client.close()

        logger.info("RabbitMQ connection closed.")


if __name__ == "__main__":

    start_consumer()
