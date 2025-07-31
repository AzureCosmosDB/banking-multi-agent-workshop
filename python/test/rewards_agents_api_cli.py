import requests

BASE_URL = "http://127.0.0.1:8000"  # Update if hosted elsewhere.
TENANT_ID = "test_tenant"  # Replace with actual tenant ID if needed.
USER_ID = "test_user"  # Replace with actual user ID if needed.

def create_session():
    response = requests.post(f"{BASE_URL}/tenant/{TENANT_ID}/user/{USER_ID}/sessions")
    if response.status_code == 200:
        return response.json().get("sessionId")
    else:
        print(f"Failed to create session: {response.json()}.")
        return None

def send_message(session_id, user_message):
    headers = {"Content-Type": "application/json"}
    response = requests.post(
        f"{BASE_URL}/tenant/{TENANT_ID}/user/{USER_ID}/sessions/{session_id}/completion",
        data=f'"{user_message}"',
        headers=headers
    )

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error in response: {response.json()}.")
        return []

def delete_session(session_id):
    response = requests.delete(f"{BASE_URL}/tenant/{TENANT_ID}/user/{USER_ID}/sessions/{session_id}")
    if response.status_code == 200:
        print("Session deleted successfully.")
    else:
        print(f"Failed to delete session: {response.json()}.")

def main():
    print("Interactive Zava Rewards Assistant Shell")
    print("Type 'exit' to end the conversation and DELETE the session.")

    session_id = create_session()
    if not session_id:
        print("Failed to start a session. Exiting.")
        return

    while True:
        user_message = input("You: ")
        if user_message.lower() == "exit":
            delete_session(session_id)
            print("Exiting the conversation. Goodbye!")
            break

        responses = send_message(session_id, user_message)

        for message in responses:
            sender = message.get("senderRole", "unknown")
            if sender != "user":
                text = message.get("text", "[No response received]")
                print(f"{sender}: {text}")

if __name__ == "__main__":
    main()