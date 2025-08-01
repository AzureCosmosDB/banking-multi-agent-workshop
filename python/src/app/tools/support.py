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
    branches = {
        "Alabama": {"Jefferson County": ["Zava Rewards Center - Birmingham", "Zava Premium - Hoover"],
                    "Mobile County": ["Zava Rewards Center - Mobile", "Zava Premium - Prichard"]},
        "Alaska": {"Anchorage": ["Zava Rewards Center - Anchorage", "Zava Premium - Eagle River"],
                   "Fairbanks North Star Borough": ["Zava Rewards Center - Fairbanks", "Zava Premium - North Pole"]},
        "Arizona": {"Maricopa County": ["Zava Rewards Center - Phoenix", "Zava Premium - Scottsdale"],
                    "Pima County": ["Zava Rewards Center - Tucson", "Zava Premium - Oro Valley"]},
        "Arkansas": {"Pulaski County": ["Zava Rewards Center - Little Rock", "Zava Premium - North Little Rock"],
                     "Benton County": ["Zava Rewards Center - Bentonville", "Zava Premium - Rogers"]},
        "California": {"Los Angeles County": ["Zava Rewards Center - Los Angeles", "Zava Premium - Long Beach"],
                       "San Diego County": ["Zava Rewards Center - San Diego", "Zava Premium - Chula Vista"]},
        "Colorado": {"Denver County": ["Zava Rewards Center - Denver", "Zava Premium - Aurora"],
                     "El Paso County": ["Zava Rewards Center - Colorado Springs", "Zava Premium - Fountain"]},
        "Connecticut": {"Fairfield County": ["Zava Rewards Center - Bridgeport", "Zava Premium - Stamford"],
                        "Hartford County": ["Zava Rewards Center - Hartford", "Zava Premium - New Britain"]},
        "Delaware": {"New Castle County": ["Zava Rewards Center - Wilmington", "Zava Premium - Newark"],
                     "Sussex County": ["Zava Rewards Center - Seaford", "Zava Premium - Lewes"]},
        "Florida": {"Miami-Dade County": ["Zava Rewards Center - Miami", "Zava Premium - Hialeah"],
                    "Orange County": ["Zava Rewards Center - Orlando", "Zava Premium - Winter Park"]},
        "Georgia": {"Fulton County": ["Zava Rewards Center - Atlanta", "Zava Premium - Sandy Springs"],
                    "Cobb County": ["Zava Rewards Center - Marietta", "Zava Premium - Smyrna"]},
        "Hawaii": {"Honolulu County": ["Zava Rewards Center - Honolulu", "Zava Premium - Pearl City"],
                   "Maui County": ["Zava Rewards Center - Kahului", "Zava Premium - Lahaina"]},
        "Idaho": {"Ada County": ["Zava Rewards Center - Boise", "Zava Premium - Meridian"],
                  "Canyon County": ["Zava Rewards Center - Nampa", "Zava Premium - Caldwell"]},
        "Illinois": {"Cook County": ["Zava Rewards Center - Chicago", "Zava Premium - Evanston"],
                     "DuPage County": ["Zava Rewards Center - Naperville", "Zava Premium - Wheaton"]},
        "Indiana": {"Marion County": ["Zava Rewards Center - Indianapolis", "Zava Premium - Lawrence"],
                    "Lake County": ["Zava Rewards Center - Gary", "Zava Premium - Hammond"]},
        "Iowa": {"Polk County": ["Zava Rewards Center - Des Moines", "Zava Premium - West Des Moines"],
                 "Linn County": ["Zava Rewards Center - Cedar Rapids", "Zava Premium - Marion"]},
        "Kansas": {"Sedgwick County": ["Zava Rewards Center - Wichita", "Zava Premium - Derby"],
                   "Johnson County": ["Zava Rewards Center - Overland Park", "Zava Premium - Olathe"]},
        "Kentucky": {"Jefferson County": ["Zava Rewards Center - Louisville", "Zava Premium - Jeffersontown"],
                     "Fayette County": ["Zava Rewards Center - Lexington", "Zava Premium - Nicholasville"]},
        "Louisiana": {"Orleans Parish": ["Zava Rewards Center - New Orleans", "Zava Premium - Metairie"],
                      "East Baton Rouge Parish": ["Zava Rewards Center - Baton Rouge", "Zava Premium - Zachary"]},
        "Maine": {"Cumberland County": ["Zava Rewards Center - Portland", "Zava Premium - South Portland"],
                  "Penobscot County": ["Zava Rewards Center - Bangor", "Zava Premium - Brewer"]},
        "Maryland": {"Baltimore County": ["Zava Rewards Center - Baltimore", "Zava Premium - Towson"],
                     "Montgomery County": ["Zava Rewards Center - Rockville", "Zava Premium - Bethesda"]},
        "Massachusetts": {"Suffolk County": ["Zava Rewards Center - Boston", "Zava Premium - Revere"],
                          "Worcester County": ["Zava Rewards Center - Worcester", "Zava Premium - Leominster"]},
        "Michigan": {"Wayne County": ["Zava Rewards Center - Detroit", "Zava Premium - Dearborn"],
                     "Oakland County": ["Zava Rewards Center - Troy", "Zava Premium - Farmington Hills"]},
        "Minnesota": {"Hennepin County": ["Zava Rewards Center - Minneapolis", "Zava Premium - Bloomington"],
                      "Ramsey County": ["Zava Rewards Center - Saint Paul", "Zava Premium - Maplewood"]},
        "Mississippi": {"Hinds County": ["Zava Rewards Center - Jackson", "Zava Premium - Clinton"],
                        "Harrison County": ["Zava Rewards Center - Gulfport", "Zava Premium - Biloxi"]},
        "Missouri": {"Jackson County": ["Zava Rewards Center - Kansas City", "Zava Premium - Independence"],
                     "St. Louis County": ["Zava Rewards Center - St. Louis", "Zava Premium - Florissant"]},
        "Montana": {"Yellowstone County": ["Zava Rewards Center - Billings", "Zava Premium - Laurel"],
                    "Missoula County": ["Zava Rewards Center - Missoula", "Zava Premium - Lolo"]},
        "Nebraska": {"Douglas County": ["Zava Rewards Center - Omaha", "Zava Premium - Bellevue"],
                     "Lancaster County": ["Zava Rewards Center - Lincoln", "Zava Premium - Waverly"]},
        "Nevada": {"Clark County": ["Zava Rewards Center - Las Vegas", "Zava Premium - Henderson"],
                   "Washoe County": ["Zava Rewards Center - Reno", "Zava Premium - Sparks"]},
        "New Hampshire": {"Hillsborough County": ["Zava Rewards Center - Manchester", "Zava Premium - Nashua"],
                          "Rockingham County": ["Zava Rewards Center - Portsmouth", "Zava Premium - Derry"]},
        "New Jersey": {"Essex County": ["Zava Rewards Center - Newark", "Zava Premium - East Orange"],
                       "Bergen County": ["Zava Rewards Center - Hackensack", "Zava Premium - Teaneck"]},
        "New Mexico": {"Bernalillo County": ["Zava Rewards Center - Albuquerque", "Zava Premium - Rio Rancho"],
                       "Santa Fe County": ["Zava Rewards Center - Santa Fe", "Zava Premium - Eldorado"]},
        "New York": {"New York County": ["Zava Rewards Center - Manhattan", "Zava Premium - Harlem"],
                     "Kings County": ["Zava Rewards Center - Brooklyn", "Zava Premium - Williamsburg"]},
        "North Carolina": {"Mecklenburg County": ["Zava Rewards Center - Charlotte", "Zava Premium - Matthews"],
                           "Wake County": ["Zava Rewards Center - Raleigh", "Zava Premium - Cary"]},
        "North Dakota": {"Cass County": ["Zava Rewards Center - Fargo", "Zava Premium - West Fargo"],
                         "Burleigh County": ["Zava Rewards Center - Bismarck", "Zava Premium - Lincoln"]},
        "Ohio": {"Cuyahoga County": ["Zava Rewards Center - Cleveland", "Zava Premium - Parma"],
                 "Franklin County": ["Zava Rewards Center - Columbus", "Zava Premium - Dublin"]},
        "Oklahoma": {"Oklahoma County": ["Zava Rewards Center - Oklahoma City", "Zava Premium - Edmond"],
                     "Tulsa County": ["Zava Rewards Center - Tulsa", "Zava Premium - Broken Arrow"]},
        "Oregon": {"Multnomah County": ["Zava Rewards Center - Portland", "Zava Premium - Gresham"],
                   "Lane County": ["Zava Rewards Center - Eugene", "Zava Premium - Springfield"]},
        "Pennsylvania": {"Philadelphia County": ["Zava Rewards Center - Philadelphia", "Zava Premium - Germantown"],
                         "Allegheny County": ["Zava Rewards Center - Pittsburgh", "Zava Premium - Bethel Park"]},
        "Rhode Island": {"Providence County": ["Zava Rewards Center - Providence", "Zava Premium - Cranston"],
                         "Kent County": ["Zava Rewards Center - Warwick", "Zava Premium - Coventry"]},
        "South Carolina": {"Charleston County": ["Zava Rewards Center - Charleston", "Zava Premium - Mount Pleasant"],
                           "Richland County": ["Zava Rewards Center - Columbia", "Zava Premium - Forest Acres"]},
        "South Dakota": {"Minnehaha County": ["Zava Rewards Center - Sioux Falls", "Zava Premium - Brandon"],
                         "Pennington County": ["Zava Rewards Center - Rapid City", "Zava Premium - Box Elder"]},
        "Tennessee": {"Davidson County": ["Zava Rewards Center - Nashville", "Zava Premium - Antioch"],
                      "Shelby County": ["Zava Rewards Center - Memphis", "Zava Premium - Bartlett"]},
        "Texas": {"Harris County": ["Zava Rewards Center - Houston", "Zava Premium - Pasadena"],
                  "Dallas County": ["Zava Rewards Center - Dallas", "Zava Premium - Garland"]},
        "Utah": {"Salt Lake County": ["Zava Rewards Center - Salt Lake City", "Zava Premium - West Valley City"],
                 "Utah County": ["Zava Rewards Center - Provo", "Zava Premium - Orem"]},
        "Vermont": {"Chittenden County": ["Zava Rewards Center - Burlington", "Zava Premium - South Burlington"],
                    "Rutland County": ["Zava Rewards Center - Rutland", "Zava Premium - Killington"]},
        "Virginia": {"Fairfax County": ["Zava Rewards Center - Fairfax", "Zava Premium - Reston"],
                     "Virginia Beach": ["Zava Rewards Center - Virginia Beach", "Zava Premium - Chesapeake"]},
        "Washington": {"King County": ["Zava Rewards Center - Seattle", "Zava Premium - Bellevue"],
                       "Pierce County": ["Zava Rewards Center - Tacoma", "Zava Premium - Lakewood"]},
        "West Virginia": {"Kanawha County": ["Zava Rewards Center - Charleston", "Zava Premium - South Charleston"],
                          "Berkeley County": ["Zava Rewards Center - Martinsburg", "Zava Premium - Hedgesville"]},
        "Wisconsin": {"Milwaukee County": ["Zava Rewards Center - Milwaukee", "Zava Premium - Wauwatosa"],
                      "Dane County": ["Zava Rewards Center - Madison", "Zava Premium - Fitchburg"]},
        "Wyoming": {"Laramie County": ["Zava Rewards Center - Cheyenne", "Zava Premium - Ranchettes"],
                    "Natrona County": ["Zava Rewards Center - Casper", "Zava Premium - Mills"]}
    }

    return branches.get(state, {"Unknown County": ["No branches available", "No branches available"]})
