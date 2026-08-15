let audioCtx = null;

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function playTapSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export function playCompleteSound() {
  try {
    const ctx = getAudioContext();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch {}
}

let adhanAudio = null;
let adhanIdx = 0;

export function getAdhanAudio() {
  return adhanAudio;
}

export async function playAzan(onEnd) {
  try {
    if (adhanAudio && !adhanAudio.paused && !adhanAudio.ended) {
      return;
    }
    if (adhanAudio) {
      adhanAudio.pause();
      adhanAudio.onended = null;
      adhanAudio.onerror = null;
      adhanAudio.oncanplaythrough = null;
      adhanAudio.src = '';
      adhanAudio = null;
    }
    stopSpeaking();
    try {
      const { stopAudio } = require('./audio');
      stopAudio();
    } catch {}
    adhanIdx = (adhanIdx + 1) % 2;
    const fileName = adhanIdx === 0 ? 'adhan1.mp3' : 'adhan2.mp3';

    let soundSrc = fileName;
    if (window.electronAPI?.getSoundPath) {
      try {
        const absPath = await window.electronAPI.getSoundPath(fileName);
        if (absPath) soundSrc = 'file:///' + absPath.replace(/\\/g, '/');
      } catch {}
    }

    adhanAudio = new Audio();
    adhanAudio.preload = 'auto';
    adhanAudio.volume = 1;
    adhanAudio.onended = () => {
      adhanAudio = null;
      if (onEnd) onEnd();
    };
    adhanAudio.onerror = (e) => {
      console.error('Adhan error:', e);
      adhanAudio = null;
      if (onEnd) onEnd();
    };
    adhanAudio.src = soundSrc;
    adhanAudio.play().catch(e => console.error('Adhan play error:', e));
  } catch (e) { console.error('Adhan error:', e); }
}

export function stopAzan() {
  try {
    if (adhanAudio) { adhanAudio.pause(); adhanAudio.currentTime = 0; adhanAudio = null; }
  } catch {}
}

export function isAzanPlaying() {
  return adhanAudio && !adhanAudio.paused;
}

export function toggleAzan() {
  if (!adhanAudio) return;
  if (adhanAudio.paused) adhanAudio.play().catch(() => {});
  else adhanAudio.pause();
}

let currentAudio = null;
let arabicVoice = null;
let speakGeneration = 0;

const EDGE_TTS_VOICES = {
  ar: 'ar-SA-HamedNeural',
  en: 'en-US-GuyNeural',
  es: 'es-ES-ElviraNeural',
};

const LANG_CONFIG = {
  ar: { lang: 'ar-SA', rate: 0.8, pitch: 0.9 },
  en: { lang: 'en-US', rate: 1.0, pitch: 1.0 },
  es: { lang: 'es-ES', rate: 1.0, pitch: 1.0 },
};

export function stopAllAudio() {
  stopSpeaking();
  stopAzan();
  stopAzkarVoice();
  try {
    const { stopAudio } = require('./audio');
    stopAudio();
  } catch {}
}

function getArabicMaleVoice() {
  if (arabicVoice) return arabicVoice;
  const voices = window.speechSynthesis.getVoices();

  const preferred = [
    'Microsoft Hazem', 'Microsoft Salem', 'Microsoft Hamed', 'Microsoft Rami',
    'Microsoft Ahmed', 'Microsoft Tariq', 'Microsoft Majed',
    'Google Arabic', 'Google ar-XA-Standard-B', 'Google ar-XA-Standard-D',
    'Shakir', 'Hamed', 'Hazzem', 'Rami', 'Majed', 'Tariq', 'Ahmad', 'Omar', 'Mohammed', 'Khalid', 'Hassan', 'Ali', 'Youssef',
  ];
  for (const name of preferred) {
    const found = voices.find(v => v.name.includes(name));
    if (found) { arabicVoice = found; return found; }
  }

  const femaleKeywords = ['Fatima', 'Salma', 'Laila', 'Amira', 'Zeina', 'Mona', 'Hoda', 'Nora', 'Lamia', 'Aya', 'Samantha', 'Victoria', 'Zira'];
  const arabic = voices.filter(v => v.lang.startsWith('ar'));
  for (const v of arabic) {
    const isFemale = femaleKeywords.some(k => v.name.includes(k));
    if (!isFemale) { arabicVoice = v; return v; }
  }

  if (arabic.length > 0) { arabicVoice = arabic[0]; return arabic[0]; }
  return null;
}

function getVoiceForLang(lang) {
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = LANG_CONFIG[lang]?.lang || 'ar-SA';

  if (lang === 'ar') return getArabicMaleVoice();

  const langVoices = voices.filter(v => v.lang.startsWith(langPrefix.split('-')[0]));
  if (langVoices.length > 0) {
    const preferred = lang === 'en'
      ? ['Microsoft Guy', 'Google US English', 'Google UK English Male']
      : ['Microsoft Elvira', 'Microsoft Pablo', 'Google español'];
    for (const name of preferred) {
      const found = langVoices.find(v => v.name.includes(name));
      if (found) return found;
    }
    return langVoices[0];
  }
  return null;
}

function initVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });
}

