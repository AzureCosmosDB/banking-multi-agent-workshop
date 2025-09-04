from typing import Any

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langsmith import traceable

from src.app.services.azure_cosmos_db import vector_search
from src.app.services.azure_open_ai import generate_embedding


@tool
@traceable
def get_offer_information(user_prompt: str, accountType: str, region: str) -> list[dict[str, Any]]:
    """Provide information about a product based on the user prompt.
    Takes as input the user prompt as a string."""
    # Perform a vector search on the Cosmos DB container and return results to the agent
    vectors = generate_embedding(user_prompt)
    search_results = vector_search(vectors, accountType, region)
    return search_results