# GreasyFork 自动发布设置指南

本文档说明如何配置 GitHub Actions 自动发布脚本到 GreasyFork，实现私有仓库也能自动更新用户脚本。

## 为什么使用 GreasyFork？

- ✅ **私有仓库友好**：GitHub 仓库可以保持私有，只发布编译后的脚本到 GreasyFork
- ✅ **自动更新**：Tampermonkey 可以从 GreasyFork 自动检测和更新脚本
- ✅ **CDN 加速**：GreasyFork 提供全球 CDN，更新速度快
- ✅ **版本管理**：GreasyFork 保留所有历史版本

## 配置步骤

### 1. 在 GreasyFork 创建/获取脚本

#### 选项 A: 创建新脚本
1. 访问 [GreasyFork](https://greasyfork.org/)
2. 登录你的账号
3. 点击 "发布你编写的脚本"
4. 上传初始版本的 `dist/index.prod.user.js`
5. 记下脚本 ID（URL 中的数字，如 `https://greasyfork.org/scripts/12345` 中的 `12345`）

#### 选项 B: 使用现有脚本
1. 找到你的脚本页面
2. 记下脚本 ID

### 2. 获取 GreasyFork API Key

1. 访问 [API Keys 页面](https://greasyfork.org/users/api-keys)
2. 点击 "生成新的 API Key"
3. 给 API Key 命名（如 "GitHub Actions Auto Deploy"）
4. **复制并保存** API Key（只显示一次！）

### 3. 配置 GitHub Secrets

在你的 GitHub 仓库中设置两个 secrets：

1. 进入仓库的 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加以下两个 secrets：

   **Secret 1: GREASY_FORK_API_KEY**
   - Name: `GREASY_FORK_API_KEY`
   - Value: 你在步骤 2 获取的 API Key

   **Secret 2: GREASY_FORK_SCRIPT_ID**
   - Name: `GREASY_FORK_SCRIPT_ID`
   - Value: 你的脚本 ID（纯数字）

### 4. 更新 metadata.cjs

编辑 `config/metadata.cjs`，将 `YOUR_SCRIPT_ID` 替换为你的实际脚本 ID：

```javascript
updateURL: "https://update.greasyfork.org/scripts/YOUR_SCRIPT_ID/HHAExchange%20Smart%20Assistant.user.js",
downloadURL: "https://update.greasyfork.org/scripts/YOUR_SCRIPT_ID/HHAExchange%20Smart%20Assistant.user.js",
```

替换后应该类似：

```javascript
updateURL: "https://update.greasyfork.org/scripts/12345/HHAExchange%20Smart%20Assistant.user.js",
downloadURL: "https://update.greasyfork.org/scripts/12345/HHAExchange%20Smart%20Assistant.user.js",
```

### 5. 测试自动发布

1. 提交并推送代码到 `dev` 分支
2. 查看 GitHub Actions 运行日志
3. 确认看到 "✅ Successfully uploaded to GreasyFork!" 消息
4. 访问你的 GreasyFork 脚本页面，确认版本已更新

## 工作流程

```
┌─────────────────┐
│  Push to dev    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  npm run build  │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         v                     v
┌─────────────────┐   ┌──────────────────┐
│  Deploy to      │   │  Upload to       │
│  dist branch    │   │  GreasyFork      │
└─────────────────┘   └──────────────────┘
         │                     │
         └─────────┬───────────┘
                   v
         ┌──────────────────┐
         │  Users get       │
         │  auto-update     │
         └──────────────────┘
```

## 故障排除

### ⚠️ 未设置 Secrets
如果看到警告信息：
```
⚠️ GREASY_FORK_API_KEY not set, skipping GreasyFork upload
```
请检查是否正确添加了 GitHub Secrets。

### ❌ 上传失败
如果上传失败，可能的原因：
1. **API Key 无效**：重新生成并更新 secret
2. **Script ID 错误**：检查 `GREASY_FORK_SCRIPT_ID` 是否正确
3. **权限问题**：确保 API Key 有更新脚本的权限
4. **文件格式问题**：确保 `dist/index.prod.user.js` 是有效的用户脚本

### 🔍 查看详细日志
在 GitHub Actions 页面查看 "Upload to GreasyFork" 步骤的详细输出。

## 安全注意事项

- ✅ API Key 存储在 GitHub Secrets 中，不会暴露在日志中
- ✅ 只有仓库管理员可以查看和修改 Secrets
- ✅ 工作流只在 `dev` 分支推送时触发
- ✅ 如果 API Key 泄露，可以在 GreasyFork 撤销并重新生成

## 手动发布（备用方案）

如果自动发布失败，你可以手动上传：

1. 本地运行 `npm run build`
2. 访问你的 GreasyFork 脚本编辑页面
3. 复制 `dist/index.prod.user.js` 的内容
4. 粘贴并保存

## 相关链接

- [GreasyFork API 文档](https://greasyfork.org/help/api)
- [GreasyFork 脚本管理](https://greasyfork.org/users/scripts)
- [GitHub Actions Secrets 文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
