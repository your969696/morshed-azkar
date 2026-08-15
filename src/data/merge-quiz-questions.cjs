const fs = require('fs');
const path = require('path');

const files = [
  'adab.js', 'afterlife.js', 'angels.js', 'aqeedah.js', 'books.js',
  'daily.js', 'death.js', 'dua.js', 'fasting.js', 'fiqh.js',
  'food.js', 'hadith.js', 'hajj.js', 'history.js', 'jannah.js',
  'marriage.js', 'quran.js', 'salah.js', 'seerah.js', 'tahara.js',
  'wudu.js', 'zakah.js'
];

const allQuestions = [];

for (const file of files) {
  const filePath = path.join(__dirname, 'quiz-questions', file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Match object literals in the array
  const objRegex = /\{[^{}]*id:\s*\d+[^{}]*\}/g;
  const matches = content.match(objRegex);
  
  if (matches) {
    for (const match of matches) {
      try {
        // Convert JS object syntax to valid JSON
        let jsonStr = match
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":')
          .replace(/""/g, '"')
          .replace(/,\s*}/g, '}')
          .replace(/\\"/g, '"');
        
        // Handle nested arrays more carefully
        const obj = JSON.parse(jsonStr);
        
        allQuestions.push({
          id: obj.id,
          category: obj.category,
          difficulty: obj.difficulty,
          question_ar: obj.question_ar,
          options_ar: obj.options_ar,
          correct_index: obj.correct_index,
          source: obj.source
        });
      } catch (e) {
        // Try alternative parsing
        const idMatch = match.match(/id:\s*(\d+)/);
        const categoryMatch = match.match(/category:\s*'([^']+)'/);
        const difficultyMatch = match.match(/difficulty:\s*'([^']+)'/);
        const questionArMatch = match.match(/question_ar:\s*'([^']+)'/);
        const correctIndexMatch = match.match(/correct_index:\s*(\d+)/);
        const sourceMatch = match.match(/source:\s*'([^']+)'/);
        
        // Extract options_ar array
        const optionsArMatch = match.match(/options_ar:\s*\[([^\]]+)\]/);
        let optionsAr = [];
        if (optionsArMatch) {
          optionsAr = optionsArMatch[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        }
        
        if (idMatch && questionArMatch) {
          allQuestions.push({
            id: parseInt(idMatch[1]),
            category: categoryMatch ? categoryMatch[1] : '',
            difficulty: difficultyMatch ? difficultyMatch[1] : '',
            question_ar: questionArMatch[1],
            options_ar: optionsAr,
            correct_index: correctIndexMatch ? parseInt(correctIndexMatch[1]) : 0,
            source: sourceMatch ? sourceMatch[1] : ''
          });
        }
      }
    }
  }
}

// Sort by id
allQuestions.sort((a, b) => a.id - b.id);

const outputPath = path.join(__dirname, 'quiz-questions-merged.json');
fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf8');
console.log(`Merged ${allQuestions.length} questions from ${files.length} files`);
console.log(`Output: ${outputPath}`);
