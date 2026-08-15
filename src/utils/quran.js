const _ALQURAN_API = 'https://api.alquran.cloud/v1';
const QURAN_AUDIO_CDN = 'https://cdn.islamic.network/quran/audio';
const RECITER = 'ar.alafasy';
const BITRATE = 128;

export const reciters = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي', style: 'مرتّل' },
  { id: 'ar.husary', name: 'محمود خليل الحصري', style: 'مرتّل' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', style: 'مرتّل' },
  { id: 'ar.abdulbasit', name: 'عبد الباسط عبد الصمد', style: 'مجود' },
  { id: 'ar.ajamy', name: 'أحمد بن علي العجمي', style: 'مرتّل' },
];

export function getAyahAudioUrl(ayahGlobalNumber, reciter = RECITER) {
  return `${QURAN_AUDIO_CDN}/${BITRATE}/${reciter}/${ayahGlobalNumber}.mp3`;
}

export function getSurahAudioUrl(surahNumber, reciter = RECITER) {
  return `https://cdn.islamic.network/quran/audio-surah/${BITRATE}/${reciter}/${surahNumber}.mp3`;
}

const SURAH_START_AYAH = [
  0, 1, 8, 299, 499, 675, 795, 960, 1166, 1241, 1370, 1479, 1602, 1713, 1756,
  1808, 1907, 2035, 2146, 2256, 2354, 2489, 2601, 2679, 2797, 2861, 2938, 3165,
  3258, 3346, 3415, 3475, 3509, 3539, 3606, 3660, 3705, 3788, 3970, 4058, 4133,
  4218, 4272, 4325, 4414, 4473, 4510, 4545, 4583, 4612, 4631, 4676, 4725, 4787,
  4842, 4920, 5016, 5045, 5067, 5091, 5104, 5118, 5129, 5140, 5158, 5176, 5194,
  5212, 5232, 5262, 5318, 5374, 5414, 5460, 5502, 5531, 5550, 5586, 5622, 5658,
  5714, 5754, 5794, 5829, 5848, 5884, 5910, 5948, 5967, 5997, 6017, 6031, 6051,
  6066, 6087, 6108, 6138, 6153, 6168, 6189, 6204, 6215, 6224, 6232, 6236,
];

export function getGlobalAyahNumber(surahNumber, ayahNumberInSurah) {
  if (surahNumber < 1 || surahNumber > 114) return 0;
  return SURAH_START_AYAH[surahNumber - 1] + ayahNumberInSurah;
}

