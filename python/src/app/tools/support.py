import logging
import uuid
from datetime import datetime
from typing import Dict, List

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langsmith import traceable

from src.app.services.azure_cosmos_db import create_service_request_record


@tool
@traceable
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


@tool
@traceable
def get_branch_location(state: str) -> Dict[str, List[str]]:
    """
    Get location of Zava Rewards Center branches for a given state in the USA.

    :param state: The name of the state.
    :return: A dictionary with county names as keys and lists of branch names as values.
    """
    # Group branches by US census regions, then flatten to a state->counties mapping
    regions = {
        "US Northeast": {
            "US Northeast": {"Contact": ["support-northeast@zava.com", "1-800-800-0001"]}
        },
        "Midwest": {
            "Midwest": {"Contact": ["support-midwest@zava.com", "1-800-800-0002"]}
        },
        "South": {
            "South": {"Contact": ["support-south@zava.com", "1-800-800-0003"]}
        },
        "West": {
            "West": {"Contact": ["support-west@zava.com", "1-800-800-0004"]}
        },
        "Canada Atlantic": {
            "Canada Atlantic": {"Contact": ["support-canada-atlantic@zava.com", "1-800-800-0101"]}
        },
        "Canada Central": {
            "Canada Central": {"Contact": ["support-canada-central@zava.com", "1-800-800-0102"]}
        },
        "Canada Prairie": {
            "Canada Prairie": {"Contact": ["support-canada-prairie@zava.com", "1-800-800-0103"]}
        },
        "Canada Pacific": {
            "Canada Pacific": {"Contact": ["support-canada-pacific@zava.com", "1-800-800-0104"]}
        },
        "Canada Northern": {
            "Canada Northern": {"Contact": ["support-canada-northern@zava.com", "1-800-800-0105"]}
        },
        "Mexico North": {
            "Mexico North": {"Contact": ["support-mexico-north@zava.com", "1-800-800-0201"]}
        },
        "Mexico Central": {
            "Mexico Central": {"Contact": ["support-mexico-central@zava.com", "1-800-800-0202"]}
        },
        "Mexico South": {
            "Mexico South": {"Contact": ["support-mexico-south@zava.com", "1-800-800-0203"]}
        },
    }

    # Flatten regions into a state->counties mapping for lookup by state
    branches = {}
    for region_states in regions.values():
        branches.update(region_states)

    return branches.get(state, {"Unknown County": ["No branches available", "No branches available"]})
