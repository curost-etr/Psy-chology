const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync('public/app.js', 'utf8');
const take = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const context = {};
vm.createContext(context);
vm.runInContext(source.slice(0, source.indexOf('const intakeForm')) +
  take('function clamp(', 'function getHistory(') +
  take('function getCategoryScores(', 'function buildRadar(') +
  take('function detectRisk(', 'function getTrainingTokens('), context);
const low = context.analyzeState(Array(10).fill(1), {scheduleScore:5, taskScore:5, fearScore:1, studyHours:1}, {age:20,status:'undergraduate'}, {avoidance:'no',comparison:'no',support:'yes'}, [], '');
const high = context.analyzeState(Array(10).fill(5), {scheduleScore:1, taskScore:1, fearScore:5, studyHours:5}, {age:20,status:'intern'}, {avoidance:'yes',comparison:'yes',support:'no'}, ['exam','sleep','unfinished'], '失眠焦虑压力'.repeat(20));
assert.equal(low.stage.key, 'stable');
assert.equal(high.stage.key, 'high');
assert.equal(context.detectRisk('我想自杀', []).level, 'crisis');
assert.equal(context.detectRisk('最近失眠心慌', []).level, 'high');
assert.equal(context.mergeRiskWithModel({level:'crisis',notice:''}, {available:true,level:'low'}).level, 'crisis');
assert.equal(context.mergeRiskWithModel({level:'normal',notice:''}, {available:true,level:'medium'}).level, 'high');
console.log(JSON.stringify({checks:6,passed:6,lowScore:low.score,highScore:high.score}));
