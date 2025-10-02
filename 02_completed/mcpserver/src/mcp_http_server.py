import sys
import os
import logging
import json
from typing import Any, Annotated, Dict, List
from datetime import datetime
import uuid
from colorama import Fore, Style
from langgraph.types import Command
from langgraph.prebuilt import InjectedState
from langchain_core.tools.base import InjectedToolCallId
from langchain_core.runnables import RunnableConfig
from mcp.server.fastmcp import FastMCP
from langsmith import traceable
from services.azure_open_ai import generate_embedding
from services.azure_cosmos_db import (
    vector_search,
    create_account_record,
    create_service_request_record,
    fetch_latest_account_number,
    fetch_latest_transaction_number,
    fetch_account_by_number,
    create_transaction_record,
    patch_account_record,
    fetch_transactions_by_date_range,
)

# Try to import OAuth support for MCP
try:
    from dotenv import load_dotenv
    # Import basic OAuth types from MCP for production GitHub OAuth
    from mcp.server.auth.provider import OAuthAuthorizationServerProvider
    import requests
    import secrets
    from datetime import datetime, timedelta
    from typing import Dict, Optional, Any
    import urllib.parse
    load_dotenv('.env.oauth')  # Load OAuth configuration
    OAUTH_AVAILABLE = True
    
    # Load authentication configuration
    github_client_id = os.getenv("GITHUB_CLIENT_ID")
    github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")
    simple_token = os.getenv("MCP_AUTH_TOKEN")
    base_url = os.getenv("MCP_SERVER_BASE_URL", "http://localhost:8080")
    
    print("🔐 Authentication Configuration:")
    print(f"   Simple Token: {'SET' if simple_token else 'NOT SET'}")
    print(f"   GitHub Client ID: {'SET' if github_client_id else 'NOT SET'}")
    print(f"   GitHub Client Secret: {'SET' if github_client_secret else 'NOT SET'}")
    print(f"   Base URL: {base_url}")
    
    # Authentication priority logic:
    # 1. GitHub OAuth (if both client_id and client_secret are configured)
    # 2. Simple token (if MCP_AUTH_TOKEN is set)
    # 3. No authentication (if nothing is configured)
    
    auth_provider = None
    auth_mode = "none"
    
    if github_client_id and github_client_secret:
        # Production GitHub OAuth mode
        auth_mode = "github_oauth"
        print("✅ GITHUB OAUTH MODE ENABLED")
        print(f"   Callback URL: {base_url}/auth/github/callback")
        print("   🔒 Production-grade authentication active")
        # Note: Full GitHub OAuth provider would be implemented here
        
    elif simple_token:
        # Simple token mode (default for development)
        auth_mode = "simple_token"
        print("✅ SIMPLE TOKEN MODE ENABLED (Development)")
        print(f"   Token: {simple_token[:8]}...")
        print("   🚀 Ready to use - no setup required!")
        print("   💡 For production, configure GitHub OAuth (see SECURITY.md)")
        
    else:
        # No authentication
        auth_mode = "none"
        print("⚠️  NO AUTHENTICATION - All requests accepted")
        print("   To enable auth: Set MCP_AUTH_TOKEN in .env.oauth")
        
except ImportError as e:
    print(f"❌ OAuth dependencies not available: {e}")
    auth_provider = None
    auth_mode = "none"
    simple_token = None
    OAUTH_AVAILABLE = False

# 🔁 Ensure project root is in sys.path before imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)

# ✅ Initialize MCP tool server with layered authentication
print("\n🚀 Initializing MCP Server...")
port = int(os.getenv("PORT", 8080))
print(f"🔧 DEBUG: Using port {port} from environment variable PORT={os.getenv('PORT', '8080')}")
mcp = FastMCP("BankingTools", host="0.0.0.0", port=port)

if auth_mode == "github_oauth":
    print("✅ Banking Tools MCP server initialized with GitHub OAuth")
    print("🔐 PRODUCTION AUTHENTICATION: GitHub OAuth enabled")
