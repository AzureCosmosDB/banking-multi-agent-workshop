# create cosmosdb Saver (langgraph checkpointer) basis dynamodb implementation in included code include=src/langgraph_dynamodb_saver/dynamodbSaver.py 
# in case of cosmosdb PK becomes partition_key and SK will be id.
# @!

from contextlib import contextmanager
from typing import Any, Iterator, List, Optional, Tuple

from langchain_core.runnables import RunnableConfig

from langgraph.checkpoint.base import WRITES_IDX_MAP, BaseCheckpointSaver, ChannelVersions, Checkpoint, CheckpointMetadata, CheckpointTuple, PendingWrite, get_checkpoint_id
from langgraph.checkpoint.serde.base import SerializerProtocol
from azure.cosmos import CosmosClient, exceptions, PartitionKey
from azure.cosmos.exceptions import CosmosHttpResponseError
from azure.identity import DefaultAzureCredential, CredentialUnavailableError
from langgraph_checkpoint_cosmosdb.cosmosSerializer import CosmosSerializer
import os

COSMOSDB_KEY_SEPARATOR = "$"

def _make_cosmosdb_checkpoint_key(thread_id: str, checkpoint_ns: str, checkpoint_id: str) -> str:
    return COSMOSDB_KEY_SEPARATOR.join([
        "checkpoint", thread_id, checkpoint_ns, checkpoint_id
    ])


def _make_cosmosdb_checkpoint_writes_key(thread_id: str, checkpoint_ns: str, checkpoint_id: str, task_id: str, idx: Optional[int]) -> str:
    if idx is None:
        return COSMOSDB_KEY_SEPARATOR.join([
            "writes", thread_id, checkpoint_ns, checkpoint_id, task_id
        ])

    return COSMOSDB_KEY_SEPARATOR.join([
        "writes", thread_id, checkpoint_ns, checkpoint_id, task_id, str(idx)
    ])


def _parse_cosmosdb_checkpoint_key(cosmosdb_key: str) -> dict:
    namespace, thread_id, checkpoint_ns, checkpoint_id = cosmosdb_key.split(
        COSMOSDB_KEY_SEPARATOR
    )
    if namespace != "checkpoint":
        raise ValueError("Expected checkpoint key to start with 'checkpoint'")

    return {
        "thread_id": thread_id,
        "checkpoint_ns": checkpoint_ns,
        "checkpoint_id": checkpoint_id,
    }


def _parse_cosmosdb_checkpoint_writes_key(cosmosdb_key: str) -> dict:
    namespace, thread_id, checkpoint_ns, checkpoint_id, task_id, idx = cosmosdb_key.split(
        COSMOSDB_KEY_SEPARATOR
    )
    if namespace != "writes":
        raise ValueError("Expected checkpoint key to start with 'writes'")

    return {
        "thread_id": thread_id,
        "checkpoint_ns": checkpoint_ns,
        "checkpoint_id": checkpoint_id,
        "task_id": task_id,
        "idx": idx,
    }


def _filter_keys(keys: List[str], before: Optional[RunnableConfig], limit: Optional[int]) -> list:
    if before:
        keys = [
            k
            for k in keys
            if _parse_cosmosdb_checkpoint_key(k)["checkpoint_id"]
            < before["configurable"]["checkpoint_id"]
        ]

    keys = sorted(
        keys,
        key=lambda k: _parse_cosmosdb_checkpoint_key(k)["checkpoint_id"],
        reverse=True,
    )
    if limit:
        keys = keys[:limit]
    return keys


def _load_writes(serde: CosmosSerializer, task_id_to_data: dict[tuple[str, str], dict]) -> list[PendingWrite]:
    writes = [
        (
            task_id,
            data["channel"],
            serde.loads_typed((data["type"], data["value"])),
        )
        for (task_id, _), data in task_id_to_data.items()
    ]
    return writes


