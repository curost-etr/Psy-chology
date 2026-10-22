import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0";

const DEPRESSION_MODEL = "RyanGao/mental-roberta-depression-onnx";
const SUICIDE_MODEL = "RyanGao/mental-roberta-suicide-onnx";

env.allowLocalModels = false;
env.useBrowserCache = true;

const state = {
  promise: null,
  depressionClassifier: null,
  suicideClassifier: null,
  status: "idle",
  error: ""
};

function emitStatus(extra = {}) {
  document.dispatchEvent(
    new CustomEvent("mental-model-status", {
      detail: {
        status: state.status,
        error: state.error,
        ...extra
      }
    })
  );
}

function shouldUseEnglishMentalModel(text) {
  const letters = (text.match(/[A-Za-z]/g) || []).length;
  const cjk = (text.match(/[\u3400-\u9FFF]/g) || []).length;
  return letters >= 12 && letters >= cjk * 2;
}

async function loadClassifiers() {
  if (state.depressionClassifier && state.suicideClassifier) {
    return state;
  }
  if (!state.promise) {
    state.status = "loading";
    emitStatus({ message: "正在加载浏览器端心理健康模型..." });
    state.promise = Promise.all([
      pipeline("text-classification", DEPRESSION_MODEL),
      pipeline("text-classification", SUICIDE_MODEL)
    ])
      .then(([depressionClassifier, suicideClassifier]) => {
        state.depressionClassifier = depressionClassifier;
        state.suicideClassifier = suicideClassifier;
        state.status = "ready";
        emitStatus({
          message: "浏览器端心理健康模型已就绪。",
          models: [DEPRESSION_MODEL, SUICIDE_MODEL]
        });
        return state;
      })
      .catch((error) => {
        state.status = "error";
        state.error = error instanceof Error ? error.message : String(error);
        emitStatus({ message: "浏览器端心理健康模型加载失败。" });
        throw error;
      });
  }
  return state.promise;
}

function pickPositiveScore(results, positiveLabel) {
  const items = Array.isArray(results) ? results : [results];
  const match = items.find((item) => String(item.label).toLowerCase() === positiveLabel);
  return match ? Number(match.score || 0) : 0;
}

async function analyze(text) {
  if (!text || !text.trim()) {
    return { available: false, reason: "empty-input" };
  }
  if (!shouldUseEnglishMentalModel(text)) {
    return { available: false, reason: "non-english-input" };
  }

  await loadClassifiers();
  const [depressionResults, suicideResults] = await Promise.all([
    state.depressionClassifier(text, { top_k: 2 }),
    state.suicideClassifier(text, { top_k: 2 })
  ]);

  const depressionScore = pickPositiveScore(depressionResults, "depression");
  const suicideScore = pickPositiveScore(suicideResults, "suicide");

  let level = "low";
  if (suicideScore >= 0.7) level = "high";
  else if (depressionScore >= 0.72 || suicideScore >= 0.45) level = "medium";

  return {
    available: true,
    level,
    depressionScore,
    suicideScore,
    source: "browser-mental-health-onnx"
  };
}

window.mentalHealthModel = {
  analyze,
  preload: loadClassifiers
};

loadClassifiers().catch(() => {});
