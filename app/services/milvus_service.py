import threading
from typing import Any
from unittest import result
from app.core.config import settings
import numpy as np
from pymilvus import (
    DataType,
    MilvusClient,
)

from app.core.logger import get_logger
logger = get_logger(__name__)


class MilvusService:

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):

        if cls._instance is None:

            with cls._lock:

                if cls._instance is None:

                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False

        return cls._instance

    def __init__(self):

        if self._initialized:
            return

        self._client: MilvusClient | None = None

        self.collection_name = settings.MILVUS_COLLECTION

        self.dimension = settings.MILVUS_DIMENSION

        self.metric_type = settings.MILVUS_METRIC_TYPE

        self.index_type = settings.MILVUS_INDEX_TYPE

        self.connect()

        self.initialize()

        self._initialized = True

    # ==========================================================
    # Connection
    # ==========================================================

    def connect(self):

        if self._client is not None:
            return

        logger.info(
            "Connecting to Milvus..."
        )

        try:

            self._client = MilvusClient(

                uri=settings.MILVUS_URI,

                token=f"{settings.MILVUS_USERNAME}:{settings.MILVUS_PASSWORD}"
                if settings.MILVUS_USERNAME
                else None,

            )

            logger.info(
                "Milvus connected successfully."
            )

        except Exception:

            logger.exception(
                "Unable to connect Milvus."
            )

            raise

    # ==========================================================
    # Initialization
    # ==========================================================

    def initialize(self):

        if not self.collection_exists():

            self.create_collection()

            self.create_index()

        self.load_collection()

    # ==========================================================
    # Health
    # ==========================================================

    def health_check(self) -> bool:

        try:

            self._client.list_collections()

            return True

        except Exception:

            logger.exception(
                "Milvus Health Check Failed."
            )

            return False

    # ==========================================================
    # Collection
    # ==========================================================

    def collection_exists(self) -> bool:

        collections = self._client.list_collections()

        return self.collection_name in collections

    def create_collection(self):

        logger.info(
            "Creating collection..."
        )

        schema = MilvusClient.create_schema(

            auto_id=True,

            enable_dynamic_field=False,

        )

        schema.add_field(

            field_name="id",

            datatype=DataType.INT64,

            is_primary=True,

        )

        schema.add_field(

            field_name="employee_id",

            datatype=DataType.VARCHAR,

            max_length=100,

        )

        schema.add_field(

            field_name="employee_code",

            datatype=DataType.VARCHAR,

            max_length=100,

        )

        schema.add_field(

            field_name="embedding",

            datatype=DataType.FLOAT_VECTOR,

            dim=self.dimension,

        )

        self._client.create_collection(

            collection_name=self.collection_name,

            schema=schema,

        )

        logger.info(
            "Collection created."
        )

    # ==========================================================
    # Index
    # ==========================================================

    def create_index(self):

        logger.info(
            "Creating index..."
        )

        index = self._client.prepare_index_params()

        index.add_index(

            field_name="embedding",

            metric_type=self.metric_type,

            index_type=self.index_type,

            index_name="embedding_index",

            params={

                "M":16,

                "efConstruction":200,

            }

        )

        self._client.create_index(

            collection_name=self.collection_name,

            index_params=index,

        )

        logger.info(
            "Index created."
        )

    # ==========================================================
    # Load
    # ==========================================================

    def load_collection(self):

        logger.info(
            "Loading collection..."
        )

        self._client.load_collection(

            self.collection_name

        )

        logger.info(
            "Collection loaded."
        )

        # ==========================================================
    # Validation
    # ==========================================================

    def _validate_embedding(
        self,
        embedding: np.ndarray,
        ) -> np.ndarray:

        if embedding is None:
            raise ValueError("Embedding cannot be None.")

        embedding = np.asarray(
            embedding,
            dtype=np.float32,
        )

        if embedding.ndim != 1:
            raise ValueError(
                f"Embedding must be 1-dimensional. Got {embedding.shape}"
            )

        if embedding.shape[0] != self.dimension:
            raise ValueError(
                f"Expected dimension {self.dimension}, "
                f"got {embedding.shape[0]}"
            )

        if np.isnan(embedding).any():
            raise ValueError("Embedding contains NaN values.")

        if np.isinf(embedding).any():
            raise ValueError("Embedding contains Inf values.")

        norm = np.linalg.norm(embedding)

        if norm == 0:
            raise ValueError("Embedding norm cannot be zero.")

        return embedding / norm

    # ==========================================================
    # Insert
    # ==========================================================

    def insert(
        self,
        employee_id: str,
        employee_code: str,
        embedding: np.ndarray,
    ) -> int:

        self._validate_embedding(embedding)

        data = [
            {
                "employee_id": employee_id,
                "employee_code": employee_code,
                "embedding": embedding.tolist(),
            }
        ]

        logger.info(
            "Inserting embedding for employee %s",
            employee_code,
        )

        try:

            result = self._client.insert(
                collection_name=self.collection_name,
                data=data,
            )

            primary_key = result["ids"][0]

            logger.info(
                "Embedding inserted successfully."
            )

            return primary_key

        except Exception:

            logger.exception(
                "Failed to insert embedding."
            )

            raise

    # ==========================================================
    # Batch Insert
    # ==========================================================

    def batch_insert(
        self,
        records: list[dict[str, Any]],
    ) -> list[int]:

        if not records:
            return []

        logger.info(
            "Batch inserting %d embeddings.",
            len(records),
        )

        payload = []

        for record in records:

            embedding = record["embedding"]

            self._validate_embedding(embedding)

            payload.append(
                {
                    "employee_id": record["employee_id"],
                    "employee_code": record["employee_code"],
                    "embedding": embedding.tolist(),
                }
            )

        try:

            result = self._client.insert(
                collection_name=self.collection_name,
                data=payload,
            )

            logger.info(
                "Batch insert completed."
            )

            return result["ids"]

        except Exception:

            logger.exception(
                "Batch insert failed."
            )

            raise

    # ==========================================================
    # Search
    # ==========================================================

    def search(
        self,
        embedding: np.ndarray,
        top_k: int = 1,
    ) -> dict | None:

        self._validate_embedding(
            embedding
        )

        logger.info(
            "Searching top %d similar faces.",
            top_k,
        )

        try:

            results = self._client.search(

                collection_name=self.collection_name,

                data=[embedding.tolist()],

                limit=top_k,

                output_fields=[
                    "employee_id",
                    "employee_code",
                ],

            )

            if not results or not results[0]:

                logger.info(
                    "No matching face found."
                )

                return None

            hit = results[0][0]

            match = {

                "id": hit["id"],

                "distance": float(
                    hit["distance"]
                ),

                "employee_id": hit["entity"][
                    "employee_id"
                ],

                "employee_code": hit["entity"][
                    "employee_code"
                ],

            }

            logger.info(
                "Best match found.",
                extra={
                    "employee_code": match["employee_code"],
                    "distance": match["distance"],
                },
            )

            return match

        except Exception:

            logger.exception(
                "Milvus search failed."
            )

            raise

    # ==========================================================
    # Delete
    # ==========================================================

    def delete(
        self,
        employee_id: str,
    ) -> None:

        logger.info(
            "Deleting employee %s",
            employee_id,
        )

        try:

            self._client.delete(

                collection_name=self.collection_name,

                filter=f'employee_id == "{employee_id}"',

            )

            logger.info(
                "Employee deleted."
            )

        except Exception:

            logger.exception(
                "Delete operation failed."
            )

            raise

    # ==========================================================
    # Update
    # ==========================================================

    def update(
        self,
        employee_id: str,
        employee_code: str,
        embedding: np.ndarray,
    ) -> int:

        self.delete(employee_id)

        return self.insert(
            employee_id=employee_id,
            employee_code=employee_code,
            embedding=embedding,
        )
    
    # ==========================================================
    # Count
    # ==========================================================

    def count(
        self,
    ) -> int:

        logger.info(
            "Counting vectors in Milvus collection."
        )

        try:

            results = self._client.query(

                collection_name=self.collection_name,

                filter="employee_id != ''",

                output_fields=[
                    "employee_id",
                ],

            )

            total = len(results)

            logger.info(
                "Total vectors in collection.",
                extra={
                    "total_vectors": total,
                },
            )

            return total

        except Exception:

            logger.exception(
                "Failed to count vectors."
            )

            raise
    # ==========================================================
    # Get All Employees
    # ==========================================================

    def get_all(
        self,
    ) -> list[dict]:

        logger.info(
            "Fetching all employees from Milvus."
        )

        try:

            results = self._client.query(

                collection_name=self.collection_name,

                filter="employee_id != ''",

                output_fields=[
                    "employee_id",
                    "employee_code",
                ],

            )

            logger.info(
                "Retrieved %d employees from Milvus.",
                len(results),
            )

            return results

        except Exception:

            logger.exception(
                "Failed to fetch employees from Milvus."
            )

            raise

    # ==========================================================
    # Get By Employee ID
    # ==========================================================

    def get_by_employee_id(
        self,
        employee_id: str,
    ) -> dict | None:

        logger.info(
            "Fetching employee by employee_id.",
            extra={
                "employee_id": employee_id,
            },
        )

        try:

            results = self._client.query(

                collection_name=self.collection_name,

                filter=f'employee_id == "{employee_id}"',

                output_fields=[
                    "employee_id",
                    "employee_code",
                ],

            )

            if not results:

                logger.info(
                    "Employee not found.",
                    extra={
                        "employee_id": employee_id,
                    },
                )

                return None

            return results[0]

        except Exception:

            logger.exception(
                "Failed to fetch employee from Milvus."
            )

            raise
    # ==========================================================
    # Get By Employee Code
    # ==========================================================

    def get_by_employee_code(
        self,
        employee_code: str,
    ) -> dict | None:

        logger.info(
            "Fetching employee by employee_code.",
            extra={
                "employee_code": employee_code,
            },
        )

        try:

            results = self._client.query(

                collection_name=self.collection_name,

                filter=f'employee_code == "{employee_code}"',

                output_fields=[
                    "employee_id",
                    "employee_code",
                ],

            )

            if not results:

                logger.info(
                    "Employee not found.",
                    extra={
                        "employee_code": employee_code,
                    },
                )

                return None

            return results[0]

        except Exception:

            logger.exception(
                "Failed to fetch employee from Milvus."
            )

            raise

    # ==========================================================
    # Collection Info
    # ==========================================================

    def collection_info(
        self,
    ) -> dict:

        logger.info(
            "Fetching Milvus collection information."
        )

        try:

            stats = self._client.get_collection_stats(
                collection_name=self.collection_name,
            )

            logger.info(
                "Collection information retrieved."
            )

            return stats

        except Exception:

            logger.exception(
                "Failed to fetch collection information."
            )

            raise

    # ==========================================================
    # Delete Employee
    # ==========================================================

    def delete(
        self,
        employee_id: str,
    ) -> bool:

        logger.info(
            "Deleting employee vector from Milvus.",
            extra={
                "employee_id": employee_id,
            },
        )

        try:

            self._client.delete(

                collection_name=self.collection_name,

                filter=f'employee_id == "{employee_id}"',

            )

            logger.info(
                "Employee vector deleted.",
                extra={
                    "employee_id": employee_id,
                },
            )

            return True

        except Exception:

            logger.exception(
                "Failed to delete employee vector."
            )

            raise


    # ==========================================================
    # Delete All
    # ==========================================================

    def delete_all(
        self,
    ) -> bool:

        logger.warning(
            "Deleting all vectors from Milvus collection."
        )

        try:

            self._client.delete(

                collection_name=self.collection_name,

                filter="employee_id != ''",

            )

            logger.warning(
                "All vectors deleted successfully."
            )

            return True

        except Exception:

            logger.exception(
                "Failed to delete all vectors."
            )

            raise


    # ==========================================================
    # Index Information
    # ==========================================================

    def index_info(
        self,
    ) -> dict:

        logger.info(
            "Fetching Milvus index information."
        )

        try:

            indexes = self._client.list_indexes(
                collection_name=self.collection_name,
            )

            return {

                "collection_name": self.collection_name,

                "indexes": indexes,

                "metric_type": settings.MILVUS_METRIC_TYPE,

                "index_type": settings.MILVUS_INDEX_TYPE,

                "dimension": settings.MILVUS_DIMENSION,

            }

        except Exception:

            logger.exception(
                "Failed to fetch index information."
            )

            raise

    # ==========================================================
    # Health Check
    # ==========================================================
    
    def health(
        self,
    ) -> dict:

        logger.info(
            "Checking Milvus health."
        )

        try:

            stats = self._client.get_collection_stats(
                collection_name=self.collection_name,
            )

            return {

                "status": "UP",

                "connected": True,

                "collection": self.collection_name,

                "row_count": int(
                    stats.get("row_count", 0)
                ),

                "index_type": settings.MILVUS_INDEX_TYPE,

                "metric_type": settings.MILVUS_METRIC_TYPE,

                "dimension": settings.MILVUS_DIMENSION,

            }

        except Exception as ex:

            logger.exception(
                "Milvus health check failed."
            )

            return {

                "status": "DOWN",

                "connected": False,

                "collection": self.collection_name,

                "error": str(ex),

            }