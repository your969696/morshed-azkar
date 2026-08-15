import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

const API_KEY = '9bwmRbAQOICzn4DWAzDwwTtM9A6UItRfN4dgLWeorXRkwNvnmtki1J6Y';
const OUT_DIR = join(process.cwd(), 'public', 'puzzle-images');

const QUERIES = [
  'mosque interior',
  'mosque architecture',
  'islamic mosque night',
  'grand mosque',
  'mosque dome',
  'blue mosque istanbul',
  'mosque minaret',
  'alhambra mosque',
  'mountain landscape',
  'mountain sunrise',
  'snow mountain',
  'mountain lake',
  'desert landscape',
  'desert sand dunes',
  'ocean sunset',
  'ocean waves coast',
  'waterfall nature',
  'forest green',
  'tropical beach',
  'crescent moon night sky',
  'stars milky way',
  'cherry blossom tree',
  'autumn forest',
  'lavender field',
  'garden flowers',
  'rice terrace',
  'lake reflection',
  'canyon landscape',
  'northern lights',
  'coastal cliff',
];

const MAX_SIZE = 600;

async function searchPexels(query, perPage = 15, page = 1) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=landscape`;
  const resp = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!resp.ok) throw new Error(`Pexels API error ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

async function downloadImage(url, filepath) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  writeFileSync(filepath, buf);
  return buf.length;
}

function resizeImage(inputPath, outputPath) {
  try {
    execSync(`ffmpeg -y -i "${inputPath}" -vf "scale='min(${MAX_SIZE},iw)':'min(${MAX_SIZE},ih)':force_original_aspect_ratio=decrease" -q:v 3 "${outputPath}" 2>NUL`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const allPhotos = [];
  const seenIds = new Set();

  console.log('Searching Pexels for images...\n');

  for (const query of QUERIES) {
    try {
      console.log(`  Searching: "${query}"...`);
      const data = await searchPexels(query, 15);
      let added = 0;
      for (const photo of data.photos) {
        if (!seenIds.has(photo.id)) {
          seenIds.add(photo.id);
          allPhotos.push(photo);
          added++;
        }
      }
      console.log(`    Found ${data.photos.length} photos, ${added} new (total unique: ${allPhotos.length})`);
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`    Error searching "${query}": ${err.message}`);
    }
  }

  console.log(`\nTotal unique photos: ${allPhotos.length}`);
  console.log('Downloading and resizing...\n');

  let downloaded = 0;
  let failed = 0;

  for (const photo of allPhotos) {
    const url = photo.src.large2x || photo.src.large || photo.src.medium;
    const name = `img-${26 + downloaded}.jpg`;
    const tmpPath = join(OUT_DIR, `tmp_${photo.id}.jpg`);
    const finalPath = join(OUT_DIR, name);

    try {
      await downloadImage(url, tmpPath);
      if (resizeImage(tmpPath, finalPath)) {
        try { execSync(`del "${tmpPath}"`, { stdio: 'pipe' }); } catch {}
        downloaded++;
        if (downloaded % 10 === 0) console.log(`  Downloaded ${downloaded} images...`);
      } else {
        try { execSync(`del "${tmpPath}"`, { stdio: 'pipe' }); } catch {}
        failed++;
      }
    } catch (err) {
      console.error(`  Failed: ${photo.id} - ${err.message}`);
      try { execSync(`del "${tmpPath}"`, { stdio: 'pipe' }); } catch {}
      failed++;
    }

    if (downloaded >= 75) break;
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nDone! Downloaded: ${downloaded}, Failed: ${failed}`);
  console.log(`Images saved to: ${OUT_DIR}`);

  console.log(`\nNow update the IMAGES array in PuzzlePage.jsx with ${downloaded} new images (img-26 to img-${25 + downloaded})`);
}

main().catch(console.error);
