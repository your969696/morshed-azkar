import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'myLibraryFiles';
const CHUNK_SIZE = 400;

const VOICES = [
  { id: 'ar-SA-HamedNeural', name: '🇸🇦 حامد — صوتي رجالي', rate: '-20%' },
  { id: 'ar-EG-ShakirNeural', name: '🇪🇬 شاكر — صوتي ناضج', rate: '-15%' },
  { id: 'ar-MA-JamalNeural', name: '🇲🇦 جمال — صوتي عميق', rate: '-20%' },
  { id: 'ar-AE-HamdanNeural', name: '🇦🇪 حمدان — صوتي رسمي', rate: '-10%' },
  { id: 'ar-SY-LaithNeural', name: '🇸🇾 ليث — صوتي شبابي', rate: '0%' },
  { id: 'ar-KW-FahedNeural', name: '🇰🇼 فهد — صوتي هادي', rate: '-25%' },
];

function getLibraryFiles() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveLibraryFiles(files) { localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); }

async function extractPdf(arrayBuffer) {
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(new Uint8Array(arrayBuffer));
  return result.text;
}

async function extractDocx(arrayBuffer) {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function chunkText(text, size = CHUNK_SIZE) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks;
}

export default function MyLibrary() {
  const [files, setFiles] = useState(getLibraryFiles);
  const [activeFile, setActiveFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [voiceId, setVoiceId] = useState('ar-MA-JamalNeural');
  const [pastedText, setPastedText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => { cancelledRef.current = true; if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  const addFile = useCallback((file) => {
    const newFile = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: file.name || 'Untitled',
      type: file.type || 'text/plain',
      size: file.size || 0,
      text: '',
      addedAt: Date.now(),
    };

    setLoading(true);
    setError('');

    if (file.type === 'application/pdf' || file.name?.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          newFile.text = await extractPdf(e.target.result);
          newFile.wordCount = newFile.text.split(/\s+/).filter(Boolean).length;
          setFiles(prev => { const next = [newFile, ...prev]; saveLibraryFiles(next); return next; });
        } catch (err) { setError('PDF parsing failed: ' + err.message); }
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name?.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          newFile.text = await extractDocx(e.target.result);
          newFile.wordCount = newFile.text.split(/\s+/).filter(Boolean).length;
          setFiles(prev => { const next = [newFile, ...prev]; saveLibraryFiles(next); return next; });
        } catch (err) { setError('DOCX parsing failed: ' + err.message); }
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        newFile.text = e.target.result;
        newFile.wordCount = newFile.text.split(/\s+/).filter(Boolean).length;
        setFiles(prev => { const next = [newFile, ...prev]; saveLibraryFiles(next); return next; });
        setLoading(false);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) addFile(file);
  }, [addFile]);

  const handlePasteText = useCallback(() => {
    if (!pastedText.trim()) return;
    const newFile = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: pastedText.slice(0, 40).trim() + (pastedText.length > 40 ? '...' : ''),
      type: 'text/plain',
      size: pastedText.length,
      text: pastedText,
      wordCount: pastedText.split(/\s+/).filter(Boolean).length,
      addedAt: Date.now(),
    };
    setFiles(prev => { const next = [newFile, ...prev]; saveLibraryFiles(next); return next; });
    setPastedText('');
  }, [pastedText]);

  const handleFetchUrl = useCallback(async () => {
    if (!urlInput.trim()) return;
    let url = urlInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    setLoading(true); setError('');
    try {
      let html;
      if (window.electronAPI?.fetchUrl) {
        const result = await window.electronAPI.fetchUrl(url);
        if (!result.ok) throw new Error(result.error || 'فشل الجلب');
        html = result.html;
      } else {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        html = await resp.text();
      }
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const title = doc.querySelector('title')?.textContent || new URL(url).hostname;
      doc.querySelectorAll('script, style, nav, footer, header, noscript, iframe').forEach(el => el.remove());
      const paragraphs = doc.querySelectorAll('p, h1, h2, h3, h4, h5, li, td, th, blockquote, pre, article, section, main, .content, .article, .post, .entry');
      const text = Array.from(paragraphs).map(p => p.textContent.trim()).filter(t => t.length > 5).join('\n\n');
      if (!text.trim()) {
        const bodyText = doc.body?.textContent?.trim() || '';
        if (bodyText.length > 50) {
          const newFile = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: title.slice(0, 50), type: 'text/html', size: bodyText.length, text: bodyText, wordCount: bodyText.split(/\s+/).filter(Boolean).length, url, addedAt: Date.now() };
          setFiles(prev => { const next = [newFile, ...prev]; saveLibraryFiles(next); return next; });
          setUrlInput(''); setLoading(false); return;
        }
        throw new Error('لم يتم العثور على نص مقروء');
      }
      const newFile = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: title.slice(0, 50), type: 'text/html', size: text.length, text, wordCount: text.split(/\s+/).filter(Boolean).length, url, addedAt: Date.now() };
      setFiles(prev => { const next = [newFile, ...prev]; saveLibraryFiles(next); return next; });
      setUrlInput('');
    } catch (err) { setError('فشل جلب الرابط: ' + err.message); }
    setLoading(false);
  }, [urlInput]);

  const playFile = useCallback((file) => {
    setActiveFile(file);
    const chunks = chunkText(file.text);
    chunksRef.current = chunks;
    setCurrentChunk(0);
    setProgress(0);
    setIsPlaying(true);
    cancelledRef.current = false;
    const selectedVoice = VOICES.find(v => v.id === voiceId) || VOICES[0];
    speakChunk(0, chunks, speed, file, selectedVoice);
  }, [speed, voiceId]);

  const speakChunk = (idx, chunks, rate, file, selectedVoice) => {
    if (cancelledRef.current || idx >= chunks.length) {
      setIsPlaying(false); setProgress(100); return;
    }
    const text = chunks[idx];
    setProgress(Math.round((idx / chunks.length) * 100));

    if (window.electronAPI?.generateTTS) {
      window.electronAPI.generateTTS(text, selectedVoice.id, selectedVoice.rate).then(filePath => {
        if (cancelledRef.current) return;
        if (!filePath) { speakViaWebSpeech(text, rate, idx, chunks, file, selectedVoice); return; }
        const audio = new Audio('file:///' + filePath.replace(/\\/g, '/'));
        audioRef.current = audio;
        audio.playbackRate = rate;
        audio.onended = () => { setCurrentChunk(idx + 1); speakChunk(idx + 1, chunks, rate, file, selectedVoice); };
        audio.onerror = () => { speakViaWebSpeech(text, rate, idx, chunks, file, selectedVoice); };
        audio.play().catch(() => { speakViaWebSpeech(text, rate, idx, chunks, file, selectedVoice); });
      }).catch(() => { speakViaWebSpeech(text, rate, idx, chunks, file, selectedVoice); });
    } else {
      speakViaWebSpeech(text, rate, idx, chunks, file, selectedVoice);
    }
  };

  const speakViaWebSpeech = (text, rate, idx, chunks, file, selectedVoice) => {
    if (cancelledRef.current) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = rate;
      utterance.onend = () => { setCurrentChunk(idx + 1); speakChunk(idx + 1, chunks, rate, file, selectedVoice); };
      utterance.onerror = () => { speakChunk(idx + 1, chunks, rate, file, selectedVoice); };
      speechSynthesis.speak(utterance);
    } else {
      speakChunk(idx + 1, chunks, rate, file, selectedVoice);
    }
  };

  const stopPlaying = useCallback(() => {
    cancelledRef.current = true;
    setIsPlaying(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    setActiveFile(null); setCurrentChunk(0); setProgress(0);
  }, []);

  const pauseResume = useCallback(() => {
    if (isPlaying) {
      cancelledRef.current = true;
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    } else if (activeFile) {
      const chunks = chunkText(activeFile.text);
      chunksRef.current = chunks;
      cancelledRef.current = false;
      setIsPlaying(true);
      speakChunk(currentChunk, chunks, speed, activeFile);
    }
  }, [isPlaying, activeFile, currentChunk, speed]);

  const deleteFile = useCallback((id) => {
    setFiles(prev => { const next = prev.filter(f => f.id !== id); saveLibraryFiles(next); return next; });
    if (activeFile?.id === id) stopPlaying();
  }, [activeFile, stopPlaying]);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const estimatedMinutes = activeFile ? Math.round((activeFile.wordCount / 150) / speed) : 0;

  return (
    <>
      <style>{pageCss}</style>
      <div className="ml-page">
        <motion.div className="ml-hero" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="ml-hero-icon">📚</div>
          <h1 className="ml-hero-title">مكتبتي</h1>
          <p className="ml-hero-sub">ارفع ملفات واقرأها بصوت AI</p>
        </motion.div>

        <motion.div className="ml-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div
            className={`ml-dropzone ${dragOver ? 'ml-dropzone-active' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.text" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) addFile(e.target.files[0]); e.target.value = ''; }} />
            <div className="ml-dropzone-icon">📁</div>
            <div className="ml-dropzone-text">{loading ? 'جاري المعالجة...' : 'اسحب الملف هنا أو اضغط لاختيار'}</div>
            <div className="ml-dropzone-formats">PDF • DOCX • TXT</div>
          </div>
        </motion.div>

        <motion.div className="ml-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="ml-section-title">🔗 رابط ويب</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="ml-input" placeholder="https://example.com/article" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()} />
            <button className="ml-btn ml-btn-green" onClick={handleFetchUrl} disabled={loading || !urlInput.trim()}>جلب</button>
          </div>
        </motion.div>

        <motion.div className="ml-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="ml-section-title">✏️ الصق نص</div>
          <textarea className="ml-textarea" rows={4} placeholder="الصق أي نص هنا..." value={pastedText} onChange={(e) => setPastedText(e.target.value)} />
          <button className="ml-btn ml-btn-purple" onClick={handlePasteText} disabled={!pastedText.trim()}>🔊 قراءة النص</button>
        </motion.div>

        {error && <div className="ml-error" onClick={() => setError('')}>⚠️ {error} — اضغط للإغلاق</div>}

        <AnimatePresence>
          {activeFile && (
            <motion.div className="ml-player" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="ml-player-title">{activeFile.name}</div>
              <div className="ml-player-info">{activeFile.wordCount?.toLocaleString() || 0} كلمة • تقريباً {estimatedMinutes} دقيقة</div>
              <div className="ml-player-progress">
                <div className="ml-progress-bar">
                  <div className="ml-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="ml-progress-text">{progress}%</div>
              </div>
              <div className="ml-player-controls">
                <button className="ml-player-btn" onClick={stopPlaying}>⏹️</button>
                <button className="ml-player-btn ml-player-btn-main" onClick={pauseResume}>{isPlaying ? '⏸️' : '▶️'}</button>
              </div>
              <div className="ml-speed-row">
                {speeds.map(s => (
                  <button key={s} className={`ml-speed-btn ${speed === s ? 'ml-speed-active' : ''}`} onClick={() => setSpeed(s)}>{s}x</button>
                ))}
              </div>
              <div className="ml-voice-row">
                <div className="ml-voice-label">🎙️ الصوت:</div>
                <select className="ml-voice-select" value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
                  {VOICES.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {files.length > 0 && (
          <motion.div className="ml-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="ml-section-title">📂 ملفاتي ({files.length})</div>
            <AnimatePresence>
              {files.map((file) => (
                <motion.div key={file.id} className={`ml-file ${activeFile?.id === file.id ? 'ml-file-active' : ''}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}>
                  <div className="ml-file-info">
                    <div className="ml-file-name">{file.type === 'application/pdf' || file.name?.endsWith('.pdf') ? '📄' : file.type === 'text/html' ? '🌐' : '📝'} {file.name}</div>
                    <div className="ml-file-meta">{(file.wordCount || 0).toLocaleString()} كلمة • {file.type === 'application/pdf' ? 'PDF' : file.type === 'text/html' ? 'رابط ويب' : file.name?.endsWith('.docx') ? 'DOCX' : 'نص'}</div>
                  </div>
                  <div className="ml-file-actions">
                    <button className="ml-file-btn ml-file-play" onClick={() => playFile(file)}>▶️</button>
                    <button className="ml-file-btn ml-file-delete" onClick={() => deleteFile(file.id)}>🗑️</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {files.length === 0 && !loading && (
          <div className="ml-empty">
            <div className="ml-empty-icon">📖</div>
            <div className="ml-empty-text">لا توجد ملفات بعد</div>
            <div className="ml-empty-sub">ارفع ملف PDF أو DOCX أو TXT أو الصق نصاً</div>
          </div>
        )}
      </div>
    </>
  );
}

