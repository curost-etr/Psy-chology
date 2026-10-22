'use strict';
const { chromium } = require('../.presentation-tools/node_modules/playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/deploy') { res.writeHead(302, { Location: '/netlify-deploy/public/index.html' }); res.end(); return; }
  const name = url.pathname === '/' ? '/public/index.html' : url.pathname;
  const file = path.resolve(root, '.' + decodeURIComponent(name));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const checks = [];
  try {
    browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**/*', route => route.abort());
    const base = `http://127.0.0.1:${server.address().port}`;
    const sample = '任务太多了我不知道先做哪个';
    async function send(text) {
      const before = await page.locator('.message.assistant').count();
      await page.fill('#chat-input', text); await page.locator('#chat-form button').click();
      await page.waitForFunction(count => document.querySelectorAll('.message.assistant').length > count, before);
      await page.waitForFunction(() => !document.querySelector('#chat-form button').disabled);
      return page.locator('.message.assistant').last().innerText();
    }
    async function openChat(url) {
      await page.goto(url);
      await page.evaluate(() => window.LocalIntentModel.ready);
      await page.selectOption('#intake-concern', 'task');
      await page.selectOption('#intake-goal', 'plan');
      await page.locator('#intake-form button').click();
    }
    await openChat(base + '/deploy');
    assert(await page.evaluate(() => Boolean(window.LocalIntentModel.model)));
    assert((await send(sample)).includes('10 分钟'));
    checks.push('Netlify complete frontend uses trained model');
    assert((await send('你好呀')).includes('不确定'));
    checks.push('out-of-domain input asks for clarification');
    assert((await send('我想伤害自己')).includes('安全优先'));
    checks.push('risk support has priority');
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    checks.push('mobile frontend fits viewport');
    await page.route('**/models/intent-model.json', route => route.abort());
    await openChat(base + '/deploy');
    assert.equal(await page.evaluate(() => window.LocalIntentModel.model), null);
    assert((await send(sample)).includes('10 分钟'));
    checks.push('missing model falls back to keyword replies');
    await page.unroute('**/models/intent-model.json');
    await openChat(base + '/public/index.html');
    assert((await send(sample)).includes('10 分钟'));
    checks.push('existing chat uses trained model when API is unavailable');
    assert.deepEqual(errors, []);
    checks.push('no uncaught page errors');
    fs.writeFileSync(path.join(__dirname, 'browser-verification.json'), JSON.stringify({ browser: await browser.version(), checks, passed: checks.length, externalNetworkBlocked: true }, null, 2) + '\n');
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
