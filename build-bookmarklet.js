const fs = require('fs');

const code = fs.readFileSync('easyxl-bookmarklet.js', 'utf8');

// 去除注释和多余的空白字符
let minified = code
    .replace(/\/\/.*/g, '') // 去除单行注释
    .replace(/\n/g, ' ')    // 将换行替换为空格
    .replace(/\s{2,}/g, ' ')// 将多个空格合并为一个
    .trim();

// 构建书签代码
const bookmarklet = 'javascript:' + encodeURIComponent(minified);

fs.writeFileSync('bookmarklet.txt', bookmarklet);

console.log('✅ Bookmarklet code successfully generated to bookmarklet.txt!');
