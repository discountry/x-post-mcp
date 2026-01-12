# X API Token Guide

This guide explains how to obtain an X API Token with tweet posting permissions.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Create a Developer Account](#step-1-create-a-developer-account)
- [Step 2: Create a Project and App](#step-2-create-a-project-and-app)
- [Step 3: Configure User Authentication](#step-3-configure-user-authentication)
- [Step 4: Obtain OAuth 2.0 Token](#step-4-obtain-oauth-20-token)
- [Step 5: Configure MCP Server](#step-5-configure-mcp-server)
- [Token Refresh Mechanism](#token-refresh-mechanism)
- [FAQ](#faq)

---

## Prerequisites

- An X (Twitter) account
- Phone number verified on the account
- Email verified on the account

## Step 1: Create a Developer Account

1. Visit the [X Developer Portal](https://developer.x.com/en/portal/dashboard)

2. Sign in with your X account

3. If this is your first time, complete the developer account application:
   - Select your use case (choose "Building tools for yourself" or similar)
   - Accept the developer agreement
   - Wait for approval (usually completes within minutes)

## Step 2: Create a Project and App

1. In the Developer Portal, click **"Create Project"**

2. Fill in the Project information:
   - **Project Name**: Custom name, e.g., `mcp-twitter-bot`
   - **Use Case**: Select `Making a bot`
   - **Project Description**: Brief description of the purpose

3. Create an App:
   - **App Name**: Custom name, e.g., `x-post-mcp`
   - After completion, API Key and Secret will be displayed (not needed now, can skip)

## Step 3: Configure User Authentication

This is the critical step - configuring OAuth 2.0 user authentication.

1. Go to your App settings page

2. Find the **"User authentication settings"** section, click **"Set up"**

3. Configure OAuth 2.0:

   | Setting | Value |
   |---------|-------|
   | **App permissions** | `Read and write` (required for posting tweets) |
   | **Type of App** | `Web App, Automated App or Bot` |
   | **Callback URI** | `http://localhost:3000/callback` |
   | **Website URL** | Any valid URL, e.g., `https://example.com` |

4. Click **Save** to save settings

5. Save the generated **Client ID** and **Client Secret**:
   ```
   Client ID: xxxxxxxxxxxxxxxxxxxxxxx
   Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   > **Important**: Client Secret is only shown once, save it securely!

## Step 4: Obtain OAuth 2.0 Token

### Method A: Using Online Tool (Recommended for Beginners)

1. Visit [X OAuth 2.0 Playground](https://developer.x.com/en/portal/oauth2/playground)

2. Select your App

3. Check the following Scopes:
   - `tweet.read` - Read tweets
   - `tweet.write` - Post tweets
   - `users.read` - Read user information
   - `offline.access` - Get Refresh Token (**Important!**)

4. Click **"Generate Token"**

5. Sign in and authorize on the popup page

6. Save the following information:
   ```
   Access Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Refresh Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Method B: Manual OAuth Flow

If the online tool is unavailable, you can complete the OAuth flow manually.

#### Step 4.1: Generate Authorization URL

Construct the following URL (replace `YOUR_CLIENT_ID`):

```
https://x.com/i/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/callback&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=state123&code_challenge=challenge&code_challenge_method=plain
```

#### Step 4.2: Get Authorization Code

1. Open the above URL in your browser

2. Sign in and authorize the app

3. The page will redirect to `http://localhost:3000/callback?code=XXXXXX&state=state123`

4. Copy the `code` parameter value from the URL

#### Step 4.3: Exchange for Token

Use curl to get the Token:

```bash
curl -X POST 'https://api.x.com/2/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -u 'CLIENT_ID:CLIENT_SECRET' \
  -d 'code=AUTHORIZATION_CODE' \
  -d 'grant_type=authorization_code' \
  -d 'redirect_uri=http://localhost:3000/callback' \
  -d 'code_verifier=challenge'
```

Replace:
- `CLIENT_ID`: Your Client ID
- `CLIENT_SECRET`: Your Client Secret
- `AUTHORIZATION_CODE`: The authorization code from the previous step

Example response:

```json
{
  "token_type": "bearer",
  "expires_in": 7200,
  "access_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "refresh_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "scope": "tweet.read tweet.write users.read offline.access"
}
```

## Step 5: Configure MCP Server

### Recommended: Auto-refresh Token

Use OAuth 2.0 credentials for automatic token refresh:

```json
{
  "mcpServers": {
    "x-post-mcp": {
      "command": "npx",
      "args": ["x-post-mcp"],
      "env": {
        "X_CLIENT_ID": "<your-client-id>",
        "X_CLIENT_SECRET": "<your-client-secret>",
        "X_REFRESH_TOKEN": "<your-refresh-token>"
      }
    }
  }
}
```

### Simple: Bearer Token

Use Access Token directly (expires in 2 hours, requires manual refresh):

```json
{
  "mcpServers": {
    "x-post-mcp": {
      "command": "npx",
      "args": ["x-post-mcp"],
      "env": {
        "X_BEARER_TOKEN": "<your-access-token>"
      }
    }
  }
}
```

## Token Refresh Mechanism

### Access Token

- Validity: **2 hours**
- After expiration, use Refresh Token to obtain a new Access Token

### Refresh Token

- Validity: **6 months** (automatically extended with regular use)
- A new Refresh Token is returned each time you refresh the Access Token
- x-post-mcp handles refresh automatically (when using recommended configuration)

### Manual Token Refresh

```bash
curl -X POST 'https://api.x.com/2/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -u 'CLIENT_ID:CLIENT_SECRET' \
  -d 'refresh_token=YOUR_REFRESH_TOKEN' \
  -d 'grant_type=refresh_token'
```

## FAQ

### Q: Why doesn't my App have posting permissions?

Make sure you selected **"Read and write"** in User Authentication Settings. "Read" only permission cannot post tweets.

### Q: Authorization shows "Something went wrong"?

Possible causes:
1. Callback URI is incorrectly configured
2. Phone number not verified on account
3. Account is restricted

### Q: What if my Refresh Token expires?

You need to go through the OAuth authorization flow again (Step 4) to get a new Refresh Token.

### Q: How do I check if my Token is valid?

```bash
curl -X GET "https://api.x.com/2/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

If user information is returned, the Token is valid.

### Q: Getting "Unauthorized" error?

1. Check if the Token has expired
2. Verify you're using the correct Token type
3. Confirm the required Scopes were selected during OAuth authorization

---

## Related Links

- [X Developer Portal](https://developer.x.com/en/portal/dashboard)
- [X API v2 Documentation](https://developer.x.com/en/docs/twitter-api)
- [OAuth 2.0 Authorization Flow](https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code)
