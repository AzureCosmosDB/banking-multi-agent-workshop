from langchain_openai import ChatOpenAI

from openai import OpenAI

# tested with LM Studio 1.2.0 and Qwen2.5-7b-instruct model
# Ensure you have the LM Studio server running and the model loaded
# replace imports with local model imports:
# from src.app.services.local_model import model (in banking_agents.py and banking_agents_api.py)
# from src.app.services.local_model import generate_embedding (in sales.py)


model = ChatOpenAI(
    model_name="qwen2.5-7b-instruct",
    openai_api_base="http://172.26.208.1:1234/v1",
    openai_api_key="lm-studio",  # Arbitrary, just needs to be set
    temperature=0,
    max_tokens=1024,
)

client = OpenAI(
    base_url="http://localhost:1235/v1",  # LM Studio embedding model
    api_key="lm-studio"
)

def generate_embedding(text):
    response = client.embeddings.create(
        input=text,
        model="nomic-embed-text-v1.5"
    )
    return response.data[0].embedding

