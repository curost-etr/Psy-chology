const questionGroups = [
  {
    key: "emotion",
    title: "情绪体验",
    description: "聚焦备考中的焦虑、紧张和情绪波动。",
    questions: [
      "最近一周内，你会因为考试或学业安排而明显感到焦虑吗？",
      "你是否经常担心自己准备不够，导致结果不理想？",
      "你会不会因为对结果期待过高而感到额外压力？"
    ]
  },
  {
    key: "cognition",
    title: "认知与专注",
    description: "观察反复思考、专注下降与认知负荷。",
    questions: [
      "你是否会在睡前反复思考复习进度或接下来的安排？",
      "你在学习时是否出现难以集中注意力、烦躁或心慌的情况？",
      "你认为情绪已经影响到日常学习效率了吗？"
    ]
  },
  {
    key: "behavior",
    title: "行为与作息",
    description: "检视睡眠、状态消耗和启动难度。",
    questions: [
      "你最近是否出现过失眠、食欲下降或情绪低落？",
      "你是否会因为任务太多而很难开始行动？",
      "你是否经常和身边人讨论“如果结果不好怎么办”？"
    ]
  },
  {
    key: "support",
    title: "支持与干预意愿",
    description: "了解对支持、建议和干预的开放程度。",
    questions: ["你是否希望获得更具体的情绪管理和行动建议？"]
  }
];

const flatQuestions = questionGroups.flatMap((group) =>
  group.questions.map((question) => ({ group: group.key, groupTitle: group.title, question }))
);

const scoreLabels = ["几乎没有", "偶尔出现", "有时出现", "经常出现", "非常明显"];

const guidance = [
  {
    key: "stable",
    level: "低风险",
    title: "当前状态整体可控",
    message: "你目前更像是处在正常压力范围内，整体节奏仍有稳定基础。",
    suggestions: [
      "保留固定学习和收尾时段，减少节奏漂移。",
      "不要靠临时熬夜换安全感，优先保住睡眠。",
      "用可见的小进展维持状态，而不是盯着最终结果。"
    ]
  },
  {
    key: "mild",
    level: "轻度焦虑",
    title: "已经出现明确压力信号",
    message: "你已经感受到明显压力，若不及时调整，后续很容易演变为持续内耗。",
    suggestions: [
      "先缩小今天的目标，不要试图一次解决全部问题。",
      "在学习块之间插入短时呼吸、散步或拉伸。",
      "减少和他人的无效比较，把注意力拉回自己的进度。"
    ]
  },
  {
    key: "moderate",
    level: "中度焦虑",
    title: "焦虑正在明显干扰状态",
    message: "你的情绪和任务压力已经形成相互放大的趋势，需要同时处理情绪与行动结构。",
    suggestions: [
      "把任务拆成可启动的最小动作，先恢复行动感。",
      "优先处理睡眠、饮食和精力透支问题，再谈效率。",
      "尽量引入现实中的支持者，避免长期独自消耗。"
    ]
  },
  {
    key: "high",
    level: "高风险",
    title: "需要及时疏导与支持",
    message: "你当前已经接近持续高压状态，策略上应优先稳定、减负和寻求支持。",
    suggestions: [
      "今天先降低负荷，不继续透支身体和注意力。",
      "让目标从“做完全部”改成“守住最重要的一步”。",
      "如持续失眠、崩溃感强或明显自我否定，请尽快联系专业支持。"
    ]
  }
];

const causeLibrary = {
  workload: {
    label: "任务堆积",
    tips: "需要先拆任务，而不是继续扩大心理负担。"
  },
  time: {
    label: "节奏失衡",
    tips: "先恢复稳定作息和固定行动窗口。"
  },
  fear: {
    label: "结果担忧",
    tips: "策略重点是把注意力拉回过程和当下动作。"
  },
  burnout: {
    label: "身心透支",
    tips: "先减负和恢复，再追求效率提升。"
  },
  support: {
    label: "支持不足",
    tips: "现实支持越弱，越需要降低单人承担的强度。"
  }
};

const keywordMap = [
  { key: "fear", words: ["挂科", "失败", "成绩", "排名", "考不好"] },
  { key: "time", words: ["来不及", "拖延", "熬夜", "进度", "时间"] },
  { key: "workload", words: ["任务", "学不完", "太多", "做不完"] },
  { key: "burnout", words: ["睡不着", "崩溃", "很累", "失眠", "撑不住"] }
];

const statusWeightMap = {
  freshman: 0.15,
  undergraduate: 0.2,
  postgraduate: 0.35,
  intern: 0.55,
  working: 0.5
};

const statusLabelMap = {
  freshman: "大一/高中升学阶段",
  undergraduate: "本科在读",
  postgraduate: "考研/研究生",
  intern: "实习与备考并行",
  working: "在职/工作备考"
};

const stressorLabelMap = {
  exam: "考试成绩与排名",
  unfinished: "复习内容未完成",
  sleep: "作息或睡眠问题",
  internship: "实习/工作冲突",
  family: "家庭或外界期望",
  future: "对未来不确定"
};

const intakeLabelMap = {
  concern: {
    exam: "考试与成绩焦虑",
    task: "任务太多，无法启动",
    sleep: "失眠、疲惫、身体状态差",
    future: "对未来、升学或就业不确定",
    relationship: "关系与人际压力",
    mixed: "多种压力交织"
  },
  intensity: {
    low: "低强度",
    medium: "中强度",
    high: "高强度"
  },
  goal: {
    comfort: "先安抚陪伴",
    plan: "先拆解计划",
    clarify: "先理清问题",
    mixed: "安抚和计划并行"
  },
  support: {
    yes: "现实支持充足",
    limited: "现实支持有限",
    no: "现实支持缺失"
  }
};

const crisisPattern =
  /(不想活|活不下去|想死|自杀|结束生命|轻生|伤害自己|割腕|跳楼|没有活着的意义)/i;
