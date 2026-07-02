import logging
import os
import threading
from logging import Logger
from logging.handlers import RotatingFileHandler

from app.core.context import get_request_id
from app.core.json_formatter import JsonFormatter


class ContextFilter(logging.Filter):
    """
    Inject application context into every log record.
    """

    def __init__(
        self,
        service: str,
        environment: str,
    ) -> None:

        super().__init__()

        self.service = service
        self.environment = environment

    def filter(
        self,
        record: logging.LogRecord,
    ) -> bool:

        record.request_id = get_request_id()

        record.service = self.service

        record.environment = self.environment

        return True


class LoggerService:
    """
    Production Logger Service

    Features
    --------
    - Thread-safe Singleton
    - JSON Structured Logging
    - Console Logging
    - Rotating File Logging
    - Error Logging
    - Request ID Injection
    - Service Injection
    - Environment Injection
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):

        if cls._instance is None:

            with cls._lock:

                if cls._instance is None:

                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False

        return cls._instance

    def __init__(
        self,
        level: str = "INFO",
        log_directory: str = "logs",
        service: str = "application",
        environment: str = "development",
    ):

        if self._initialized:
            return

        self.level = getattr(
            logging,
            level.upper(),
            logging.INFO,
        )

        self.log_directory = log_directory

        self.service = service

        self.environment = environment

        os.makedirs(
            self.log_directory,
            exist_ok=True,
        )

        self.root_logger = logging.getLogger()

        self.root_logger.setLevel(
            self.level
        )

        # Prevent duplicate handlers
        self.root_logger.handlers.clear()

        self.context_filter = ContextFilter(
            service=self.service,
            environment=self.environment,
        )

        self.formatter = JsonFormatter()

        self._configure_handlers()

        logging.captureWarnings(True)

        self._initialized = True

    # =====================================================
    # Console Handler
    # =====================================================

    def _create_console_handler(
        self,
    ) -> logging.Handler:

        handler = logging.StreamHandler()

        handler.setLevel(
            self.level
        )

        handler.setFormatter(
            self.formatter
        )

        handler.addFilter(
            self.context_filter
        )

        return handler

    # =====================================================
    # Application Log Handler
    # =====================================================

    def _create_application_handler(
        self,
    ) -> logging.Handler:

        handler = RotatingFileHandler(

            filename=os.path.join(
                self.log_directory,
                "application.log",
            ),

            maxBytes=10 * 1024 * 1024,

            backupCount=5,

            encoding="utf-8",

        )

        handler.setLevel(
            self.level
        )

        handler.setFormatter(
            self.formatter
        )

        handler.addFilter(
            self.context_filter
        )

        return handler

    # =====================================================
    # Error Log Handler
    # =====================================================

    def _create_error_handler(
        self,
    ) -> logging.Handler:

        handler = RotatingFileHandler(

            filename=os.path.join(
                self.log_directory,
                "error.log",
            ),

            maxBytes=20 * 1024 * 1024,

            backupCount=10,

            encoding="utf-8",

        )

        handler.setLevel(
            logging.ERROR
        )

        handler.setFormatter(
            self.formatter
        )

        handler.addFilter(
            self.context_filter
        )

        return handler
    
    # =====================================================
    # Configure Handlers
    # =====================================================

    def _configure_handlers(self) -> None:
        """
        Register all logging handlers.
        """

        self.root_logger.addHandler(
            self._create_console_handler()
        )

        self.root_logger.addHandler(
            self._create_application_handler()
        )

        self.root_logger.addHandler(
            self._create_error_handler()
        )

    # =====================================================
    # Public API
    # =====================================================

    def get_logger(
        self,
        name: str,
    ) -> Logger:
        """
        Return logger instance.
        """

        return logging.getLogger(name)

    def set_level(
        self,
        level: str,
    ) -> None:
        """
        Change logging level dynamically.
        """

        numeric_level = getattr(
            logging,
            level.upper(),
            logging.INFO,
        )

        self.root_logger.setLevel(
            numeric_level
        )

        for handler in self.root_logger.handlers:

            if isinstance(
                handler,
                RotatingFileHandler,
            ):

                # Error handler always stays ERROR
                if handler.level == logging.ERROR:
                    continue

            handler.setLevel(
                numeric_level
            )

    def shutdown(
        self,
    ) -> None:
        """
        Flush and close all handlers.
        """

        handlers = self.root_logger.handlers[:]

        for handler in handlers:

            handler.flush()

            handler.close()

            self.root_logger.removeHandler(
                handler
            )


# =====================================================
# Singleton
# =====================================================

_logger_service: LoggerService | None = None

_logger_lock = threading.Lock()


def setup_logging(
    level: str = "INFO",
    log_directory: str = "logs",
    service: str = "application",
    environment: str = "development",
) -> None:
    """
    Configure logging once.

    Call this once during application startup.
    """

    global _logger_service

    if _logger_service is None:

        with _logger_lock:

            if _logger_service is None:

                _logger_service = LoggerService(

                    level=level,

                    log_directory=log_directory,

                    service=service,

                    environment=environment,

                )


def get_logger(
    name: str,
) -> Logger:
    """
    Return application logger.

    Example
    -------
    logger = get_logger(__name__)
    """

    if _logger_service is None:

        setup_logging()

    return logging.getLogger(name)


def shutdown_logging() -> None:
    """
    Shutdown logging gracefully.
    """

    global _logger_service

    if _logger_service:

        _logger_service.shutdown()

        _logger_service = None