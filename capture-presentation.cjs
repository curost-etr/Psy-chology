const {chromium}=require('./.presentation-tools/node_modules/playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'public');
const assets=path.join(__dirname,'presentation-assets');fs.mkdirSync(assets,{recursive:true});
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(req.url.split('?')[0]);
  const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}
  const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json'};
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(r=>server.listen(3217,'127.0.0.1',r));
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
    await page.route('https://**/*',r=>r.abort());
    await page.goto('http://127.0.0.1:3217',{waitUntil:'networkidle'});
    await page.locator('.hero').screenshot({path:path.join(assets,'hero.png')});
    await page.selectOption('#intake-concern','task');await page.selectOption('#intake-goal','plan');
    await page.locator('#intake-form button').click();
    await page.locator('.onboarding-panel').screenshot({path:path.join(assets,'intake.png')});
    await page.fill('#chat-input','我期末任务太多，不知道先做什么，总是开始不了。');
    await page.locator('#chat-form button').click();
    await page.waitForFunction(()=>document.querySelectorAll('.message.assistant').length>=3);
    await page.locator('.chat-feed').evaluate(e=>{e.scrollTop=e.scrollHeight;});
    await page.locator('.chat-panel').screenshot({path:path.join(assets,'chat.png')});
    for(let i=0;i<10;i++)await page.locator(`input[name="q${i}"][value="${i===6?4:3}"]`).check();
    for(const [key,val] of Object.entries({avoidance:'yes',comparison:'yes',support:'yes'})) await page.locator(`input[name="${key}"][value="${val}"]`).check();
    await page.locator('input[name="stressors"][value="unfinished"]').check();
    await page.locator('input[name="stressors"][value="sleep"]').check();
    await page.fill('#stress-text','复习任务很多，我担心来不及，最近睡不着。');
    await page.locator('#assessment-form button[type="submit"]').click();
    await page.locator('.result-panel').scrollIntoViewIfNeeded();
    const b=await page.locator('.result-panel').boundingBox();
    await page.screenshot({path:path.join(assets,'result.png'),clip:{x:b.x,y:b.y,width:b.width,height:Math.min(b.height,1030)}});
    await page.locator('#result').screenshot({path:path.join(assets,'result-full.png')});
    fs.writeFileSync(path.join(assets,'capture-info.json'),JSON.stringify({source:'Actual project frontend, static fallback',syntheticDemo:true,score:await page.locator('.score-pill').innerText()},null,2));
    console.log('Frontend screenshots captured.');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
