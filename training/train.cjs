'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const engine = require('../public/intent-model.js');
const root = path.join(__dirname, '..');
const inputIndex = process.argv.indexOf('--data');
const rows = inputIndex >= 0 ? fs.readFileSync(process.argv[inputIndex + 1], 'utf8').trim().split(/\r?\n/).map(JSON.parse) : require('./seed-data.cjs');
const labels = ['exam_result_fear', 'task_start_block', 'sleep_burnout', 'self_blame', 'future_uncertainty', 'relationship_pressure', 'other'];
const seen = new Set(), groups = new Map(), ids = new Set();
for (const row of rows) {
  assert(labels.includes(row.intent), `Invalid label ${row.id}`);
  assert(['train', 'dev', 'test'].includes(row.split), `Invalid split ${row.id}`);
  assert(row.training_allowed === true && typeof row.source === 'string' && row.source, `Missing permission/source ${row.id}`);
  assert(typeof row.text === 'string' && engine.normalize(row.text).length > 0 && row.text.length <= 2000, `Invalid text ${row.id}`);
  assert(row.id && row.group_id && !ids.has(row.id), `Invalid/duplicate ID ${row.id}`);
  assert(['single_author_seed', 'reviewed'].includes(row.annotation_status), `Unreviewed record ${row.id}`);
  if (row.source !== 'assistant_authored') assert(row.annotation_status === 'reviewed', `External data requires review ${row.id}`);
  const normalized = engine.normalize(row.text).replace(/[\p{P}\p{Z}]/gu, '');
  assert(!seen.has(normalized), `Duplicate text ${row.id}`);
  seen.add(normalized); ids.add(row.id);
  assert(!groups.has(row.group_id) || groups.get(row.group_id) === row.split, `Group leakage ${row.group_id}`);
  groups.set(row.group_id, row.split);
}
// Detect likely cross-split rewrites using character-bigram Jaccard overlap.
const bigrams = rows.map(row => new Set(engine.counts(row.text, 2, 2).keys()));
for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
  if (rows[i].split === rows[j].split) continue;
  let overlap = 0;
  for (const token of bigrams[i]) if (bigrams[j].has(token)) overlap++;
  const union = bigrams[i].size + bigrams[j].size - overlap;
  assert(!union || overlap / union < 0.8, `Near-duplicate across splits: ${rows[i].id}, ${rows[j].id}`);
}
const split = name => rows.filter(row => row.split === name);
const train = split('train'), dev = split('dev'), test = split('test');
for (const name of ['train', 'dev', 'test']) for (const label of labels)
  assert(split(name).some(row => row.intent === label), `Missing ${label} in ${name}`);
function fit(minDf, l2) {
  const df = new Map();
  for (const row of train) for (const token of engine.counts(row.text).keys()) df.set(token, (df.get(token) || 0) + 1);
  const tokens = [...df.keys()].filter(token => df.get(token) >= minDf).sort();
  const vocabulary = Object.fromEntries(tokens.map((token, index) => [token, index]));
  const model = {
    format: 'char-tfidf-softmax-v1', labels, ngram: [1, 3], vocabulary,
    idf: tokens.map(token => Math.log((train.length + 1) / (df.get(token) + 1)) + 1),
    weights: labels.map(() => Array(tokens.length).fill(0)), bias: labels.map(() => 0),
    threshold: 0.55, margin: 0.15, parameters: { minDf, l2, epochs: 400, learningRate: 3 }
  };
  const examples = train.map(row => ({ x: engine.vectorize(row.text, model), y: labels.indexOf(row.intent) }));
  const classCounts = labels.map(label => train.filter(row => row.intent === label).length);
  const classWeights = classCounts.map(count => train.length / (labels.length * count));
  for (let epoch = 0; epoch < model.parameters.epochs; epoch++) {
    const gradient = labels.map(() => new Float64Array(tokens.length));
    const biasGradient = labels.map(() => 0);
    for (const { x, y } of examples) {
      const p = engine.probabilities(x, model);
      for (let k = 0; k < labels.length; k++) {
        const error = (p[k] - (k === y ? 1 : 0)) * classWeights[y] / train.length;
        biasGradient[k] += error;
        for (const [index, value] of x) gradient[k][index] += error * value;
      }
    }
    for (let k = 0; k < labels.length; k++) {
      model.bias[k] -= 3 * biasGradient[k];
      for (let index = 0; index < tokens.length; index++) model.weights[k][index] -= 3 * (gradient[k][index] + l2 * model.weights[k][index]);
    }
  }
  return model;
}
function evaluate(data, predict) {
  const confusion = labels.map(() => labels.map(() => 0));
  let accepted = 0, correctAccepted = 0, otherAccepted = 0, correct = 0;
  const errors = [];
  for (const row of data) {
    const result = predict(row.text);
    const y = labels.indexOf(row.intent), predicted = labels.indexOf(result.intent);
    if (predicted >= 0) confusion[y][predicted]++;
    if (result.intent === row.intent) correct++;
    else errors.push({ id: row.id, text: row.text, expected: row.intent, predicted: result.intent });
    if (result.accepted) { accepted++; if (result.intent === row.intent) correctAccepted++; if (row.intent === 'other') otherAccepted++; }
  }
  const perClass = labels.map((label, k) => {
    const tp = confusion[k][k], support = data.filter(row => row.intent === label).length;
    const predicted = confusion.reduce((sum, line) => sum + line[k], 0);
    const precision = tp / (predicted || 1), recall = tp / (support || 1);
    return { label, support, precision, recall, f1: 2 * precision * recall / (precision + recall || 1) };
  });
  return { count: data.length, accuracy: correct / data.length, macroF1: perClass.reduce((s, x) => s + x.f1, 0) / labels.length,
    perClass, confusion, coverage: accepted / data.length, acceptedAccuracy: accepted ? correctAccepted / accepted : null,
    otherFalseAcceptance: otherAccepted / (data.filter(row => row.intent === 'other').length || 1), errors };
}
const candidates = [];
let best;
for (const minDf of [1, 2]) for (const l2 of [0.0003, 0.003]) {
  const model = fit(minDf, l2);
  const metrics = evaluate(dev, text => engine.predict(text, model));
  candidates.push({ parameters: model.parameters, devMacroF1: metrics.macroF1 });
  if (!best || metrics.macroF1 > best.score) best = { model, score: metrics.macroF1 };
}
const model = best.model;
let thresholdChoice;
for (const threshold of [0.35, 0.45, 0.55, 0.65]) for (const margin of [0.05, 0.1, 0.15, 0.2]) {
  model.threshold = threshold; model.margin = margin;
  const metrics = evaluate(dev, text => engine.predict(text, model));
  // Reward correct accepted answers, penalize wrong ones and out-of-domain acceptance.
  const value = metrics.coverage * ((metrics.acceptedAccuracy ?? 0) * 3 - 2) - metrics.otherFalseAcceptance;
  if (!thresholdChoice || value > thresholdChoice.value) thresholdChoice = { threshold, margin, value };
}
model.threshold = thresholdChoice.threshold; model.margin = thresholdChoice.margin;
const dataHash = crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');
model.version = dataHash.slice(0, 12);
model.training = { dataHash, counts: { train: train.length, dev: dev.length, test: test.length },
  provenance: [...new Set(rows.map(row => row.source))], limitation: 'Prototype; single-author synthetic data unless externally supplied; no clinical validation.' };