async function speakViaWebSpeech(text, lang = 'ar') {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  if (!text) return false;

  await initVoices();

  const config = LANG_CONFIG[lang] || LANG_CONFIG.ar;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = config.lang;
  u.rate = config.rate;
  u.pitch = config.pitch;
  u.volume = 1;

  const voice = getVoiceForLang(lang);
  if (voice) u.voice = voice;

  return new Promise((resolve) => {
    u.onend = () => resolve(true);
    u.onerror = () => resolve(false);
    window.speechSynthesis.speak(u);
  });
}

async function speakViaEdgeTTS(text, lang = 'ar', gen) {
  try {
    if (!window.electronAPI?.generateTTS) return false;
    const voice = EDGE_TTS_VOICES[lang] || EDGE_TTS_VOICES.ar;
    const filePath = await window.electronAPI.generateTTS(text, voice);
    if (!filePath) return false;
    if (gen !== undefined && gen !== speakGeneration) return false;

    if (currentAudio) { currentAudio.pause(); currentAudio = null; }

    const audio = new Audio(`file:///${filePath.replace(/\\/g, '/')}`);
    currentAudio = audio;

    return new Promise((resolve) => {
      audio.onended = () => { currentAudio = null; resolve(true); };
      audio.onerror = () => { currentAudio = null; resolve(false); };
      audio.play().catch(() => resolve(false));
    });
  } catch {
    return false;
  }
}

export async function speakText(text, lang = 'ar', onEnd) {
  if (!text) return;

  const gen = ++speakGeneration;
  stopSpeaking();
  stopAzan();
  try { const { stopAudio } = require('./audio'); stopAudio(); } catch {}

  const isElectron = window.electronAPI?.isElectron;

  if (isElectron) {
    await speakViaEdgeTTS(text, lang, gen);
    if (gen === speakGeneration && onEnd) onEnd();
    return;
  }

  await speakViaWebSpeech(text, lang);
  if (gen === speakGeneration && onEnd) onEnd();
}

