# 使用本机 Ollama

要求 Node.js 22.9+（支持 process.loadEnvFile），并保持 Ollama 运行。

1. 在项目根目录运行 `ollama list`，确认模型已安装。
2. `.env` 支持以下配置；只有一个模型时，不设置模型名也会自动选择：

   ```dotenv
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=modelscope.cn/Qwen/Qwen3-VL-8B-Instruct-GGUF:latest
   OLLAMA_TIMEOUT_MS=180000
   ```

3. 执行 `npm start`，浏览器打开 `http://localhost:3000`，在原有聊天区发送消息。
4. 成功时显示“Ollama 本地模型”。失败时保留浏览器本地回复；HTTP 503 通常表示 Ollama 未运行或模型配置不正确，504 表示超时。

请通过 Node 服务打开页面；直接双击 HTML、使用静态预览或发布到 Netlify 不会启动本机后端。更改环境配置后需重启 Node 服务。

当前接口为文字聊天；虽然检测到的模型支持视觉，本次未添加图片上传。首次加载可能较慢，请等待；默认单次最多生成 512 token。

同一局域网设备可尝试访问 `http://电脑局域网IP:3000`，需允许防火墙入站，电脑保持开机。无需开放 Ollama 的 11434 端口。当前项目接口没有登录认证，先限于本机或可信局域网使用。
