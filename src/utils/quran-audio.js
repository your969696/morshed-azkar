let quranAudioInstance = null;

export function playQuranAudio(url, opts = {}) {
  try { if (quranAudioInstance) { quranAudioInstance.pause(); quranAudioInstance = null; } } catch {}
  quranAudioInstance = new Audio();
  quranAudioInstance.src = url;
  quranAudioInstance.volume = opts.volume ?? 0.8;
  quranAudioInstance.play().catch(() => {});
}

export function stopQuranAudio() {
  try { if (quranAudioInstance) { quranAudioInstance.pause(); quranAudioInstance.currentTime = 0; quranAudioInstance = null; } } catch {}
}

export function getQuranAudioUrl(kahfOnly = false) {
  const base = 'https://server14.mp3quran.net/refat/';
  if (kahfOnly || new Date().getDay() === 5) {
    return { name: 'الكهف', url: `${base}018.mp3` };
  }
  const randomSurah = Math.floor(Math.random() * 114) + 1;
  const padded = randomSurah.toString().padStart(3, '0');
  const names = {1:'الفاتحة',2:'البقرة',3:'آل عمران',4:'النساء',5:'المائدة',6:'الأنعام',7:'الأعراف',8:'الأنفال',9:'التوبة',10:'يونس',11:'هود',12:'يوسف',13:'الرعد',14:'إبراهيم',15:'الحجر',16:'النحل',17:'الإسراء',18:'الكهف',19:'مريم',20:'طه',21:'الأنبياء',22:'الحج',23:'المؤمنون',24:'النور',25:'الفرقان',26:'الشعراء',27:'النمل',28:'القصص',29:'العنكبوت',30:'الروم',31:'لقمان',32:'السجدة',33:'الأحزاب',34:'سبأ',35:'فاطر',36:'يس',37:'الصافات',38:'ص',39:'الزمر',40:'غافر',41:'فصلت',42:'الشورى',43:'الزخرف',44:'الدخان',45:'الجاثية',46:'الأحقاف',47:'محمد',48:'الفتح',49:'الحجرات',50:'ق',51:'الذاريات',52:'الطور',53:'النجم',54:'القمر',55:'الرحمن',56:'الواقعة',57:'الحديد',58:'المجادلة',59:'الحشر',60:'الممتحنة',61:'الصف',62:'الجمعة',63:'المنافقون',64:'التغابن',65:'الطلاق',66:'التحريم',67:'الملك',68:'القلم',69:'الحاقة',70:'المعارج',71:'نوح',72:'الجن',73:'المزمل',74:'المدثر',75:'القيامة',76:'الإنسان',77:'المرسلات',78:'النبأ',79:'النازعات',80:'عبس',81:'التكوير',82:'الانفطار',83:'المطففين',84:'الانشقاق',85:'البروج',86:'الطارق',87:'الأعلى',88:'الغاشية',89:'الفجر',90:'البلد',91:'الشمس',92:'الليل',93:'الضحى',94:'الشرح',95:'التين',96:'العلق',97:'القدر',98:'البينة',99:'الزلزلة',100:'العاديات',101:'القارعة',102:'التكاثر',103:'العصر',104:'الهمزة',105:'الفيل',106:'قريش',107:'الماعون',108:'الكوثر',109:'الكافرون',110:'النصر',111:'المسد',112:'الإخلاص',113:'الفلق',114:'الناس'};
  return { name: names[randomSurah] || `سورة ${randomSurah}`, url: `${base}${padded}.mp3` };
}

export function getTodaySurah() {
  return getQuranAudioUrl(false);
}

export function getRamadanIqamaSettings() {
  try {
    const raw = localStorage.getItem('ramadanIqamaSettings');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabled: true, mode: 'everyday', minutesBefore: 15, autoPlay: true, volume: 80 };
}

export function setRamadanIqamaSettings(settings) {
  localStorage.setItem('ramadanIqamaSettings', JSON.stringify(settings));
}
