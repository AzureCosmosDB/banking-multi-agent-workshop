import logging
from datetime import datetime
from typing import List, Dict
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langsmith import traceable

from src.app.services.azure_cosmos_db import fetch_latest_transaction_number, fetch_account_by_number, \
    create_transaction_record, \
    patch_account_record, fetch_transactions_by_date_range



def account_transaction(config: RunnableConfig, account_number: str, amount: float, credit_account: float,
                     debit_account: float) -> str:
    """Transfer to rewards agent"""
    global new_balance
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")

    # Fetch the account record
    account = fetch_account_by_number(account_number, tenantId, userId)
    if not account:
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
                "type": "RewardsTransaction",
                "debitAmount": debit_account,
                "creditAmount": credit_account,
                "accountBalance": new_balance,
                "details": "Rewards Transfer",
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
@traceable
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
@traceable
def account_balance(config: RunnableConfig, account_number: str) -> str:
    """Retrieve the balance for a specific rewards account."""
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")

    # Fetch the account record
    account = fetch_account_by_number(account_number, tenantId, userId)
    if not account:
        return f"Account {account_number} not found for tenant {tenantId} and user {userId}"

    balance = account.get("rewardsBalance", 0)
    return f"The rewards balance for account number {account_number} is {balance} points"
