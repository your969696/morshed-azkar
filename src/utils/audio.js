let audioInstance = null;
let currentSource = null;
let isPlaying = false;

const RECITERS = [
  { id: 'refaat', name: 'محمد رفعت', url: 'https://server14.mp3quran.net/refat/' },
  { id: 'mishary', name: 'مشاري العفاسي', url: 'https://server8.mp3quran.net/afs/' },
  { id: 'husary', name: 'محمود خليل الحصري', url: 'https://server10.mp3quran.net/husr/' },
  { id: 'minshawi', name: 'محمد صديق المنشاوي', url: 'https://server11.mp3quran.net/mjsj/' },
  { id: 'sudais', name: 'عبدالرحمن السديس', url: 'https://server7.mp3quran.net/sds/' },
  { id: 'shuraim', name: 'سعود الشريم', url: 'https://server8.mp3quran.net/shrm/' },
  { id: 'ajmi', name: 'أحمد العجمي', url: 'https://server9.mp3quran.net/ajm/' },
];

function padZero(n) {
  return n.toString().padStart(2, '0');
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${padZero(m)}:${padZero(s)}`;
}

export function getReciters() {
  return RECITERS;
}

export function getAudioInstance() {
  if (!audioInstance) {
    audioInstance = new Audio();
    audioInstance.preload = 'auto';
  }
  return audioInstance;
}

export function playAudio(url, onTimeUpdate, onEnded, onError) {
  const audio = getAudioInstance();

  if (currentSource === url && isPlaying) {
    audio.pause();
    isPlaying = false;
    return { playing: false, audio };
  }

  if (currentSource !== url) {
    audio.src = url;
    currentSource = url;
  }

  audio.ontimeupdate = () => {
    if (onTimeUpdate) {
      onTimeUpdate({
        currentTime: audio.currentTime,
        duration: audio.duration,
        formatted: formatTime(audio.currentTime),
        durationFormatted: formatTime(audio.duration),
        progress: audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
      });
    }
  };

  audio.onended = () => {
    isPlaying = false;
    if (onEnded) onEnded();
  };

  audio.onerror = (e) => {
    isPlaying = false;
    if (onError) onError(e);
  };

  audio.play().then(() => {
    isPlaying = true;
  }).catch((e) => {
    isPlaying = false;
    if (onError) onError(e);
  });

  return { playing: true, audio };
}

export function pauseAudio() {
  const audio = getAudioInstance();
  audio.pause();
  isPlaying = false;
}

export function stopAudio() {
  const audio = getAudioInstance();
  audio.pause();
  audio.currentTime = 0;
  currentSource = null;
  isPlaying = false;
}

export function seekAudio(time) {
  const audio = getAudioInstance();
  if (audio.duration) {
    audio.currentTime = time;
  }
}

export function setVolume(vol) {
  const audio = getAudioInstance();
  audio.volume = Math.max(0, Math.min(1, vol));
}

export function getIsPlaying() {
  return isPlaying;
}

export function getSurahAudioUrl(reciterId, surahNum) {
  const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
  const padded = surahNum.toString().padStart(3, '0');
  return `${reciter.url}${padded}.mp3`;
}

export { formatTime };