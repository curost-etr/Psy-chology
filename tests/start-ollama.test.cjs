const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { ensureOllama } = require('../start-ollama');
const quiet = () => {};
const running = async () => ({ ok: true, json: async () => ({ models: [] }) });
const offline = async () => { throw new Error('offline'); };
const never = () => { throw new Error('Should not be called'); };

test('existing service is reused without spawning', async () => {
  await ensureOllama({ env: {}, fetchImpl: running, spawnImpl: never, log: quiet });
});

test('DeepSeek, remote service and opt-out never spawn local Ollama', async () => {
  for (const env of [{ CHAT_PROVIDER: 'deepseek' }, { OLLAMA_AUTO_START: 'false' }, { OLLAMA_BASE_URL: 'http://example.com:11434' }]) {
    await ensureOllama({ env, fetchImpl: never, spawnImpl: never, log: quiet });
  }
});

test('offline local service starts in background and readiness is awaited', async () => {
  let started = false;
  await ensureOllama({
    env: { OLLAMA_BIN: 'custom-ollama', OLLAMA_BASE_URL: 'http://127.0.0.1:11435' },
    fetchImpl: async () => started ? running() : offline(), log: quiet,
    spawnImpl: (binary, args, options) => {
      assert.equal(binary, 'custom-ollama');
      assert.deepEqual(args, ['serve']);
      assert.equal(options.env.OLLAMA_HOST, 'http://127.0.0.1:11435');
      assert.equal(options.windowsHide, true);
      assert.equal(options.detached, true);
      started = true;
      return Object.assign(new EventEmitter(), { unref() {} });
    }
  });
  assert(started);
});

test('missing executable returns actionable error without unhandled event', async () => {
  await assert.rejects(ensureOllama({ env: {}, fetchImpl: offline, log: quiet, pollMs: 1,
    spawnImpl: () => {
      const child = Object.assign(new EventEmitter(), { unref() {} });
      queueMicrotask(() => child.emit('error', Object.assign(new Error('missing'), { code: 'ENOENT' })));
      return child;
    }
  }), /OLLAMA_BIN/);
});

test('exited process and readiness timeout are reported', async () => {
  for (const exits of [true, false]) {
    await assert.rejects(ensureOllama({ env: { OLLAMA_STARTUP_TIMEOUT_MS: '10' }, fetchImpl: offline, log: quiet, pollMs: 1,
      spawnImpl: () => {
        const child = Object.assign(new EventEmitter(), { unref() {} });
        if (exits) queueMicrotask(() => child.emit('exit', 1));
        return child;
      }
    }), exits ? /退出/ : /超时/);
  }
});
