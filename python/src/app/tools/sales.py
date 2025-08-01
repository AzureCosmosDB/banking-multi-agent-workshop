from typing import Any

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langsmith import traceable

from src.app.services.azure_cosmos_db import vector_search, create_account_record, \
    fetch_latest_account_number
from src.app.services.azure_open_ai import generate_embedding


@tool
@traceable
def get_offer_information(user_prompt: str, accountType: str) -> list[dict[str, Any]]:
    """Provide information about a product based on the user prompt.
    Takes as input the user prompt as a string."""
    # Perform a vector search on the Cosmos DB container and return results to the agent
    vectors = generate_embedding(user_prompt)
    search_results = vector_search(vectors, accountType)
    return search_results


@tool
@traceable
def create_account(account_holder: str, balance: float, config: RunnableConfig) -> str:
    """
    Create a new rewards account for a user.

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
            "type": "RewardsAccount",
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
@traceable
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
