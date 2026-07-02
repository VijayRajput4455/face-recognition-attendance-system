from contextvars import ContextVar
import uuid


_request_id: ContextVar[str] = ContextVar(
    "request_id",
    default="-",
)


def set_request_id(
    request_id: str | None = None,
) -> str:
    """
    Set request ID for the current context.
    """

    if request_id is None:

        request_id = str(uuid.uuid4())

    _request_id.set(request_id)

    return request_id


def get_request_id() -> str:
    """
    Return current request ID.
    """

    return _request_id.get()


def clear_request_id() -> None:
    """
    Clear request ID.
    """

    _request_id.set("-")