def _parse_cosmosdb_checkpoint_data(serde: CosmosSerializer, key: str, data: dict, pending_writes: Optional[List[PendingWrite]] = None) -> Optional[CheckpointTuple]:
    if not data:
        return None

    parsed_key = _parse_cosmosdb_checkpoint_key(key)
    thread_id = parsed_key["thread_id"]
    checkpoint_ns = parsed_key["checkpoint_ns"]
    checkpoint_id = parsed_key["checkpoint_id"]
    config = {
        "configurable": {
            "thread_id": thread_id,
            "checkpoint_ns": checkpoint_ns,
            "checkpoint_id": checkpoint_id,
        }
    }

    checkpoint = serde.loads_typed((data["type"], data["checkpoint"]))
    metadata = serde.loads(data["metadata"])
    parent_checkpoint_id = data.get("parent_checkpoint_id", "")
    parent_config = (
        {
            "configurable": {
                "thread_id": thread_id,
                "checkpoint_ns": checkpoint_ns,
                "checkpoint_id": parent_checkpoint_id,
            }
        }
        if parent_checkpoint_id
        else None
    )
    return CheckpointTuple(
        config=config,
        checkpoint=checkpoint,
        metadata=metadata,
        parent_config=parent_config,
        pending_writes=pending_writes,
    )


