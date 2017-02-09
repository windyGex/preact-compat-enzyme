'use strict';

const fs = require('fs');
const cp = require('child_process');
const mkdirp = require('mkdirp');
let data = fs.readFileSync('./lib/index.js', 'utf-8');

data = data
    .replace(`Object.defineProperty(exports, "__esModule", {`, '')
    .replace(/value:\s*true\s*\n*\r*\}\);/, '')
    .replace(`require('preact-compat')`, `window.preactCompat`)
    .replace(`exports['default'] = _preactCompat2['default'];`, '')
    .replace(`module.exports = exports['default'];`, '')

data += `window.preactCompat = _preactCompat2['default']`;

cp.execSync('rm -rf build');
mkdirp.sync('build');
fs.writeFileSync('build/index.js', data, 'utf-8');