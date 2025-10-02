import logging
import os
import time
from datetime import datetime
from typing import List, Dict
import re

from azure.cosmos import CosmosClient, PartitionKey
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

logging.basicConfig(level=logging.ERROR)

load_dotenv(override=False)

# Azure Cosmos DB configuration
COSMOS_DB_URL = os.getenv("COSMOSDB_ENDPOINT")
DATABASE_NAME = os.getenv("COSMOS_DB_DATABASE_NAME", "MultiAgentBanking")

# Global client variables
cosmos_client = None
database = None

# Container clients needed for MCP server
offers_container = None
account_container = None

def initialize_cosmos_client():
    """Initialize the Cosmos DB client and containers"""
    global cosmos_client, database, offers_container, account_container
    
    if cosmos_client is None:
        try:
            credential = DefaultAzureCredential()
            cosmos_client = CosmosClient(COSMOS_DB_URL, credential=credential)
            print("[DEBUG] MCP Server: Connected to Cosmos DB successfully using DefaultAzureCredential.")
        except Exception as dac_error:
            print(f"[ERROR] MCP Server: Failed to authenticate using DefaultAzureCredential: {dac_error}")
            print("[WARN] MCP Server: Continuing without Cosmos DB client - some features may not work")
            return

        # Initialize database and containers
        try:
            database = cosmos_client.get_database_client(DATABASE_NAME)
            print(f"[DEBUG] MCP Server: Connected to Cosmos DB: {DATABASE_NAME}")

            offers_container = database.get_container_client("OffersData")
            account_container = database.get_container_client("AccountsData")
            
            print("[DEBUG] MCP Server: Cosmos DB containers initialized")
        except Exception as e:
            print(f"[ERROR] MCP Server: Error initializing Cosmos DB Containers: {e}")
            print("[WARN] MCP Server: Continuing without Cosmos DB containers - some features may not work")

# Initialize on import
try:
    initialize_cosmos_client()
except Exception as e:
    print(f"[WARN] MCP Server: Failed to initialize Cosmos DB client during import: {e}")

# Helper function to check if cosmos is available
def is_cosmos_available():
    return account_container is not None and offers_container is not None

def get_cosmos_client():
    """Return the initialized Cosmos client for shared MCP server"""
    return cosmos_client

def vector_search(vectors, accountType):
    if offers_container is None:
        print("[ERROR] MCP Server: Cosmos DB not available - cannot perform vector search")
        return []
        
    start_time = time.time()
    print(f"⏱️  MCP COSMOS_DB: Starting vector search for accountType={accountType}, vector_dims={len(vectors) if vectors else 0}")
    
    try:
        query_start_time = time.time()
        results = offers_container.query_items(
            query='''
            SELECT TOP 3 c.offerId, c.text, c.name
                            FROM c
                            WHERE c.type = 'Term'
                            AND c.accountType = @accountType
                            AND VectorDistance(c.vector, @referenceVector)> 0.075
                            ORDER BY VectorDistance(c.vector, @referenceVector) 
            ''',
            parameters=[
                {"name": "@accountType", "value": accountType},
                {"name": "@referenceVector", "value": vectors}
            ],
            enable_cross_partition_query=True, 
            populate_query_metrics=True
        )
        
        query_duration_ms = (time.time() - query_start_time) * 1000
        print(f"⏱️  MCP COSMOS_DB: Query execution took {query_duration_ms:.2f}ms")
        
        # Convert iterator to list with error handling
        processing_start_time = time.time()
        result_list = []
        try:
            count = 0
            for item in results:
                result_list.append(item)
                count += 1
                if count >= 3:  # Safety limit to prevent infinite loops
                    break
            
        except Exception as list_error:
            logging.error(f"Error processing results iterator: {list_error}")
            return []
        
        processing_duration_ms = (time.time() - processing_start_time) * 1000
        total_duration_ms = (time.time() - start_time) * 1000
        
        print(f"⏱️  MCP COSMOS_DB: Results processing took {processing_duration_ms:.2f}ms")
        print(f"⏱️  MCP COSMOS_DB: Total vector search took {total_duration_ms:.2f}ms, returned {len(result_list)} results")
        
        return result_list
        
    except Exception as e:
        logging.error(f"Error in vector_search: {e}")
        return []