const highStressPattern = /(失眠|崩溃|撑不住|特别焦虑|恐慌|喘不过气|心慌|很绝望)/i;
const strongStressPattern = /(失眠|崩溃|焦虑|压力|考不好|撑不住)/;
const STORAGE_KEY = "mindbell-assessment-history";
const CHAT_SUMMARY_STORAGE_KEY = "mindbell-chat-summary";

const intakeForm = document.getElementById("intake-form");
const intakeSummary = document.getElementById("intake-summary");
const form = document.getElementById("assessment-form");
const questionsBox = document.getElementById("questions");
const resultBox = document.getElementById("result");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatFeed = document.getElementById("chat-feed");
const chatStatus = document.getElementById("chat-status");
const conversationInsights = document.getElementById("conversation-insights");
const conversationOverview = document.getElementById("conversation-overview");

let latestReport = null;
let chatHistory = [];
let latestIntake = null;
let trainingData = {
  replyPolicy: {
    maxActions: 2,
    maxParagraphs: 4
  },
  intents: []
};
let mentalModelStatus = {
  status: "loading",
  error: "",
  message: "正在加载浏览器端心理健康模型..."
};

async function loadTrainingData() {
  try {
    const response = await fetch("./training-data.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data?.intents)) {
      trainingData = {
        replyPolicy: {
          ...trainingData.replyPolicy,
          ...(data.replyPolicy || {})
        },
        intents: data.intents
      };
    }
  } catch (error) {
    console.warn("Training data unavailable, using built-in reply rules:", error);
  }
}

