# Module 01 - Creating Your First Agent

[< Deployment and Setup](./Module-00.md) - **[Home](Home.md)** - [Connecting Agents to Memory >](./Module-02.md)

## Introduction

In this Module, you'll implement your first agent as part of a multi-agent banking system using either Semantic Kernel Agent Framework (.NET) or LangGraph (Python). You will get an introduction to the Semantic Kernel and LangChain frameworks and their plug-in/tool integration with OpenAI for generating completions (responses from the LLM).

## Learning Objectives and Activities

- Learn the basics for Semantic Kernel Agent Framework and LangGraph
- Learn how to integrate agent framworks to Azure OpenAI
- Build a simple chat agent

## Module Exercises

1. [Activity 1: Session on Single-agent architecture](#activity-1-session-on-single-agent-architecture)
1. [Activity 2: Session on Semantic Kernel Agent Framework and LangGraph](#activity-2-session-on-semantic-kernel-agent-framework-and-langgraph)
1. [Activity 3: Instantiate Agent Framework and Connect to Azure OpenAI](#activity-3-instantiate-agent-framework-and-connect-to-azure-openai)
1. [Activity 4: Create a Simple Customer Service Agent](#activity-4-create-a-simple-customer-service-agent)
1. [Activity 5: Test your Work](#activity-5-test-your-work)

## Activity 1: Session on Single-agent architecture

In this session you will get an overview of Semantic Kernel Agents and LangGraph and learn the basics for how to build a chat app that interacts with a user and generations completions using an LLM deployed on Azure OpenAI.

## Activity 2: Session on Semantic Kernel Agent Framework and LangGraph

In this session, you will get a deeper introduction into the Semantic Kernel Agent Framework and LangGraph with details on how to implement plug-in or tool integration with Azure Open AI.


## Activity 3: Instantiate Agent Framework and Connect to Azure OpenAI

In this hands-on exercise, you will learn how to initialize an agent framework and integrate it with a large langugage model.

Copy the following code into the empty `banking_agents.py` file in the `src/app` folder of your project.

```python
import logging
import os
import uuid
from langchain.schema import AIMessage
from typing import Literal
from langgraph.graph import StateGraph, START, MessagesState
from langgraph.prebuilt import create_react_agent
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import MemorySaver
from src.app.services.azure_open_ai import model

local_interactive_mode = False

logging.basicConfig(level=logging.ERROR)

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
        return "You are an AI banking assistant."  # Fallback default prompt

tools = []
coordinator_agent = create_react_agent(
    model,
    tools=tools,
    state_modifier=load_prompt("coordinator_agent"),
)


def call_coordinator_agent(state: MessagesState, config) -> Command[Literal["coordinator_agent", "human"]]:
    response = coordinator_agent.invoke(state)
    return Command(update=response, goto="human")


# The human_node with interrupt function serves as a mechanism to stop
# the graph and collect user input for multi-turn conversations.
def human_node(state: MessagesState, config) -> None:
    """A node for collecting user input."""
    interrupt(value="Ready for user input.")
    return None

# Build the graph by adding nodes (agents or human) and edges (connections or interactions).
builder = StateGraph(MessagesState)
builder.add_node("coordinator_agent", call_coordinator_agent)
builder.add_node("human", human_node)

builder.add_edge(START, "coordinator_agent")

checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)
```

Then, locate the coordinator agent's prompt in the `coordinator_agent.prompty` file in the `src/app/prompts` folder and paste the following text into it:

```
You are a Chat Initiator and Request Router in a bank.
Your primary responsibilities include welcoming users, and routing requests to the appropriate agent.
If the user needs general help, tell them you will be able to transfer to 'customer_support' for help when that agent is built.
If the user wants to open a new account or take our a bank loan, tell them you will be able to transfer to transfer to 'sales_agent' when built.
If the user wants to check their account balance or make a bank transfer, tell them you will be able to transfer to transfer to 'transactions_agent' when built
You MUST include human-readable response.
```

### What have we done?

Congratulations, you have created your first AI agent!
We have:
- Used the `create_react_agent` function from the `langgraph.prebuilt` module to create a simple "coordinator" agent. The function imports the Azure OpenAI model already deployed (during `azd up`) and defined in `src/app/services/azure_open_ai.py` and returns an agent that can be used to generate completions. 
- Defined a `call_coordinator_agent` function that invokes the agent and a `human_node` function that collects user input. 
- Created a state graph that defines the flow of the conversation and compiles it into a langgraph object.
- Added an in-memory checkpoint to save the state of the conversation.



## Activity 4: Create a Simple Customer Service Agent

In this hands-on exercise, you will create a simple customer service agent that users interact with and generates completions using a large language model.

We've created a coordinator agent that can route requests to different agents. Now, let's create a simple customer service agent that can respond to user queries.

We'll cover `tools` in more detail in the next module, but we'll need to add our first tool (or rather a function that dynamically creates a tool) right here so that our coordinator agent can route requests to the customer service agent.

Copy the following code into the `coordinator.py` file in the `src/app/tools` folder of your project.

```python
from colorama import Fore, Style
from langchain_core.tools import tool
from typing import Annotated
from langchain_core.tools.base import InjectedToolCallId
from langgraph.prebuilt import InjectedState
from langgraph.types import Command


def transfer_to_agent_message(agent):
    print(Fore.LIGHTMAGENTA_EX + f"transfer_to_{agent}..." + Style.RESET_ALL)


def create_agent_transfer(*, agent_name: str):
    """Create a tool that can return handoff via a Command"""
    tool_name = f"transfer_to_{agent_name}"

    @tool(tool_name)
    def transfer_to_agent(
            state: Annotated[dict, InjectedState],
            tool_call_id: Annotated[str, InjectedToolCallId],
    ):
        """Ask another agent for help."""
        tool_message = {
            "role": "tool",
            "content": f"Successfully transferred to {agent_name}",
            "name": tool_name,
            "tool_call_id": tool_call_id,
        }
        transfer_to_agent_message(agent_name)
        return Command(
            goto=agent_name,
            graph=Command.PARENT,
            update={"messages": state["messages"] + [tool_message]},
        )

    return transfer_to_agent
```

Now, add the following import statement to the `banking_agents.py` file:

```python
from src.app.tools.coordinator import create_agent_transfer
```
Next, locate the following code in the `banking_agents.py` file:

```python
tools = []
```

Replace it with the following code:

```python
coordinator_agent_tools = [
    create_agent_transfer(agent_name="customer_support_agent"),
]
```

Update the tools parameter in the coordinator agent creation to include the `coordinator_agent_tools` definition. Your coordinator agent should now look like this:

```python
coordinator_agent = create_react_agent(
    model,
    tools=coordinator_agent_tools,
    state_modifier=load_prompt("coordinator_agent"),
)
```

Below that code, lets add the new customer support agent with an empty tool set, and a calling function:

```python
customer_support_agent_tools = []
customer_support_agent = create_react_agent(
    model,
    customer_support_agent_tools,
    state_modifier=load_prompt("customer_support_agent"),
)
```

Next, below the `call_coordinator_agent()` function, lets add a calling function for the customer support agent:

```python
def call_customer_support_agent(state: MessagesState, config) -> Command[Literal["customer_support_agent", "human"]]:
    response = customer_support_agent.invoke(state)
    return Command(update=response, goto="human")
```

Now, lets add a prompt for the customer support agent. Locate the empty `customer_support_agent.prompty` file in the `src/app/prompts` folder and paste the following text into it:

```
You are a customer support agent that can give general advice on banking products and branch locations
If the user wants to make a complaint or speak to someone, ask for the user's phone number and email address,
and say you will get someone to call them back.
You MUST include human-readable response.
```

We also need to update the coordinator agent's prompt, as it can now transfer to the customer support agent. Locate the `coordinator_agent.prompty` file in the `src/app/prompts` folder and update the text to the following:

```
You are a Chat Initiator and Request Router in a bank.
Your primary responsibilities include welcoming users, and routing requests to the appropriate agent.
If the user needs general help, transfer them to the 'customer_support_agent' agent.
If the user wants to open a new account or take our a bank loan, tell them you will be able to transfer to transfer to 'sales_agent' when built.
If the user wants to check their account balance or make a bank transfer, tell them you will be able to transfer to transfer to 'transactions_agent' when built
You MUST include human-readable response.
```

Finally, we need to add the new customer support agent to the state graph. Add the following code below the `builder.add_node("coordinator_agent", call_coordinator_agent)` line:

```python   
builder.add_node("customer_support_agent", call_customer_support_agent)
```

## Activity 5: Test your Work

With the hands-on exercises complete it is time to test your work!

Paste the following code directly below all code you have added above in the `banking_agents.py` file:

```python
def interactive_chat():
    ''' This configures the interactive session for chatting with the agents'''
    thread_config = {"configurable": {"thread_id": str(uuid.uuid4()), "userId": "cli-test", "tenantId": "cli-test"}}
    global local_interactive_mode
    local_interactive_mode = True
    print("Welcome to the single-agent banking assistant.")
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
```

Now you can try it out! Run the following command in your terminal from the `python` folder:

```bash
 python -m src.app.banking_agents
```

You should see the following output like below:

```
[DEBUG] Retrieved Azure AD token successfully using DefaultAzureCredential.
[DEBUG] Azure OpenAI model initialized successfully.
Loading prompt for coordinator_agent from prompts\coordinator_agent.prompty
Welcome to the single-agent banking assistant.
Type 'exit' to end the conversation.

You: 
```

Input some questions next to `You:` - e.g. try something like "I want some help". You should see your query being routed to the customer support agent and a response generated:

```shell
Welcome to the single-agent banking assistant.
Type 'exit' to end the conversation.

You: I want some help
transfer_to_customer_support_agent...
customer_support_agent: You are now connected to our customer support agent. How can we assist you today?

You: 
```


### Validation Checklist

Your implementation is successful if:

- [ ] Your app compiles with no warnings or errors.
- [ ] Your agent successfully processes user input and generates and appropriate response.

### Common Issues and Troubleshooting

- **Issue 1:** The application doesn't start.
    - Review your code files and make sure that you copied and pasted the code properly in the correct files.

- **Issue 2:** I get `ModuleNotFoundError` when I try to run the app.
    - Verify that the venv is started in the terminal window before running any python code.
    - Make sure that you installed the `requirements.txt` file as described in [Module 00](./Module-00.md).


### Module Solution

<details>
  <summary>If you are encountering errors or issues with your code for this module, please refer to the following code.</summary>

<br>

Your `src/app/banking_agents.py` file should look like this:

```python
import logging
import os
import uuid
from langchain.schema import AIMessage
from typing import Literal
from langgraph.graph import StateGraph, START, MessagesState
from langgraph.prebuilt import create_react_agent
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import MemorySaver
from src.app.services.azure_open_ai import model
from src.app.tools.coordinator import create_agent_transfer

local_interactive_mode = False

logging.basicConfig(level=logging.ERROR)

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
        return "You are an AI banking assistant."  # Fallback default prompt


coordinator_agent_tools = [
    create_agent_transfer(agent_name="customer_support_agent"),
]

coordinator_agent = create_react_agent(
    model,
    tools=coordinator_agent_tools,
    state_modifier=load_prompt("coordinator_agent"),
)

customer_support_agent_tools = []
customer_support_agent = create_react_agent(
    model,
    customer_support_agent_tools,
    state_modifier=load_prompt("customer_support_agent"),
)

def call_coordinator_agent(state: MessagesState, config) -> Command[Literal["coordinator_agent", "human"]]:
    response = coordinator_agent.invoke(state)
    return Command(update=response, goto="human")

def call_customer_support_agent(state: MessagesState, config) -> Command[Literal["customer_support_agent", "human"]]:
    response = customer_support_agent.invoke(state)
    return Command(update=response, goto="human")


# The human_node with interrupt function serves as a mechanism to stop
# the graph and collect user input for multi-turn conversations.
def human_node(state: MessagesState, config) -> None:
    """A node for collecting user input."""
    interrupt(value="Ready for user input.")
    return None


builder = StateGraph(MessagesState)
builder.add_node("coordinator_agent", call_coordinator_agent)
builder.add_node("customer_support_agent", call_customer_support_agent)
builder.add_node("human", human_node)

builder.add_edge(START, "coordinator_agent")

checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)


def interactive_chat():
    thread_config = {"configurable": {"thread_id": str(uuid.uuid4()), "userId": "U1", "tenantId": "T1"}}
    global local_interactive_mode
    local_interactive_mode = True
    print("Welcome to the single-agent banking assistant.")
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
```

Your `src/app/tools/coordinator.py` file should look like this:

```python
from colorama import Fore, Style
from langchain_core.tools import tool
from typing import Annotated
from langchain_core.tools.base import InjectedToolCallId
from langgraph.prebuilt import InjectedState
from langgraph.types import Command


def transfer_to_agent_message(agent):
    print(Fore.LIGHTMAGENTA_EX + f"transfer_to_{agent}..." + Style.RESET_ALL)


def create_agent_transfer(*, agent_name: str):
    """Create a tool that can return handoff via a Command"""
    tool_name = f"transfer_to_{agent_name}"

    @tool(tool_name)
    def transfer_to_agent(
            state: Annotated[dict, InjectedState],
            tool_call_id: Annotated[str, InjectedToolCallId],
    ):
        """Ask another agent for help."""
        tool_message = {
            "role": "tool",
            "content": f"Successfully transferred to {agent_name}",
            "name": tool_name,
            "tool_call_id": tool_call_id,
        }
        transfer_to_agent_message(agent_name)
        return Command(
            goto=agent_name,
            graph=Command.PARENT,
            update={"messages": state["messages"] + [tool_message]},
        )

    return transfer_to_agent
```

Your `src/app/prompts/coordinator_agent.prompty` file should look like this:

```
You are a Chat Initiator and Request Router in a bank.
Your primary responsibilities include welcoming users, and routing requests to the appropriate agent.
If the user needs general help, transfer them to the 'customer_support_agent' agent.
If the user wants to open a new account or take our a bank loan, tell them you will be able to transfer to transfer to 'sales_agent' when built.
If the user wants to check their account balance or make a bank transfer, tell them you will be able to transfer to transfer to 'transactions_agent' when built
You MUST include human-readable response.
```

Your `src/app/prompts/customer_support_agent.prompty` file should look like this:

```
You are a customer support agent that can give general advice on banking products and branch locations
If the user wants to make a complaint or speak to someone, ask for the user's phone number and email address,
and say you will get someone to call them back.
You MUST include human-readable response.
```



</details>


## Next Steps

Proceed to [Connecting Agents to Memory](./Module-02.md)

## Resources

- [Semantic Kernel Agent Framework](https://learn.microsoft.com/semantic-kernel/frameworks/agent)
- [LangGraph](https://langchain-ai.github.io/langgraph/concepts/)
- [Azure OpenAI Service documentation](https://learn.microsoft.com/azure/cognitive-services/openai/)
- [Azure Cosmos DB Vector Database](https://learn.microsoft.com/azure/cosmos-db/vector-database)