def create_account_record(account_data):
    if not is_cosmos_available():
        print("[ERROR] MCP Server: Cosmos DB not available - cannot create account record")
        raise Exception("Cosmos DB not available")
        
    try:
        account_container.upsert_item(account_data)
        print(f"[DEBUG] MCP Server: Account record created: {account_data}")
    except Exception as e:
        print(f"[ERROR] MCP Server: Error creating account record: {e}")
        raise e

def create_service_request_record(account_data):
    try:
        account_container.upsert_item(account_data)
        print(f"[DEBUG] MCP Server: Service request record created: {account_data}")
    except Exception as e:
        print(f"[ERROR] MCP Server: Error creating service request record: {e}")
        raise e

def fetch_latest_account_number():
    try:
        query = "SELECT c.accountId FROM c WHERE c.type = 'BankAccount'"
        items = list(account_container.query_items(query=query, enable_cross_partition_query=True))

        print(f"[DEBUG] MCP Server: Fetched {len(items)} account numbers")

        if items:
            # Extract numeric parts and convert to integers
            account_numbers = []
            for item in items:
                account_id = item.get("accountId", "")
                if account_id.startswith("A") and account_id[1:].isdigit():
                    account_numbers.append(int(account_id[1:]))

            if not account_numbers:
                return 0  # No valid account numbers found

            latest_account_number = max(account_numbers)  # Get the highest account number
            print(f"[DEBUG] MCP Server: Latest account number: {latest_account_number}")
            return latest_account_number

        return 0  # No accounts found

    except Exception as e:
        print(f"[ERROR] MCP Server: Error fetching latest account number: {e}")
        raise e

def fetch_latest_transaction_number(account_number):
    try:
        query = f"SELECT c.id FROM c WHERE c.type = 'BankTransaction' AND c.accountId = '{account_number}' ORDER BY c._ts DESC"
        items = list(account_container.query_items(query=query, enable_cross_partition_query=True))

        if items:
            latest_transaction_id = items[0]["id"]
            numeric_part = re.sub(r'\D', '', latest_transaction_id)
            latest_transaction_number = int(numeric_part)
            return latest_transaction_number

        return 0  # No transactions found

    except Exception as e:
        print(f"[ERROR] MCP Server: Error fetching latest transaction number: {e}")
        raise e

def fetch_account_by_number(account_number, tenantId, userId):
    try:
        print(f"🚨🚨🚨 MCP COSMOS: fetch_account_by_number ENTRY POINT 🚨🚨🚨")
        print(f"MCP Server: Looking for account_number={account_number}, tenantId={tenantId}, userId={userId}")
        
        # First check what accounts exist for this tenant
        query_all = f"SELECT c.id, c.accountId, c.tenantId, c.userId, c.balance FROM c WHERE c.type = 'BankAccount' AND c.tenantId = '{tenantId}'"
        print(f"MCP Server: Listing all accounts for tenant {tenantId}...")
        all_accounts = list(account_container.query_items(query=query_all, enable_cross_partition_query=True))
        print(f"MCP Server: Found {len(all_accounts)} accounts for tenant {tenantId}:")
        for acc in all_accounts:
            print(f"  - id: {acc.get('id')}, accountId: {acc.get('accountId')}, tenantId: {acc.get('tenantId')}, userId: {acc.get('userId')}")
        
        query = f"SELECT * FROM c WHERE c.type = 'BankAccount' AND c.accountId = '{account_number}' AND c.tenantId = '{tenantId}' AND c.userId = '{userId}'"
        print(f"MCP Server: Specific query: {query}")
        items = list(account_container.query_items(query=query, enable_cross_partition_query=True))
        print(f"MCP Server: Query returned {len(items)} items")

        if items:
            print(f"MCP Server: Found account: {items[0].get('id')}")
            return items[0]  # Return the first matching account

        print("MCP Server: No matching account found")
        return None  # No matching account found

    except Exception as e:
        print(f"[ERROR] MCP Server: Error fetching account by number: {e}")
        raise e