function renderQuestions() {
  questionGroups.forEach((group) => {
    const wrapper = document.createElement("section");
    wrapper.className = "question-group";

    const groupIndexStart = flatQuestions.findIndex((item) => item.group === group.key);
    wrapper.innerHTML = `
      <div class="group-heading">
        <div>
          <p class="section-kicker">${group.title}</p>
          <h4>${group.description}</h4>
        </div>
      </div>
      <div class="questions"></div>
    `;

    const innerQuestions = wrapper.querySelector(".questions");
    group.questions.forEach((question, localIndex) => {
      const index = groupIndexStart + localIndex;
      const item = document.createElement("section");
      item.className = "question-card";
      item.innerHTML = `
        <p class="question-title">${index + 1}. ${question}</p>
        <div class="scale-row">
          ${scoreLabels
            .map(
              (label, labelIndex) => `
                <label class="scale-option">
                  <input type="radio" name="q${index}" value="${labelIndex + 1}" required />
                  <span class="scale-value">${labelIndex + 1}</span>
                  <span class="scale-label">${label}</span>
                </label>
              `
            )
            .join("")}
        </div>
      `;
      innerQuestions.appendChild(item);
    });

    questionsBox.appendChild(wrapper);
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(report) {
  try {
    const history = getHistory();
    history.push({
      timestamp: new Date().toISOString(),
      score: report.score,
      level: report.stage.level,
      radar: report.radar
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-6)));
  } catch {
    // Ignore local storage failures.
  }
}

function getChatSummary() {
  try {
    const raw = localStorage.getItem(CHAT_SUMMARY_STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          totalMessages: 0,
          updatedAt: "",
          categories: {
            exam: 0,
            task: 0,
            sleep: 0,
            emotion: 0,
            future: 0,
            relationship: 0
          }
        };
  } catch {
    return {
      totalMessages: 0,
      updatedAt: "",
      categories: {
        exam: 0,
        task: 0,
        sleep: 0,
        emotion: 0,
        future: 0,
        relationship: 0
      }
    };
  }
}

function saveChatSummary(summary) {
  try {
    localStorage.setItem(CHAT_SUMMARY_STORAGE_KEY, JSON.stringify(summary));
  } catch {
    // Ignore local storage failures.
  }
}

function detectConversationTags(text) {
  const normalized = String(text || "").toLowerCase();
  return {
    exam: /考试|成绩|挂科|复习|排名|deadline|exam|grade|study/.test(normalized),
    task: /任务|计划|拖延|开始不了|效率|todo|task|plan|deadline/.test(normalized),
    sleep: /失眠|睡|熬夜|累|睡不着|sleep|tired|insomnia/.test(normalized),
    emotion: /焦虑|崩溃|难受|压抑|紧张|anx|panic|sad|stress|overwhelm/.test(normalized),
    future: /未来|就业|升学|读研|前途|future|career|job/.test(normalized),
    relationship: /家人|同学|老师|关系|朋友|family|friend|relationship/.test(normalized)
  };
}

function recordConversationSummary(text) {
  const summary = getChatSummary();
  const tags = detectConversationTags(text);

  summary.totalMessages += 1;
  summary.updatedAt = new Date().toISOString();
  Object.entries(tags).forEach(([key, matched]) => {
    if (matched) {
      summary.categories[key] = (summary.categories[key] || 0) + 1;
    }
  });

  saveChatSummary(summary);
  renderConversationInsights(summary);
}

function renderConversationInsights(summary = getChatSummary()) {
  if (!conversationInsights) return;

  const entries = [
    { key: "exam", icon: "✦", label: "考试压力", tip: "近期更常围绕成绩、复习与截止时间。"},
    { key: "task", icon: "↗", label: "任务启动", tip: "更常提到拖延、计划和行动阻滞。"},
    { key: "sleep", icon: "☾", label: "睡眠负担", tip: "作息、疲惫和睡眠相关困扰较常出现。"},
    { key: "emotion", icon: "◌", label: "情绪波动", tip: "焦虑、压抑或紧张表达占比更高。"},
    { key: "future", icon: "⌁", label: "未来担忧", tip: "更多集中在前途、升学或职业方向。"},
    { key: "relationship", icon: "◎", label: "关系压力", tip: "与家人、同学、老师的互动更常被提起。"}
  ];

  const ranked = entries
    .map((item) => ({
      ...item,
      value: Number(summary.categories?.[item.key] || 0)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const topTopic = ranked.find((item) => item.value > 0);
  if (conversationOverview) {
    conversationOverview.innerHTML = `
      <article class="overview-card">
        <span>累计用户消息</span>
        <strong>${summary.totalMessages}</strong>
      </article>
      <article class="overview-card">
        <span>当前最高频主题</span>
        <strong>${topTopic ? topTopic.label : "待生成"}</strong>
      </article>
    `;
  }

  if (!summary.totalMessages) {
    conversationInsights.innerHTML = `
      <article class="insight-card">
        <div class="insight-icon">◎</div>
        <div>
          <strong>还没有形成对话总结</strong>
          <p>开始聊天后，这里会把更常出现的困扰主题整理成图标卡片，方便展示用户使用趋势。</p>
        </div>
      </article>
    `;
    return;
  }

  const maxValue = Math.max(...ranked.map((item) => item.value), 1);
  conversationInsights.innerHTML = ranked
    .map(
      (item) => `
        <article class="insight-card">
          <div class="insight-icon">${item.icon}</div>
          <div>
            <strong>${item.label}</strong>
            <p>${item.tip}</p>
            <div class="insight-bar">
              <span style="width:${(item.value / maxValue) * 100}%"></span>
            </div>
            <div class="insight-meta">
              <span class="insight-pill">提及 ${item.value} 次</span>
              <span class="insight-pill">累计 ${summary.totalMessages} 条用户消息</span>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function getCategoryScores(answers) {
  const result = {};
  let cursor = 0;
  questionGroups.forEach((group) => {
    const values = answers.slice(cursor, cursor + group.questions.length);
    result[group.key] = {
      title: group.title,
      score: average(values)
    };
    cursor += group.questions.length;
  });
  return result;
}

function getCauseWeights(answers, metrics, profile, choices, stressors, text) {
  const weights = { workload: 0, time: 0, fear: 0, burnout: 0, support: 0 };

  weights.workload += answers[7] >= 4 ? 2 : 0;
  weights.time += answers[3] >= 4 ? 1.4 : 0;
  weights.fear += answers[1] >= 4 || answers[2] >= 4 ? 2 : 0;
  weights.burnout += answers[6] >= 4 || metrics.studyHours >= 5 ? 1.8 : 0;
  weights.support += choices.support === "no" ? 2.1 : 0;

  if (metrics.taskScore <= 2) weights.workload += 1.8;
  if (metrics.scheduleScore <= 2) weights.time += 1.6;
  if (metrics.fearScore >= 4) weights.fear += 1.7;
  if (choices.avoidance === "yes") weights.workload += 1.2;
  if (choices.comparison === "yes") weights.fear += 1.1;
  if (profile.status === "intern" || profile.status === "working") weights.time += 1.4;
  if (profile.status === "postgraduate") weights.fear += 0.9;

  stressors.forEach((item) => {
    if (item === "unfinished") weights.workload += 1.7;
    if (item === "sleep") {
      weights.burnout += 1.7;
      weights.time += 0.8;
    }
    if (item === "internship") weights.time += 1.8;
    if (item === "exam" || item === "future") weights.fear += 1.4;
    if (item === "family") weights.support += 1.1;
  });

  keywordMap.forEach(({ key, words }) => {
    if (words.some((word) => text.includes(word))) {
      weights[key] += 0.8;
    }
  });

  return weights;
}

function detectCauses(weights) {
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)
    .slice(0, 3)
    .map(([key]) => key);
}

function buildActionPlan(report) {
  if (report.stage.key === "stable") {
    return [
      "今天：只确认最关键的 1 到 2 个任务，不额外扩张清单。",
      "这周：保持固定睡眠和学习收尾时间。",
      "需要时：用简短记录代替反复担心。"
    ];
  }
  if (report.stage.key === "mild") {
    return [
      "今天：从一件 20 分钟内能启动的任务开始。",
      "这周：减少无效比较，拉回自己的节奏。",
      "需要时：短时散步、呼吸或拉伸中断紧绷感。"
    ];
  }
  if (report.stage.key === "moderate") {
    return [
      "今天：先把任务改成最小步骤，而不是追求完整推进。",
      "这周：优先修复睡眠和精力，再谈效率提升。",
      "需要时：找一位现实支持者同步你的卡点。"
    ];
  }
  return [
    "今天：先减负，不继续透支身体和情绪。",
    "这周：尽快联系老师、家人、同学或专业支持。",
    "需要时：如果崩溃感、失眠或强烈自责持续，请立即升级求助。"
  ];
}

function analyzeState(answers, metrics, profile, choices, stressors, text) {
  const surveyAverage = average(answers);
  const behaviorPressure =
    (6 - metrics.scheduleScore + (6 - metrics.taskScore) + metrics.fearScore + metrics.studyHours) / 4;
  const textPressure = clamp(text.length / 60, 0, 2) + (strongStressPattern.test(text) ? 0.8 : 0);
  const profilePressure =
    (profile.age <= 18 ? 0.15 : 0) +
    (profile.age >= 24 ? 0.1 : 0) +
    (statusWeightMap[profile.status] || 0);
  const choicePressure =
    (choices.avoidance === "yes" ? 0.3 : 0) +
    (choices.comparison === "yes" ? 0.2 : 0) +
    (choices.support === "no" ? 0.35 : -0.1) +
    stressors.length * 0.08;
  const overallScore =
    surveyAverage * 0.52 + behaviorPressure * 0.23 + textPressure * 0.12 + profilePressure + choicePressure;

  let stage = guidance[0];
  if (overallScore >= 4.1) stage = guidance[3];
  else if (overallScore >= 3.35) stage = guidance[2];
  else if (overallScore >= 2.45) stage = guidance[1];

  const categoryScores = getCategoryScores(answers);
  const causeWeights = getCauseWeights(answers, metrics, profile, choices, stressors, text);
  const causes = detectCauses(causeWeights);

  return {
    stage,
    score: Math.round(clamp(overallScore / 5, 0, 1) * 100),
    causes,
    causeWeights,
    radar: {
      情绪波动: clamp((answers[0] + answers[6]) / 2, 1, 5),
      专注压力: clamp((answers[4] + answers[8]) / 2, 1, 5),
      时间秩序: clamp(6 - metrics.scheduleScore, 1, 5),
      结果担忧: clamp((answers[1] + metrics.fearScore) / 2, 1, 5),
      任务负荷: clamp((answers[7] + (6 - metrics.taskScore)) / 2, 1, 5)
    },
    categoryScores,
    actionPlan: buildActionPlan({ stage }),
    profile: {
      age: profile.age,
      statusLabel: statusLabelMap[profile.status] || statusLabelMap.undergraduate
    },
    stressorSummary:
      stressors.length > 0
        ? stressors.map((item) => stressorLabelMap[item] || item).join("、")
        : "未额外选择主要压力源"
  };
}

function buildRadar(radar) {
  return `
    <div class="radar-list">
      ${Object.entries(radar)
        .map(([label, value]) => {
          const width = `${(value / 5) * 100}%`;
          return `
            <div class="radar-item">
              <div class="radar-head">
                <span>${label}</span>
                <strong>${value.toFixed(1)} / 5</strong>
              </div>
              <div class="radar-track">
                <span class="radar-fill" style="width:${width}"></span>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function buildCategoryCards(categoryScores) {
  return `
    <div class="category-grid">
      ${Object.values(categoryScores)
        .map(
          (item) => `
            <div class="mini-stat">
              <span>${item.title}</span>
              <strong>${item.score.toFixed(1)} / 5</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function buildCauseBars(weights) {
  const maxWeight = Math.max(...Object.values(weights), 1);
  return `
    <div class="cause-bars">
      ${Object.entries(weights)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value]) => {
          const percent = `${(value / maxWeight) * 100}%`;
          return `
            <div class="bar-row">
              <div class="bar-head">
                <span>${causeLibrary[key].label}</span>
                <strong>${value.toFixed(1)}</strong>
              </div>
              <div class="radar-track">
                <span class="radar-fill" style="width:${percent}"></span>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function buildTrend(history) {
  if (history.length <= 1) {
    return '<p class="plain-tip">完成 2 次以上评估后，这里会显示近期变化趋势。</p>';
  }

  return `
    <div class="trend-list">
      ${history
        .map(
          (item, index) => `
            <div class="trend-item">
              <span>第 ${index + 1} 次</span>
              <div class="trend-track">
                <span class="trend-fill" style="width:${item.score}%"></span>
              </div>
              <strong>${item.score}</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderResult(report) {
  const causeMarkup =
    report.causes.length > 0
      ? report.causes
          .map(
            (cause) => `
              <div class="cause-chip">
                <strong>${causeLibrary[cause].label}</strong>
                <span>${causeLibrary[cause].tips}</span>
              </div>
            `
          )
          .join("")
      : '<p class="plain-tip">当前没有识别出单一特别突出的诱因，建议先守住基础作息和节奏。</p>';

  const history = getHistory();

  resultBox.className = "result-card";
  resultBox.innerHTML = `
    <div class="result-topline">
      <span class="badge">${report.stage.level}</span>
      <span class="score-pill">综合指数 ${report.score}</span>
    </div>
    <h3>${report.stage.title}</h3>
    <p class="result-message">${report.stage.message}</p>

    <section class="result-section">
      <h4>分组概览</h4>
      ${buildCategoryCards(report.categoryScores)}
    </section>

    <section class="result-section">
      <h4>主要诱因</h4>
      <div class="cause-list">${causeMarkup}</div>
    </section>

    <section class="result-section">
      <h4>诱因强度</h4>
      ${buildCauseBars(report.causeWeights)}
    </section>

    <section class="result-section">
      <h4>背景摘要</h4>
      <ul class="result-list">
        <li>年龄：${report.profile.age} 岁</li>
        <li>当前状态：${report.profile.statusLabel}</li>
        <li>压力来源：${report.stressorSummary}</li>
      </ul>
    </section>

    <section class="result-section">
      <h4>行动建议</h4>
      <ul class="result-list">
        ${report.stage.suggestions.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="result-section">
      <h4>72 小时行动计划</h4>
      <ol class="result-list">
        ${report.actionPlan.map((item) => `<li>${item}</li>`).join("")}
      </ol>
    </section>

    <section class="result-section">
      <h4>状态雷达</h4>
      ${buildRadar(report.radar)}
    </section>

    <section class="result-section">
      <h4>近期趋势</h4>
      ${buildTrend(history)}
    </section>

    <section class="result-section export-actions">
      <button class="secondary-btn" type="button" id="download-report-btn">生成文本报告</button>
      <button class="secondary-btn" type="button" id="print-report-btn">导出/打印当前页</button>
    </section>
  `;

  document.getElementById("download-report-btn")?.addEventListener("click", downloadReport);
  document.getElementById("print-report-btn")?.addEventListener("click", () => window.print());

  chatStatus.textContent = "详细评估已接入对话上下文，后续回复会更细化。";
}

function buildReportText(report) {
  return [
    "MindBell 评估报告",
    "",
    `综合结果：${report.stage.level} / 指数 ${report.score}`,
    `标题判断：${report.stage.title}`,
    `背景概览：${report.profile.age} 岁，${report.profile.statusLabel}`,
    `主要压力源：${report.stressorSummary}`,
    "",
    "分组量表分数：",
    ...Object.values(report.categoryScores).map((item) => `- ${item.title}：${item.score.toFixed(1)} / 5`),
    "",
    "主要诱因：",
    ...report.causes.map((cause) => `- ${causeLibrary[cause].label}：${causeLibrary[cause].tips}`),
    "",
    "个性化建议：",
    ...report.stage.suggestions.map((item) => `- ${item}`),
    "",
    "72 小时行动计划：",
    ...report.actionPlan.map((item, index) => `${index + 1}. ${item}`)
  ].join("\n");
}

function downloadReport() {
  if (!latestReport) return;
  const blob = new Blob([buildReportText(latestReport)], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "mindbell-report.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderIntakeSummary(profile) {
  intakeSummary.className = "intake-summary";
  intakeSummary.innerHTML = `
    <p class="summary-title">画像已建立</p>
    <div class="summary-tags">
      <span>${intakeLabelMap.concern[profile.concern]}</span>
      <span>${intakeLabelMap.intensity[profile.intensity]}</span>
      <span>${intakeLabelMap.goal[profile.goal]}</span>
      <span>${intakeLabelMap.support[profile.support]}</span>
    </div>
    <p>系统会优先按这组信息调整提问顺序、回复速度和建议颗粒度。</p>
  `;
}

function buildAssessmentContext(assessment) {
  if (!assessment || typeof assessment !== "object") return "";
  const level = assessment.level || assessment.stage?.level || "未评估";
  const score = assessment.score ?? "未知";
  const causes = Array.isArray(assessment.causes) ? assessment.causes.join("、") : "";
  const stressorSummary = assessment.stressorSummary || "";
  return [
    `评估等级：${level}`,
    `综合指数：${score}`,
    causes ? `主要诱因：${causes}` : "",
    stressorSummary ? `压力来源：${stressorSummary}` : ""
  ]
    .filter(Boolean)
    .join("；");
}

function buildIntakeContext(intake) {
  if (!intake || typeof intake !== "object") return "";
  return [
    intake.concern ? `主要困扰：${intakeLabelMap.concern[intake.concern] || intake.concern}` : "",
    intake.intensity ? `情绪强度：${intakeLabelMap.intensity[intake.intensity] || intake.intensity}` : "",
    intake.goal ? `期望帮助：${intakeLabelMap.goal[intake.goal] || intake.goal}` : "",
    intake.support ? `现实支持：${intakeLabelMap.support[intake.support] || intake.support}` : ""
  ]
    .filter(Boolean)
    .join("；");
}

function detectRisk(message, history) {
  const text = [message, ...history.map((item) => item.content || "")].join(" ");
  if (crisisPattern.test(text)) {
    return {
      level: "crisis",
      notice:
        "我注意到你提到了可能伤害自己或结束生命的内容。这已经超出普通情绪支持范围，请立即联系身边可信任的人，并尽快联系学校心理中心、当地心理援助热线或急救资源。现在不要一个人承受。"
    };
  }
  if (highStressPattern.test(text)) {
    return {
      level: "high",
      notice:
        "你现在的压力信号比较强，这里可以先陪你梳理，但如果失眠、崩溃感或明显身心不适持续存在，建议尽快联系老师、家人或专业支持。"
    };
  }
  return { level: "normal", notice: "" };
}

function mergeRiskWithModel(risk, modelSignal) {
  if (!modelSignal?.available) return risk;
  if (risk.level === "crisis") return risk;
  if (modelSignal.level === "high") {
    return {
      level: "high",
      notice:
        risk.notice ||
        "心理健康模型提示你的表达里有较强的高危信号。它不能替代专业评估，但建议你尽快联系身边可信任的人或专业支持。"
    };
  }
  if (modelSignal.level === "medium" && risk.level === "normal") {
    return {
      level: "high",
      notice:
        "心理健康模型提示这段表达里有比较明显的低落或失控风险。这里可以继续陪你梳理，但也建议尽快引入现实中的支持。"
    };
  }
  return risk;
}

function buildModelInsight(modelSignal) {
  if (!modelSignal?.available) return "";
  if (modelSignal.level === "high") {
    return "浏览器端心理健康模型检测到较强的高危信号，这个结果只能作为辅助筛查，但说明现在更重要的是先确保安全、减少独自承受。";
  }
  if (modelSignal.level === "medium") {
    return "浏览器端心理健康模型提示你的表达中有明显的低落或压垮感，所以这轮回复会更偏向稳定情绪和减轻负担。";
  }
  return "浏览器端心理健康模型没有检测到特别强的附加风险信号，这轮回复会继续以你当前表达的困扰为主。";
}

function buildStrategy(intake, risk) {
  const strategy = {
    tone: "balanced",
    priority: "clarify",
    actionDepth: "medium"
  };

  if (intake?.goal === "comfort") strategy.priority = "comfort";
  if (intake?.goal === "plan") strategy.priority = "plan";
  if (intake?.goal === "mixed") strategy.priority = "mixed";

  if (intake?.intensity === "high" || risk.level === "high") {
    strategy.tone = "stabilize";
    strategy.actionDepth = "small-step";
  }
  if (intake?.concern === "task") strategy.priority = "plan";
  if (intake?.concern === "sleep") {
    strategy.tone = "stabilize";
    strategy.actionDepth = "recovery-first";
  }
  if (intake?.support === "no") strategy.tone = "contain";

  return strategy;
}

function getTrainingTokens(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[\s,，。！？；;、：:"'“”‘’（）()【】\[\]<>《》]+/)
    .filter(Boolean);
}

function scoreTrainingIntent(intent, message, intake) {
  const text = String(message || "").toLowerCase();
  let score = 0;

  (intent.keywords || []).forEach((keyword) => {
    if (keyword && text.includes(String(keyword).toLowerCase())) score += 2;
  });

  if (intake?.concern && Array.isArray(intent.concerns) && intent.concerns.includes(intake.concern)) {
    score += 3;
  }

  if (intake?.goal === "plan" && intent.id === "task_start_block") score += 1;
  if (intake?.intensity === "high" && intent.id === "sleep_burnout") score += 1;

  return score;
}

function findTrainingIntent(message, intake) {
  const local = window.LocalIntentModel;
  if (local?.model) {
    const prediction = local.predict(message, local.model);
    return prediction.accepted
      ? (trainingData.intents || []).find(intent => intent.id === prediction.intent) || null
      : null;
  }
  const ranked = (trainingData.intents || [])
    .map((intent) => ({
      intent,
      score: scoreTrainingIntent(intent, message, intake)
    }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0]?.score >= 2) return ranked[0].intent;

  const tokens = getTrainingTokens(message);
  if (!tokens.length && intake?.concern) {
    return (trainingData.intents || []).find((intent) => intent.concerns?.includes(intake.concern)) || null;
  }

  return null;
}

function dedupeSentences(items) {
  const seen = new Set();
  return items.filter((item) => {
    const normalized = String(item || "").replace(/\s+/g, "");
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function selectTrainingActions(intent, strategy, risk) {
  const maxActions = Number(trainingData.replyPolicy?.maxActions || 2);
  const actions = Array.isArray(intent?.actions) ? [...intent.actions] : [];

  if (risk.level === "high") {
    const stableAction = actions.find((action) => /休息|停止|联系|支持|降|收尾|心慌|胸闷/.test(action));
    return dedupeSentences([stableAction, ...actions]).slice(0, maxActions);
  }

  if (strategy.priority === "plan") {
    const planAction = actions.find((action) => /分钟|动作|清单|开始|计时|任务/.test(action));
    return dedupeSentences([planAction, ...actions]).slice(0, maxActions);
  }

  return dedupeSentences(actions).slice(0, maxActions);
}

function buildBriefRiskLine(message, intake, risk) {
  if (risk.level === "high") {
    return "风险提示：如果失眠、心慌、崩溃感持续，优先联系身边可信任的人或学校心理支持。";
  }

  const flags = [];
  if (/一直|每天|反复|持续/.test(message)) flags.push("压力持续化");
  if (/没用|废物|不行|完了/.test(message)) flags.push("自我否定");
  if (/睡不着|吃不下|胸闷|心慌/.test(message)) flags.push("身心反应");
  if (intake?.support === "no") flags.push("现实支持偏弱");

  return flags.length ? `留意：${flags.join("、")}。` : "";
}

function buildTrainedLocalReply({ message, intake, strategy, risk, modelSignal }) {
  const local = window.LocalIntentModel;
  if (local?.model && !local.predict(message, local.model).accepted) {
    return "我还不确定你最想处理的困扰。你愿意说说最近发生了什么，以及你希望我先陪你梳理哪一点吗？";
  }
  const intent = findTrainingIntent(message, intake);
  const fallbackIntent = {
    label: "当前困扰",
    ack: "先抓最关键的一点：你现在需要的不是更多道理，而是一个能立刻开始的下一步。",
    focus: "把问题缩小到今天能处理的一小块。",
    actions: ["写下当前最卡的一件事。", "把它拆成一个 10 分钟内能完成的小动作。"],
    question: "你现在最卡的是情绪、任务，还是睡眠状态？"
  };
  const selected = intent || fallbackIntent;
  const actions = selectTrainingActions(selected, strategy, risk);
  const riskLine = buildBriefRiskLine(message, intake, risk);
  const modelLine =
    modelSignal?.available && modelSignal.level !== "low"
      ? "模型提示：当前表达有额外压力信号，所以回复会优先减负和稳定。"
      : "";

  const sections = [
    `先抓重点：${selected.ack}`,
    selected.focus ? `判断：${selected.focus}` : "",
    actions.length ? `现在做：\n${actions.map((action, index) => `${index + 1}. ${action}`).join("\n")}` : "",
    [riskLine || modelLine, selected.question ? `只回我一个点：${selected.question}` : ""].filter(Boolean).join("\n")
  ];

  return sections.filter(Boolean).slice(0, Number(trainingData.replyPolicy?.maxParagraphs || 4)).join("\n\n");
}

function providerCompanion({ assessmentContext, intakeContext, strategy, risk }) {
  const openingByTone = {
    balanced: "我先接住你现在的状态。",
    stabilize: "先不急着解决全部问题，我们先把状态稍微稳住。",
    contain: "你一个人扛到现在已经很不容易了，我先陪你把它说清楚。"
  };

  const parts = [openingByTone[strategy.tone] || openingByTone.balanced];
  if (intakeContext) parts.push(`我已经记住你的快速画像：${intakeContext}。`);
  if (assessmentContext) parts.push(`结合评估结果看，${assessmentContext}。`);
  if (risk.level === "high") {
    parts.push("此刻最重要的不是逼自己立刻高效，而是先减少继续失控的感觉。");
  } else {
    parts.push("你可以先只说最卡住你的那一个点，不用一次讲完整个局面。");
  }
  return parts.join("");
}

function providerCoach({ message, intake, strategy }) {
  const actions = [];
  const mentionsExam = /考试|成绩|挂科|排名/.test(message);
  const mentionsTask = /任务|计划|做不完|启动|开始/.test(message);
  const mentionsSleep = /睡|失眠|熬夜|累/.test(message);

  if (strategy.actionDepth === "recovery-first" || mentionsSleep) {
    actions.push("先把今晚的目标改成守住休息和停止继续透支。");
  }
  if (strategy.priority === "plan" || mentionsTask) {
    actions.push("把当前任务拆成 1 个 20 分钟内能启动的小动作。");
  }
  if (strategy.priority === "clarify") {
    actions.push("先区分你现在是“害怕结果”还是“行动卡住”，不要把它们混成一团。");
  }
  if (strategy.priority === "comfort") {
    actions.push("先允许自己暂时不完美，再决定下一步，而不是边自责边行动。");
  }
  if (mentionsExam) {
    actions.push("把注意力从最终结果拉回今天最能推进的一小块内容。");
  }
  if (actions.length === 0) {
    actions.push("先写下你最困扰的 1 个问题、1 个最小动作、1 个今晚能收尾的点。");
  }

  return `如果马上落到行动上，我建议你优先这样做：${actions.join("")}`;
}

function providerSentinel({ message, intake, risk }) {
  if (risk.level === "crisis") {
    return "当前已经出现高危表达，必须优先切换到安全与求助，不适合继续常规疏导。";
  }

  const flags = [];
  if (/一直|每天|反复|持续/.test(message)) flags.push("压力可能已经持续化");
  if (/没用|废物|不行|完了/.test(message)) flags.push("存在明显自我否定");
  if (/睡不着|吃不下|胸闷|心慌/.test(message)) flags.push("已经出现身心反应");
  if (intake?.support === "no") flags.push("现实支持偏弱");
  if (intake?.intensity === "high") flags.push("当前情绪强度偏高");

  if (flags.length === 0) {
    return "目前更像是高压情境下的紧绷状态，但仍然需要边推进事情边照顾自己。";
  }
  return `我额外注意到几个风险点：${flags.join("；")}。`;
}

function composeLocalReply({ message, assessment, history, intake, modelSignal = null }) {
  const safeHistory = Array.isArray(history) ? history.slice(-6) : [];
  const detectedRisk = detectRisk(message, safeHistory);
  const risk = mergeRiskWithModel(detectedRisk, modelSignal);
  const assessmentContext = buildAssessmentContext(assessment);
  const intakeContext = buildIntakeContext(intake);
  const strategy = buildStrategy(intake, risk);

  const providerOutputs = {
    companion: providerCompanion({ assessmentContext, intakeContext, strategy, risk }),
    coach: providerCoach({ message, intake, strategy }),
    sentinel: providerSentinel({ message, intake, risk })
  };

  if (risk.level === "crisis") {
    return {
      mode: "safety-first",
      risk,
      reply: [
        risk.notice,
        "如果你愿意，现在先做两件事：第一，立刻联系一位你信任的人；第二，离开可能伤害自己的环境或物品。",
        "你也可以直接告诉我你现在身边有没有人，我会帮你整理下一句怎么开口求助。"
      ].join("\n\n")
    };
  }

  const trainedReply = buildTrainedLocalReply({
    message,
    intake,
    strategy,
    risk,
    modelSignal
  });

  return {
    mode: "local-trained",
    risk,
    strategy,
    modelSignal,
    providerOutputs,
    provider: modelSignal?.available ? "mental-health-browser" : "local-static",
    reply: [risk.notice, trainedReply].filter(Boolean).join("\n\n")
  };
}

function appendMessage(role, content, meta) {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  article.innerHTML = `
    <div class="message-meta">
      <span>${role === "user" ? "你" : "MindBell"}</span>
      <span>${meta}</span>
    </div>
    <div class="message-bubble"></div>
  `;
  article.querySelector(".message-bubble").textContent = content;
  chatFeed.appendChild(article);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function setSendingState(isSending) {
  chatInput.disabled = isSending;
  const submitButton = chatForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = isSending;
    submitButton.textContent = isSending ? "发送中..." : "发送消息";
  }
}

function getAssistantMeta(data) {
  if (data.provider === "DeepSeek") return "DeepSeek API";
  if (data.provider === "Ollama") return "Ollama 本地模型";
  if (data.mode === "safety-first") return "安全优先";
  if (data.provider === "mental-health-browser") return "心理模型辅助";
  if (data.provider === "PsycoLLM") return "PsycoLLM";
  if (window.LocalIntentModel?.model) return "本地意图模型辅助";
  return "本地兜底回复";
}

function getChatStatusText(data) {
  if (data.provider === "DeepSeek") return `已由 DeepSeek API（${data.model || ""}）生成回复。`;
  if (data.provider === "Ollama") return `已由本机 Ollama 模型 ${data.model || ""} 生成回复。`;
  if (data.provider === "mental-health-browser") {
    if (data.modelSignal?.level === "high") {
      return "已使用浏览器端心理健康模型做辅助筛查，并按更高风险信号调整回复。";
    }
    if (data.modelSignal?.level === "medium") {
      return "已使用浏览器端心理健康模型做辅助筛查，当前回复更偏向稳定情绪与减负。";
    }
    return "已使用浏览器端心理健康模型辅助分析，这个版本可直接部署到 GitHub Pages。";
  }
  if (data.fallbackReason === "model-not-deployed") {
    return "PsycoLLM 当前不能直接走 Hugging Face 默认路由，请配置自定义推理端点；当前已切换本地兜底回复。";
  }
  if (data.fallbackReason === "invalid-api-key") {
    return "PsycoLLM 密钥不可用，请检查 .env 中的密钥；当前已切换本地兜底回复。";
  }
  if (data.fallbackReason === "rate-limited") {
    return "PsycoLLM 请求过于频繁，当前已切换本地兜底回复。";
  }
  if (data.risk?.level === "crisis") {
    return "系统检测到高危表达，已切换到安全优先回复。";
  }
  if (data.risk?.level === "high") {
    return data.provider === "PsycoLLM"
      ? "PsycoLLM 已按高压稳定策略生成更短、更聚焦的回复。"
      : "已使用本地减负与稳定策略生成回复。";
  }
  if (!latestIntake) {
    return data.provider === "PsycoLLM"
      ? "回复已生成。若先完成快速信息收集，后续针对性会更强。"
      : "已生成本地回复；补全画像后建议会更有针对性。";
  }
  return data.provider === "PsycoLLM"
    ? "PsycoLLM 已结合你的快速画像生成回复。"
    : "已结合你的快速画像，使用本地意图模型与疏导规则生成回复。";
}

function getServerChatFailureText(error) {
  if (error?.userMessage) return `${error.userMessage} 已使用浏览器本地回复。`;
  if (error?.name === "AbortError") {
    return "对话接口请求超时，已使用浏览器本地回复。";
  }
  if (error?.code === "chat-api-missing") {
    return "当前站点未提供 /api/chat 对话接口，已使用浏览器本地回复；启用 PsycoLLM 需要部署后端与推理端点。";
  }
  if (error?.status) {
    return `对话接口返回 HTTP ${error.status}，已使用浏览器本地回复。`;
  }
  return "对话接口连接失败或响应无效，已使用浏览器本地回复。";
}

async function getMentalModelSignal(message) {
  if (!window.mentalHealthModel?.analyze) {
    return { available: false, reason: "model-unavailable" };
  }

  try {
    return await window.mentalHealthModel.analyze(message);
  } catch (error) {
    return {
      available: false,
      reason: "model-error",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function requestServerChat(message) {
  const configuredBase = String(window.MindBellChatConfig?.apiBaseUrl || "").trim().replace(/\/+$/, "");
  if (!configuredBase && location.hostname.endsWith("github.io")) {
    const error = new Error("Missing chat backend");
    error.userMessage = "GitHub Pages 尚未配置对话后端地址，请配置 chat-config.js 中的 apiBaseUrl。";
    throw error;
  }
  if (configuredBase && !/^https:\/\//i.test(configuredBase)) {
    const error = new Error("HTTPS backend required");
    error.userMessage = "对话后端地址必须使用 HTTPS。";
    throw error;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 190000);

  try {
    const response = await fetch(`${configuredBase}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        history: chatHistory.slice(-10),
        assessment: latestReport,
        intake: latestIntake
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      const details = await response.json().catch(() => null);
      if (typeof details?.error === "string") error.userMessage = details.error;
      if (response.status === 404 || response.status === 405) error.code = "chat-api-missing";
      throw error;
    }
    if (!response.headers.get("content-type")?.includes("application/json")) {
      const error = new Error("Chat API did not return JSON");
      error.code = "chat-api-missing";
      throw error;
    }
    const data = await response.json();
    if (!data?.ok || !data.reply) throw new Error(data?.error || "empty server reply");
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sendChatMessage(message) {
  appendMessage("user", message, "刚刚");
  chatHistory.push({ role: "user", content: message });
  recordConversationSummary(message);
  setSendingState(true);
  chatStatus.textContent = "正在等待对话模型回复，请稍候...";

  try {
    const data = await requestServerChat(message);
    appendMessage("assistant", data.reply, getAssistantMeta(data));
    chatHistory.push({ role: "assistant", content: data.reply });
    chatStatus.textContent = getChatStatusText(data);
  } catch (serverError) {
    await window.LocalIntentModel?.ready;
    await trainingDataReady;
    const modelSignal = await getMentalModelSignal(message);
    const data = composeLocalReply({
      message,
      history: chatHistory,
      assessment: latestReport,
      intake: latestIntake,
      modelSignal
    });

    appendMessage("assistant", data.reply, getAssistantMeta(data));
    chatHistory.push({ role: "assistant", content: data.reply });
    chatStatus.textContent = `${getChatStatusText(data)} ${getServerChatFailureText(serverError)}`;
  } finally {
    setSendingState(false);
  }
}

document.addEventListener("mental-model-status", (event) => {
  mentalModelStatus = {
    ...mentalModelStatus,
    ...event.detail
  };

  if (chatHistory.length > 0) return;

  if (mentalModelStatus.status === "ready") {
    chatStatus.textContent = "浏览器端心理健康模型已就绪，这个版本可直接部署到 GitHub Pages。";
  } else if (mentalModelStatus.status === "error") {
    chatStatus.textContent = "浏览器端心理健康模型加载失败，当前将继续使用本地规则回复。";
  } else if (mentalModelStatus.status === "loading") {
    chatStatus.textContent = "正在加载浏览器端心理健康模型，请稍等片刻再开始对话。";
  }
});

intakeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(intakeForm);
  latestIntake = {
    concern: String(formData.get("concern") || "mixed"),
    intensity: String(formData.get("intensity") || "medium"),
    goal: String(formData.get("goal") || "mixed"),
    support: String(formData.get("support") || "limited")
  };
  renderIntakeSummary(latestIntake);
  chatStatus.textContent = "对话画像已建立，现在可以开始更有针对性的聊天。";
  appendMessage(
    "assistant",
    `我已经记住你的当前画像：${intakeLabelMap.concern[latestIntake.concern]}、${intakeLabelMap.intensity[latestIntake.intensity]}、${intakeLabelMap.goal[latestIntake.goal]}。你现在可以直接说最想先处理的那件事。`,
    "画像更新"
  );
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const answers = Array.from({ length: flatQuestions.length }, (_, index) => Number(formData.get(`q${index}`)));
  const metrics = {
    studyHours: Number(formData.get("studyHours")),
    scheduleScore: Number(formData.get("scheduleScore")),
    taskScore: Number(formData.get("taskScore")),
    fearScore: Number(formData.get("fearScore"))
  };
  const profile = {
    age: Number(formData.get("age")),
    status: String(formData.get("status") || "undergraduate")
  };
  const choices = {
    avoidance: String(formData.get("avoidance") || "no"),
    comparison: String(formData.get("comparison") || "no"),
    support: String(formData.get("support") || "yes")
  };
  const stressors = formData.getAll("stressors").map((item) => String(item));
  const stressText = String(formData.get("stressText") || "").trim();

  latestReport = analyzeState(answers, metrics, profile, choices, stressors, stressText);
  saveHistory(latestReport);
  renderResult(latestReport);
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.value = "";
  await sendChatMessage(message);
});

chatInput.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.value = "";
  await sendChatMessage(message);
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    chatInput.value = button.getAttribute("data-prompt") || "";
    chatInput.focus();
  });
});

renderConversationInsights();
const trainingDataReady = loadTrainingData();
chatStatus.textContent = "正在加载浏览器端心理健康模型；完成后可直接作为 GitHub Pages 静态站点使用。";
renderQuestions();
