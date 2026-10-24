const express = require('express');
const path = require('path');
const fs = require('fs');
if (fs.existsSync(path.join(__dirname, '.env'))) process.loadEnvFile(path.join(__dirname, '.env'));
const { chat } = require('./ollama-chat');
const { ensureOllama } = require('./start-ollama');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Allow only explicitly listed website origins; do not expose Ollama itself.
const chatOrigins = new Set((process.env.CHAT_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean));
app.use('/api/chat', (req, res, next) => {
  const origin = req.get('Origin');
  const sameOrigin = origin === `${req.protocol}://${req.get('host')}`;
  if (origin && !sameOrigin && !chatOrigins.has(origin)) {
    return res.status(403).json({ ok: false, error: '当前网页域名未获允许，请配置后端 CHAT_ALLOWED_ORIGINS。' });
  }
  if (origin && chatOrigins.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.vary('Origin');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.post('/api/chat', chat);

const questions = [
  '最近一周内，你会因为期末考试而觉得明显焦虑吗？',
  '你是否经常担心自己复习不够，导致考试表现不佳？',
  '你是否会在睡前反复思考考试安排和复习进度？',
  '你会不会在学习时出现注意力难集中、心跳加快的情况？',
  '你是否曾出现过食欲不振、失眠或情绪低落的情况？',
  '你会不会对期末成绩预期过高而压力倍增？',
  '你是否会因为任务过多而感到难以开始复习？',
  '你会不会在班级/宿舍中频繁讨论“考不好怎么办”？',
  '你是否认为自己的情绪影响了平时学习效率？',
  '你是否希望获得更好的情绪管理和学习规划建议？'
];

const guidance = [
  {
    level: '轻度压力',
    title: '当前压力处于可控范围',
    message: '你目前的焦虑感比较轻，建议保持规律作息并适当安排复习节奏。',
    suggestions: [
      '每天固定学习与休息时间，避免熬夜冲刺。',
      '用番茄钟分段复习，每 25 分钟休息 5 分钟。',
      '每晚记录当日学习完成情况，增强成就感。'
    ]
  },
  {
    level: '中度压力',
    title: '存在明显焦虑信号',
    message: '你的焦虑水平已影响学习状态，建议主动进行情绪调节和任务拆解。',
    suggestions: [
      '优先完成最重要的三项任务，避免一次性处理过多。',
      '尝试深呼吸 5 分钟或进行 10 分钟轻度运动缓解紧张。',
      '将大型复习计划拆成每日小目标，逐步推进。'
    ]
  },
  {
    level: '重度压力',
    title: '需要及时疏导',
    message: '你目前的焦虑强度较高，建议尽快采取专业帮助或心理支持。',
    suggestions: [
      '主动和老师、同学沟通，寻求复习协作和情绪支持。',
      '若持续出现失眠、强烈焦虑或自我否定，及时联系心理咨询资源。',
      '将压力从“结果焦虑”转向“过程管理”，重新建立学习节奏。'
    ]
  }
];

function analyzeAnxiety(answers) {
  const total = answers.reduce((sum, value) => sum + Number(value), 0);
  const average = total / answers.length;

  let levelIndex = 0;
  if (average >= 3.5) levelIndex = 2;
  else if (average >= 2.4) levelIndex = 1;

  const report = guidance[levelIndex];
  return {
    score: Math.round(average * 20),
    level: report.level,
    title: report.title,
    message: report.message,
    suggestions: report.suggestions,
    questions
  };
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: '服务正常运行' });
});

app.get('/api/questions', (req, res) => {
  res.json({ questions });
});

app.post('/api/analyze', (req, res) => {
  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return res.status(400).json({ error: 'answers 数组必须包含 10 个有效评分值' });
  }

  const valid = answers.every((v) => Number.isFinite(Number(v)) && Number(v) >= 1 && Number(v) <= 5);
  if (!valid) {
    return res.status(400).json({ error: '每个评分都必须是 1 到 5 之间的整数' });
  }

  const result = analyzeAnxiety(answers);
  res.json({ result });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  try {
    await ensureOllama();
  } catch (error) {
    console.warn(`Ollama 启动提示：${error.message} 网站仍可使用本地兜底回复。`);
  }
  const server = app.listen(PORT, () => {
    console.log(`服务已启动：http://localhost:${PORT}`);
  });
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE' ? `端口 ${PORT} 已被占用，请先停止旧项目服务。` : `网站启动失败：${error.message}`);
    process.exitCode = 1;
  });
}
start();