def patch_account_record(tenantId, account_id, balance, userId=None):
    try:
        print("🚨🚨🚨 MCP COSMOS: patch_account_record ENTRY POINT 🚨🚨🚨")
        print("MCP Server: account_id: ", account_id)
        print("MCP Server: balance: ", balance)
        print("MCP Server: tenantId: ", tenantId)
        print("MCP Server: userId: ", userId)

        # First, let's see what accounts exist in the database
        print(f"MCP Server: Listing all BankAccount records for tenant {tenantId}...")
        query = f"SELECT c.id, c.accountId, c.tenantId, c.userId, c.balance FROM c WHERE c.type = 'BankAccount' AND c.tenantId = '{tenantId}'"
        all_accounts = list(account_container.query_items(query=query, enable_cross_partition_query=True))
        print(f"MCP Server: Found {len(all_accounts)} total accounts:")
        for acc in all_accounts:
            print(f"  - id: {acc.get('id')}, accountId: {acc.get('accountId')}, balance: {acc.get('balance')}")
        
        # Now try to find the specific account
        print(f"MCP Server: Looking for account with accountId={account_id}...")
        query = f"SELECT * FROM c WHERE c.type = 'BankAccount' AND c.accountId = '{account_id}' AND c.tenantId = '{tenantId}'"
        print(f"MCP Server: Query: {query}")
        
        items = list(account_container.query_items(query=query, enable_cross_partition_query=True))
        print(f"MCP Server: Found {len(items)} accounts with query")
        
        if items:
            account = items[0]
            account_document_id = account.get('id')
            print(f"MCP Server: Found account: document_id={account_document_id}, accountId={account.get('accountId')}, tenantId={account.get('tenantId')}")
            print(f"MCP Server: Using document ID '{account_document_id}' for patch operation")
            
            # Use patch_item like the Python version - use document ID as item, not accountId
            operations = [{'op': 'replace', 'path': '/balance', 'value': balance}]
            partition_key = [tenantId, account_id]
            print(f"MCP Server: Using partition_key: {partition_key}")
            print(f"MCP Server: Using operations: {operations}")
            print(f"MCP Server: Using item (document ID): {account_document_id}")
            
            account_container.patch_item(item=account_document_id, partition_key=partition_key, patch_operations=operations)
            print(f"[DEBUG] MCP Server: Account record patched successfully: {account_id}")
        else:
            print(f"MCP Server: No account found with accountId={account_id} and tenantId={tenantId}")
            raise Exception(f"Account {account_id} not found")
            
    except Exception as e:
        print(f"[ERROR] MCP Server: Error patching account record: {e}")
        print(f"[ERROR] MCP Server: Exception type: {type(e)}")
        print(f"[ERROR] MCP Server: Exception args: {e.args}")
        raise e

def fetch_transactions_by_date_range(accountId: str, startDate: datetime, endDate: datetime) -> List[Dict]:
    """
    Retrieve the transaction history for a specific account between two dates.

    :param accountId: The ID of the account to retrieve transactions for.
    :param startDate: The start date for the transaction history.
    :param endDate: The end date for the transaction history.
    :return: A list of transactions within the specified date range.
    """
    query = """
    SELECT * FROM c
    WHERE c.accountId = @accountId AND c.transactionDateTime >= @startDate AND c.transactionDateTime <= @endDate
    AND c.type = "BankTransaction"
    ORDER BY c.transactionDateTime ASC
    """
    parameters = [
        {"name": "@accountId", "value": accountId},
        {"name": "@startDate", "value": startDate.isoformat() + "Z"},
        {"name": "@endDate", "value": endDate.isoformat() + "Z"}
    ]
    transactions = list(
        account_container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
    return transactions

def create_transaction_record(transaction_data):
    try:
        account_container.upsert_item(transaction_data)
        print(f"[DEBUG] MCP Server: Transaction record created")
    except Exception as e:
        print(f"[ERROR] MCP Server: Error creating transaction record: {e}")
        raise e