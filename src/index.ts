#!/usr/bin/env node

import * as readline from "node:readline";

const X_API_URL = "https://api.x.com/2/tweets";
const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";

// Token state (will be refreshed automatically)
let currentAccessToken = process.env.X_BEARER_TOKEN || "";
let tokenExpiresAt = 0;

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

async function refreshAccessToken(): Promise<boolean> {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const refreshToken = process.env.X_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return false;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(X_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    currentAccessToken = data.access_token;
    // Set expiry 5 minutes before actual expiry to be safe
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
    return true;
  } catch {
    return false;
  }
}

async function getValidToken(): Promise<string | null> {
  // If we have a valid token that hasn't expired, use it
  if (currentAccessToken && tokenExpiresAt > Date.now()) {
    return currentAccessToken;
  }

  // Try to refresh the token
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    return currentAccessToken;
  }

  // Fall back to the original bearer token if refresh fails
  if (process.env.X_BEARER_TOKEN) {
    return process.env.X_BEARER_TOKEN;
  }

  return null;
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
  const token = await getValidToken();

  if (!token) {
    return {
      content: [{ type: "text", text: "Error: No valid access token. Set X_BEARER_TOKEN or configure X_CLIENT_ID, X_CLIENT_SECRET, and X_REFRESH_TOKEN for auto-refresh." }],
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
