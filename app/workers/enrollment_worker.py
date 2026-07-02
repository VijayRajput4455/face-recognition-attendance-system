from app.orchestrators.enrollment_orchestrator import (
    EnrollmentOrchestrator,
)
from app.schemas.enrollment import (
    EnrollmentMessage,
)
from app.services.rabbitmq_service import get_rabbitmq_client

from app.core.logger import setup_logging, get_logger
from app.core.config import settings

setup_logging(
    level=settings.LOG_LEVEL,
    log_directory=settings.LOG_STORAGE_PATH,
    service="enrollment-worker",
    environment=settings.APP_ENV,
)

logger = get_logger(__name__)

QUEUE_NAME = "employee_enrollment"

orchestrator = EnrollmentOrchestrator()


def callback(
    ch,
    method,
    properties,
    body,
):

    message = None

    try:

        message = EnrollmentMessage.model_validate_json(
            body
        )
        logger.info(
                    "Enrollment message received.",
                    extra={
                        "employee_id": message.employee_id,
                        "employee_code": message.employee_code,
                        "enrollment_id": message.enrollment_id,
                    },
                )

        orchestrator.process(
            message
        )

        ch.basic_ack(
            delivery_tag=method.delivery_tag
        )

        logger.info(
            "Enrollment completed successfully.",
            extra={
                "employee_id": message.employee_id,
                "employee_code": message.employee_code,
                "enrollment_id": message.enrollment_id,
            },
        )

    except Exception:

        logger.exception(
            "Enrollment processing failed.",
            extra={
                "employee_id": getattr(message, "employee_id", None),
                "employee_code": getattr(message, "employee_code", None),
                "enrollment_id": getattr(message, "enrollment_id", None),
            },
        )

        ch.basic_nack(
            delivery_tag=method.delivery_tag,
            requeue=False,
        )


def start_consumer():

    rabbitmq_client = get_rabbitmq_client()

    logger.info(
        "Enrollment worker is ready.",
        extra={
            "queue": QUEUE_NAME,
        },
    )
    try:

        logger.info(
            "Starting to consume messages...",
            extra={
                "queue": QUEUE_NAME,
            },
        )

        rabbitmq_client.consume(
            queue_name=QUEUE_NAME,
            on_message=callback,
            prefetch_count=1,
        )
    except KeyboardInterrupt:

        logger.info(
            "Enrollment worker stopped by user.",
            extra={
                "queue": QUEUE_NAME,
            },
        )
    except Exception as e:

        logger.exception(
            "Enrollment worker encountered an error.",
            extra={
                "queue": QUEUE_NAME,
                "error": str(e),
            },
        )
    finally:

        rabbitmq_client.close(queue_name=QUEUE_NAME)

        logger.info(
            "RabbitMQ connection closed.",
            extra={
                "queue": QUEUE_NAME,
            },
        )



if __name__ == "__main__":

    start_consumer()