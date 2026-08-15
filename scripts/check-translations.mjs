import { translations } from '../src/i18n-data.js';

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? prefix + '.' + k : k;
    if (Array.isArray(v)) { keys.push(path); }
    else if (v && typeof v === 'object') { keys = keys.concat(getKeys(v, path)); }
    else { keys.push(path); }
  }
  return keys;
}

const arKeys = getKeys(translations.ar);
const enKeys = getKeys(translations.en);
const esKeys = getKeys(translations.es);

const enSet = new Set(enKeys);
const esSet = new Set(esKeys);

const missingInEn = arKeys.filter(k => !enSet.has(k));
const missingInEs = arKeys.filter(k => !esSet.has(k));

console.log('=== MISSING IN ENGLISH (' + missingInEn.length + ') ===');
missingInEn.forEach(k => console.log('  ' + k));

console.log('\n=== MISSING IN SPANISH (' + missingInEs.length + ') ===');
missingInEs.forEach(k => console.log('  ' + k));

console.log('\n=== TOTAL KEYS ===');
console.log('Arabic: ' + arKeys.length);
console.log('English: ' + enKeys.length);
console.log('Spanish: ' + esKeys.length);

// Also check for keys in en/es that don't exist in ar (extra keys)
const arSet = new Set(arKeys);
const extraInEn = enKeys.filter(k => !arSet.has(k));
const extraInEs = esKeys.filter(k => !arSet.has(k));
if (extraInEn.length > 0) {
  console.log('\n=== EXTRA IN ENGLISH (not in Arabic) ===');
  extraInEn.forEach(k => console.log('  ' + k));
}
if (extraInEs.length > 0) {
  console.log('\n=== EXTRA IN SPANISH (not in Arabic) ===');
  extraInEs.forEach(k => console.log('  ' + k));
}