const policy = JSON.parse(fs.readFileSync(path.join(root, 'public/training-data.json'), 'utf8'));
const keywordPredict = text => {
  const ranked = policy.intents.map(intent => ({ intent: intent.id,
    score: intent.keywords.reduce((s, keyword) => s + (text.includes(keyword) ? 2 : 0), 0) })).sort((a, b) => b.score - a.score);
  return { intent: ranked[0].score >= 2 ? ranked[0].intent : 'other', accepted: ranked[0].score >= 2 };
};
// Test evaluation occurs only after model and rejection settings have been frozen.
const metrics = evaluate(test, text => engine.predict(text, model));
const baseline = evaluate(test, keywordPredict);
const majorityLabel = labels.slice().sort((a, b) => train.filter(r => r.intent === b).length - train.filter(r => r.intent === a).length)[0];
const majority = evaluate(test, () => ({ intent: majorityLabel, accepted: true }));
const start = performance.now();
for (let i = 0; i < 1000; i++) engine.predict(test[i % test.length].text, model);
const inferenceMs = (performance.now() - start) / 1000;
const report = { version: model.version, dataHash, runtime: process.version, platform: process.platform, counts: model.training.counts,
  provenance: model.training.provenance, limitation: model.training.limitation, candidates,
  selectedParameters: model.parameters, rejection: { threshold: model.threshold, margin: model.margin },
  dev: evaluate(dev, text => engine.predict(text, model)), test: metrics, keywordBaseline: baseline, majorityBaseline: majority,
  inferenceMs, targetChecks: { macroF1AtLeast080: metrics.macroF1 >= 0.8,
    improvesKeywordBy005: metrics.macroF1 - baseline.macroF1 >= 0.05,
    allClassRecallAtLeast070: metrics.perClass.every(row => row.recall >= 0.7) } };
const output = path.join(__dirname, 'artifacts', model.version);
fs.mkdirSync(output, { recursive: true });
for (const [file, value] of [['model.json', model], ['metrics.json', report], ['split-manifest.json', rows.map(({ id, split, group_id }) => ({ id, split, group_id }))]])
  fs.writeFileSync(path.join(output, file), JSON.stringify(value, null, 2) + '\n');
fs.writeFileSync(path.join(output, 'dataset.jsonl'), rows.map(row => JSON.stringify(row)).join('\n') + '\n');
fs.writeFileSync(path.join(__dirname, 'latest.json'), JSON.stringify({ version: model.version, artifactDirectory: `artifacts/${model.version}` }, null, 2) + '\n');
fs.mkdirSync(path.join(root, 'public/models'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/models/intent-model.json'), JSON.stringify(model) + '\n');
console.log(JSON.stringify({ version: model.version, counts: report.counts, testMacroF1: metrics.macroF1,
  keywordMacroF1: baseline.macroF1, coverage: metrics.coverage, acceptedAccuracy: metrics.acceptedAccuracy,
  rejection: report.rejection, inferenceMs, targetChecks: report.targetChecks }, null, 2));