const pageCss = `
.ml-page { min-height: 100vh; padding: 16px 16px 100px; background: var(--bg-primary, #0a0015); color: var(--text-primary, #fff); }
.ml-hero { text-align: center; padding: 20px 0 16px; }
.ml-hero-icon { font-size: 36px; margin-bottom: 8px; }
.ml-hero-title { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #FFD700, #FF6B8A); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 4px; }
.ml-hero-sub { font-size: 12px; color: rgba(255,255,255,.45); margin: 0; }
.ml-section { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; padding: 14px; margin-bottom: 12px; }
.ml-section-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.6); margin-bottom: 10px; }
.ml-dropzone { border: 2px dashed rgba(255,255,255,.12); border-radius: 14px; padding: 28px 16px; text-align: center; cursor: pointer; transition: all 0.2s; }
.ml-dropzone:hover, .ml-dropzone-active { border-color: #FFD700; background: rgba(255,215,0,.05); }
.ml-dropzone-icon { font-size: 32px; margin-bottom: 8px; }
.ml-dropzone-text { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.7); }
.ml-dropzone-formats { font-size: 11px; color: rgba(255,255,255,.35); margin-top: 4px; }
.ml-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05); color: #fff; font-size: 13px; font-family: inherit; outline: none; flex: 1; }
.ml-input:focus { border-color: #00C896; }
.ml-textarea { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05); color: #fff; font-size: 13px; font-family: inherit; outline: none; resize: vertical; min-height: 80px; margin-bottom: 8px; }
.ml-textarea:focus { border-color: #a78bfa; }
.ml-btn { padding: 8px 16px; border-radius: 10px; border: none; font-size: 12px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.2s; }
.ml-btn:disabled { opacity: .4; cursor: not-allowed; }
.ml-btn-green { background: #00C896; color: #000; }
.ml-btn-green:hover:not(:disabled) { background: #00e6aa; }
.ml-btn-purple { background: #a78bfa; color: #000; width: 100%; margin-top: 8px; }
.ml-btn-purple:hover:not(:disabled) { background: #c4a6ff; }
.ml-error { background: rgba(239,68,68,.15); color: #ef4444; padding: 10px 14px; border-radius: 10px; font-size: 12px; font-weight: 700; margin-bottom: 12px; cursor: pointer; }
.ml-player { background: linear-gradient(135deg, rgba(167,139,250,.1), rgba(255,107,138,.08)); border: 1px solid rgba(167,139,250,.2); border-radius: 16px; padding: 16px; margin-bottom: 12px; }
.ml-player-title { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ml-player-info { font-size: 11px; color: rgba(255,255,255,.45); margin-bottom: 10px; }
.ml-player-progress { margin-bottom: 12px; }
.ml-progress-bar { width: 100%; height: 4px; background: rgba(255,255,255,.1); border-radius: 2px; overflow: hidden; }
.ml-progress-fill { height: 100%; background: linear-gradient(90deg, #a78bfa, #FF6B8A); border-radius: 2px; transition: width 0.3s; }
.ml-progress-text { font-size: 11px; color: rgba(255,255,255,.4); text-align: center; margin-top: 4px; }
.ml-player-controls { display: flex; justify-content: center; gap: 16px; margin-bottom: 10px; }
.ml-player-btn { width: 44px; height: 44px; border-radius: 50%; border: none; background: rgba(255,255,255,.1); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.ml-player-btn:hover { background: rgba(255,255,255,.2); }
.ml-player-btn-main { width: 52px; height: 52px; background: linear-gradient(135deg, #a78bfa, #FF6B8A); font-size: 22px; }
.ml-player-btn-main:hover { transform: scale(1.05); }
.ml-speed-row { display: flex; justify-content: center; gap: 6px; }
.ml-speed-btn { padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05); color: rgba(255,255,255,.5); font-size: 11px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.2s; }
.ml-speed-btn:hover { border-color: rgba(255,255,255,.2); color: #fff; }
.ml-speed-active { background: #a78bfa; color: #000; border-color: #a78bfa; }
.ml-voice-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.08); }
.ml-voice-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.4); white-space: nowrap; }
.ml-voice-select { padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: #fff; font-size: 11px; font-weight: 700; font-family: inherit; outline: none; cursor: pointer; }
.ml-voice-select option { background: #1a1030; color: #fff; }
.ml-file { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 12px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); margin-bottom: 8px; transition: all 0.2s; }
.ml-file:hover { background: rgba(255,255,255,.06); }
.ml-file-active { border-color: #a78bfa; background: rgba(167,139,250,.08); }
.ml-file-info { flex: 1; min-width: 0; }
.ml-file-name { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ml-file-meta { font-size: 11px; color: rgba(255,255,255,.35); margin-top: 2px; }
.ml-file-actions { display: flex; gap: 6px; flex-shrink: 0; margin-left: 8px; }
.ml-file-btn { width: 34px; height: 34px; border-radius: 8px; border: none; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; background: rgba(255,255,255,.06); }
.ml-file-play:hover { background: rgba(0,200,150,.2); }
.ml-file-delete:hover { background: rgba(239,68,68,.2); }
.ml-empty { text-align: center; padding: 40px 0; }
.ml-empty-icon { font-size: 48px; margin-bottom: 12px; opacity: .3; }
.ml-empty-text { font-size: 16px; font-weight: 700; color: rgba(255,255,255,.3); }
.ml-empty-sub { font-size: 12px; color: rgba(255,255,255,.2); margin-top: 4px; }
`;
