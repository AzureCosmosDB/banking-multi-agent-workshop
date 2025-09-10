from typing import Any, Optional

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langsmith import traceable

from src.app.services.azure_cosmos_db import vector_search
from src.app.services.azure_open_ai import generate_embedding


@tool
@traceable
def get_offer_information(config: RunnableConfig, user_prompt: str,
                          region: Optional[str] = None,
                          tenantId: Optional[str] = None) -> list[dict[str, Any]]:
    """
    Parameters:
    - config: runtime config provided by the agent/graph (automatically passed by langgraph)
    - user_prompt: text to embed and search
    - accountType, region, tenantId: optional overrides; tenantId will be taken from config when not provided
    """
    # Prefer explicit tenantId, otherwise read from runtime config
    if not tenantId and config:
        tenantId = config["configurable"].get("tenantId")


    # Require tenantId before performing tenant-scoped vector search
    if not tenantId:
        raise ValueError("tenantId is required for tenant-scoped offer search. Provide it or include it in the agent config.")

    vectors = generate_embedding(user_prompt)
    # call the DB function which now expects (vectors, tenantId, region)
    search_results = vector_search(vectors, tenantId, region)
    return search_results