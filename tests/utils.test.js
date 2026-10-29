const test = require('node:test');
const assert = require('node:assert');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

test('Utils: slugify converts arbitrary titles to URL-safe slugs', () => {
  assert.strictEqual(slugify('Hello World! 2026'), 'hello-world-2026');
  assert.strictEqual(slugify('   Why We Don\'t Need Microservices... '), 'why-we-dont-need-microservices');
  assert.strictEqual(slugify('Special @#$ Characters & Symbols'), 'special-characters-symbols');
});

test('Utils: calculateReadingTime accurately computes duration based on word count', () => {
  const shortText = 'One two three four five.';
  assert.strictEqual(calculateReadingTime(shortText), 1, 'Minimum reading time is 1 min');

  const longText = new Array(450).fill('word').join(' ');
  assert.strictEqual(calculateReadingTime(longText), 3, '450 words should be ~3 min');
});
