from pydantic import BaseModel, Field
import uuid
from langgraph.graph import StateGraph, MessagesState, START, END
from typing import Literal, List, Optional
from fastapi import FastAPI, HTTPException
from chat_history import fetch_conversation_messages, save_message_to_cosmos
from banking_agents import get_compiled_graph
import settings

# Initialize FastAPI
app = FastAPI()

# Conversation model
class ConversationRequest(BaseModel):
    conversation_id: Optional[str] = None
    user_message: str

compiled_graph = get_compiled_graph()
print("[DEBUG] State graph compiled successfully.")

@app.post("/conversation")
def conversation(request: ConversationRequest):
    """Handle both new and existing conversations."""
    # Create a new conversation if no conversation_id is provided
    if not request.conversation_id:
        settings.CURRENT_CONVERSATION_ID = str(uuid.uuid4())
        print(f"[DEBUG] Starting a new conversation with ID: {settings.CURRENT_CONVERSATION_ID}")
        initial_message = {"role": "user", "content": request.user_message}
    else:
        settings.CURRENT_CONVERSATION_ID = request.conversation_id
        print(f"[DEBUG] Continuing conversation with ID: {settings.CURRENT_CONVERSATION_ID}")

    # Fetch messages for existing conversations
    try:
        print(f"[DEBUG] Fetching messages for conversation_id: {settings.CURRENT_CONVERSATION_ID}")
        messages = fetch_conversation_messages(settings.CURRENT_CONVERSATION_ID)
    except Exception as e:
        print(f"[ERROR] Error fetching conversation messages: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")

    # Reconstruct the state
    try:
        state = MessagesState(messages=messages)
        print(f"[DEBUG] Reconstructed state: {state}")
        state["messages"].append({"role": "user", "content": request.user_message})
        save_message_to_cosmos(settings.CURRENT_CONVERSATION_ID, state["messages"][-1])  # Save the user's message
    except Exception as e:
        print(f"[ERROR] Error reconstructing state or saving user message: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating state: {str(e)}")

    all_responses = []  # To accumulate all processed messages
    try:
        for event in compiled_graph.stream(state):
            print(f"[DEBUG] Processing graph event: {event}")
            for value in event.values():
                # Validate that 'messages' is present and is a list
                if "messages" not in value or not isinstance(value["messages"], list):
                    print(f"[ERROR] Invalid 'messages' format: {value}")
                    raise TypeError("Expected 'messages' to be a list in the graph response.")

                # Ensure the list is not empty before accessing the last element
                if not value["messages"]:
                    print(f"[ERROR] 'messages' is empty: {value}")
                    raise ValueError("The 'messages' list in the graph response is empty.")

                # Save and debug the response
                response_message = value["messages"][-1]
                print(f"[DEBUG] Processed event with message: {response_message}")
                all_responses.append(response_message)  # Accumulate the response
    except Exception as e:
        print(f"[ERROR] Error during graph execution: {e}")
        raise HTTPException(status_code=500, detail=f"Error during conversation: {str(e)}")

    print(f"[DEBUG] All responses: {all_responses}")
    return {"conversation_id": settings.CURRENT_CONVERSATION_ID, "responses": all_responses}
