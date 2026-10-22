# GitHub Pages 部署说明

当前版本已经适配为纯静态部署：

- 前端页面位于 `public/`
- 聊天不再依赖 Node.js 后端
- 浏览器会直接加载免费公开的心理健康分类模型
- 因此可以直接部署到 GitHub Pages

## 当前模型方案

这个免费方案没有继续使用 `PsycoLLM`，也没有直接使用原始 `Mental-BERT`。

原因是：

- `MindIntLab/PsycoLLM` 需要服务端推理端点
- `mental/mental-bert-base-uncased` 本身是 gated，而且不适合直接在 GitHub Pages 里免费浏览器推理

因此，当前静态版改成了浏览器端加载公开 ONNX 心理健康分类模型，作为对话辅助筛查：

- `RyanGao/mental-roberta-depression-onnx`
- `RyanGao/mental-roberta-suicide-onnx`

它们适合免费静态部署，但更偏向英文文本分类。中文场景下，页面仍会继续使用本地风险规则与本地疏导逻辑。

## 直接部署到 GitHub

仓库里已经有 GitHub Pages 工作流：

- `.github/workflows/deploy-pages.yml`

你只需要：

1. 把当前项目推到 GitHub 仓库
2. 打开仓库的 `Settings -> Pages`
3. 在 `Build and deployment` 里把 `Source` 设为 `GitHub Actions`
4. 提交到默认分支后，GitHub 会自动部署

## 部署后效果

部署成功后：

- 页面可以直接访问
- 量表评估仍可使用
- 聊天可以在浏览器端运行
- 不需要单独购买服务器或推理 API

## 适用范围说明

这个版本更适合：

- 比赛展示
- 静态网页发布
- 无服务器、低成本演示

如果你后续要追求更强的中文心理对话能力，再考虑把模型切回服务端部署方案，例如：

- 私有推理服务
- 云端 GPU 部署
- 重新接入中文对话大模型
