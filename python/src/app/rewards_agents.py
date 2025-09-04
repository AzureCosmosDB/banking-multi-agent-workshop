import logging
import os
import uuid
from langchain.schema import AIMessage
from typing import Literal
from langgraph.graph import StateGraph, START, MessagesState
from langgraph.prebuilt import create_react_agent
from langgraph.types import Command, interrupt
from langgraph_checkpoint_cosmosdb import CosmosDBSaver
from langsmith import traceable
from src.app.services.azure_open_ai import model
from src.app.services.azure_cosmos_db import DATABASE_NAME, checkpoint_container, chat_container, \
    update_chat_container, patch_active_agent
from src.app.tools.sales import get_offer_information
from src.app.tools.transactions import account_balance, get_transaction_history
from src.app.tools.support import service_request, get_branch_location
from src.app.tools.coordinator import create_agent_transfer

local_interactive_mode = False

logging.basicConfig(level=logging.DEBUG)

PROMPT_DIR = os.path.join(os.path.dirname(__file__), 'prompts')


def load_prompt(agent_name):
    """Loads the prompt for a given agent from a file."""
    file_path = os.path.join(PROMPT_DIR, f"{agent_name}.prompty")
    print(f"Loading prompt for {agent_name} from {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read().strip()
    except FileNotFoundError:
        print(f"Prompt file not found for {agent_name}, using default placeholder.")
        return "You are an AI rewards assistant."  # Fallback default prompt


coordinator_agent_tools = [
    create_agent_transfer(agent_name="customer_support_agent"),
    create_agent_transfer(agent_name="redemption_agent"),
    create_agent_transfer(agent_name="transactions_agent"),
]

coordinator_agent = create_react_agent(
    model,
    coordinator_agent_tools,
    state_modifier=load_prompt("coordinator_agent"),
)

customer_support_agent_tools = [
    get_branch_location,
    service_request,
    create_agent_transfer(agent_name="redemption_agent"),
    create_agent_transfer(agent_name="transactions_agent"),
]
customer_support_agent = create_react_agent(
    model,
    customer_support_agent_tools,
    state_modifier=load_prompt("customer_support_agent"),
)

transactions_agent_tools = [
    account_balance,
    get_transaction_history,
    create_agent_transfer(agent_name="customer_support_agent"),
]
transactions_agent = create_react_agent(
    model,
    transactions_agent_tools,
    state_modifier=load_prompt("transactions_agent"),
)

redemption_agent_tools = [
    get_offer_information,
    create_agent_transfer(agent_name="customer_support_agent"),
    create_agent_transfer(agent_name="transactions_agent"),
]

redemption_agent = create_react_agent(
    model,
    redemption_agent_tools,
    state_modifier=load_prompt("redemption_agent"),
)


@traceable(run_type="llm")
def call_coordinator_agent(state: MessagesState, config) -> Command[Literal["coordinator_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")

    logging.debug(f"Calling coordinator agent with Thread ID: {thread_id}")

    # Get the active agent from Cosmos DB with a point lookup
    partition_key = [tenantId, userId, thread_id]
    activeAgent = None
    try:
        activeAgent = chat_container.read_item(item=thread_id, partition_key=partition_key).get('activeAgent',
                                                                                                'unknown')
    except Exception as e:
        logging.debug(f"No active agent found: {e}")

    if activeAgent is None:
        if local_interactive_mode:
            update_chat_container({
                "id": thread_id,
                "tenantId": "cli-test",
                "userId": "cli-test",
                "sessionId": thread_id,
                "name": "cli-test",
                "age": "cli-test",
                "address": "cli-test",
                "activeAgent": "unknown",
                "ChatName": "cli-test",
                "messages": []
            })

    logging.debug(f"Active agent from point lookup: {activeAgent}")

    # If active agent is something other than unknown or coordinator_agent, transfer directly to that agent
    if activeAgent is not None and activeAgent not in ["unknown", "coordinator_agent"]:
        logging.debug(f"Routing straight to last active agent: {activeAgent}")
        return Command(update=state, goto=activeAgent)
    else:
        response = coordinator_agent.invoke(state)
        return Command(update=response, goto="human")


@traceable(run_type="llm")
def call_customer_support_agent(state: MessagesState, config) -> Command[Literal["customer_support_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent(tenantId="cli-test", userId="cli-test", sessionId=thread_id,
                           activeAgent="customer_support_agent")
    response = customer_support_agent.invoke(state)
    return Command(update=response, goto="human")


@traceable(run_type="llm")
def call_redemption_agent(state: MessagesState, config) -> Command[Literal["redemption_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent(tenantId="cli-test", userId="cli-test", sessionId=thread_id,
                           activeAgent="redemption_agent")
    response = redemption_agent.invoke(state, config)  # Invoke redemption agent with state
    return Command(update=response, goto="human")


@traceable(run_type="llm")
def call_transactions_agent(state: MessagesState, config) -> Command[Literal["transactions_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent(tenantId="cli-test", userId="cli-test", sessionId=thread_id,
                           activeAgent="transactions_agent")
    response = transactions_agent.invoke(state)
    return Command(update=response, goto="human")


# The human_node with interrupt function serves as a mechanism to stop
# the graph and collect user input for multi-turn conversations.
@traceable
def human_node(state: MessagesState, config) -> None:
    """A node for collecting user input."""
    interrupt(value="Ready for user input.")
    return None


builder = StateGraph(MessagesState)
builder.add_node("coordinator_agent", call_coordinator_agent)
builder.add_node("customer_support_agent", call_customer_support_agent)
builder.add_node("redemption_agent", call_redemption_agent)
builder.add_node("transactions_agent", call_transactions_agent)
builder.add_node("human", human_node)

builder.add_edge(START, "coordinator_agent")

checkpointer = CosmosDBSaver(database_name=DATABASE_NAME, container_name=checkpoint_container)
graph = builder.compile(checkpointer=checkpointer)


def interactive_chat():
    thread_config = {"configurable": {"thread_id": str(uuid.uuid4()), "userId": "Mark", "tenantId": "Contoso"}}
    global local_interactive_mode
    local_interactive_mode = True
    print("Welcome to the Zava Rewards Assistant.")
    print("Type 'exit' to end the conversation.\n")

    user_input = input("You: ")
    conversation_turn = 1

    while user_input.lower() != "exit":

        input_message = {"messages": [{"role": "user", "content": user_input}]}

        response_found = False  # Track if we received an AI response

        for update in graph.stream(
                input_message,
                config=thread_config,
                stream_mode="updates",
        ):
            for node_id, value in update.items():
                if isinstance(value, dict) and value.get("messages"):
                    last_message = value["messages"][-1]  # Get last message
                    if isinstance(last_message, AIMessage):
                        print(f"{node_id}: {last_message.content}\n")
                        response_found = True

        if not response_found:
            print("DEBUG: No AI response received.")

        # Get user input for the next round
        user_input = input("You: ")
        conversation_turn += 1


if __name__ == "__main__":
    interactive_chat()