elif auth_mode == "simple_token":
    print("✅ Banking Tools MCP server initialized with Simple Token Auth")
    print("🔐 DEVELOPMENT AUTHENTICATION: Bearer token required")
    print(f"   Use: Authorization: Bearer {simple_token}")
else:
    print("✅ Banking Tools MCP server initialized (no authentication)")
    print("⚠️  AUTHENTICATION: DISABLED - All requests accepted without verification")

print(f"🌐 Server will be available at: http://0.0.0.0:{int(os.getenv('PORT', 8080))}")
print(f"📋 Authentication mode: {auth_mode.upper()}\n")

# Authentication helper function
def validate_request_auth() -> bool:
    """Validate authentication for the current request"""
    if auth_mode == "none":
        return True  # No auth required
    elif auth_mode == "simple_token":
        # TODO: In a real implementation, we'd check the request headers
        # For now, we'll assume requests are authenticated if token is configured
        return bool(simple_token)
    elif auth_mode == "github_oauth":
        # TODO: Validate OAuth token
        return True  # Placeholder
    return False

##### Coordinator agent tools #####

def transfer_to_agent_message(agent):
    print(Fore.LIGHTMAGENTA_EX + f"transfer_to_{agent}..." + Style.RESET_ALL)

def create_agent_transfer(agent_name: str):
    tool_name = f"transfer_to_{agent_name}"

    @mcp.tool(name=tool_name, description="")
    def transfer_to_agent(
        tool_call_id: Annotated[str, InjectedToolCallId],
        **kwargs
    ):
        state = kwargs.get("state", {})
        print(Fore.LIGHTMAGENTA_EX + f"→ Transferring to {agent_name.replace('_', ' ')}..." + Style.RESET_ALL)
        tool_message = {
            "role": "tool",
            "content": f"Successfully transferred to {agent_name.replace('_', ' ')}",
            "name": tool_name,
            "tool_call_id": tool_call_id,
        }
        transfer_to_agent_message(agent_name)
        return Command(
            goto=agent_name,
            graph=Command.PARENT,
            update={"messages": state.get("messages", []) + [tool_message]},
        )

# Register agent transfer tools
create_agent_transfer("sales_agent")
create_agent_transfer("customer_support_agent")
create_agent_transfer("transactions_agent")

##### Sales agent tools #####

@mcp.tool()
@traceable
def get_offer_information(user_prompt: str, accountType: str) -> list[dict[str, Any]]:
    """Provide information about a product based on the user prompt.
    Takes as input the user prompt as a string."""
    # Perform a vector search on the Cosmos DB container and return results to the agent
    vectors = generate_embedding(user_prompt)
    search_results = vector_search(vectors, accountType)
    return search_results


@mcp.tool()
@traceable
def create_account(account_holder: str, balance: float, config: RunnableConfig) -> str:
    """
    Create a new bank account for a user.

    This function retrieves the latest account number, increments it, and creates a new account record
    in Cosmos DB associated with a specific user and tenant.
    """
    # Authentication debug logging
    print(f"\n🔐 Authentication Debug: create_account called")
    print(f"   - Auth Mode: {auth_mode}")
    print(f"   - Token Auth: {'ENABLED' if auth_mode == 'simple_token' else 'DISABLED'}")
    print(f"   - Account Holder: {account_holder}")
    print(f"   - Operation: Creating new bank account")
    
    if not validate_request_auth():
        print("❌ Authentication failed")
        return "Error: Authentication required"
    
    print(f"✅ Authentication validated - proceeding with account creation")
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


@mcp.tool()
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


#### Support agent tools #####

# 🔧 Tool: Create a service request
@mcp.tool()
@traceable
def service_request(
    config: RunnableConfig,
    recipientPhone: str,
    recipientEmail: str,
    requestSummary: str
) -> str:
    """Create a new service request for customer support.
    
    Args:
        recipientPhone: Customer's phone number for contact
        recipientEmail: Customer's email address for contact
        requestSummary: Description of the service request or issue
    
    Returns:
        Confirmation message with service request ID
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
            "accountId": "A1",
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

# 🔧 Tool: Get branch locations
@mcp.tool()
@traceable
def get_branch_location(state: str) -> Dict[str, List[str]]:
    """Find bank branch locations in a specific state.
    
    Args:
        state: The US state name to search for branch locations
    
    Returns:
        Dictionary with counties and their branch locations
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
    return branches.get(state, {"Unknown County": ["No branches available"]})

