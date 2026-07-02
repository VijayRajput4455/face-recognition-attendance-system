class EmbeddingException(Exception):
    """Base embedding exception."""
    pass


class EmptyEmbeddingListException(EmbeddingException):
    """Raised when embedding list is empty."""
    pass


class InvalidEmbeddingDimensionException(EmbeddingException):
    """Raised when embedding dimension is invalid."""
    pass


class InvalidEmbeddingException(EmbeddingException):
    """Raised when embedding is invalid."""
    pass


class NoValidEmbeddingException(EmbeddingException):
    """Raised when no valid embedding is generated."""
    pass