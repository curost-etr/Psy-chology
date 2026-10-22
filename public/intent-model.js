(function (root) {
  'use strict';
  function normalize(text) {
    return String(text || '').normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim();
  }
  function counts(text, minN = 1, maxN = 3) {
    const chars = Array.from(normalize(text));
    const result = new Map();
    for (let n = minN; n <= maxN; n++) {
      for (let i = 0; i + n <= chars.length; i++) {
        const token = chars.slice(i, i + n).join('');
        result.set(token, (result.get(token) || 0) + 1);
      }
    }
    return result;
  }
  function vectorize(text, model) {
    const result = [];
    let norm = 0;
    for (const [token, count] of counts(text, ...model.ngram)) {
      if (!Object.prototype.hasOwnProperty.call(model.vocabulary, token)) continue;
      const index = model.vocabulary[token];
      const value = (1 + Math.log(count)) * model.idf[index];
      result.push([index, value]);
      norm += value * value;
    }
    norm = Math.sqrt(norm) || 1;
    return result.map(([index, value]) => [index, value / norm]);
  }
  function probabilities(vector, model) {
    const logits = model.weights.map((weights, k) =>
      vector.reduce((value, [index, x]) => value + weights[index] * x, model.bias[k]));
    const max = Math.max(...logits);
    const exp = logits.map(value => Math.exp(value - max));
    const total = exp.reduce((a, b) => a + b, 0);
    return exp.map(value => value / total);
  }
  function predict(text, model) {
    const normalized = normalize(text);
    if (!normalized || normalized.length > 2000) return { accepted: false, intent: null, reason: normalized ? 'too-long' : 'empty' };
    const vector = vectorize(normalized, model);
    const scores = probabilities(vector, model);
    const ranked = scores.map((confidence, index) => ({ intent: model.labels[index], confidence }))
      .sort((a, b) => b.confidence - a.confidence);
    const top = ranked[0];
    const margin = top.confidence - ranked[1].confidence;
    const accepted = vector.length > 0 && top.intent !== 'other' &&
      top.confidence >= model.threshold && margin >= model.margin;
    return { ...top, margin, accepted, reason: !vector.length ? 'unknown-vocabulary' : top.intent === 'other' ? 'other' : accepted ? 'accepted' : 'uncertain', scores: ranked };
  }
  const api = { normalize, counts, vectorize, probabilities, predict, model: null, error: null, ready: null };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.LocalIntentModel = api;
    api.ready = fetch('./models/intent-model.json', { signal: AbortSignal.timeout(5000) }).then(response => {
      if (!response.ok) throw new Error(`Intent model HTTP ${response.status}`);
      return response.json();
    }).then(model => {
      if (model.format !== 'char-tfidf-softmax-v1' || model.labels.length !== 7 ||
          model.weights.length !== model.labels.length || model.bias.length !== model.labels.length ||
          !model.weights.every(row => row.length === model.idf.length && row.every(Number.isFinite)) ||
          !model.idf.every(Number.isFinite) || !model.bias.every(Number.isFinite)) throw new Error('Invalid intent model');
      api.model = model;
      return model;
    }).catch(error => { api.error = error.message; return null; });
  }
})(typeof window !== 'undefined' ? window : globalThis);
