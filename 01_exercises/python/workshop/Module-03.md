# Module 03 - Agent Specialization

## Introduction

In this Module you'll learn how to implement agent specialization by creating Semantic Kernel Functions or LangGraph Tools that provide the functionality necessary to power individual agents that comprise a multi-agent system.

## Learning Objectives and Activities

- Learn the basics for LangGraph Tools
- Learn how to implement semantic and natural language features using vector indexing and search integration from Azure Cosmos DB.
- Learn how to define tasks and communication protocols for seamless collaboration.

## Module Exercises

1. [Activity 1: Creating Multiple Agents](#activity-1-creating-multiple-agents)
1. [Activity 2: Adding Agent Tools](#activity-2-adding-agent-tools)
1. [Activity 3: Semantic Search](#activity-3-semantic-search)
1. [Activity 4: Test your Work](#activity-4-test-your-work)

## Activity 1: Creating Multiple Agents

In this hands-on exercise, you will learn how to create multiple agents that specialize in different tasks. You will learn how to define the roles and responsibilities of each agent and how to define the communication protocols between them.

In the earlier modules, you created a single customer service agent that specialized in a single set of tasks, and a coordinator agent that was responsible for transferring responsibility to that agent. In this module, you will broaden the scope of that agent, and create more agents that handle different tasks. You will define the roles and responsibilities of each agent and define the communication protocols between them.

First, let's add a new transactions agent and sales agent.

### Define the New Agents

1. To begin, open the **banking_agents.py** file.
1. Locate the lines that define the **customer_support_agent_tools** and the **customer_support_agent**
1. Paste the following code below.

```python
transactions_agent_tools = []
transactions_agent = create_react_agent(
    model,
    transactions_agent_tools,
    state_modifier=load_prompt("transactions_agent"),
)

sales_agent_tools = []
sales_agent = create_react_agent(
    model,
    sales_agent_tools,
    state_modifier=load_prompt("sales_agent"),
)
```

### Update the Coordinator Agent

Lets also update the coordinator agent tool definition so that it can transfer to both the customer support agent and the transactions agent.

1. Locate the **coordinator_agent_tools** definition.

```python
coordinator_agent_tools = [
    create_agent_transfer(agent_name="customer_support_agent"),
]   
```

1. Replace this code with the following.

```python
coordinator_agent_tools = [
    create_agent_transfer(agent_name="customer_support_agent"),
    create_agent_transfer(agent_name="transactions_agent"),
    create_agent_transfer(agent_name="sales_agent"),
]
```

### Define the New Functions

We also need to add calling functions for the two new agents.

1. Locate the function, **def call_customer_support_agent**.
1. Below this function, paste two new functions.

```python
def call_sales_agent(state: MessagesState, config) -> Command[Literal["sales_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent(
            tenantId="Contoso", 
            userId="Mark", 
            sessionId=thread_id,
            activeAgent="sales_agent")
    response = sales_agent.invoke(state, config)  # Invoke sales agent with state
    return Command(update=response, goto="human")


def call_transactions_agent(state: MessagesState, config) -> Command[Literal["transactions_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent(
            tenantId="Contoso", 
            userId="Mark", 
            sessionId=thread_id,
            activeAgent="transactions_agent")
    response = transactions_agent.invoke(state)
    return Command(update=response, goto="human")
```

### Update Workflow

Finally, we need to add these agents as nodes in the graph with their calling functions.

1. Locate the **StateGraph** builder further below in the file.
1. Add these two lines to the `StateGraph` builder.

```python
builder.add_node("transactions_agent", call_transactions_agent)
builder.add_node("sales_agent", call_sales_agent)
```

We've now added two new agents, and adjusted the coordinator agent so it can transfer to all three agents.

## Activity 2: Adding Agent Tools

In this activity, you will learn how to add tools to your agents. You will also learn how to define the API contracts for these plugins and how to test and debug them.

### What are tools?

By "tools" we mean functions or discreet actions that each agent can perform. A tool will typically have input parameters (though it can also have none) and the agent will be responsible for extracting the input values from the conversational context and calling the tool when appropriate.

We already added a type of tool to the coordinator agent in the previous module, but that tool only allowed agents to hand off to each-other. In this module, we will add more functional tools to each agent that will allow them to perform other actions, including transactions against the database.

### Defining New Tools

We are going to define a series of tools that allow the customer agents to perform specific actions for users including creating new accounts, balance inquiries, and varios other banking transactions.

1. In VS Code, open the file **src/app/tools/sales.py**.
1. In the empty file, add the following code.

```python
from typing import Any

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from src.app.services.azure_cosmos_db import create_account_record, \
    fetch_latest_account_number

@tool
def create_account(account_holder: str, balance: float, config: RunnableConfig) -> str:
    """
    Create a new bank account for a user.

    This function retrieves the latest account number, increments it, and creates a new account record
    in Cosmos DB associated with a specific user and tenant.
    """
    print(f"Creating account for {account_holder}")
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    max_attempts = 10
    account_number = fetch_latest_account_number()

    print(f"Latest account number: {account_number}")
    if account_number is None:
        account_number = 1
    else:
        account_number += 1

    for attempt in range(max_attempts):
        account_data = {
            "id": f"{account_number}",
            "accountId": f"A{account_number}",
            "tenantId": tenantId,
            "userId": userId,
            "name": "Account",
            "type": "BankAccount",
            "accountName": account_holder,
            "balance": balance,
            "startDate": "01-01-2025",
            "accountDescription": "Some description here",
            "accountProperties": {
                "key1": "Value1",
                "key2": "Value2"
            }
        }
        try:
            print(f"Creating account record: {account_data}")
            create_account_record(account_data)
            return f"Successfully created account {account_number} for {account_holder} with a balance of ${balance}"
        except Exception as e:
            account_number += 1
            if attempt == max_attempts - 1:
                return f"Failed to create account after {max_attempts} attempts: {e}"

    return f"Failed to create account after {max_attempts} attempts"

@tool
def calculate_monthly_payment(loan_amount: float, years: int) -> float:
    """Calculate the monthly payment for a loan."""
    interest_rate = 0.05  # Hardcoded annual interest rate (5%)
    monthly_rate = interest_rate / 12  # Convert annual rate to monthly
    total_payments = years * 12  # Total number of monthly payments

    if monthly_rate == 0:
        return loan_amount / total_payments  # If interest rate is 0, simple division

    monthly_payment = (loan_amount * monthly_rate * (1 + monthly_rate) ** total_payments) / \
                      ((1 + monthly_rate) ** total_payments - 1)

    return round(monthly_payment, 2)  # Rounded to 2 decimal places
```

1. Next, open the file **src/app/tools/transactions.py**.
1. In the empty file, add the following code.

```python
import logging
from datetime import datetime
from typing import List, Dict
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from src.app.services.azure_cosmos_db import fetch_latest_transaction_number, fetch_account_by_number, \
    create_transaction_record, \
    patch_account_record, fetch_transactions_by_date_range


@tool
def bank_transfer(config: RunnableConfig, toAccount: str, fromAccount: str, amount: float) -> str:
    """Wrapper function to handle the transfer of funds between two accounts."""
    # Debit the amount from the fromAccount
    debit_result = bank_transaction(config, fromAccount, amount, credit_account=0, debit_account=amount)
    if "Failed" in debit_result:
        return f"Failed to debit amount from {fromAccount}: {debit_result}"

    # Credit the amount to the toAccount
    credit_result = bank_transaction(config, toAccount, amount, credit_account=amount, debit_account=0)
    if "Failed" in credit_result:
        return f"Failed to credit amount to {toAccount}: {credit_result}"

    return f"Successfully transferred ${amount} from account {fromAccount} to account {toAccount}"


def bank_transaction(config: RunnableConfig, account_number: str, amount: float, credit_account: float,
                     debit_account: float) -> str:
    """Transfer to bank agent"""
    global new_balance
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")

    # Fetch the account record
    account = fetch_account_by_number(account_number, tenantId, userId)
    if not account:
        print(f"Account {account_number} not found for tenant {tenantId} and user {userId}")
        return f"Account {account_number} not found for tenant {tenantId} and user {userId}"

    max_attempts = 5
    for attempt in range(max_attempts):
        try:
            # Fetch the latest transaction number for the account
            latest_transaction_number = fetch_latest_transaction_number(account_number)
            transaction_id = f"{account_number}-{latest_transaction_number + 1}"

            # Calculate the new account balance
            new_balance = account["balance"] + credit_account - debit_account

            # Create the transaction record
            transaction_data = {
                "id": transaction_id,
                "tenantId": tenantId,
                "accountId": account["accountId"],
                "type": "BankTransaction",
                "debitAmount": debit_account,
                "creditAmount": credit_account,
                "accountBalance": new_balance,
                "details": "Bank Transfer",
                "transactionDateTime": datetime.utcnow().isoformat() + "Z"
            }

            create_transaction_record(transaction_data)
            print(f"Successfully transferred ${amount} to account number {account_number}")
            break  # Stop retrying after a successful attempt
        except Exception as e:
            logging.error(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_attempts - 1:
                return f"Failed to create transaction record after {max_attempts} attempts: {e}"

    # Update the account balance
    patch_account_record(tenantId, account["accountId"], new_balance)
    return f"Successfully transferred ${amount} to account number {account_number}"


@tool
def get_transaction_history(accountId: str, startDate: datetime, endDate: datetime) -> List[Dict]:
    """
    Retrieve the transaction history for a specific account between two dates.

    :param accountId: The ID of the account to retrieve transactions for.
    :param startDate: The start date for the transaction history.
    :param endDate: The end date for the transaction history.
    :return: A list of transactions within the specified date range.
    """
    try:
        transactions = fetch_transactions_by_date_range(accountId, startDate, endDate)
        return transactions
    except Exception as e:
        logging.error(f"Error fetching transaction history for account {accountId}: {e}")
        return []


@tool
def bank_balance(config: RunnableConfig, account_number: str) -> str:
    """Retrieve the balance for a specific bank account."""
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")

    # Fetch the account record
    account = fetch_account_by_number(account_number, tenantId, userId)
    if not account:
        return f"Account {account_number} not found for tenant {tenantId} and user {userId}"

    balance = account.get("balance", 0)
    return f"The balance for account number {account_number} is ${balance}"
```

1. Finally, open the file **src/app/tools/support.py**.
1. In the empty file, add the following code.

```python
import logging
import uuid
from datetime import datetime
from typing import Dict, List

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from src.app.services.azure_cosmos_db import create_service_request_record


@tool
def service_request(config: RunnableConfig,  recipientPhone: str, recipientEmail: str,
                    requestSummary: str) -> str:
    """
    Create a service request entry in the AccountsData container.

    :param config: Configuration dictionary.
    :param tenantId: The ID of the tenant.
    :param userId: The ID of the user.
    :param recipientPhone: The phone number of the recipient.
    :param recipientEmail: The email address of the recipient.
    :param requestSummary: A summary of the service request.
    :return: A message indicating the result of the operation.
    """
    try:
        tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
        userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
        request_id = str(uuid.uuid4())
        requested_on = datetime.utcnow().isoformat() + "Z"
        request_annotations = [
            requestSummary,
            f"[{datetime.utcnow().strftime('%d-%m-%Y %H:%M:%S')}] : Urgent"
        ]

        service_request_data = {
            "id": request_id,
            "tenantId": tenantId,
            "userId": userId,
            "type": "ServiceRequest",
            "requestedOn": requested_on,
            "scheduledDateTime": "0001-01-01T00:00:00",
            "accountId": "Acc001",
            "srType": 0,
            "recipientEmail": recipientEmail,
            "recipientPhone": recipientPhone,
            "debitAmount": 0,
            "isComplete": False,
            "requestAnnotations": request_annotations,
            "fulfilmentDetails": None
        }

        create_service_request_record(service_request_data)
        return f"Service request created successfully with ID: {request_id}"
    except Exception as e:
        logging.error(f"Error creating service request: {e}")
        return f"Failed to create service request: {e}"


@tool
def get_branch_location(state: str) -> Dict[str, List[str]]:
    """
    Get location of bank branches for a given state in the USA.

    :param state: The name of the state.
    :return: A dictionary with county names as keys and lists of branch names as values.
    """
    branches = {
        "Alabama": {"Jefferson County": ["Central Bank - Birmingham", "Trust Bank - Hoover"],
                    "Mobile County": ["Central Bank - Mobile", "Trust Bank - Prichard"]},
        "Alaska": {"Anchorage": ["Central Bank - Anchorage", "Trust Bank - Eagle River"],
                   "Fairbanks North Star Borough": ["Central Bank - Fairbanks", "Trust Bank - North Pole"]},
        "Arizona": {"Maricopa County": ["Central Bank - Phoenix", "Trust Bank - Scottsdale"],
                    "Pima County": ["Central Bank - Tucson", "Trust Bank - Oro Valley"]},
        "Arkansas": {"Pulaski County": ["Central Bank - Little Rock", "Trust Bank - North Little Rock"],
                     "Benton County": ["Central Bank - Bentonville", "Trust Bank - Rogers"]},
        "California": {"Los Angeles County": ["Central Bank - Los Angeles", "Trust Bank - Long Beach"],
                       "San Diego County": ["Central Bank - San Diego", "Trust Bank - Chula Vista"]},
        "Colorado": {"Denver County": ["Central Bank - Denver", "Trust Bank - Aurora"],
                     "El Paso County": ["Central Bank - Colorado Springs", "Trust Bank - Fountain"]},
        "Connecticut": {"Fairfield County": ["Central Bank - Bridgeport", "Trust Bank - Stamford"],
                        "Hartford County": ["Central Bank - Hartford", "Trust Bank - New Britain"]},
        "Delaware": {"New Castle County": ["Central Bank - Wilmington", "Trust Bank - Newark"],
                     "Sussex County": ["Central Bank - Seaford", "Trust Bank - Lewes"]},
        "Florida": {"Miami-Dade County": ["Central Bank - Miami", "Trust Bank - Hialeah"],
                    "Orange County": ["Central Bank - Orlando", "Trust Bank - Winter Park"]},
        "Georgia": {"Fulton County": ["Central Bank - Atlanta", "Trust Bank - Sandy Springs"],
                    "Cobb County": ["Central Bank - Marietta", "Trust Bank - Smyrna"]},
        "Hawaii": {"Honolulu County": ["Central Bank - Honolulu", "Trust Bank - Pearl City"],
                   "Maui County": ["Central Bank - Kahului", "Trust Bank - Lahaina"]},
        "Idaho": {"Ada County": ["Central Bank - Boise", "Trust Bank - Meridian"],
                  "Canyon County": ["Central Bank - Nampa", "Trust Bank - Caldwell"]},
        "Illinois": {"Cook County": ["Central Bank - Chicago", "Trust Bank - Evanston"],
                     "DuPage County": ["Central Bank - Naperville", "Trust Bank - Wheaton"]},
        "Indiana": {"Marion County": ["Central Bank - Indianapolis", "Trust Bank - Lawrence"],
                    "Lake County": ["Central Bank - Gary", "Trust Bank - Hammond"]},
        "Iowa": {"Polk County": ["Central Bank - Des Moines", "Trust Bank - West Des Moines"],
                 "Linn County": ["Central Bank - Cedar Rapids", "Trust Bank - Marion"]},
        "Kansas": {"Sedgwick County": ["Central Bank - Wichita", "Trust Bank - Derby"],
                   "Johnson County": ["Central Bank - Overland Park", "Trust Bank - Olathe"]},
        "Kentucky": {"Jefferson County": ["Central Bank - Louisville", "Trust Bank - Jeffersontown"],
                     "Fayette County": ["Central Bank - Lexington", "Trust Bank - Nicholasville"]},
        "Louisiana": {"Orleans Parish": ["Central Bank - New Orleans", "Trust Bank - Metairie"],
                      "East Baton Rouge Parish": ["Central Bank - Baton Rouge", "Trust Bank - Zachary"]},
        "Maine": {"Cumberland County": ["Central Bank - Portland", "Trust Bank - South Portland"],
                  "Penobscot County": ["Central Bank - Bangor", "Trust Bank - Brewer"]},
        "Maryland": {"Baltimore County": ["Central Bank - Baltimore", "Trust Bank - Towson"],
                     "Montgomery County": ["Central Bank - Rockville", "Trust Bank - Bethesda"]},
        "Massachusetts": {"Suffolk County": ["Central Bank - Boston", "Trust Bank - Revere"],
                          "Worcester County": ["Central Bank - Worcester", "Trust Bank - Leominster"]},
        "Michigan": {"Wayne County": ["Central Bank - Detroit", "Trust Bank - Dearborn"],
                     "Oakland County": ["Central Bank - Troy", "Trust Bank - Farmington Hills"]},
        "Minnesota": {"Hennepin County": ["Central Bank - Minneapolis", "Trust Bank - Bloomington"],
                      "Ramsey County": ["Central Bank - Saint Paul", "Trust Bank - Maplewood"]},
        "Mississippi": {"Hinds County": ["Central Bank - Jackson", "Trust Bank - Clinton"],
                        "Harrison County": ["Central Bank - Gulfport", "Trust Bank - Biloxi"]},
        "Missouri": {"Jackson County": ["Central Bank - Kansas City", "Trust Bank - Independence"],
                     "St. Louis County": ["Central Bank - St. Louis", "Trust Bank - Florissant"]},
        "Montana": {"Yellowstone County": ["Central Bank - Billings", "Trust Bank - Laurel"],
                    "Missoula County": ["Central Bank - Missoula", "Trust Bank - Lolo"]},
        "Nebraska": {"Douglas County": ["Central Bank - Omaha", "Trust Bank - Bellevue"],
                     "Lancaster County": ["Central Bank - Lincoln", "Trust Bank - Waverly"]},
        "Nevada": {"Clark County": ["Central Bank - Las Vegas", "Trust Bank - Henderson"],
                   "Washoe County": ["Central Bank - Reno", "Trust Bank - Sparks"]},
        "New Hampshire": {"Hillsborough County": ["Central Bank - Manchester", "Trust Bank - Nashua"],
                          "Rockingham County": ["Central Bank - Portsmouth", "Trust Bank - Derry"]},
        "New Jersey": {"Essex County": ["Central Bank - Newark", "Trust Bank - East Orange"],
                       "Bergen County": ["Central Bank - Hackensack", "Trust Bank - Teaneck"]},
        "New Mexico": {"Bernalillo County": ["Central Bank - Albuquerque", "Trust Bank - Rio Rancho"],
                       "Santa Fe County": ["Central Bank - Santa Fe", "Trust Bank - Eldorado"]},
        "New York": {"New York County": ["Central Bank - Manhattan", "Trust Bank - Harlem"],
                     "Kings County": ["Central Bank - Brooklyn", "Trust Bank - Williamsburg"]},
        "North Carolina": {"Mecklenburg County": ["Central Bank - Charlotte", "Trust Bank - Matthews"],
                           "Wake County": ["Central Bank - Raleigh", "Trust Bank - Cary"]},
        "North Dakota": {"Cass County": ["Central Bank - Fargo", "Trust Bank - West Fargo"],
                         "Burleigh County": ["Central Bank - Bismarck", "Trust Bank - Lincoln"]},
        "Ohio": {"Cuyahoga County": ["Central Bank - Cleveland", "Trust Bank - Parma"],
                 "Franklin County": ["Central Bank - Columbus", "Trust Bank - Dublin"]},
        "Oklahoma": {"Oklahoma County": ["Central Bank - Oklahoma City", "Trust Bank - Edmond"],
                     "Tulsa County": ["Central Bank - Tulsa", "Trust Bank - Broken Arrow"]},
        "Oregon": {"Multnomah County": ["Central Bank - Portland", "Trust Bank - Gresham"],
                   "Lane County": ["Central Bank - Eugene", "Trust Bank - Springfield"]},
        "Pennsylvania": {"Philadelphia County": ["Central Bank - Philadelphia", "Trust Bank - Germantown"],
                         "Allegheny County": ["Central Bank - Pittsburgh", "Trust Bank - Bethel Park"]},
        "Rhode Island": {"Providence County": ["Central Bank - Providence", "Trust Bank - Cranston"],
                         "Kent County": ["Central Bank - Warwick", "Trust Bank - Coventry"]},
        "South Carolina": {"Charleston County": ["Central Bank - Charleston", "Trust Bank - Mount Pleasant"],
                           "Richland County": ["Central Bank - Columbia", "Trust Bank - Forest Acres"]},
        "South Dakota": {"Minnehaha County": ["Central Bank - Sioux Falls", "Trust Bank - Brandon"],
                         "Pennington County": ["Central Bank - Rapid City", "Trust Bank - Box Elder"]},
        "Tennessee": {"Davidson County": ["Central Bank - Nashville", "Trust Bank - Antioch"],
                      "Shelby County": ["Central Bank - Memphis", "Trust Bank - Bartlett"]},
        "Texas": {"Harris County": ["Central Bank - Houston", "Trust Bank - Pasadena"],
                  "Dallas County": ["Central Bank - Dallas", "Trust Bank - Garland"]},
        "Utah": {"Salt Lake County": ["Central Bank - Salt Lake City", "Trust Bank - West Valley City"],
                 "Utah County": ["Central Bank - Provo", "Trust Bank - Orem"]},
        "Vermont": {"Chittenden County": ["Central Bank - Burlington", "Trust Bank - South Burlington"],
                    "Rutland County": ["Central Bank - Rutland", "Trust Bank - Killington"]},
        "Virginia": {"Fairfax County": ["Central Bank - Fairfax", "Trust Bank - Reston"],
                     "Virginia Beach": ["Central Bank - Virginia Beach", "Trust Bank - Chesapeake"]},
        "Washington": {"King County": ["Central Bank - Seattle", "Trust Bank - Bellevue"],
                       "Pierce County": ["Central Bank - Tacoma", "Trust Bank - Lakewood"]},
        "West Virginia": {"Kanawha County": ["Central Bank - Charleston", "Trust Bank - South Charleston"],
                          "Berkeley County": ["Central Bank - Martinsburg", "Trust Bank - Hedgesville"]},
        "Wisconsin": {"Milwaukee County": ["Central Bank - Milwaukee", "Trust Bank - Wauwatosa"],
                      "Dane County": ["Central Bank - Madison", "Trust Bank - Fitchburg"]},
        "Wyoming": {"Laramie County": ["Central Bank - Cheyenne", "Trust Bank - Ranchettes"],
                    "Natrona County": ["Central Bank - Casper", "Trust Bank - Mills"]}
    }

    return branches.get(state, {"Unknown County": ["No branches available", "No branches available"]})
```

### Integrate the New Tools

With the tools defined, we need to update the tool definitions for each agent.

1. In VS Code, open the **banking_agents.py** file.
1. At the top of the file, add the following import statements:

```python
from src.app.tools.sales import calculate_monthly_payment, create_account
from src.app.tools.support import get_branch_location, service_request
from src.app.tools.transactions import bank_balance, bank_transfer, get_transaction_history
```

1. Next, locate the line containing the empty *customer_support_agent_tools = []*
1. Update it with the code below.

```python
customer_support_agent_tools = [
    get_branch_location,
    service_request,
]
```

1. Next, scroll a further down in this file to locate, the empty *transactions_agent_tools = []*.
1. Update it with the code below.

```python
transactions_agent_tools = [
    bank_balance,
    bank_transfer,
    get_transaction_history,
]
```

1. Finally, scroll further down to the empty *sales_agent_tools = []*.
1. Update it with the code below.

```python
sales_agent_tools = [
    calculate_monthly_payment,
    create_account, 
]
```

We're done defining the tools each agent has access to, but we still need to define *when* these tools should be called. To do this, we need to update the agent prompts.

### Updating Agent Prompts

Since the agents have now been built, we can update the coordinator agent's prompt to route to them.

1. In VS Code, open the file **src/app/prompts/coordinator_agent.prompty**.
1. Replace the contents with this text below.

```text
You are a Chat Initiator and Request Router in a bank.
Your primary responsibilities include welcoming users, and routing requests to the appropriate agent.
If the user needs general help, transfer to 'customer_support' for help.
If the user wants to open a new account or take our a bank loan or ask about banking offers, transfer to 'sales_agent'.
If the user wants to check their account balance or make a bank transfer, transfer to 'transactions_agent'.
You MUST include human-readable response before transferring to another agent.
```

Now that the customer support agent has a service request tool, we can update the prompt for the customer support agent.

1. Next, open the file **src/app/prompts/customer_support_agent.prompty**.
1. Replace the contents with this text below.

```text
You are a customer support agent that can give general advice on banking products and branch locations
If the user wants to make a complaint or speak to someone, ask for the user's phone number and email address,
and say you will get someone to call them back, call 'service_request' tool with these values and pass config along with a summary of what they said into the requestSummary parameter.
You MUST include human-readable response before transferring to another agent.
```

Note that we are not explicitly naming the branch location tool, as this is already implied in the first part of the prompt. However, keep a note of this when you test the agent. Does it always call the tool when you expect? Or does the prompt need to be more specific?

Next, update the prompt for the transactions agent.

1. Open the empty file **src/app/prompts/transactions_agent.prompty**.
1. Paste this text below.

```text
You are a banking transactions agent that can handle account balance enquiries and bank transfers.
If the user wants to make a deposit or withdrawal or transfer, ask for the amount and the account number which they want to transfer from and to.
Then call 'bank_transfer' tool with toAccount, fromAccount, and amount values.
Make sure you confirm the transaction details with the user before calling the 'bank_transfer' tool then call 'bank_transfer' tool with these values.
If the user wants to know transaction history, ask for the start and end date, and call 'get_transaction_history' tool with these values.
If the user needs general help, transfer to 'customer_support' for help.
You MUST respond with the repayment amounts before transferring to another agent.
```

Finally, lets update the prompt for the sales agent.

1. Open the empty file **src/app/prompts/sales_agent.prompty**
1. Paste this text below.

```text
You are a sales agent that can help users with creating a new account, or taking out bank loans.
If the user wants to check their account balance, make a bank transfer, or get transaction history, transfer to 'transactions_agent'.
If the user wants to create a new account, you must ask for the account holder's name and the initial balance.
Call create_account tool with these values, and also pass the config. Be sure to tell the user their full new account number including A prefix.
If customer wants to open anything other than a banking account, advise that you can only open a banking account and if they want any other sort of account they will need to contact the branch.
If user wants to take out a loan, you can offer a loan quote. You must ask for the loan amount and the number of years for the loan.
When user provides these, calculate the monthly payment using calculate_monthly_payment tool and provide the result as part of the response.
Do not return the monthly payment tool call output directly to the user, include it with the rest of your response.
If the user wants to move ahead with the loan, advise that they need to come into the branch to complete the application.
If the wants information about a product or offer, ask whether they want Credit Card or Savings, then call 'get_offer_information' tool with the user_prompt, and the accountType ('CreditCard' or 'Savings').
You MUST respond with the repayment amounts before transferring to another agent.
```

## Activity 3: Semantic Search

We are going to add one more tool that is a little different from the others. This tool will allow the customer support agent to perform a semantic search for products in the bank's database. We'll use Azure Cosmos DB Vector Search capability to perform a semantic search against the OffersData container.

1. In VS Code, open the file **src/app/tools/sales.py**
1. Add these imports to the top of the file.

```python
from src.app.services.azure_cosmos_db import vector_search
from src.app.services.azure_open_ai import generate_embedding
```

1. Next, paste the code for this tool below the imports at the top.

```python
@tool
def get_offer_information(user_prompt: str, accountType: str) -> list[dict[str, Any]]:
    """Provide information about a product based on the user prompt.
    Takes as input the user prompt as a string."""
    # Perform a vector search on the Cosmos DB container and return results to the agent
    vectors = generate_embedding(user_prompt)
    search_results = vector_search(vectors, accountType)
    return search_results
```

You can implement this tool in exactly the same way as the other tools.

1. In VS Code, open the **banking_agents.py**
1. Locate this import at the top of the file.

```python
from src.app.tools.sales import calculate_monthly_payment, create_account
```

1. Replace it with this updated import statement.

```python
from src.app.tools.sales import calculate_monthly_payment, create_account, get_offer_information
```

1. Next, locate this code.

```python
sales_agent_tools = [
    calculate_monthly_payment,
    create_account,
]
```

1. And replace it with this.

```python
sales_agent_tools = [
    get_offer_information,
    calculate_monthly_payment,
    create_account,
]
```

## Activity 4: Test your Work

With the activities in this module complete, it is time to test your work!

### Ready to test

Let's test our agents!

1. In you browser, return to the frontend and hit refresh.
1. Start a new conversation.
1. Type the following text to try transferring money between accounts.

```text
I want to transfer 500 from account Acc001 to Acc003
```

![Testing_1](./media/module-03/testing_module3_1.png)

1. Wait until the transaction has been completed by the agent.
1. Return to the Azure Portal, open the Cosmos DB account
1. Open the AccountsData container.
1. Verify the transaction was successful.

Let's test a new scenario that will invoke a vector search in Cosmos DB on our banking offers.

1. Return to the frontend in your browser.
1. Create a new conversation.
1. Type the following text to try asking about banking offers:

 ```text
 Tell me about banking offers
 ```

1. You should see results like this below (you might have to specify which type of offer, e.g. "Savings"):

![Testing_2](./media/module-03/testing_module3_2.png)

## Validation Checklist

- [ ] Account Balance agent functions correctly
- [ ] Semantic Search for Product Agent functions correctly
- [ ] Service Request agent successfully creates a new service request on behalf of user
- [ ] New Service request is correctly read by second service request agent

### Module Solution

The following sections include the completed code for this Module. Copy and paste these into your project if you run into issues and cannot resolve.

<details>
  <summary>Completed code for <strong>src/app/banking_agents.py</strong></summary>

<br>

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
from langgraph_checkpoint_cosmosdb import CosmosDBSaver
from src.app.services.azure_cosmos_db import DATABASE_NAME, checkpoint_container, chat_container, update_chat_container, \
    patch_active_agent
from src.app.tools.sales import calculate_monthly_payment, create_account, get_offer_information
from src.app.tools.support import get_branch_location, service_request
from src.app.tools.transactions import bank_balance, bank_transfer, get_transaction_history

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
    create_agent_transfer(agent_name="transactions_agent"),
    create_agent_transfer(agent_name="sales_agent"),
]
coordinator_agent = create_react_agent(
    model,
    tools=coordinator_agent_tools,
    state_modifier=load_prompt("coordinator_agent"),
)

customer_support_agent_tools = [
    get_branch_location,
    service_request,
]
customer_support_agent = create_react_agent(
    model,
    customer_support_agent_tools,
    state_modifier=load_prompt("customer_support_agent"),
)

transactions_agent_tools = [
    bank_balance,
    bank_transfer,
    get_transaction_history,
]
transactions_agent = create_react_agent(
    model,
    transactions_agent_tools,
    state_modifier=load_prompt("transactions_agent"),
)

sales_agent_tools = [
    calculate_monthly_payment,
    get_offer_information,
    create_account,
]
sales_agent = create_react_agent(
    model,
    sales_agent_tools,
    state_modifier=load_prompt("sales_agent"),
)


def call_coordinator_agent(state: MessagesState, config) -> Command[Literal["coordinator_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")

    logging.debug(f"Calling coordinator agent with Thread ID: {thread_id}")

    # Get the active agent from Cosmos DB with a point lookup
    partition_key = [tenantId, userId, thread_id]
    activeAgent = None
    try:
        activeAgent = chat_container.read_item(
            item=thread_id,
            partition_key=partition_key).get('activeAgent', 'unknown')

    except Exception as e:
        logging.debug(f"No active agent found: {e}")

    if activeAgent is None:
        if local_interactive_mode:
            update_chat_container({
                "id": thread_id,
                "tenantId": "Contoso",
                "userId": "Mark",
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


def call_customer_support_agent(state: MessagesState, config) -> Command[Literal["customer_support_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent(
            tenantId="Contoso",
            userId="Mark",
            sessionId=thread_id,
            activeAgent="customer_support_agent")

    response = customer_support_agent.invoke(state)
    return Command(update=response, goto="human")


def call_sales_agent(state: MessagesState, config) -> Command[Literal["sales_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent(
            tenantId="Contoso",
            userId="Mark",
            sessionId=thread_id,
            activeAgent="sales_agent")
    response = sales_agent.invoke(state, config)  # Invoke sales agent with state
    return Command(update=response, goto="human")


def call_transactions_agent(state: MessagesState, config) -> Command[Literal["transactions_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent(
            tenantId="Contoso",
            userId="Mark",
            sessionId=thread_id,
            activeAgent="transactions_agent")
    response = transactions_agent.invoke(state)
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
builder.add_node("transactions_agent", call_transactions_agent)
builder.add_node("sales_agent", call_sales_agent)
builder.add_node("human", human_node)

builder.add_edge(START, "coordinator_agent")

checkpointer = CosmosDBSaver(database_name=DATABASE_NAME, container_name=checkpoint_container)
graph = builder.compile(checkpointer=checkpointer)


def interactive_chat():
    thread_config = {"configurable": {"thread_id": str(uuid.uuid4()), "userId": "Mark", "tenantId": "Contoso"}}
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

</details>

<details>
  <summary>Completed code for <strong>src/app/tools/support.py</strong></summary>

<br>

```python
import logging
import uuid
from datetime import datetime
from typing import Dict, List

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from src.app.services.azure_cosmos_db import create_service_request_record


@tool
def service_request(config: RunnableConfig,  recipientPhone: str, recipientEmail: str,
                    requestSummary: str) -> str:
    """
    Create a service request entry in the AccountsData container.

    :param config: Configuration dictionary.
    :param tenantId: The ID of the tenant.
    :param userId: The ID of the user.
    :param recipientPhone: The phone number of the recipient.
    :param recipientEmail: The email address of the recipient.
    :param requestSummary: A summary of the service request.
    :return: A message indicating the result of the operation.
    """
    try:
        tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
        userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
        request_id = str(uuid.uuid4())
        requested_on = datetime.utcnow().isoformat() + "Z"
        request_annotations = [
            requestSummary,
            f"[{datetime.utcnow().strftime('%d-%m-%Y %H:%M:%S')}] : Urgent"
        ]

        service_request_data = {
            "id": request_id,
            "tenantId": tenantId,
            "userId": userId,
            "type": "ServiceRequest",
            "requestedOn": requested_on,
            "scheduledDateTime": "0001-01-01T00:00:00",
            "accountId": "Acc001",
            "srType": 0,
            "recipientEmail": recipientEmail,
            "recipientPhone": recipientPhone,
            "debitAmount": 0,
            "isComplete": False,
            "requestAnnotations": request_annotations,
            "fulfilmentDetails": None
        }

        create_service_request_record(service_request_data)
        return f"Service request created successfully with ID: {request_id}"
    except Exception as e:
        logging.error(f"Error creating service request: {e}")
        return f"Failed to create service request: {e}"


@tool
def get_branch_location(state: str) -> Dict[str, List[str]]:
    """
    Get location of bank branches for a given state in the USA.

    :param state: The name of the state.
    :return: A dictionary with county names as keys and lists of branch names as values.
    """
    branches = {
        "Alabama": {"Jefferson County": ["Central Bank - Birmingham", "Trust Bank - Hoover"],
                    "Mobile County": ["Central Bank - Mobile", "Trust Bank - Prichard"]},
        "Alaska": {"Anchorage": ["Central Bank - Anchorage", "Trust Bank - Eagle River"],
                   "Fairbanks North Star Borough": ["Central Bank - Fairbanks", "Trust Bank - North Pole"]},
        "Arizona": {"Maricopa County": ["Central Bank - Phoenix", "Trust Bank - Scottsdale"],
                    "Pima County": ["Central Bank - Tucson", "Trust Bank - Oro Valley"]},
        "Arkansas": {"Pulaski County": ["Central Bank - Little Rock", "Trust Bank - North Little Rock"],
                     "Benton County": ["Central Bank - Bentonville", "Trust Bank - Rogers"]},
        "California": {"Los Angeles County": ["Central Bank - Los Angeles", "Trust Bank - Long Beach"],
                       "San Diego County": ["Central Bank - San Diego", "Trust Bank - Chula Vista"]},
        "Colorado": {"Denver County": ["Central Bank - Denver", "Trust Bank - Aurora"],
                     "El Paso County": ["Central Bank - Colorado Springs", "Trust Bank - Fountain"]},
        "Connecticut": {"Fairfield County": ["Central Bank - Bridgeport", "Trust Bank - Stamford"],
                        "Hartford County": ["Central Bank - Hartford", "Trust Bank - New Britain"]},
        "Delaware": {"New Castle County": ["Central Bank - Wilmington", "Trust Bank - Newark"],
                     "Sussex County": ["Central Bank - Seaford", "Trust Bank - Lewes"]},
        "Florida": {"Miami-Dade County": ["Central Bank - Miami", "Trust Bank - Hialeah"],
                    "Orange County": ["Central Bank - Orlando", "Trust Bank - Winter Park"]},
        "Georgia": {"Fulton County": ["Central Bank - Atlanta", "Trust Bank - Sandy Springs"],
                    "Cobb County": ["Central Bank - Marietta", "Trust Bank - Smyrna"]},
        "Hawaii": {"Honolulu County": ["Central Bank - Honolulu", "Trust Bank - Pearl City"],
                   "Maui County": ["Central Bank - Kahului", "Trust Bank - Lahaina"]},
        "Idaho": {"Ada County": ["Central Bank - Boise", "Trust Bank - Meridian"],
                  "Canyon County": ["Central Bank - Nampa", "Trust Bank - Caldwell"]},
        "Illinois": {"Cook County": ["Central Bank - Chicago", "Trust Bank - Evanston"],
                     "DuPage County": ["Central Bank - Naperville", "Trust Bank - Wheaton"]},
        "Indiana": {"Marion County": ["Central Bank - Indianapolis", "Trust Bank - Lawrence"],
                    "Lake County": ["Central Bank - Gary", "Trust Bank - Hammond"]},
        "Iowa": {"Polk County": ["Central Bank - Des Moines", "Trust Bank - West Des Moines"],
                 "Linn County": ["Central Bank - Cedar Rapids", "Trust Bank - Marion"]},
        "Kansas": {"Sedgwick County": ["Central Bank - Wichita", "Trust Bank - Derby"],
                   "Johnson County": ["Central Bank - Overland Park", "Trust Bank - Olathe"]},
        "Kentucky": {"Jefferson County": ["Central Bank - Louisville", "Trust Bank - Jeffersontown"],
                     "Fayette County": ["Central Bank - Lexington", "Trust Bank - Nicholasville"]},
        "Louisiana": {"Orleans Parish": ["Central Bank - New Orleans", "Trust Bank - Metairie"],
                      "East Baton Rouge Parish": ["Central Bank - Baton Rouge", "Trust Bank - Zachary"]},
        "Maine": {"Cumberland County": ["Central Bank - Portland", "Trust Bank - South Portland"],
                  "Penobscot County": ["Central Bank - Bangor", "Trust Bank - Brewer"]},
        "Maryland": {"Baltimore County": ["Central Bank - Baltimore", "Trust Bank - Towson"],
                     "Montgomery County": ["Central Bank - Rockville", "Trust Bank - Bethesda"]},
        "Massachusetts": {"Suffolk County": ["Central Bank - Boston", "Trust Bank - Revere"],
                          "Worcester County": ["Central Bank - Worcester", "Trust Bank - Leominster"]},
        "Michigan": {"Wayne County": ["Central Bank - Detroit", "Trust Bank - Dearborn"],
                     "Oakland County": ["Central Bank - Troy", "Trust Bank - Farmington Hills"]},
        "Minnesota": {"Hennepin County": ["Central Bank - Minneapolis", "Trust Bank - Bloomington"],
                      "Ramsey County": ["Central Bank - Saint Paul", "Trust Bank - Maplewood"]},
        "Mississippi": {"Hinds County": ["Central Bank - Jackson", "Trust Bank - Clinton"],
                        "Harrison County": ["Central Bank - Gulfport", "Trust Bank - Biloxi"]},
        "Missouri": {"Jackson County": ["Central Bank - Kansas City", "Trust Bank - Independence"],
                     "St. Louis County": ["Central Bank - St. Louis", "Trust Bank - Florissant"]},
        "Montana": {"Yellowstone County": ["Central Bank - Billings", "Trust Bank - Laurel"],
                    "Missoula County": ["Central Bank - Missoula", "Trust Bank - Lolo"]},
        "Nebraska": {"Douglas County": ["Central Bank - Omaha", "Trust Bank - Bellevue"],
                     "Lancaster County": ["Central Bank - Lincoln", "Trust Bank - Waverly"]},
        "Nevada": {"Clark County": ["Central Bank - Las Vegas", "Trust Bank - Henderson"],
                   "Washoe County": ["Central Bank - Reno", "Trust Bank - Sparks"]},
        "New Hampshire": {"Hillsborough County": ["Central Bank - Manchester", "Trust Bank - Nashua"],
                          "Rockingham County": ["Central Bank - Portsmouth", "Trust Bank - Derry"]},
        "New Jersey": {"Essex County": ["Central Bank - Newark", "Trust Bank - East Orange"],
                       "Bergen County": ["Central Bank - Hackensack", "Trust Bank - Teaneck"]},
        "New Mexico": {"Bernalillo County": ["Central Bank - Albuquerque", "Trust Bank - Rio Rancho"],
                       "Santa Fe County": ["Central Bank - Santa Fe", "Trust Bank - Eldorado"]},
        "New York": {"New York County": ["Central Bank - Manhattan", "Trust Bank - Harlem"],
                     "Kings County": ["Central Bank - Brooklyn", "Trust Bank - Williamsburg"]},
        "North Carolina": {"Mecklenburg County": ["Central Bank - Charlotte", "Trust Bank - Matthews"],
                           "Wake County": ["Central Bank - Raleigh", "Trust Bank - Cary"]},
        "North Dakota": {"Cass County": ["Central Bank - Fargo", "Trust Bank - West Fargo"],
                         "Burleigh County": ["Central Bank - Bismarck", "Trust Bank - Lincoln"]},
        "Ohio": {"Cuyahoga County": ["Central Bank - Cleveland", "Trust Bank - Parma"],
                 "Franklin County": ["Central Bank - Columbus", "Trust Bank - Dublin"]},
        "Oklahoma": {"Oklahoma County": ["Central Bank - Oklahoma City", "Trust Bank - Edmond"],
                     "Tulsa County": ["Central Bank - Tulsa", "Trust Bank - Broken Arrow"]},
        "Oregon": {"Multnomah County": ["Central Bank - Portland", "Trust Bank - Gresham"],
                   "Lane County": ["Central Bank - Eugene", "Trust Bank - Springfield"]},
        "Pennsylvania": {"Philadelphia County": ["Central Bank - Philadelphia", "Trust Bank - Germantown"],
                         "Allegheny County": ["Central Bank - Pittsburgh", "Trust Bank - Bethel Park"]},
        "Rhode Island": {"Providence County": ["Central Bank - Providence", "Trust Bank - Cranston"],
                         "Kent County": ["Central Bank - Warwick", "Trust Bank - Coventry"]},
        "South Carolina": {"Charleston County": ["Central Bank - Charleston", "Trust Bank - Mount Pleasant"],
                           "Richland County": ["Central Bank - Columbia", "Trust Bank - Forest Acres"]},
        "South Dakota": {"Minnehaha County": ["Central Bank - Sioux Falls", "Trust Bank - Brandon"],
                         "Pennington County": ["Central Bank - Rapid City", "Trust Bank - Box Elder"]},
        "Tennessee": {"Davidson County": ["Central Bank - Nashville", "Trust Bank - Antioch"],
                      "Shelby County": ["Central Bank - Memphis", "Trust Bank - Bartlett"]},
        "Texas": {"Harris County": ["Central Bank - Houston", "Trust Bank - Pasadena"],
                  "Dallas County": ["Central Bank - Dallas", "Trust Bank - Garland"]},
        "Utah": {"Salt Lake County": ["Central Bank - Salt Lake City", "Trust Bank - West Valley City"],
                 "Utah County": ["Central Bank - Provo", "Trust Bank - Orem"]},
        "Vermont": {"Chittenden County": ["Central Bank - Burlington", "Trust Bank - South Burlington"],
                    "Rutland County": ["Central Bank - Rutland", "Trust Bank - Killington"]},
        "Virginia": {"Fairfax County": ["Central Bank - Fairfax", "Trust Bank - Reston"],
                     "Virginia Beach": ["Central Bank - Virginia Beach", "Trust Bank - Chesapeake"]},
        "Washington": {"King County": ["Central Bank - Seattle", "Trust Bank - Bellevue"],
                       "Pierce County": ["Central Bank - Tacoma", "Trust Bank - Lakewood"]},
        "West Virginia": {"Kanawha County": ["Central Bank - Charleston", "Trust Bank - South Charleston"],
                          "Berkeley County": ["Central Bank - Martinsburg", "Trust Bank - Hedgesville"]},
        "Wisconsin": {"Milwaukee County": ["Central Bank - Milwaukee", "Trust Bank - Wauwatosa"],
                      "Dane County": ["Central Bank - Madison", "Trust Bank - Fitchburg"]},
        "Wyoming": {"Laramie County": ["Central Bank - Cheyenne", "Trust Bank - Ranchettes"],
                    "Natrona County": ["Central Bank - Casper", "Trust Bank - Mills"]}
    }

    return branches.get(state, {"Unknown County": ["No branches available", "No branches available"]})
```
</details>

<details>
  <summary>Completed code for <strong>src/app/tools/sales.py</strong></summary>

<br>

```python
from typing import Any

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from src.app.services.azure_cosmos_db import create_account_record, \
    fetch_latest_account_number

from src.app.services.azure_cosmos_db import vector_search
from src.app.services.azure_open_ai import generate_embedding


@tool
def get_offer_information(user_prompt: str, accountType: str) -> list[dict[str, Any]]:
    """Provide information about a product based on the user prompt.
    Takes as input the user prompt as a string."""
    # Perform a vector search on the Cosmos DB container and return results to the agent
    vectors = generate_embedding(user_prompt)
    search_results = vector_search(vectors, accountType)
    return search_results


@tool
def create_account(account_holder: str, balance: float, config: RunnableConfig) -> str:
    """
    Create a new bank account for a user.

    This function retrieves the latest account number, increments it, and creates a new account record
    in Cosmos DB associated with a specific user and tenant.
    """
    print(f"Creating account for {account_holder}")
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    max_attempts = 10
    account_number = fetch_latest_account_number()

    print(f"Latest account number: {account_number}")
    if account_number is None:
        account_number = 1
    else:
        account_number += 1

    for attempt in range(max_attempts):
        account_data = {
            "id": f"{account_number}",
            "accountId": f"A{account_number}",
            "tenantId": tenantId,
            "userId": userId,
            "name": "Account",
            "type": "BankAccount",
            "accountName": account_holder,
            "balance": balance,
            "startDate": "01-01-2025",
            "accountDescription": "Some description here",
            "accountProperties": {
                "key1": "Value1",
                "key2": "Value2"
            }
        }
        try:
            print(f"Creating account record: {account_data}")
            create_account_record(account_data)
            return f"Successfully created account {account_number} for {account_holder} with a balance of ${balance}"
        except Exception as e:
            account_number += 1
            if attempt == max_attempts - 1:
                return f"Failed to create account after {max_attempts} attempts: {e}"

    return f"Failed to create account after {max_attempts} attempts"


@tool
def calculate_monthly_payment(loan_amount: float, years: int) -> float:
    """Calculate the monthly payment for a loan."""
    interest_rate = 0.05  # Hardcoded annual interest rate (5%)
    monthly_rate = interest_rate / 12  # Convert annual rate to monthly
    total_payments = years * 12  # Total number of monthly payments

    if monthly_rate == 0:
        return loan_amount / total_payments  # If interest rate is 0, simple division

    monthly_payment = (loan_amount * monthly_rate * (1 + monthly_rate) ** total_payments) / \
                      ((1 + monthly_rate) ** total_payments - 1)

    return round(monthly_payment, 2)  # Rounded to 2 decimal places
```
</details>

<details>
  <summary>Completed code for <strong>src/app/tools/transactions.py</strong></summary>

<br>

```python
import logging
from datetime import datetime
from typing import List, Dict
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from src.app.services.azure_cosmos_db import fetch_latest_transaction_number, fetch_account_by_number, \
    create_transaction_record, \
    patch_account_record, fetch_transactions_by_date_range


@tool
def bank_transfer(config: RunnableConfig, toAccount: str, fromAccount: str, amount: float) -> str:
    """Wrapper function to handle the transfer of funds between two accounts."""
    # Debit the amount from the fromAccount
    debit_result = bank_transaction(config, fromAccount, amount, credit_account=0, debit_account=amount)
    if "Failed" in debit_result:
        return f"Failed to debit amount from {fromAccount}: {debit_result}"

    # Credit the amount to the toAccount
    credit_result = bank_transaction(config, toAccount, amount, credit_account=amount, debit_account=0)
    if "Failed" in credit_result:
        return f"Failed to credit amount to {toAccount}: {credit_result}"

    return f"Successfully transferred ${amount} from account {fromAccount} to account {toAccount}"


def bank_transaction(config: RunnableConfig, account_number: str, amount: float, credit_account: float,
                     debit_account: float) -> str:
    """Transfer to bank agent"""
    global new_balance
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")

    # Fetch the account record
    account = fetch_account_by_number(account_number, tenantId, userId)
    if not account:
        print(f"Account {account_number} not found for tenant {tenantId} and user {userId}")
        return f"Account {account_number} not found for tenant {tenantId} and user {userId}"

    max_attempts = 5
    for attempt in range(max_attempts):
        try:
            # Fetch the latest transaction number for the account
            latest_transaction_number = fetch_latest_transaction_number(account_number)
            transaction_id = f"{account_number}-{latest_transaction_number + 1}"

            # Calculate the new account balance
            new_balance = account["balance"] + credit_account - debit_account

            # Create the transaction record
            transaction_data = {
                "id": transaction_id,
                "tenantId": tenantId,
                "accountId": account["accountId"],
                "type": "BankTransaction",
                "debitAmount": debit_account,
                "creditAmount": credit_account,
                "accountBalance": new_balance,
                "details": "Bank Transfer",
                "transactionDateTime": datetime.utcnow().isoformat() + "Z"
            }

            create_transaction_record(transaction_data)
            print(f"Successfully transferred ${amount} to account number {account_number}")
            break  # Stop retrying after a successful attempt
        except Exception as e:
            logging.error(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_attempts - 1:
                return f"Failed to create transaction record after {max_attempts} attempts: {e}"

    # Update the account balance
    patch_account_record(tenantId, account["accountId"], new_balance)
    return f"Successfully transferred ${amount} to account number {account_number}"


@tool
def get_transaction_history(accountId: str, startDate: datetime, endDate: datetime) -> List[Dict]:
    """
    Retrieve the transaction history for a specific account between two dates.

    :param accountId: The ID of the account to retrieve transactions for.
    :param startDate: The start date for the transaction history.
    :param endDate: The end date for the transaction history.
    :return: A list of transactions within the specified date range.
    """
    try:
        transactions = fetch_transactions_by_date_range(accountId, startDate, endDate)
        return transactions
    except Exception as e:
        logging.error(f"Error fetching transaction history for account {accountId}: {e}")
        return []


@tool
def bank_balance(config: RunnableConfig, account_number: str) -> str:
    """Retrieve the balance for a specific bank account."""
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")

    # Fetch the account record
    account = fetch_account_by_number(account_number, tenantId, userId)
    if not account:
        return f"Account {account_number} not found for tenant {tenantId} and user {userId}"

    balance = account.get("balance", 0)
    return f"The balance for account number {account_number} is ${balance}"
```
</details>

<details>
  <summary>Completed code for <strong>src/app/prompts/coordinator_agent.prompty</strong></summary>

<br>

```text
You are a Chat Initiator and Request Router in a bank.
Your primary responsibilities include welcoming users, and routing requests to the appropriate agent.
If the user needs general help, transfer to 'customer_support' for help.
If the user wants to open a new account or take our a bank loan or ask about banking offers, transfer to 'sales_agent'.
If the user wants to check their account balance or make a bank transfer, transfer to 'transactions_agent'.
You MUST include human-readable response before transferring to another agent.
```
</details>

<details>
  <summary>Completed code for <strong>src/app/prompts/customer_support_agent.prompty</strong></summary>

<br>

```text
You are a customer support agent that can give general advice on banking products and branch locations
If the user wants to make a complaint or speak to someone, ask for the user's phone number and email address,
and say you will get someone to call them back, call 'service_request' tool with these values and pass config along with a summary of what they said into the requestSummary parameter.
You MUST include human-readable response before transferring to another agent.
```
</details>

<details>
  <summary>Completed code for <strong>src/app/prompts/sales_agent.prompty</strong></summary>

<br>

```text
You are a sales agent that can help users with creating a new account, or taking out bank loans.
If the user wants to check their account balance, make a bank transfer, or get transaction history, transfer to 'transactions_agent'.
If the user wants to create a new account, you must ask for the account holder's name and the initial balance.
Call create_account tool with these values, and also pass the config. Be sure to tell the user their full new account number including A prefix.
If customer wants to open anything other than a banking account, advise that you can only open a banking account and if they want any other sort of account they will need to contact the branch.
If user wants to take out a loan, you can offer a loan quote. You must ask for the loan amount and the number of years for the loan.
When user provides these, calculate the monthly payment using calculate_monthly_payment tool and provide the result as part of the response.
Do not return the monthly payment tool call output directly to the user, include it with the rest of your response.
If the user wants to move ahead with the loan, advise that they need to come into the branch to complete the application.
If the wants information about a product or offer, ask whether they want Credit Card or Savings, then call 'get_offer_information' tool with the user_prompt, and the accountType ('CreditCard' or 'Savings').
You MUST respond with the repayment amounts before transferring to another agent.
```
</details>

<details>
  <summary>Completed code for <strong>src/app/prompts/transactions_agent.prompty</strong></summary>

<br>

```text
You are a banking transactions agent that can handle account balance enquiries and bank transfers.
If the user wants to make a deposit or withdrawal or transfer, ask for the amount and the account number which they want to transfer from and to.
Then call 'bank_transfer' tool with toAccount, fromAccount, and amount values.
Make sure you confirm the transaction details with the user before calling the 'bank_transfer' tool.
then call 'bank_transfer' tool with these values.
If the user wants to know transaction history, ask for the start and end date, and call 'get_transaction_history' tool with these values.
If the user needs general help, transfer to 'customer_support' for help.
You MUST respond with the repayment amounts before transferring to another agent.
```   
</details>

## Next Steps


Proceed to [Multi-Agent Orchestration](./Module-04.md)

## Resources

- [LangGraph](https://langchain-ai.github.io/langgraph/concepts/)
- [Azure OpenAI Service documentation](https://learn.microsoft.com/azure/cognitive-services/openai/)
- [Azure Cosmos DB Vector Database](https://learn.microsoft.com/azure/cosmos-db/vector-database)