# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

x-post-mcp is a minimal MCP server that enables AI agents to post tweets via X API v2. Zero runtime dependencies.

## Commands

```bash
pnpm install    # Install dev dependencies
pnpm build      # Compile TypeScript to dist/
pnpm dev        # Watch mode compilation
```

## Architecture

Single-file MCP server (`src/index.ts`) implementing JSON-RPC over stdio:
- `initialize` - Returns server capabilities
- `tools/list` - Exposes `send_tweet` tool
- `tools/call` - Executes tweet posting via X API v2

### Tool: send_tweet

Parameters:
- `text` (required): Tweet content
- `reply_to_tweet_id` (optional): Reply to specific tweet
- `quote_tweet_id` (optional): Quote tweet

### Authentication

Bearer token passed via `X_BEARER_TOKEN` environment variable at MCP installation:

```json
{
  "mcpServers": {
    "x-post-mcp": {
      "command": "npx",
      "args": ["x-post-mcp"],
      "env": {
        "X_BEARER_TOKEN": "<token>"
      }
    }
  }
}
```

## X API Reference

Endpoint: `POST https://api.x.com/2/tweets`

Full OpenAPI spec in `docs/tweets.md`
