import os
import unittest
from unittest.mock import patch

from azure.core.credentials import AccessToken
from langchain_core.messages import ToolMessage


class MCPHandoffTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        env = {
            "COSMOSDB_ENDPOINT": "https://example.invalid",
            "AZURE_OPENAI_ENDPOINT": "https://example.invalid",
            "AZURE_OPENAI_COMPLETIONSDEPLOYMENTID": "offline",
        }
        with (
            patch.dict(os.environ, env),
            patch("azure.cosmos.CosmosClient"),
            patch("azure.identity.DefaultAzureCredential.get_token", return_value=AccessToken("offline", 0)),
        ):
            from src.app import banking_agents

        cls.agents = banking_agents

    def test_handoff_reads_mcp_text_without_a_cosmos_lookup(self):
        payload = '{"goto":"sales_agent"}'
        for content in (payload, [{"type": "text", "text": payload}]):
            with self.subTest(content=content), patch.object(self.agents.chat_container, "read_item") as read_item:
                message = ToolMessage(content=content, tool_call_id="handoff")
                result = self.agents.get_active_agent({"messages": [message]}, {"configurable": {}})
                self.assertEqual(result, "sales_agent")
                read_item.assert_not_called()

    def test_graph_displays_command_and_conditional_destinations(self):
        edges = self.agents.graph.get_graph().edges
        targets = {edge.target for edge in edges if edge.source == "coordinator_agent"}
        self.assertTrue({"human", "sales_agent", "transactions_agent", "customer_support_agent"} <= targets)
