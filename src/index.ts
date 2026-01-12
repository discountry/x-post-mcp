#!/usr/bin/env node

import * as readline from "node:readline";

const X_API_URL = "https://api.x.com/2/tweets";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

function send(response: JsonRpcResponse): void {
  process.stdout.write(JSON.stringify(response) + "\n");
}

function sendError(
  id: string | number | null,
  code: number,
  message: string
): void {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

function getServerInfo() {
  return {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {} },
    serverInfo: { name: "x-post-mcp", version: "1.0.0" },
  };
}

function getToolsList() {
  return {
    tools: [
      {
        name: "send_tweet",
        description: "Post a new tweet to X (Twitter)",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The content of the tweet",
            },
            reply_to_tweet_id: {
              type: "string",
              description: "Optional: Tweet ID to reply to",
            },
            quote_tweet_id: {
              type: "string",
              description: "Optional: Tweet ID to quote",
            },
          },
          required: ["text"],
        },
      },
    ],
  };
}

async function sendTweet(params: {
  text: string;
  reply_to_tweet_id?: string;
  quote_tweet_id?: string;
}): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const token = process.env.X_BEARER_TOKEN;

  if (!token) {
    return {
      content: [{ type: "text", text: "Error: X_BEARER_TOKEN environment variable is not set" }],
      isError: true,
    };
  }

  const body: Record<string, unknown> = { text: params.text };

  if (params.reply_to_tweet_id) {
    body.reply = { in_reply_to_tweet_id: params.reply_to_tweet_id };
  }

  if (params.quote_tweet_id) {
    body.quote_tweet_id = params.quote_tweet_id;
  }

  try {
    const response = await fetch(X_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        content: [{ type: "text", text: `Error: ${JSON.stringify(data)}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Tweet posted successfully!\nID: ${data.data?.id}\nText: ${data.data?.text}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  if (name === "send_tweet") {
    return sendTweet(args as { text: string; reply_to_tweet_id?: string; quote_tweet_id?: string });
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
}

async function handleRequest(request: JsonRpcRequest): Promise<void> {
  const { id, method, params } = request;

  switch (method) {
    case "initialize":
      send({ jsonrpc: "2.0", id, result: getServerInfo() });
      break;

    case "notifications/initialized":
      break;

    case "tools/list":
      send({ jsonrpc: "2.0", id, result: getToolsList() });
      break;

    case "tools/call": {
      const toolName = params?.name as string;
      const toolArgs = (params?.arguments ?? {}) as Record<string, unknown>;
      const result = await handleToolCall(toolName, toolArgs);
      send({ jsonrpc: "2.0", id, result });
      break;
    }

    default:
      sendError(id, -32601, `Method not found: ${method}`);
  }
}

function main(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", async (line) => {
    if (!line.trim()) return;

    try {
      const request = JSON.parse(line) as JsonRpcRequest;
      await handleRequest(request);
    } catch {
      sendError(null, -32700, "Parse error");
    }
  });

  rl.on("close", () => {
    process.exit(0);
  });
}

main();