export async function speakArabic(text, onEnd) {
  return speakText(text, 'ar', onEnd);
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function isSpeaking() {
  if (currentAudio && !currentAudio.paused) return true;
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}

let mesaharatiAudio = null;

export function playMesaharati() {
  stopMesaharati();
  try {
    mesaharatiAudio = new Audio('حان_الان_موعد_السحور.m4a');
    mesaharatiAudio.volume = 1;
    mesaharatiAudio.play().catch(() => {});
  } catch {}
}

export function stopMesaharati() {
  if (mesaharatiAudio) {
    mesaharatiAudio.pause();
    mesaharatiAudio.currentTime = 0;
    mesaharatiAudio = null;
  }
}

let takbeerAudio = null;
let takbeerLooping = false;

export function playTakbeer(loop = false) {
  try {
    takbeerLooping = loop;
    if (takbeerAudio) { takbeerAudio.pause(); takbeerAudio.currentTime = 0; }
    takbeerAudio = new Audio();
    takbeerAudio.preload = 'auto';
    takbeerAudio.volume = 1;
    takbeerAudio.onended = () => {
      if (takbeerLooping && takbeerAudio) {
        takbeerAudio.currentTime = 0;
        takbeerAudio.play().catch(() => {});
      } else {
        takbeerAudio = null;
      }
    };
    takbeerAudio.onerror = () => { takbeerAudio = null; };
    takbeerAudio.oncanplaythrough = () => {
      if (!takbeerAudio) return;
      takbeerAudio.oncanplaythrough = null;
      takbeerAudio.play().catch(() => {});
    };
    takbeerAudio.src = 'takbeer-eid.mp3';
    takbeerAudio.load();
  } catch {}
}

export function stopTakbeer() {
  takbeerLooping = false;
  if (takbeerAudio) { takbeerAudio.pause(); takbeerAudio.currentTime = 0; takbeerAudio = null; }
}

export function isTakbeerPlaying() {
  return takbeerAudio && !takbeerAudio.paused;
}

let azkarAudio = null;

export function playAzkarVoice(type) {
  try {
    stopAzkarVoice();
    stopAllAudio();
    const file = type === 'evening' ? 'evening-azkar-voice.mp3' : 'morning-azkar-voice.mp3';
    azkarAudio = new Audio();
    azkarAudio.preload = 'auto';
    azkarAudio.volume = 1;
    azkarAudio.onended = () => { azkarAudio = null; };
    azkarAudio.onerror = (e) => { console.error('Azkar voice error:', e); azkarAudio = null; };
    azkarAudio.oncanplaythrough = () => {
      if (!azkarAudio) return;
      azkarAudio.oncanplaythrough = null;
      azkarAudio.play().catch(e => console.error('Azkar voice play error:', e));
    };
    azkarAudio.src = file;
    azkarAudio.load();
  } catch (e) { console.error('Azkar voice error:', e); }
}

export function pauseAzkarVoice() {
  if (azkarAudio && !azkarAudio.paused) { azkarAudio.pause(); }
}

export function resumeAzkarVoice() {
  if (azkarAudio && azkarAudio.paused && azkarAudio.readyState >= 2) {
    azkarAudio.play().catch(() => {});
  }
}

export function getAzkarAudioDuration() {
  return azkarAudio && azkarAudio.duration && !isNaN(azkarAudio.duration) ? azkarAudio.duration : 0;
}

export function stopAzkarVoice() {
  if (azkarAudio) { azkarAudio.pause(); azkarAudio.currentTime = 0; azkarAudio = null; }
}

export function getAzkarAudio() { return azkarAudio; }

let ramadanToneAudio = null;

export function playRamadanTone() {
  try {
    const type = localStorage.getItem('ramadanSoundType') || 'tone';
    if (type === 'none') return;

    stopAllAudio();

    if (type === 'adhan') {
      const adhanAudio = new Audio('adhan1.mp3');
      adhanAudio.preload = 'auto';
      adhanAudio.volume = 0.7;
      ramadanToneAudio = adhanAudio;
      adhanAudio.onended = () => { ramadanToneAudio = null; };
      adhanAudio.onerror = () => { ramadanToneAudio = null; };
      adhanAudio.play().catch(() => { ramadanToneAudio = null; });
    } else {
      const ctx = getAudioContext();
      const notes = [523, 587, 659, 698, 784, 698, 659, 587];
      let t = ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        t += 0.35;
      });
    }
  } catch {}
}

export function stopRamadanTone() {
  if (ramadanToneAudio) {
    ramadanToneAudio.pause();
    ramadanToneAudio.currentTime = 0;
    ramadanToneAudio = null;
  }
}

let cannonAudio = null;

export function playRamadanCannon(onEnd) {
  try {
    stopAllAudio();
    cannonAudio = new Audio('انطلق_الافطار_اذان_المغرب.m4a');
    cannonAudio.preload = 'auto';
    cannonAudio.volume = 1;
    cannonAudio.onended = () => { cannonAudio = null; if (onEnd) onEnd(); };
    cannonAudio.onerror = () => { cannonAudio = null; if (onEnd) onEnd(); };
    cannonAudio.play().catch(() => { cannonAudio = null; if (onEnd) onEnd(); });
  } catch { if (onEnd) onEnd(); }
}

export function stopRamadanCannon() {
  if (cannonAudio) { cannonAudio.pause(); cannonAudio.currentTime = 0; cannonAudio = null; }
}
