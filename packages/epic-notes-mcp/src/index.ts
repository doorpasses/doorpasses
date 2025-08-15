import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Get API key from command line arguments
const API_KEY = process.argv[2];
if (!API_KEY) {
  console.error("Error: API key is required");
  console.error("Usage: npx epic-notes-mcp <api-key>");
  process.exit(1);
}

const SERVER_URL = "http://localhost:3001/api/mcp-tools";

// Create a proxy server
const server = new McpServer(
  {
    name: "epic-notes-proxy",
    title: "Epic Notes Proxy",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
    instructions: "Lets you connect to Epic Notes system",
  }
);

// Helper to call the simplified API
async function callRemoteTool(toolName: string, args: Record<string, any>) {
  try {
    const response = await fetch(`${SERVER_URL}?apiKey=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: toolName,
        args: args,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HTTP Error:", response.status, errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const result = await response.json() as any;

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error: any) {
    console.error(`Error calling ${toolName}:`, error);
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
    };
  }
}

// Add an addition tool
server.registerTool(
  "find_user",
  {
    title: "Find users",
    description:
      "Search for users in your organization by their name or username",
    inputSchema: { query: z.string() },
  },
  async ({ query }: { query: string }) => callRemoteTool("find_user", { query })
);

//Register tools using registerTool with Zod schemas
server.registerTool(
  "get_user_notes",
  {
    title: "Get notes",
    description: "Get the notes for a user in your organization",
    inputSchema: { username: z.string() },
  },
  async ({ username }) => callRemoteTool("get_user_notes", { username })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Failed to start MCP proxy:", error);
  process.exit(1);
});
