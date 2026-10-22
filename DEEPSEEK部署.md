# DeepSeek API 接入

1. 在 https://platform.deepseek.com/ 创建 API Key，并确认 API 账户有可用余额。
2. 在项目根目录 `.env` 填写 `DEEPSEEK_API_KEY`。不要将密钥写进 public 或 netlify-deploy。
3. 设置 `CHAT_PROVIDER=deepseek`，模型默认 `DEEPSEEK_MODEL=deepseek-chat`；如账户支持其他模型，可按官方平台可用模型 ID 修改。
4. 停止旧 Node 服务，再执行 `npm.cmd start`，打开 http://localhost:3000 。成功回复会显示“DeepSeek API”。

密钥只在 Node 后端使用。请求发送到 https://api.deepseek.com/chat/completions，包含当前消息、最近六条历史消息及用户填写的画像、评估背景。使用该 API 会产生平台计费。

401 表示密钥问题，402 表示余额问题，429 表示请求限制。调用失败时页面保留本地回复。

切回本地模型：设置 `CHAT_PROVIDER=ollama` 后重启。Netlify 静态发布不能运行 server.js，需要另外部署 Node 后端才能使用 API。`.env` 已加入 Git 忽略规则。
