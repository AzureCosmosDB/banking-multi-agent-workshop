import json
import logging
import os
import time
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv(override=False)

# Global client variable
aoai_client = None

def get_azure_ad_token():
    try:
        credential = DefaultAzureCredential()
        token = credential.get_token("https://cognitiveservices.azure.com/.default")
        print("[DEBUG] MCP Server: Retrieved Azure AD token successfully using DefaultAzureCredential.")
        return token.token
    except Exception as e:
        print(f"[ERROR] MCP Server: Failed to retrieve Azure AD token: {e}")
        print("[WARN] MCP Server: Continuing without Azure AD authentication - some features may not work")
        return None

def initialize_openai_client():
    """Initialize the Azure OpenAI client"""
    global aoai_client
    
    if aoai_client is None:
        try:
            azure_ad_token = get_azure_ad_token()
            if azure_ad_token:
                aoai_client = AzureOpenAI(
                    azure_ad_token=azure_ad_token,
                    api_version="2024-09-01-preview",
                    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
                )
                print("[DEBUG] MCP Server: Azure OpenAI client initialized successfully.")
            else:
                print("[WARN] MCP Server: Skipping Azure OpenAI client initialization - no valid token")
        except Exception as e:
            print(f"[ERROR] MCP Server: Error initializing Azure OpenAI client: {e}")
            print("[WARN] MCP Server: Continuing without Azure OpenAI client - some features may not work")

# Initialize on import
try:
    initialize_openai_client()
except Exception as e:
    print(f"[WARN] MCP Server: Failed to initialize Azure OpenAI client during import: {e}")

def generate_embedding(text):
    if aoai_client is None:
        print("[ERROR] MCP Server: Azure OpenAI client not available - cannot generate embedding")
        return [0.0] * 1536  # Return dummy embedding vector
    
    start_time = time.time()
    print(f"⏱️  MCP AZURE_OPENAI: Starting embedding generation for {len(text)} chars")
    
    response = aoai_client.embeddings.create(input=text, model=os.getenv("AZURE_OPENAI_EMBEDDINGDEPLOYMENTID"))
    
    duration_ms = (time.time() - start_time) * 1000
    print(f"⏱️  MCP AZURE_OPENAI: Embedding API call took {duration_ms:.2f}ms")
    
    json_response = response.model_dump_json(indent=2)
    parsed_response = json.loads(json_response)
    embedding = parsed_response['data'][0]['embedding']
    
    total_duration_ms = (time.time() - start_time) * 1000
    print(f"⏱️  MCP AZURE_OPENAI: Total embedding processing took {total_duration_ms:.2f}ms, returned {len(embedding)} dimensions")
    
    return embedding

def get_openai_client():
    """Return the initialized Azure OpenAI client"""
    return aoai_client