class CosmosDBSaver(BaseCheckpointSaver):
    container: Any

    def __init__(self, database_name: str, container_name: str):
        super().__init__()
        endpoint = os.getenv("COSMOSDB_ENDPOINT")
        if not endpoint:
            raise ValueError("COSMOSDB_ENDPOINT environment variable is not set")
        key = os.getenv("COSMOSDB_KEY")

        try:
            if key:
                # Use key-based authentication
                self.client = CosmosClient(endpoint, key)
                self.database = self.client.create_database_if_not_exists(database_name)
                self.container = self.database.create_container_if_not_exists(
                    id=container_name,
                    partition_key=PartitionKey(path="/partition_key")
                )
            else:
                # Use default credentials (e.g., Azure Managed Identity)
                credential = DefaultAzureCredential()
                self.client = CosmosClient(endpoint, credential=credential)
                self.database = self.client.get_database_client(database_name)
                self.container = self.database.get_container_client(container_name)
        except CredentialUnavailableError as e:
            raise RuntimeError(
                "Failed to obtain default credentials. Ensure the environment is correctly configured for DefaultAzureCredential."
            ) from e
        except Exception as e:
            raise RuntimeError("An unexpected error occurred during CosmosClient initialization.") from e

        self.cosmos_serde = CosmosSerializer(self.serde)
        self.database = self.client.get_database_client(database_name)
        self.container = self.database.create_container_if_not_exists(
            id=container_name,
            partition_key=PartitionKey(path="/partition_key")
        )

    @classmethod
    @contextmanager
    def from_conn_info(cls, *, endpoint: str, key: str, database_name: str, container_name: str) -> Iterator["CosmosDBSaver"]:
        saver = None
        try:
            saver = CosmosDBSaver(endpoint, key, database_name, container_name)
            yield saver
        finally:
            pass

    def put(self, config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata, new_versions: ChannelVersions) -> RunnableConfig:
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"]["checkpoint_ns"]
        checkpoint_id = checkpoint["id"]
        parent_checkpoint_id = config["configurable"].get("checkpoint_id")
        key = _make_cosmosdb_checkpoint_key(thread_id, checkpoint_ns, checkpoint_id)
        partition_key = _make_cosmosdb_checkpoint_key(thread_id, checkpoint_ns, '')
       
        type_, serialized_checkpoint = self.cosmos_serde.dumps_typed(checkpoint)
        serialized_metadata = self.cosmos_serde.dumps(metadata)
        data = {
            "partition_key": partition_key,
            "id": key,
            "checkpoint": serialized_checkpoint,
            "type": type_,
            "metadata": serialized_metadata,
            "parent_checkpoint_id": parent_checkpoint_id
            if parent_checkpoint_id
            else "",
        }
        try:
            self.container.create_item(data)
        except CosmosHttpResponseError as e:
            print(f"Unexpected error ({e.status_code}): {e.message}")
            raise
        
        return {
            "configurable": {
                "thread_id": thread_id,
                "checkpoint_ns": checkpoint_ns,
                "checkpoint_id": checkpoint_id,
            }
        }

    def put_writes(self, config: RunnableConfig, writes: List[Tuple[str, Any]], task_id: str) -> None:
       
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"]["checkpoint_id"]

         # Decide on the operation: upsert or insert
        is_upsert = all(w[0] in WRITES_IDX_MAP for w in writes)

        for idx, (channel, value) in enumerate(writes):
            key = _make_cosmosdb_checkpoint_writes_key(
                thread_id,
                checkpoint_ns,
                checkpoint_id,
                task_id,
                WRITES_IDX_MAP.get(channel, idx),
            )
            partition_key = _make_cosmosdb_checkpoint_writes_key(
                thread_id,
                checkpoint_ns,
                checkpoint_id, 
                '',
                ''
            )
            type_, serialized_value = self.cosmos_serde.dumps_typed(value)

            data = {"partition_key": partition_key,"id": key, "channel": channel, "type": type_, "value": serialized_value}
           
            if is_upsert:
                self.container.upsert_item(data)
            else:   
                try:
                    self.container.create_item(data)
                except CosmosHttpResponseError as e:
                    if e.status_code != 409:  # Conflict: Item already exists
                        print(f"Unexpected error ({e.status_code}): {e.message}")
                        raise

    def get_tuple(self, config: RunnableConfig) -> Optional[CheckpointTuple]:
       
        thread_id = config["configurable"]["thread_id"]
        checkpoint_id = get_checkpoint_id(config)
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")

        partition_key = _make_cosmosdb_checkpoint_key(thread_id, checkpoint_ns, '')
        checkpoint_key = self._get_checkpoint_key(
            self.container, thread_id, checkpoint_ns, checkpoint_id
        )
        if not checkpoint_key:
            return None
        
        checkpoint_id = _parse_cosmosdb_checkpoint_key(checkpoint_key)["checkpoint_id"]

        query = "SELECT * FROM c WHERE c.partition_key=@partition_key AND c.id=@checkpoint_key"
        parameters = [
            {"name": "@partition_key", "value": partition_key},
            {"name": "@checkpoint_key", "value": checkpoint_key}
        ]
        items = list(self.container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
        checkpoint_data = items[0] if items else {}

        pending_writes = self._load_pending_writes(
            thread_id, checkpoint_ns, checkpoint_id
        )
        return _parse_cosmosdb_checkpoint_data(
            self.cosmos_serde, checkpoint_key, checkpoint_data, pending_writes=pending_writes
        )

    def list(self, config: Optional[RunnableConfig], *, filter: Optional[dict[str, Any]] = None, before: Optional[RunnableConfig] = None, limit: Optional[int] = None) -> Iterator[CheckpointTuple]:
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")

        partition_key = _make_cosmosdb_checkpoint_key(thread_id, checkpoint_ns, '')

        query = "SELECT * FROM c WHERE c.partition_key=@partition_key"
        parameters = [
            {"name": "@partition_key", "value": partition_key}
        ]
        items = list(self.container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
        
        for data in items:
            if data and "checkpoint" in data and "metadata" in data:
                key = data["id"]
                checkpoint_id = _parse_cosmosdb_checkpoint_key(key)[
                    "checkpoint_id"
                ]
                pending_writes = self._load_pending_writes(
                    thread_id, checkpoint_ns, checkpoint_id
                )
                yield _parse_cosmosdb_checkpoint_data(
                    self.cosmos_serde, key, data, pending_writes=pending_writes
                )

    def _load_pending_writes(self, thread_id: str, checkpoint_ns: str, checkpoint_id: str) -> List[PendingWrite]:
        
        partition_key = _make_cosmosdb_checkpoint_writes_key(
                thread_id,
                checkpoint_ns,
                checkpoint_id, 
                '',
                ''
            )


        query = "SELECT * FROM c WHERE c.partition_key=@partition_key"
        parameters = [
            {"name": "@partition_key", "value": partition_key}
        ]
        writes = list(self.container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
        
        parsed_keys = [
            _parse_cosmosdb_checkpoint_writes_key(write["id"]) for write in writes
        ]
        pending_writes = _load_writes(
            self.cosmos_serde,
            {
                (parsed_key["task_id"], parsed_key["idx"]): write
                for write, parsed_key in sorted(
                    zip(writes, parsed_keys), key=lambda x: x[1]["idx"]
                )
            },
        )
        return pending_writes

    def _get_checkpoint_key(self, container, thread_id: str, checkpoint_ns: str, checkpoint_id: Optional[str]) -> Optional[str]:
        if checkpoint_id:
            return _make_cosmosdb_checkpoint_key(thread_id, checkpoint_ns, checkpoint_id)
        
        partition_key = _make_cosmosdb_checkpoint_key(thread_id, checkpoint_ns, '')

        query = "SELECT * FROM c WHERE c.partition_key=@partition_key"
        parameters = [
            {"name": "@partition_key", "value": partition_key}
        ]
        all_keys = list(container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
        
        if not all_keys:
            return None
        latest_key = max(
            all_keys,
            key=lambda k: _parse_cosmosdb_checkpoint_key(k["id"])["checkpoint_id"],
        )
        return latest_key["id"]
