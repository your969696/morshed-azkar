import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'public', 'data');
const QURAN_DIR = join(DATA_DIR, 'quran');
const HADITH_DIR = join(DATA_DIR, 'hadith');

[QURAN_DIR, HADITH_DIR].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });

async function downloadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// ─── 1. Quran Text ───
console.log('\n=== Downloading Quran text (114 surahs) ===');
const quranErrors = [];
for (let i = 1; i <= 114; i++) {
  const outFile = join(QURAN_DIR, `${i}.json`);
  if (existsSync(outFile)) { process.stdout.write(`  ${i}/114 (cached)\r`); continue; }
  try {
    const data = await downloadJSON(`https://api.alquran.cloud/v1/surah/${i}/editions/quran-uthmani`);
    writeFileSync(outFile, JSON.stringify(data.data[0]), 'utf8');
    process.stdout.write(`  ${i}/114\r`);
    await new Promise(r => setTimeout(r, 200));
  } catch (e) { quranErrors.push({ surah: i, error: e.message }); console.error(`  ERROR ${i}: ${e.message}`); }
}
console.log(`\nQuran: ${114 - quranErrors.length}/114 done${quranErrors.length ? `, ${quranErrors.length} errors` : ''}`);

// ─── 2. Tafsir Al-Muyassar ───
console.log('\n=== Downloading Tafsir Al-Muyassar ===');
const tafsirFile = join(DATA_DIR, 'tafsir.json');
if (!existsSync(tafsirFile)) {
  try {
    const allTafsir = {};
    for (let i = 1; i <= 114; i++) {
      const data = await downloadJSON(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-muyassar/${i}.json`);
      allTafsir[i] = data;
      process.stdout.write(`  ${i}/114\r`);
      await new Promise(r => setTimeout(r, 100));
    }
    writeFileSync(tafsirFile, JSON.stringify(allTafsir), 'utf8');
    console.log('\nTafsir: done');
  } catch (e) { console.error(`\nTafsir ERROR: ${e.message}`); }
} else { console.log('Tafsir: cached'); }

// ─── 3. Hadith Collections ───
const COLLECTIONS = [
  { id: 'ara-bukhari', name: 'bukhari', label: 'Bukhari' },
  { id: 'ara-muslim', name: 'muslim', label: 'Muslim' },
  { id: 'ara-abudawud', name: 'abudawud', label: 'Abu Dawud' },
  { id: 'ara-tirmidhi', name: 'tirmidhi', label: 'Tirmidhi' },
  { id: 'ara-nasai', name: 'nasai', label: 'Nasai' },
  { id: 'ara-ibnmajah', name: 'ibnmajah', label: 'Ibn Majah' },
];

console.log('\n=== Downloading Hadith collections ===');
for (const col of COLLECTIONS) {
  const outFile = join(HADITH_DIR, `${col.name}.json`);
  if (existsSync(outFile)) { console.log(`  ${col.label}: cached`); continue; }
  try {
    console.log(`  Downloading ${col.label}...`);
    const data = await downloadJSON(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${col.id}.min.json`);
    writeFileSync(outFile, JSON.stringify(data), 'utf8');
    const sizeMB = (Buffer.byteLength(JSON.stringify(data)) / 1024 / 1024).toFixed(1);
    console.log(`  ${col.label}: done (${sizeMB}MB)`);
    await new Promise(r => setTimeout(r, 500));
  } catch (e) { console.error(`  ${col.label} ERROR: ${e.message}`); }
}

console.log('\n=== All data downloaded! ===');
