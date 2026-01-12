# x-post-mcp

A minimal MCP server for posting tweets to X (Twitter) via API v2. Zero runtime dependencies.

## Installation

```bash
npm install -g x-post-mcp
# or
npx x-post-mcp
```

## Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "x-post-mcp": {
      "command": "npx",
      "args": ["x-post-mcp"],
      "env": {
        "X_BEARER_TOKEN": "<your-bearer-token>"
      }
    }
  }
}
```

### Getting a Bearer Token

See the detailed step-by-step guide: **[English](./docs/token-guide.en.md)** | **[中文](./docs/token-guide.md)**

Quick overview:
1. Go to [X Developer Portal](https://developer.x.com/en/portal/dashboard)
2. Create a project and app
3. Configure User Authentication with `Read and write` permission
4. Generate OAuth 2.0 Token with `tweet.read`, `tweet.write`, `users.read`, `offline.access` scopes

**Recommended**: Use auto-refresh configuration with `X_CLIENT_ID`, `X_CLIENT_SECRET`, and `X_REFRESH_TOKEN` to avoid manual token refresh every 2 hours.

## Tool

### send_tweet

Post a new tweet to X.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| text | string | ✓ | Tweet content |
| reply_to_tweet_id | string | | Tweet ID to reply to |
| quote_tweet_id | string | | Tweet ID to quote |

## Skill Example

You can create a skill file to help AI agents use this MCP. Save as `.claude/skills/post-tweet.md`:

```markdown
# Post Tweet Skill

Post a tweet to X (Twitter) using the x-post-mcp server.

## Instructions

1. Confirm the tweet content with the user before posting
2. Call the `send_tweet` tool with the user's message
3. Report the result back to the user

## Examples

**Simple tweet:**
User: 帮我发一条推文：Hello World!
Assistant: [calls send_tweet with text: "Hello World!"]

**Reply to a tweet:**
User: 回复这条推文 1234567890：感谢分享！
Assistant: [calls send_tweet with text: "感谢分享!", reply_to_tweet_id: "1234567890"]

**Quote tweet:**
User: 引用推文 1234567890 并评论：这个观点很有意思
Assistant: [calls send_tweet with text: "这个观点很有意思", quote_tweet_id: "1234567890"]
```

## License

MIT
