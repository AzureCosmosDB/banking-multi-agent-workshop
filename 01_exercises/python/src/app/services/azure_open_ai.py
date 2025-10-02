import json
import logging
import os
from azure.identity import DefaultAzureCredential, ManagedIdentityCredential
from dotenv import load_dotenv
from langchain_openai import AzureChatOpenAI
from openai import AzureOpenAI

load_dotenv(override=False)

# Use DefaultAzureCredential to get a token
def get_azure_ad_token():
    try:
        credential = DefaultAzureCredential()
        token = credential.get_token("https://cognitiveservices.azure.com/.default")

        print("[DEBUG] Retrieved Azure AD token successfully using DefaultAzureCredential.")
    except Exception as e:
        print(f"[ERROR] Failed to retrieve Azure AD token: {e}")
        raise e
    return token.token


def generate_embedding(text):
    response = aoai_client.embeddings.create(input=text, model=os.getenv("AZURE_OPENAI_EMBEDDINGDEPLOYMENTID"))
    json_response = response.model_dump_json(indent=2)
    parsed_response = json.loads(json_response)
    return parsed_response['data'][0]['embedding']


# Fetch AD Token
azure_ad_token = get_azure_ad_token()

try:
    azure_openai_api_version = "2023-05-15"
    azure_deployment_name = model=os.getenv("AZURE_OPENAI_COMPLETIONSDEPLOYMENTID")
    model = AzureChatOpenAI(
        azure_deployment=azure_deployment_name,
        api_version=azure_openai_api_version,
        temperature=0,
        azure_ad_token=azure_ad_token
    )
    aoai_client = AzureOpenAI(
        azure_ad_token=azure_ad_token,
        api_version="2024-09-01-preview",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )
    print("[DEBUG] Azure OpenAI model initialized successfully.")
except Exception as e:
    print(f"[ERROR] Error initializing Azure OpenAI model: {e}")
    raise e
