const fs = require('fs');

const path = '../bridge-plan-math-literacy-quiz/quiz/full-flow.html';
const html = fs.readFileSync(path, 'utf8');

console.log('=== Headings in full-flow.html ===');
const headings = html.match(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/gi) || [];
headings.forEach(h => {
  console.log(h.trim().replace(/\s+/g, ' '));
});

console.log('\n=== Elements with IDs around the result section ===');
const ids = html.match(/id="([^"]+)"/g) || [];
console.log('Total IDs found:', ids.length);
ids.forEach(id => {
  if (id.includes('result') || id.includes('match') || id.includes('score') || id.includes('radar') || id.includes('value')) {
    console.log(id);
  }
});

// Let's search for the results display container
const resultIndex = html.indexOf('id="result"');
if (resultIndex !== -1) {
  console.log('\n=== Result Section preview (1000 chars) ===');
  console.log(html.slice(resultIndex, resultIndex + 3000));
}
