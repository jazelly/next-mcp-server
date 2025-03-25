#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";;
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import * as router from './operations/router.js';
import { VERSION } from "./common/version.js";
import { resolvePort, resolveTransport, setupSSE } from "./setup.js";

const configureServer = (): Server => {
  const server = new Server(
    {
      name: "next-mcp-server",
      version: VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
  
  
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "get_routers_info",
          description: "Get Pages details in the Next.js app.",
          inputSchema: zodToJsonSchema(router.GetRoutersInfoSchema),
        },
      ],
    };
  });
  
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      switch (request.params.name) {
        case "get_routers_info": {
          const args = router.GetRoutersInfoSchema.parse(request.params.arguments);
          const pagesInfo = await router.getRoutersInfo(args.projectDir);
          return {
            content: [{ type: "text", text: JSON.stringify(pagesInfo, null, 2) }],
          };
        }
  
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
      }
      throw error;
    }
  });

  return server;
}

async function runServer() {
  const server = configureServer();
  const transportData = resolveTransport();
  console.error(`Using transport: ${transportData.type}`);
  console.error(`Transport source: ${transportData.source}`);

  if (transportData.type === 'sse') {
    // Set up Express server for SSE transport
    const app = await setupSSE(process.env.URL_BASE || '', server);
    // Start the HTTP server (port is only relevant for SSE transport)
    const portData = resolvePort();
    const port = portData.port;
    console.error(`Port source: ${portData.source}`);
    app.listen(port, () => {
      console.error(`Waiting for connection to MCP server at http://localhost:${port}/sse`);
    });
  } else {
    // Set up STDIO transport
    const transport = new StdioServerTransport();
    console.error("Starting with STDIO transport");
    await server.connect(transport);
    
    // Listen for SIGINT to gracefully shut down
    process.on('SIGINT', async () => {
      console.error('Shutting down...');
      await transport.close();
      process.exit(0);
    });
    console.error("Next MCP Server running on stdio");
  }
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});