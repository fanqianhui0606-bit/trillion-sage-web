const fs = require('fs');

const path = '../bridge-plan-math-literacy-quiz/quiz/full-flow.html';
const html = fs.readFileSync(path, 'utf8');

const match = html.match(/<script type="module">([\s\S]*?)<\/script>/i);
if (!match) {
  console.log('No script tag found.');
  process.exit(0);
}

const js = match[1];
console.log('Script length:', js.length);

// Let's search for functions or variable names
const keywords = [
  'function showResult', 
  'function render',
  'function init',
  'showResult',
  'introInterest',
  'introValue',
  'introObjective',
  'introRecommend',
  'btnAllMatch',
  'l2-all-match-check'
];

keywords.forEach(kw => {
  console.log(`\n=== Matches for "${kw}": ===`);
  let pos = 0;
  while ((pos = js.indexOf(kw, pos)) !== -1) {
    const start = Math.max(0, pos - 200);
    const end = Math.min(js.length, pos + 400);
    console.log(`[Pos ${pos}]:\n`, js.slice(start, end).trim());
    console.log('-'.repeat(40));
    pos += kw.length;
  }
});
