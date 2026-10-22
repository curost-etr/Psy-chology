const fs = require('fs');
const filename = '人工智能算法大赛技术报告.md';
const original = fs.readFileSync(filename, 'utf8');
if (!fs.existsSync('人工智能算法大赛技术报告_优化前.md')) fs.writeFileSync('人工智能算法大赛技术报告_优化前.md', original);
const intro = '本作品面向大学生期末备考中的结果担忧、任务堆积和作息失衡，构建“画像收集—状态评估—诱因解释—个性化疏导”辅助流程。系统融合问卷、行为自报和文本规则，输出可解释的状态指数；通过六类意图匹配简短行动建议，并优先处理显式危机表达。浏览器端接入公开ONNX分类模型，后端支持可选PsycoLLM接口及失败回退。当前已完成网页原型与六项基础逻辑核验，支持静态展示和本地服务运行。作品适用于校园情绪支持与参赛演示，模型准确率和心理改善效果仍待正式评测，不替代专业诊断。';
let content = original.slice(original.indexOf('## 1 项目背景与任务定义'));
const headings = {
  '## 1 项目背景与任务定义':'## 一、项目概述',
  '## 2 技术架构与运行流程':'## 二、技术方案与实现\n\n### （一）总体架构与运行流程',
  '## 3 多源状态评估算法':'### （二）多源状态评估算法',
  '## 4 个性化疏导算法':'### （三）个性化疏导算法',
  '## 5 预训练模型与风险处理':'### （四）预训练模型与风险处理',
  '## 6 工程实现与数据管理':'### （五）工程实现与数据管理',
  '## 7 实现核验与实验设计':'### （六）实现核验与实验设计',
  '## 8 项目特点与应用价值':'### （七）作品特点与应用价值',
  '## 9 局限与改进方向':'### （八）局限与改进方向',
  '## 10 结论':'### （九）阶段成果与结论',
  '## 附录 A 参赛演示与提交材料':'## 三、附录\n\n### （一）参赛演示与提交材料',
  '## 附录 B 技术来源':'### （二）技术来源与引用'
};
content = content.replace(/^### ([2-7])\.(\d+) (.+)$/gm, '#### $1.$2 $3');
for (const [a,b] of Object.entries(headings)) content = content.replace(a,b);
content = content.replace('### 1.1 应用需求','### （一）项目背景与意义').replace('### 1.2 研究目标','### （二）赛题方向定位与研究目标').replace('### 1.3 输入与输出','### （三）输入与输出');
content = content.replace('### （二）赛题方向定位与研究目标\n', '### （二）赛题方向定位与研究目标\n\n作品拟定位于人工智能算法在校园心理支持场景中的应用，重点呈现可解释多源规则融合、画像驱动意图匹配及预训练模型辅助风险筛查。具体赛题名称和所属方向需依据报名信息填写，不能仅凭模板推定官方分组。\n');
content = content.replace('#### 2.3 关键文件', '#### 2.3 前端运行界面\n\n[[IMAGE_FRONTEND]]\n\n图 1  项目本地服务运行截图：快速画像输入与评估入口（未填写初始状态）\n\n截图来自当前项目在本机 http://localhost:3000 的实际页面，不包含真实用户心理数据。页面将困扰、情绪强度、帮助偏好和现实支持组织为四项输入；评估结果在完成问卷后生成。\n\n#### 2.4 关键文件');
content = content.replace('```text\n用户输入', '```text\n用户输入');
const header = `# 2026年第八届\n# 全球校园人工智能算法精英大赛\n\n算法主题赛\n\n赛题名称：【按报名信息填写】\n\n# 技术报告\n\n作品名称：MindBell——大学生期末焦虑智能察觉与个性化疏导系统\n\n团队名称：【待填写】\n\n参赛编号：AIC-2026-【待填写】\n\n学校／单位：【待填写】\n\n日期：2026年10月9日\n\n[[PAGEBREAK]]\n\n# 目 录\n\n[[TOC]]\n\n[[PAGEBREAK]]\n\n## 作品简介\n\n${intro}\n\n关键词：期末压力；可解释规则推理；个性化疏导；浏览器端推理\n\n[[PAGEBREAK]]\n\n`;
fs.writeFileSync(filename, header + content);
console.log(JSON.stringify({introductionCharacters:intro.length,markdownBytes:fs.statSync(filename).size}));
