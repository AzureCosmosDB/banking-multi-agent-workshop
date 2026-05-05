# Build a Multi-Agent Workshop

**[Home](Home.md)** - **[Prerequisites - Deployment and Setup >](./Module-00.md)**

## Learning Path

The workshop follows a progressive learning path with the following Modules

- [Module 0: Deployment and Project Setup](Module-00.md)
- [Module 1: Creating Your First Agent](Module-01.md)
- [Module 2: Connecting Agents to Memory](Module-02.md)
- [Module 3: Agent Specialization](Module-03.md)
- [Module 4: Multi-Agent Orchestration](Module-04.md)
- [Module 5: Converting to Model Context Protocol (MCP)](Module-05.md)
- [Module 6: Bonus - Build Your Own Multi-Agent App with AI](Module-06.md)
- [Module 7: Lessons Learned, Agent Futures, Q&A](Module-07.md)

## Clean up

If done with workshop or sample application you can deprovision any Azure Services used.

Open a terminal and navigate to the /infra directory in this solution.

:bulb: The --force and --purge switches are required to delete the deployed Azure OpenAI models.

Type azd down.

```bash
azd down --force --purge
```
