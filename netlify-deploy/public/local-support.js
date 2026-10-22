(function (root) {
  'use strict';
  const crisis = /(不想活|自杀|结束生命|伤害自己|自残|活不下去|想死|轻生|割腕|跳楼|没有活着的意义|suicid|kill myself|end my life)/i;
  const high = /(失眠|崩溃|撑不住|恐慌|心慌|胸闷|很绝望)/i;
  function reply(text, model, policy, engine) {
    if (crisis.test(text)) return { mode: 'safety-first', text: '你提到了可能伤害自己或结束生命的内容。请先联系身边可信任的人陪着你，远离可能伤害自己的物品。如果存在即时危险，请联系当地急救或报警服务，并联系学校心理中心或专业人员。你现在身边有人可以陪你吗？' };
    const prefix = high.test(text) ? '如果这些不适持续或加重，请联系身边可信任的人和专业支持。\n\n' : '';
    let intent;
    let mode;
    if (model) {
      const prediction = engine.predict(text, model);
      intent = prediction.accepted ? policy.intents.find(item => item.id === prediction.intent) : null;
      mode = 'model';
    } else {
      const ranked = policy.intents.map(item => ({ item, score: item.keywords.reduce((s, word) => s + (text.includes(word) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
      intent = ranked[0]?.score > 0 ? ranked[0].item : null;
      mode = 'fallback';
    }
    if (!intent) return { mode, text: prefix + '我还不确定你最想处理的困扰。你愿意说说最近发生了什么，以及你希望我先陪你梳理哪一点吗？' };
    return { mode, intent: intent.id, text: prefix + [intent.ack, intent.focus,
      intent.actions.slice(0, 2).map((action, index) => `${index + 1}. ${action}`).join('\n'), intent.question].join('\n\n') };
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { reply }; return; }
  const form = document.getElementById('local-support-form');
  if (!form) return;
  const button = form.querySelector('button');
  const output = document.getElementById('local-support-output');
  const status = document.getElementById('local-support-status');
  const policyReady = fetch('./training-data.json', { signal: AbortSignal.timeout(5000) }).then(response => {
    if (!response.ok) throw new Error(`Policy HTTP ${response.status}`);
    return response.json();
  }).then(policy => {
    if (!Array.isArray(policy.intents)) throw new Error('Invalid policy');
    return policy;
  }).catch(() => ({ intents: [] }));
  Promise.all([root.LocalIntentModel.ready, policyReady]).then(([model]) => {
    status.textContent = model ? '已就绪 · 在当前浏览器处理输入' : '模型暂不可用 · 使用备用回复';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = document.getElementById('local-support-input').value.trim();
    if (!text) return;
    button.disabled = true;
    try {
      const [model, policy] = await Promise.all([root.LocalIntentModel.ready, policyReady]);
      const result = reply(text, model, policy, root.LocalIntentModel);
      output.textContent = result.text;
      status.textContent = result.mode === 'safety-first' ? '请优先联系现实中的支持' : result.mode === 'model' ? '已回复 · 在当前浏览器处理输入' : '已使用备用回复';
    } catch (_) {
      output.textContent = '暂时无法生成回复，请稍后重试。若你正处于危险中，请立即联系身边可信任的人或当地急救服务。';
    } finally { button.disabled = false; }
  });
})(typeof window !== 'undefined' ? window : globalThis);
