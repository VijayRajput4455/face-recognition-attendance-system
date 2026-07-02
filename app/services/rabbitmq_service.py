import json
import ssl
import threading
import time
from collections.abc import Callable
from typing import Any

import pika
import pika.exceptions
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties

from app.core.config import settings

from app.core.logger import get_logger
logger = get_logger(__name__)

# Errors that mean "the connection/channel is dead" and are worth
# reconnecting + retrying for. Auth failures are deliberately excluded -
# retrying with the same bad credentials will never succeed.
RETRYABLE_CONNECTION_ERRORS = (
    pika.exceptions.AMQPConnectionError,
    pika.exceptions.StreamLostError,
    pika.exceptions.ChannelClosedByBroker,
    pika.exceptions.ConnectionClosedByBroker,
    pika.exceptions.ChannelWrongStateError,
    ConnectionResetError,
    OSError,
)


class RabbitMQClient:
    """
    Thread-aware RabbitMQ client built on pika's BlockingConnection.

    IMPORTANT: pika.BlockingConnection is NOT thread-safe. A connection
    (and any channel created from it) must only ever be used by the
    thread that created it. This client keeps one connection + one
    channel-cache per thread via `threading.local`, instead of sharing
    a single connection process-wide.

    Because that state is already partitioned per thread, no lock is
    needed around normal channel/publish/consume operations - two
    threads never touch the same `threading.local` slot, so there is
    nothing to race on. The only lock in this class guards a small
    bookkeeping registry used for best-effort cleanup at shutdown.
    """

    _instance = None
    _instance_lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        with self._instance_lock:
            if self._initialized:
                return
            self._initialized = True

        self._state = threading.local()
        self.exchange_name = settings.RABBITMQ_EXCHANGE

        # thread_id -> that thread's `vars(self._state)` dict (i.e. a
        # live reference to its 'connection' / 'channels' entries).
        # Used only by close_all() at process shutdown - see caveat there.
        self._registry_lock = threading.Lock()
        self._registry: dict[int, dict[str, Any]] = {}

        # Tunables - read via getattr so this doesn't break if a given
        # deployment's settings module hasn't been updated with them yet.
        self.use_ssl = getattr(settings, "RABBITMQ_USE_SSL", False)
        self.max_connect_retries = getattr(settings, "RABBITMQ_CONNECT_MAX_RETRIES", 5)
        self.connect_backoff_base = getattr(settings, "RABBITMQ_CONNECT_BACKOFF_BASE", 0.5)
        self.connect_backoff_max = getattr(settings, "RABBITMQ_CONNECT_BACKOFF_MAX", 10.0)
        self.max_publish_retries = getattr(settings, "RABBITMQ_PUBLISH_MAX_RETRIES", 2)

    # ------------------------------------------------------------------
    # Per-thread state
    # ------------------------------------------------------------------

    def _get_state(self):
        if not hasattr(self._state, "connection"):
            self._state.connection = None
            self._state.channels = {}
            with self._registry_lock:
                self._registry[threading.get_ident()] = vars(self._state)
        return self._state

    def _build_connection_parameters(self) -> pika.ConnectionParameters:
        credentials = pika.PlainCredentials(
            settings.RABBITMQ_USER,
            settings.RABBITMQ_PASSWORD,
        )

        ssl_options = None
        if self.use_ssl:
            ssl_context = ssl.create_default_context()
            ssl_options = pika.SSLOptions(ssl_context, settings.RABBITMQ_HOST)

        return pika.ConnectionParameters(
            host=settings.RABBITMQ_HOST,
            port=settings.RABBITMQ_PORT,
            virtual_host=settings.RABBITMQ_VHOST,
            credentials=credentials,
            heartbeat=settings.RABBITMQ_HEARTBEAT,
            blocked_connection_timeout=settings.RABBITMQ_BLOCKED_TIMEOUT,
            ssl_options=ssl_options,
        )

    def _connect_with_retry(self) -> pika.BlockingConnection:
        attempt = 0
        while True:
            try:
                logger.info(
                    "Opening RabbitMQ connection to %s:%s (attempt %d)",
                    settings.RABBITMQ_HOST, settings.RABBITMQ_PORT, attempt + 1,
                )
                return pika.BlockingConnection(self._build_connection_parameters())
            except pika.exceptions.ProbableAuthenticationError:
                logger.error("RabbitMQ authentication failed - check RABBITMQ_USER/RABBITMQ_PASSWORD")
                raise
            except (pika.exceptions.AMQPConnectionError, OSError) as exc:
                attempt += 1
                if attempt > self.max_connect_retries:
                    logger.error("Exhausted RabbitMQ connection retries: %s", exc)
                    raise
                delay = min(self.connect_backoff_base * (2 ** (attempt - 1)), self.connect_backoff_max)
                logger.warning(
                    "RabbitMQ connection attempt %d failed (%s); retrying in %.1fs",
                    attempt, exc, delay,
                )
                time.sleep(delay)

    def _ensure_connection(self):
        state = self._get_state()
        if state.connection is None or state.connection.is_closed:
            state.connection = self._connect_with_retry()
            # Old channels (if any) died with the old connection. Clear
            # the dict in place rather than reassigning, so the
            # reference held in self._registry stays valid.
            state.channels.clear()

    def get_channel(self, queue_name: str) -> BlockingChannel:
        self._ensure_connection()
        state = self._get_state()

        channel = state.channels.get(queue_name)
        if channel is not None and not channel.is_closed:
            return channel

        channel = state.connection.channel()
        channel.exchange_declare(
            exchange=self.exchange_name,
            exchange_type="direct",
            durable=True,
        )
        channel.queue_declare(queue=queue_name, durable=True)
        channel.queue_bind(
            exchange=self.exchange_name,
            queue=queue_name,
            routing_key=queue_name,
        )
        state.channels[queue_name] = channel
        logger.info(
            "RabbitMQ channel ready for queue=%s (thread=%s)",
            queue_name, threading.get_ident(),
        )
        return channel

    def _invalidate(self, queue_name: str | None = None) -> None:
        """Drop cached connection/channel state after a failure so the
        next call reconnects from scratch."""
        state = self._get_state()
        state.connection = None
        if queue_name is not None:
            state.channels.pop(queue_name, None)
        else:
            state.channels.clear()

    # ------------------------------------------------------------------
    # Publish
    # ------------------------------------------------------------------

    def publish(
        self,
        queue_name: str,
        message: dict[str, Any],
        *,
        headers: dict[str, Any] | None = None,
    ) -> None:
        body = json.dumps(message)
        properties = pika.BasicProperties(delivery_mode=2, headers=headers or {})

        attempt = 0
        while True:
            try:
                channel = self.get_channel(queue_name)
                channel.basic_publish(
                    exchange=self.exchange_name,
                    routing_key=queue_name,
                    body=body,
                    properties=properties,
                )
                logger.info("Published RabbitMQ message to queue=%s", queue_name)
                return
            except RETRYABLE_CONNECTION_ERRORS as exc:
                attempt += 1
                self._invalidate(queue_name)
                if attempt > self.max_publish_retries:
                    logger.error(
                        "Failed to publish to queue=%s after %d attempt(s): %s",
                        queue_name, attempt, exc,
                    )
                    raise
                logger.warning(
                    "Publish to queue=%s failed (%s); reconnecting and retrying (attempt %d)",
                    queue_name, exc, attempt,
                )

    # ------------------------------------------------------------------
    # Consume
    # ------------------------------------------------------------------

    def consume(
        self,
        queue_name: str,
        on_message: Callable[[BlockingChannel, Basic.Deliver, BasicProperties, bytes], None],
        *,
        prefetch_count: int = 1,
        stop_event: threading.Event | None = None,
    ) -> None:
        """
        Blocks, consuming from `queue_name`. Automatically reconnects on
        connection-level failures (broker restart, network blip) so a
        long-running worker doesn't die on a transient outage.

        Pass `stop_event` (a threading.Event) to allow graceful shutdown:
        set it from another thread or a signal handler and this loop
        will exit instead of reconnecting forever. Without it, the loop
        only exits via an unrecoverable exception (e.g. auth failure)
        or process termination.
        """
        while stop_event is None or not stop_event.is_set():
            try:
                channel = self.get_channel(queue_name)
                channel.basic_qos(prefetch_count=prefetch_count)
                channel.basic_consume(queue=queue_name, on_message_callback=on_message)
                logger.info("Waiting for RabbitMQ messages on queue=%s", queue_name)
                channel.start_consuming()
                # Returns normally only after someone calls channel.stop_consuming().
                return
            except RETRYABLE_CONNECTION_ERRORS as exc:
                self._invalidate(queue_name)
                logger.warning(
                    "RabbitMQ consumer on queue=%s lost connection (%s); reconnecting",
                    queue_name, exc,
                )
                time.sleep(self.connect_backoff_base)

    # ------------------------------------------------------------------
    # Health / shutdown
    # ------------------------------------------------------------------

    def is_connected(self) -> bool:
        """Check connection health for *this* thread - useful for a
        readiness/liveness probe running on the same thread/worker."""
        state = self._get_state()
        return state.connection is not None and state.connection.is_open

    def close(self, queue_name: str | None = None) -> None:
        """
        Close this thread's channel(s)/connection. Call this from the
        same thread that used them - ideally in a `finally` block around
        whatever loop calls publish()/consume().
        """
        state = self._get_state()
        if queue_name is not None:
            channel = state.channels.pop(queue_name, None)
            if channel is not None and not channel.is_closed:
                channel.close()
                logger.info("Closed RabbitMQ channel for queue=%s", queue_name)
        else:
            for name, channel in list(state.channels.items()):
                if channel is not None and not channel.is_closed:
                    channel.close()
                    logger.info("Closed RabbitMQ channel for queue=%s", name)
            state.channels.clear()

        if state.connection is not None and not state.connection.is_closed:
            state.connection.close()
            logger.info("Closed RabbitMQ connection")
            state.connection = None

    def close_all(self) -> None:
        """
        Best-effort shutdown hook for process exit (e.g. a SIGTERM
        handler or `atexit.register(client.close_all)`). Closes every
        connection any thread in this process has opened, not just the
        calling thread's.

        Caveat: pika's BlockingConnection is documented as not
        thread-safe, so this is only safe once those other threads are
        no longer actively publishing/consuming on it (i.e. during
        shutdown, after worker threads have been signalled to stop).
        Prefer each thread calling close() on itself when possible;
        treat close_all() as a safety net, not the primary cleanup path.
        """
        with self._registry_lock:
            thread_states = list(self._registry.values())

        for thread_state in thread_states:
            try:
                channels = thread_state.get("channels") or {}
                for name, channel in list(channels.items()):
                    if channel is not None and not channel.is_closed:
                        channel.close()
                connection = thread_state.get("connection")
                if connection is not None and not connection.is_closed:
                    connection.close()
            except Exception as exc:  # noqa: BLE001 - best effort cleanup
                logger.warning("Error during close_all() cleanup: %s", exc)


_rabbitmq_client = RabbitMQClient()


def get_rabbitmq_client() -> RabbitMQClient:
    return _rabbitmq_client