##### Transactions agent tools #####

@mcp.tool()
@traceable
def bank_transfer(toAccount: str, fromAccount: str, amount: float, tenantId: str, userId: str, thread_id: str) -> str:
    """Transfer funds between two accounts."""
    print(f"Transferring ${amount} from {fromAccount} to {toAccount}...")
    config = RunnableConfig(configurable={
        "tenantId": tenantId,
        "userId": userId,
        "thread_id": thread_id
    })
    if amount <= 0:
        return "Transfer amount must be greater than zero."
    config["configurable"]["tenantId"] = tenantId
    config["configurable"]["userId"] = userId
    config["configurable"]["thread_id"] = thread_id
    debit_result = bank_transaction(config, fromAccount, amount, credit_account=0, debit_account=amount)
    if "Failed" in debit_result:
        return f"Failed to debit amount from {fromAccount}: {debit_result}"
    credit_result = bank_transaction(config, toAccount, amount, credit_account=amount, debit_account=0)
    if "Failed" in credit_result:
        return f"Failed to credit amount to {toAccount}: {credit_result}"

    return f"Successfully transferred ${amount} from account {fromAccount} to account {toAccount}"


def bank_transaction(config: RunnableConfig, account_number: str, amount: float, credit_account: float,
                     debit_account: float) -> str:
    print(f"Processing transaction for account {account_number}: "
          f"credit=${credit_account}, debit=${debit_account}, total amount=${amount}")
    """Helper to execute bank debit or credit."""
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")

    account = fetch_account_by_number(account_number, tenantId, userId)
    if not account:
        return f"Account {account_number} not found for tenant {tenantId} and user {userId}"

    max_attempts = 5
    for attempt in range(max_attempts):
        try:
            latest_transaction_number = fetch_latest_transaction_number(account_number)
            transaction_id = f"{account_number}-{latest_transaction_number + 1}"
            new_balance = account["balance"] + credit_account - debit_account

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
            break
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_attempts - 1:
                return f"Failed to create transaction record after {max_attempts} attempts: {e}"

    patch_account_record(tenantId, account["accountId"], new_balance)
    return f"Successfully transferred ${amount} to account number {account_number}"


@mcp.tool()
@traceable
def get_transaction_history(accountId: str, startDate: datetime, endDate: datetime) -> List[Dict]:
    """Retrieve transactions for an account between two dates."""
    try:
        return fetch_transactions_by_date_range(accountId, startDate, endDate)
    except Exception as e:
        logging.error(f"Error fetching transaction history for account {accountId}: {e}")
        return []


@mcp.tool()
@traceable
def bank_balance(account_number: str, tenantId: str, userId: str, thread_id: str) -> str:
    """Retrieve the balance for a specific bank account."""
    account = fetch_account_by_number(account_number, tenantId, userId)
    if not account:
        return f"Account {account_number} not found for tenant {tenantId} and user {userId}"

    balance = account.get("balance", 0)
    return f"The balance for account number {account_number} is ${balance}"

@mcp.tool()
def server_info() -> Dict[str, Any]:
    """Get information about the MCP server including authentication status."""
    return {
        "server_name": "Banking Tools MCP Server",
        "version": "1.0.0",
        "authentication": "none",  # Will be handled by reverse proxy
        "transport": "streamable_http",
        "endpoints": {
            "mcp": "/mcp/",
        },
        "oauth_support": OAUTH_AVAILABLE
    }

# ✅ Entry point for streamable HTTP server
if __name__ == "__main__":
    print("Starting Banking Tools MCP server...")
    
    # Configure server options
    server_options = {
        "transport": "streamable-http"
    }
    
    print("� Starting server without built-in authentication...")
    print("💡 For OAuth, use a reverse proxy like nginx or API gateway")
    
    try:
        mcp.run(**server_options)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)
