# X API Token 获取教程

本教程详细介绍如何获取具有发推权限的 X API Token。

## 目录

- [前置要求](#前置要求)
- [Step 1: 创建 Developer 账号](#step-1-创建-developer-账号)
- [Step 2: 创建 Project 和 App](#step-2-创建-project-和-app)
- [Step 3: 配置 User Authentication](#step-3-配置-user-authentication)
- [Step 4: 获取 OAuth 2.0 Token](#step-4-获取-oauth-20-token)
- [Step 5: 配置 MCP Server](#step-5-配置-mcp-server)
- [Token 刷新机制](#token-刷新机制)
- [常见问题](#常见问题)

---

## 前置要求

- 一个 X (Twitter) 账号
- 该账号需要绑定手机号
- 该账号需要通过邮箱验证

## Step 1: 创建 Developer 账号

1. 访问 [X Developer Portal](https://developer.x.com/en/portal/dashboard)

2. 使用你的 X 账号登录

3. 如果是首次使用，需要完成开发者账号申请：
   - 选择使用场景（选择 "Building tools for yourself" 或相关选项）
   - 填写开发者协议
   - 等待审核通过（通常几分钟内完成）

## Step 2: 创建 Project 和 App

1. 在 Developer Portal 中，点击 **"Create Project"**

2. 填写 Project 信息：
   - **Project Name**: 自定义名称，如 `mcp-twitter-bot`
   - **Use Case**: 选择 `Making a bot`
   - **Project Description**: 简单描述用途

3. 创建 App：
   - **App Name**: 自定义名称，如 `x-post-mcp`
   - 完成后会显示 API Key 和 Secret（暂时不需要，可以跳过）

## Step 3: 配置 User Authentication

这是关键步骤，需要配置 OAuth 2.0 用户认证。

1. 进入你的 App 设置页面

2. 找到 **"User authentication settings"** 部分，点击 **"Set up"**

3. 配置 OAuth 2.0：

   | 设置项 | 值 |
   |--------|-----|
   | **App permissions** | `Read and write` (必须选择此项才能发推) |
   | **Type of App** | `Web App, Automated App or Bot` |
   | **Callback URI** | `http://localhost:3000/callback` |
   | **Website URL** | 任意有效 URL，如 `https://example.com` |

4. 点击 **Save** 保存设置

5. 保存生成的 **Client ID** 和 **Client Secret**：
   ```
   Client ID: xxxxxxxxxxxxxxxxxxxxxxx
   Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   > **重要**: Client Secret 只显示一次，请妥善保存！

## Step 4: 获取 OAuth 2.0 Token

### 方法 A: 使用在线工具（推荐新手）

1. 访问 [X OAuth 2.0 Playground](https://developer.x.com/en/portal/oauth2/playground)

2. 选择你的 App

3. 勾选以下 Scopes（权限范围）：
   - `tweet.read` - 读取推文
   - `tweet.write` - 发布推文
   - `users.read` - 读取用户信息
   - `offline.access` - 获取 Refresh Token（**重要！**）

4. 点击 **"Generate Token"**

5. 在弹出的授权页面中登录并授权

6. 获取并保存以下信息：
   ```
   Access Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Refresh Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 方法 B: 手动 OAuth 流程

如果在线工具不可用，可以手动完成 OAuth 流程。

#### Step 4.1: 生成授权 URL

构造以下 URL（替换 `YOUR_CLIENT_ID`）：

```
https://x.com/i/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/callback&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=state123&code_challenge=challenge&code_challenge_method=plain
```

#### Step 4.2: 获取授权码

1. 在浏览器中打开上述 URL

2. 登录并授权应用

3. 页面会跳转到 `http://localhost:3000/callback?code=XXXXXX&state=state123`

4. 复制 URL 中的 `code` 参数值

#### Step 4.3: 交换 Token

使用 curl 获取 Token：

```bash
curl -X POST 'https://api.x.com/2/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -u 'CLIENT_ID:CLIENT_SECRET' \
  -d 'code=AUTHORIZATION_CODE' \
  -d 'grant_type=authorization_code' \
  -d 'redirect_uri=http://localhost:3000/callback' \
  -d 'code_verifier=challenge'
```

替换：
- `CLIENT_ID`: 你的 Client ID
- `CLIENT_SECRET`: 你的 Client Secret
- `AUTHORIZATION_CODE`: 上一步获取的授权码

响应示例：

```json
{
  "token_type": "bearer",
  "expires_in": 7200,
  "access_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "refresh_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "scope": "tweet.read tweet.write users.read offline.access"
}
```

## Step 5: 配置 MCP Server

### 推荐配置：自动刷新 Token

使用 OAuth 2.0 凭据配置，Token 会自动刷新：

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

### 简易配置：Bearer Token

直接使用 Access Token（2小时后过期需手动刷新）：

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

## Token 刷新机制

### Access Token

- 有效期：**2 小时**
- 过期后需要使用 Refresh Token 获取新的 Access Token

### Refresh Token

- 有效期：**6 个月**（如果定期使用会自动延长）
- 每次刷新 Access Token 时会返回新的 Refresh Token
- x-post-mcp 会自动处理刷新（使用推荐配置时）

### 手动刷新 Token

```bash
curl -X POST 'https://api.x.com/2/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -u 'CLIENT_ID:CLIENT_SECRET' \
  -d 'refresh_token=YOUR_REFRESH_TOKEN' \
  -d 'grant_type=refresh_token'
```

## 常见问题

### Q: 为什么我的 App 没有发推权限？

确保在 User Authentication Settings 中选择了 **"Read and write"** 权限。只有 "Read" 权限是无法发推的。

### Q: 授权时提示 "Something went wrong"？

可能的原因：
1. Callback URI 配置不正确
2. 账号未绑定手机号
3. 账号被限制

### Q: Refresh Token 过期了怎么办？

需要重新走一遍 OAuth 授权流程（Step 4），获取新的 Refresh Token。

### Q: 如何检查 Token 是否有效？

```bash
curl -X GET "https://api.x.com/2/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

成功返回用户信息则 Token 有效。

### Q: 提示 "Unauthorized" 错误？

1. 检查 Token 是否过期
2. 检查是否使用了正确的 Token 类型
3. 确认 OAuth 授权时勾选了必要的 Scopes

---

## 相关链接

- [X Developer Portal](https://developer.x.com/en/portal/dashboard)
- [X API v2 文档](https://developer.x.com/en/docs/twitter-api)
- [OAuth 2.0 授权流程](https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code)
