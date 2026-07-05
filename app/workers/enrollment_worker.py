from app.orchestrators.enrollment_processing_orchestrator import (
    EnrollmentProcessingOrchestrator,
)

from app.schemas.enrollment import (
    EnrollmentMessage,
)

from app.services.rabbitmq_service import (
    get_rabbitmq_client,
)

from app.core.logger import (
    setup_logging,
    get_logger,
)

from app.core.config import settings


setup_logging(
    level=settings.LOG_LEVEL,
    log_directory=settings.LOG_STORAGE_PATH,
    service="enrollment-worker",
    environment=settings.APP_ENV,
)

logger = get_logger(__name__)

QUEUE_NAME = "employee_enrollment"

orchestrator = EnrollmentProcessingOrchestrator()


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

        message = EnrollmentMessage.model_validate_json(body)

        logger.info(
            "Enrollment message received.",
            extra={
                "employee_id": message.employee_id,
                "employee_code": message.employee_code,
                "enrollment_id": message.enrollment_id,
            },
        )

        orchestrator.process(message)

        ch.basic_ack(
            delivery_tag=method.delivery_tag,
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


# ==========================================================
# Start Consumer
# ==========================================================

def start_consumer():

    rabbitmq_client = get_rabbitmq_client()

    logger.info(
        "Enrollment worker started.",
        extra={
            "queue": QUEUE_NAME,
        },
    )

    try:

        rabbitmq_client.consume(
            queue_name=QUEUE_NAME,
            on_message=callback,
            prefetch_count=1,
        )

    except KeyboardInterrupt:

        logger.info(
            "Enrollment worker stopped.",
        )

    except Exception:

        logger.exception(
            "Enrollment worker crashed.",
        )

    finally:

        rabbitmq_client.close()

        logger.info(
            "RabbitMQ connection closed.",
        )


if __name__ == "__main__":

    start_consumer()