export const surahsData = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", verses: 7, type: "مكية" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", verses: 286, type: "مدنية" },
  { number: 3, name: "آل عمران", englishName: "Aal-Imran", verses: 200, type: "مدنية" },
  { number: 4, name: "النساء", englishName: "An-Nisa", verses: 176, type: "مدنية" },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", verses: 120, type: "مدنية" },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", verses: 165, type: "مكية" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", verses: 206, type: "مكية" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", verses: 75, type: "مدنية" },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", verses: 129, type: "مدنية" },
  { number: 10, name: "يونس", englishName: "Yunus", verses: 109, type: "مكية" },
  { number: 11, name: "هود", englishName: "Hud", verses: 123, type: "مكية" },
  { number: 12, name: "يوسف", englishName: "Yusuf", verses: 111, type: "مكية" },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", verses: 43, type: "مدنية" },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", verses: 52, type: "مكية" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", verses: 99, type: "مكية" },
  { number: 16, name: "النحل", englishName: "An-Nahl", verses: 128, type: "مكية" },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", verses: 111, type: "مكية" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", verses: 110, type: "مكية" },
  { number: 19, name: "مريم", englishName: "Maryam", verses: 98, type: "مكية" },
  { number: 20, name: "طه", englishName: "Taha", verses: 135, type: "مكية" },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya", verses: 112, type: "مكية" },
  { number: 22, name: "الحج", englishName: "Al-Hajj", verses: 78, type: "مدنية" },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", verses: 118, type: "مكية" },
  { number: 24, name: "النور", englishName: "An-Nur", verses: 64, type: "مدنية" },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", verses: 77, type: "مكية" },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", verses: 227, type: "مكية" },
  { number: 27, name: "النمل", englishName: "An-Naml", verses: 93, type: "مكية" },
  { number: 28, name: "القصص", englishName: "Al-Qasas", verses: 88, type: "مكية" },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankabut", verses: 69, type: "مكية" },
  { number: 30, name: "الروم", englishName: "Ar-Rum", verses: 60, type: "مكية" },
  { number: 31, name: "لقمان", englishName: "Luqman", verses: 34, type: "مكية" },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", verses: 30, type: "مكية" },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", verses: 73, type: "مدنية" },
  { number: 34, name: "سبأ", englishName: "Saba", verses: 54, type: "مكية" },
  { number: 35, name: "فاطر", englishName: "Fatir", verses: 45, type: "مكية" },
  { number: 36, name: "يس", englishName: "Ya-Sin", verses: 83, type: "مكية" },
  { number: 37, name: "الصافات", englishName: "As-Saffat", verses: 182, type: "مكية" },
  { number: 38, name: "ص", englishName: "Sad", verses: 88, type: "مكية" },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", verses: 75, type: "مكية" },
  { number: 40, name: "غافر", englishName: "Ghafir", verses: 85, type: "مكية" },
  { number: 41, name: "فصلت", englishName: "Fussilat", verses: 54, type: "مكية" },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", verses: 53, type: "مكية" },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", verses: 89, type: "مكية" },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", verses: 59, type: "مكية" },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", verses: 37, type: "مكية" },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", verses: 35, type: "مكية" },
  { number: 47, name: "محمد", englishName: "Muhammad", verses: 38, type: "مدنية" },
  { number: 48, name: "الفتح", englishName: "Al-Fath", verses: 29, type: "مدنية" },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", verses: 18, type: "مدنية" },
  { number: 50, name: "ق", englishName: "Qaf", verses: 45, type: "مكية" },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", verses: 60, type: "مكية" },
  { number: 52, name: "الطور", englishName: "At-Tur", verses: 49, type: "مكية" },
  { number: 53, name: "النجم", englishName: "An-Najm", verses: 62, type: "مكية" },
  { number: 54, name: "القمر", englishName: "Al-Qamar", verses: 55, type: "مكية" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", verses: 78, type: "مدنية" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", verses: 96, type: "مكية" },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", verses: 29, type: "مدنية" },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadilah", verses: 22, type: "مدنية" },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", verses: 24, type: "مدنية" },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", verses: 13, type: "مدنية" },
  { number: 61, name: "الصف", englishName: "As-Saff", verses: 14, type: "مدنية" },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", verses: 11, type: "مدنية" },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", verses: 11, type: "مدنية" },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", verses: 18, type: "مدنية" },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", verses: 12, type: "مدنية" },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", verses: 12, type: "مدنية" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", verses: 30, type: "مكية" },
  { number: 68, name: "القلم", englishName: "Al-Qalam", verses: 52, type: "مكية" },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", verses: 52, type: "مكية" },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", verses: 44, type: "مكية" },
  { number: 71, name: "نوح", englishName: "Nuh", verses: 28, type: "مكية" },
  { number: 72, name: "الجن", englishName: "Al-Jinn", verses: 28, type: "مكية" },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", verses: 20, type: "مكية" },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", verses: 56, type: "مكية" },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", verses: 40, type: "مكية" },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", verses: 31, type: "مدنية" },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", verses: 50, type: "مكية" },
  { number: 78, name: "النبأ", englishName: "An-Naba", verses: 40, type: "مكية" },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", verses: 46, type: "مكية" },
  { number: 80, name: "عبس", englishName: "Abasa", verses: 42, type: "مكية" },
  { number: 81, name: "التكوير", englishName: "At-Takwir", verses: 29, type: "مكية" },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar", verses: 19, type: "مكية" },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", verses: 36, type: "مكية" },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", verses: 25, type: "مكية" },
  { number: 85, name: "البروج", englishName: "Al-Buruj", verses: 22, type: "مكية" },
  { number: 86, name: "الطارق", englishName: "At-Tariq", verses: 17, type: "مكية" },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", verses: 19, type: "مكية" },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", verses: 26, type: "مكية" },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", verses: 30, type: "مكية" },
  { number: 90, name: "البلد", englishName: "Al-Balad", verses: 20, type: "مكية" },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", verses: 15, type: "مكية" },
  { number: 92, name: "الليل", englishName: "Al-Layl", verses: 21, type: "مكية" },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", verses: 11, type: "مكية" },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", verses: 8, type: "مكية" },
  { number: 95, name: "التين", englishName: "At-Tin", verses: 8, type: "مكية" },
  { number: 96, name: "العلق", englishName: "Al-Alaq", verses: 19, type: "مكية" },
  { number: 97, name: "القدر", englishName: "Al-Qadr", verses: 5, type: "مكية" },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", verses: 8, type: "مدنية" },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", verses: 8, type: "مدنية" },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", verses: 11, type: "مكية" },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", verses: 11, type: "مكية" },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", verses: 8, type: "مكية" },
  { number: 103, name: "العصر", englishName: "Al-Asr", verses: 3, type: "مكية" },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", verses: 9, type: "مكية" },
  { number: 105, name: "الفيل", englishName: "Al-Fil", verses: 5, type: "مكية" },
  { number: 106, name: "قريش", englishName: "Quraysh", verses: 4, type: "مكية" },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", verses: 7, type: "مكية" },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", verses: 3, type: "مكية" },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", verses: 6, type: "مكية" },
  { number: 110, name: "النصر", englishName: "An-Nasr", verses: 3, type: "مدنية" },
  { number: 111, name: "المسد", englishName: "Al-Masad", verses: 5, type: "مكية" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", verses: 4, type: "مكية" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", verses: 5, type: "مكية" },
  { number: 114, name: "الناس", englishName: "An-Nas", verses: 6, type: "مكية" },
];

export async function fetchSurahText(surahNumber) {
  try {
    const res = await fetch(`./data/quran/${surahNumber}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to load surah:', e);
    return null;
  }
}

let tafsirData = null;

export async function fetchTafseer(surahNumber, ayahNumber) {
  try {
    const surahNum = parseInt(surahNumber);
    const ayahNum = parseInt(ayahNumber);

    if (!tafsirData) {
      const res = await fetch('./data/tafsir.json');
      if (!res.ok) return null;
      tafsirData = await res.json();
    }

    const surahData = tafsirData[surahNum];
    if (Array.isArray(surahData)) {
      const ayahData = surahData.find(item => {
        return parseInt(item.surah) === surahNum && parseInt(item.ayah) === ayahNum;
      });
      if (ayahData && ayahData.text) {
        return ayahData.text.replace(/<[^>]*>/g, '').replace(/•/g, '\n•').trim();
      }
    }
    return null;
  } catch (e) {
    console.error('Failed to load tafseer:', e);
    return null;
  }
}
