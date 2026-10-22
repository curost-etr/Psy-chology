'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const os = require('node:os');
const engine = require('../public/intent-model.js');
const support = require('../public/local-support.js');
const latest = require('./latest.json');
const model = require('../public/models/intent-model.json');
const policy = require('../public/training-data.json');
const dataset = fs.readFileSync(path.join(__dirname, latest.artifactDirectory, 'dataset.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const source = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
(async () => {
  check('export matches saved artifact', () => assert.deepEqual(model, require(`./${latest.artifactDirectory}/model.json`)));
  const context = { window: {}, fetch: async () => ({ ok: true, json: async () => JSON.parse(JSON.stringify(model)) }), AbortSignal };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/intent-model.js'), 'utf8'), context);
  await context.window.LocalIntentModel.ready;
  check('browser and Node agree on all corpus probabilities', () => {
    for (const row of dataset) {
      const node = engine.predict(row.text, model), browser = context.window.LocalIntentModel.predict(row.text, context.window.LocalIntentModel.model);
      assert.equal(browser.intent, node.intent); assert.equal(browser.accepted, node.accepted);
      node.scores.forEach((score, i) => assert(Math.abs(score.confidence - browser.scores[i].confidence) < 1e-12));
      assert(Math.abs(node.scores.reduce((sum, item) => sum + item.confidence, 0) - 1) < 1e-12);
    }
  });
  check('empty, unseen and excessive input are rejected', () => {
    for (const text of ['', '   ', '🪐🦕🧬', '字'.repeat(2001)]) assert.equal(engine.predict(text, model).accepted, false);
  });
  check('full-width normalization is consistent', () => assert.equal(engine.normalize(' ＡＢＣ　１２３ '), 'abc 123'));
  check('risk priority works with and without model or policy', () => {
    for (const text of ['我想自杀', '我想伤害自己', '我不想活了', '我想跳楼', 'I want to kill myself'])
      for (const candidate of [model, null])
        assert.equal(support.reply(text, candidate, { intents: [] }, engine).mode, 'safety-first');
  });
  check('model routes topic and preserves support notice', () => {
    const result = support.reply('最近总是睡不着，失眠心慌', model, policy, engine);
    assert(result.text.includes('专业支持'));
    assert.equal(result.intent, 'sleep_burnout');
  });
  check('unavailable model uses keyword fallback', () => {
    const result = support.reply('复习任务太多开始不了', null, policy, engine);
    assert.equal(result.intent, 'task_start_block'); assert.equal(result.mode, 'fallback');
    assert(support.reply('你好', null, { intents: [] }, engine).text.includes('不确定'));
  });
  check('other and ambiguous inputs receive clarification', () => {
    assert(support.reply('你好呀', model, policy, engine).text.includes('不确定'));
    assert(support.reply('🪐🦕🧬', model, policy, engine).text.includes('不确定'));
  });
  const main = { window: { LocalIntentModel: { ...engine, model } }, trainingData: policy };
  vm.createContext(main);
  const start = source.indexOf('function scoreTrainingIntent('), end = source.indexOf('function dedupeSentences(');
  vm.runInContext(source.slice(start, end), main);
  check('existing chat uses model and keeps reject behavior', () => {
    assert.equal(main.findTrainingIntent('我每天凌晨三点才睡', {})?.id, 'sleep_burnout');
    assert.equal(main.findTrainingIntent('你好呀', { concern: 'exam' }), null);
    main.window.LocalIntentModel.model = null;
    assert.equal(main.findTrainingIntent('复习任务太多开始不了', {})?.id, 'task_start_block');
  });
  const failed = { window: {}, fetch: async () => { throw new Error('offline'); }, AbortSignal };
  vm.createContext(failed); vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/intent-model.js'), 'utf8'), failed);
  await failed.window.LocalIntentModel.ready;
  check('failed fetch settles safely', () => { assert.equal(failed.window.LocalIntentModel.model, null); assert.equal(failed.window.LocalIntentModel.error, 'offline'); });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mindbell-validation-'));
  try {
    check('trainer rejects cross-split group leakage before fitting', () => {
      const invalid = dataset.map(row => ({ ...row }));
      invalid.find(row => row.split === 'dev').group_id = invalid.find(row => row.split === 'train').group_id;
      const file = path.join(temporary, 'invalid.jsonl');
      fs.writeFileSync(file, invalid.map(row => JSON.stringify(row)).join('\n'));
      const result = spawnSync(process.execPath, [path.join(__dirname, 'train.cjs'), '--data', file], { encoding: 'utf8' });
      assert.notEqual(result.status, 0); assert(result.stderr.includes('Group leakage'));
    });
    check('trainer rejects unapproved training data', () => {
      const invalid = dataset.map(row => ({ ...row })); invalid[0].training_allowed = false;
      const file = path.join(temporary, 'invalid.jsonl');
      fs.writeFileSync(file, invalid.map(row => JSON.stringify(row)).join('\n'));
      const result = spawnSync(process.execPath, [path.join(__dirname, 'train.cjs'), '--data', file], { encoding: 'utf8' });
      assert.notEqual(result.status, 0); assert(result.stderr.includes('Missing permission'));
    });
  } finally {
    // This exact newly-created temporary directory is owned by this test.
    fs.unlinkSync(path.join(temporary, 'invalid.jsonl')); fs.rmdirSync(temporary);
  }
  console.log(`${checks} AI verification groups passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
