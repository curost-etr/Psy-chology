# GitHub Pages 调用 Ollama

GitHub Pages 只托管前端。模型及 Node 后端需要持续运行在能够通过 HTTPS 访问的主机上。

1. 在模型所在主机部署本项目的 Node 后端，配置 `CHAT_PROVIDER=ollama`、`OLLAMA_MODEL` 和 `OLLAMA_BASE_URL`。
2. 后端环境变量设置 `CHAT_ALLOWED_ORIGINS=https://curost-etr.github.io`。自定义网站域名需要同时加入，多个域名用逗号分隔，不包含路径或末尾斜线。
3. HTTPS 反向代理将 `/api/chat` 的 POST 和 OPTIONS 请求转发给 Node 服务，并允许超过 190 秒的请求等待。
4. 在 `public/chat-config.js` 中填写 `apiBaseUrl` 为真实 HTTPS 后端地址，不包含 `/api/chat`。更新后执行 `node training/sync.cjs` 同步静态包，然后提交代码。
5. GitHub Pages 发布完成后从网页发送消息；真实模型回复会标注“Ollama 本地模型”。本地兜底并不代表 Ollama 调用成功。

这里需要提供本项目 `/api/chat` 接口，直接填写 Ollama 的地址无法兼容返回格式。Ollama 的 11434 端口保留在模型服务器本机或内网；公网后端需按使用范围配置认证、访问限制和限流。CORS 不是身份认证。

不要把 `.env` 或密钥发布到 GitHub。后端停机、电脑休眠、隧道关闭或网络不可达时，静态网页无法使用远端模型。
