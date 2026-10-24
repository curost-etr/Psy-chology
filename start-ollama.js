const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

async function ensureOllama({ env = process.env, fetchImpl = fetch, spawnImpl = spawn, log = console.log, pollMs = 500 } = {}) {
  if ((env.CHAT_PROVIDER || 'ollama').trim().toLowerCase() !== 'ollama' || env.OLLAMA_AUTO_START === 'false') return;
  const base = new URL(env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname) || base.protocol !== 'http:') {
    log('使用远程或 HTTPS Ollama，不启动本地进程。');
    return;
  }
  const ready = async () => {
    try {
      const r = await fetchImpl(new URL('/api/tags', base), { signal: AbortSignal.timeout(1500) });
      return r.ok && Array.isArray((await r.json()).models);
    } catch { return false; }
  };
  if (await ready()) { log('Ollama 已运行，复用现有服务。'); return; }
  const windowsBinary = env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'Programs', 'Ollama', 'ollama.exe');
  const binary = env.OLLAMA_BIN || (process.platform === 'win32' && windowsBinary && fs.existsSync(windowsBinary) ? windowsBinary : 'ollama');
  log('正在自动启动 Ollama，请稍候…');
  const child = spawnImpl(binary, ['serve'], {
    env: { ...env, OLLAMA_HOST: base.origin },
    detached: true, windowsHide: true, stdio: 'ignore'
  });
  let startError;
  let exited = false;
  child.once('error', error => { startError = error; });
  child.once('exit', () => { exited = true; });
  child.unref();
  const configured = Number(env.OLLAMA_STARTUP_TIMEOUT_MS || 30000);
  const timeout = Number.isFinite(configured) && configured > 0 ? configured : 30000;
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await ready()) { log('Ollama 已就绪。首次对话时会加载模型。'); return; }
    if (startError) throw new Error(startError.code === 'ENOENT' ? '未找到 Ollama，请先安装或设置 OLLAMA_BIN。' : '无法启动 Ollama，请检查安装路径和访问权限。');
    if (exited) throw new Error('Ollama 启动后退出，请运行 ollama serve 查看原因。');
    await new Promise(resolve => setTimeout(resolve, pollMs));
  }
  throw new Error('等待 Ollama 启动超时，请检查 ollama serve 或增加 OLLAMA_STARTUP_TIMEOUT_MS。');
}

module.exports = { ensureOllama };
