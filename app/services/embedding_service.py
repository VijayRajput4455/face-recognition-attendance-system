import numpy as np

from app.exceptions.embedding_exception import (
    EmptyEmbeddingListException,
    InvalidEmbeddingException,
)

from app.core.logger import get_logger
logger = get_logger(__name__)


class EmbeddingService:

    EMBEDDING_DIMENSION = 512

    # --------------------------------------------------------
    # Public APIs
    # --------------------------------------------------------

    def average(
        self,
        embeddings: list[np.ndarray],
    ) -> np.ndarray:

        self.validate(embeddings)

        embedding = np.mean(
            embeddings,
            axis=0,
        )

        embedding = self.normalize(
            embedding,
        )

        logger.info(
            "Average embedding created from %d embeddings.",
            len(embeddings),
        )

        return embedding

    def normalize(
        self,
        embedding: np.ndarray,
    ) -> np.ndarray:

        norm = np.linalg.norm(embedding)

        if norm == 0:

            raise InvalidEmbeddingException(
                "Embedding norm cannot be zero."
            )

        return embedding / norm

    def cosine_similarity(
        self,
        embedding1: np.ndarray,
        embedding2: np.ndarray,
    ) -> float:

        embedding1 = self.normalize(
            embedding1,
        )

        embedding2 = self.normalize(
            embedding2,
        )

        similarity = np.dot(
            embedding1,
            embedding2,
        )

        return float(similarity)

    def euclidean_distance(
        self,
        embedding1: np.ndarray,
        embedding2: np.ndarray,
    ) -> float:

        return float(
            np.linalg.norm(
                embedding1 - embedding2
            )
        )

    def validate(
        self,
        embeddings: list[np.ndarray],
    ):

        if not embeddings:

            raise EmptyEmbeddingListException(
                "No embeddings found."
            )

        for embedding in embeddings:

            if not isinstance(
                embedding,
                np.ndarray,
            ):

                raise InvalidEmbeddingException(
                    "Embedding must be numpy.ndarray."
                )

            if embedding.shape != (
                self.EMBEDDING_DIMENSION,
            ):

                raise InvalidEmbeddingException(
                    f"Expected embedding dimension "
                    f"{self.EMBEDDING_DIMENSION}, "
                    f"received {embedding.shape}"
                )