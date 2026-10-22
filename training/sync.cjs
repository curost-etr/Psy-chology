'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const deploy = path.join(root, 'netlify-deploy');
fs.mkdirSync(deploy, { recursive: true });
fs.cpSync(path.join(root, 'public'), path.join(deploy, 'public'), { recursive: true, force: true });
for (const name of ['index.html', '期末焦虑智能察觉与个性化疏导系统.html', '.nojekyll']) {
  fs.copyFileSync(path.join(root, name), path.join(deploy, name));
}
console.log('Synced complete frontend, entry pages and models to Netlify bundle.');
