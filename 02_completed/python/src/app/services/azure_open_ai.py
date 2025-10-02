import json
import logging
import os
import time
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
    start_time = time.time()
    print(f"⏱️  AZURE_OPENAI: Starting embedding generation for {len(text)} chars")
    
    response = aoai_client.embeddings.create(input=text, model=os.getenv("AZURE_OPENAI_EMBEDDINGDEPLOYMENTID"))
    
    duration_ms = (time.time() - start_time) * 1000
    print(f"⏱️  AZURE_OPENAI: Embedding API call took {duration_ms:.2f}ms")
    
    json_response = response.model_dump_json(indent=2)
    parsed_response = json.loads(json_response)
    embedding = parsed_response['data'][0]['embedding']
    
    total_duration_ms = (time.time() - start_time) * 1000
    print(f"⏱️  AZURE_OPENAI: Total embedding processing took {total_duration_ms:.2f}ms, returned {len(embedding)} dimensions")
    
    return embedding


# Fetch AD Token
azure_ad_token = get_azure_ad_token()

try:
    azure_openai_api_version = "2023-05-15"
    azure_deployment_name = os.getenv("AZURE_OPENAI_COMPLETIONSDEPLOYMENTID")
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


def get_openai_client():
    """Return the initialized Azure OpenAI client"""
    return aoai_client


def get_cosmos_client():
    """Return the initialized Cosmos client (imported from azure_cosmos_db)"""
    from src.app.services.azure_cosmos_db import cosmos_client
    return cosmos_client
