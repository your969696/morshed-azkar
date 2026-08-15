import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function getRecordings() {
  try { return JSON.parse(localStorage.getItem('voiceRecordings') || '[]'); } catch { return []; }
}
function saveRecordings(list) { localStorage.setItem('voiceRecordings', JSON.stringify(list)); }

const FREQ_OPTIONS = [
  { v: 'daily', l: 'يومياً' },
  { v: '2days', l: 'كل يومين' },
  { v: '3days', l: 'كل 3 أيام' },
  { v: 'weekly', l: 'أسبوعياً' },
  { v: 'custom', l: 'عدد مخصص' },
];
const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const pageCss = `
@keyframes pulse-rec{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 16px rgba(239,68,68,0)}}
@keyframes waveform{0%,100%{height:4px}50%{height:20px}}
.vr-page{background:#0c0818;min-height:100vh;padding:16px 16px 100px;font-family:'Segoe UI',Tahoma,sans-serif;color:#fff;direction:rtl}
.vr-hero{background:linear-gradient(170deg,#1c1040 0%,#0c0818 100%);border-radius:20px;padding:24px 20px;margin-bottom:20px;position:relative;overflow:hidden}
.vr-hero::before{content:'';position:absolute;top:-60px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(236,72,153,.15),transparent 70%);pointer-events:none}
.vr-hero-icon{font-size:48px;margin-bottom:12px}
.vr-hero-title{font-size:22px;font-weight:800;color:#fff;margin-bottom:4px}
.vr-hero-sub{font-size:12px;color:rgba(255,255,255,.45);line-height:1.6}
.vr-section{background:#151030;border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:20px;margin-bottom:16px}
.vr-section-title{font-size:14px;font-weight:800;color:#f0b040;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.vr-source-tabs{display:flex;gap:6px;margin-bottom:16px}
.vr-source-tab{flex:1;padding:12px 8px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.4);font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;text-align:center;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:6px}
.vr-source-tab .tab-icon{font-size:22px}
.vr-source-tab.active{background:rgba(0,200,150,.1);border-color:rgba(0,200,150,.25);color:#00c896}
.vr-source-tab:hover{background:rgba(255,255,255,.06)}
.vr-recorder{display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px 0}
.vr-rec-btn{width:80px;height:80px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;font-size:28px}
.vr-rec-btn.idle{background:rgba(239,68,68,.15);border:2px solid rgba(239,68,68,.3);color:#ef4444}
.vr-rec-btn.recording{background:#ef4444;animation:pulse-rec 1.5s infinite;color:#fff}
.vr-rec-btn:active{transform:scale(.95)}
.vr-rec-timer{font-size:24px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums}
.vr-rec-hint{font-size:11px;color:rgba(255,255,255,.35)}
.vr-waveform{display:flex;align-items:center;gap:3px;height:30px}
.vr-wave-bar{width:3px;background:#ef4444;border-radius:2px;animation:waveform .8s ease-in-out infinite}
.vr-wave-bar:nth-child(2){animation-delay:.1s}
.vr-wave-bar:nth-child(3){animation-delay:.2s}
.vr-wave-bar:nth-child(4){animation-delay:.3s}
.vr-wave-bar:nth-child(5){animation-delay:.4s}
.vr-input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#fff;font-size:13px;font-weight:600;font-family:inherit;outline:none;transition:all .2s;text-align:right}
.vr-input:focus{border-color:rgba(240,176,64,.4);background:rgba(240,176,64,.06)}
.vr-input::placeholder{color:rgba(255,255,255,.2)}
.vr-label{font-size:11px;font-weight:700;color:rgba(255,255,255,.4);margin-bottom:6px;display:block}
.vr-rec-list{display:flex;flex-direction:column;gap:10px}
.vr-rec-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:14px}
.vr-rec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.vr-rec-name{font-size:13px;font-weight:700;color:#fff;flex:1}
.vr-rec-date{font-size:10px;color:rgba(255,255,255,.3)}
.vr-rec-meta{display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap}
.vr-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700}
.vr-badge-green{background:rgba(0,200,150,.1);color:#00c896}
.vr-badge-gold{background:rgba(240,176,64,.1);color:#f0b040}
.vr-badge-src{background:rgba(139,92,246,.1);color:#a78bfa}
.vr-rec-controls{display:flex;gap:8px;margin-bottom:8px}
.vr-rec-ctrl{width:36px;height:36px;border-radius:10px;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:all .2s}
.vr-rec-ctrl.play{background:rgba(0,200,150,.12);color:#00c896}
.vr-rec-ctrl.play:hover{background:rgba(0,200,150,.2)}
.vr-rec-ctrl.stop{background:rgba(255,255,255,.06);color:rgba(255,255,255,.4)}
.vr-rec-ctrl.del{background:rgba(239,68,68,.1);color:#ef4444}
.vr-rec-ctrl.del:hover{background:rgba(239,68,68,.2)}
.vr-progress{height:4px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden}
.vr-progress-fill{height:100%;background:linear-gradient(90deg,#00c896,#3b82f6);border-radius:4px;transition:width .3s}
.vr-schedule{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.vr-sched-chip{padding:4px 10px;border-radius:8px;font-size:10px;font-weight:700;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);cursor:pointer;font-family:inherit;transition:all .2s}
.vr-sched-chip.on{background:rgba(240,176,64,.12);border-color:rgba(240,176,64,.25);color:#f0b040}
.vr-days-row{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
.vr-day-chip{width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.4);font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
.vr-day-chip.sel{background:rgba(0,200,150,.15);border-color:rgba(0,200,150,.3);color:#00c896}
.vr-empty{text-align:center;padding:40px 20px;color:rgba(255,255,255,.3)}
.vr-empty-icon{font-size:40px;margin-bottom:12px}
.vr-empty-text{font-size:13px;font-weight:600}
.vr-save-btn{width:100%;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#f0b040,#e09020);color:#fff;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;transition:all .2s;margin-top:12px}
.vr-save-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(240,176,64,.3)}
.vr-save-btn:active{transform:scale(.98)}
.vr-upload-zone{border:2px dashed rgba(255,255,255,.12);border-radius:16px;padding:30px 20px;text-align:center;cursor:pointer;transition:all .3s}
.vr-upload-zone:hover{border-color:rgba(0,200,150,.3);background:rgba(0,200,150,.03)}
.vr-upload-zone.drag{border-color:#00c896;background:rgba(0,200,150,.06)}
.vr-upload-icon{font-size:36px;margin-bottom:8px}
.vr-upload-text{font-size:12px;color:rgba(255,255,255,.4);font-weight:600}
.vr-upload-hint{font-size:10px;color:rgba(255,255,255,.25);margin-top:4px}
.vr-guide{background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.1);border-radius:14px;padding:16px;margin-top:16px}
.vr-guide-title{font-size:13px;font-weight:800;color:#00c896;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.vr-guide-item{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:11px;color:rgba(255,255,255,.5);line-height:1.6}
.vr-guide-item:last-child{border-bottom:none}
.vr-guide-icon{font-size:14px;flex-shrink:0;margin-top:2px}
.vr-guide-item b{color:rgba(255,255,255,.7)}
.vr-toggle{width:40px;height:22px;border-radius:11px;border:none;position:relative;cursor:pointer;transition:all .3s;flex-shrink:0}
.vr-toggle.on{background:#00c896;box-shadow:0 0 10px rgba(0,200,150,.3)}
.vr-toggle.off{background:rgba(255,255,255,.1)}
.vr-toggle-dot{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:3px;transition:all .3s;box-shadow:0 1px 4px rgba(0,0,0,.3)}
.vr-toggle.on .vr-toggle-dot{right:3px}
.vr-toggle.off .vr-toggle-dot{right:21px}
`;

export default function VoiceRecordings() {
  const [recordings, setRecordings] = useState(getRecordings);
  const [source, setSource] = useState('mic');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordName, setRecordName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [playProgress, setPlayProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const saveAudioBlob = (blob, name, srcType) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newRec = {
        id: Date.now(),
        name: name.trim() || 'تسجيل ' + new Date().toLocaleDateString('ar-EG'),
        audio: reader.result,
        duration: recordingTime || 0,
        source: srcType,
        createdAt: new Date().toISOString(),
        schedule: { freq: 'daily', time: '07:00', days: [0,1,2,3,4,5,6], customDays: 1, enabled: false },
      };
      setRecordings(prev => { const next = [newRec, ...prev]; saveRecordings(next); return next; });
      setRecordName('');
      setEditingId(newRec.id);
    };
    reader.readAsDataURL(blob);
  };

  const startMicRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      mediaRecorder.current.onstop = () => {
        saveAudioBlob(new Blob(audioChunks.current, { type: 'audio/webm' }), recordName, 'mic');
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch { alert('لا يمكن الوصول للميكروفون. تأكد من إذن الميكروفون.'); }
  };

  const startSystemRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      mediaRecorder.current.onstop = () => {
        saveAudioBlob(new Blob(audioChunks.current, { type: 'audio/webm' }), recordName, 'system');
        stream.getTracks().forEach(t => t.stop());
      };
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') mediaRecorder.current.stop();
      };
      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch { alert('تم إلغاء اختيار الشاشة.'); }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') mediaRecorder.current.stop();
    setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('audio/')) { alert('الملف يجب أن يكون صوتياً (MP3, WAV, OGG)'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const audioData = reader.result;
      const displayName = recordName.trim() || file.name.replace(/\.[^.]+$/, '');
      const audio = new Audio(audioData);
      audio.onloadedmetadata = () => {
        const newRec = {
          id: Date.now(), name: displayName, audio: audioData, duration: Math.floor(audio.duration),
          source: 'file', fileName: file.name, createdAt: new Date().toISOString(),
          schedule: { freq: 'daily', time: '07:00', days: [0,1,2,3,4,5,6], customDays: 1, enabled: false },
        };
        setRecordings(prev => { const next = [newRec, ...prev]; saveRecordings(next); return next; });
        setRecordName(''); setEditingId(newRec.id);
      };
      audio.onerror = () => {
        const newRec = {
          id: Date.now(), name: displayName, audio: audioData, duration: 0,
          source: 'file', fileName: file.name, createdAt: new Date().toISOString(),
          schedule: { freq: 'daily', time: '07:00', days: [0,1,2,3,4,5,6], customDays: 1, enabled: false },
        };
        setRecordings(prev => { const next = [newRec, ...prev]; saveRecordings(next); return next; });
        setRecordName(''); setEditingId(newRec.id);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files[0]); };

  const playRecording = (rec) => {
    if (playingId === rec.id) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlayingId(null); setPlayProgress(0); return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(rec.audio);
    audioRef.current = audio; setPlayingId(rec.id); setPlayProgress(0);
    audio.ontimeupdate = () => { if (audio.duration) setPlayProgress((audio.currentTime / audio.duration) * 100); };
    audio.onended = () => { setPlayingId(null); setPlayProgress(0); };
    audio.play().catch(() => { setPlayingId(null); setPlayProgress(0); });
  };

  const deleteRecording = (id) => {
    if (!confirm('هل تريد حذف هذا التسجيل؟')) return;
    if (playingId === id) { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } setPlayingId(null); setPlayProgress(0); }
    setRecordings(prev => { const next = prev.filter(r => r.id !== id); saveRecordings(next); return next; });
    if (editingId === id) setEditingId(null);
  };

  const updateSchedule = (id, field, value) => {
    setRecordings(prev => { const next = prev.map(r => r.id === id ? { ...r, schedule: { ...r.schedule, [field]: value } } : r); saveRecordings(next); return next; });
  };

  const toggleDay = (id, day) => {
    setRecordings(prev => {
      const rec = prev.find(r => r.id === id);
      if (!rec) return prev;
      const days = rec.schedule.days.includes(day) ? rec.schedule.days.filter(d => d !== day) : [...rec.schedule.days, day];
      const next = prev.map(r => r.id === id ? { ...r, schedule: { ...r.schedule, days } } : r);
      saveRecordings(next); return next;
    });
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const srcLabel = (s) => s === 'mic' ? '🎤 ميكروفون' : s === 'system' ? '💻 صوت الكمبيوتر' : '📁 ملف mp3';
  const srcBadge = (s) => s === 'mic' ? 'vr-badge-src' : s === 'system' ? 'vr-badge-gold' : 'vr-badge-green';

  const handleRecordClick = () => {
    if (isRecording) { stopRecording(); return; }
    if (source === 'mic') startMicRecording(); else startSystemRecording();
  };

  return (
    <>
      <style>{pageCss}</style>
      <div className="vr-page">
        <motion.div className="vr-hero" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="vr-hero-icon">🎙️</div>
          <h1 className="vr-hero-title">التسجيلات الصوتية</h1>
          <p className="vr-hero-sub">سجّل رسائل صوتية لعائلتك وحدد مواعيد تشغيلها تلقائياً</p>
        </motion.div>

        {/* Source Tabs */}
        <motion.div className="vr-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="vr-section-title">🎙️ تسجيل جديد</div>
          <div className="vr-source-tabs">
            <button className={`vr-source-tab ${source === 'mic' ? 'active' : ''}`} onClick={() => setSource('mic')}>
              <span className="tab-icon">🎤</span>
              <span>ميكروفون</span>
            </button>
            <button className={`vr-source-tab ${source === 'system' ? 'active' : ''}`} onClick={() => setSource('system')}>
              <span className="tab-icon">💻</span>
              <span>صوت الكمبيوتر</span>
            </button>
            <button className={`vr-source-tab ${source === 'file' ? 'active' : ''}`} onClick={() => setSource('file')}>
              <span className="tab-icon">📁</span>
              <span>رفع ملف MP3</span>
            </button>
          </div>

          <input type="text" className="vr-input" placeholder="اسم التسجيل (مثال: رسالة لولادي في رمضان)" value={recordName} onChange={e => setRecordName(e.target.value)} style={{ marginBottom: 12 }} />

          {source === 'file' ? (
            <>
              <input type="file" ref={fileInputRef} accept="audio/*" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
              <div className={`vr-upload-zone ${isDragOver ? 'drag' : ''}`} onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)}>
                <div className="vr-upload-icon">📁</div>
                <div className="vr-upload-text">اسحب الملف هنا أو اضغط للاختيار</div>
                <div className="vr-upload-hint">يدعم: MP3, WAV, OGG, M4A — بدون حد حجم</div>
              </div>
            </>
          ) : (
            <div className="vr-recorder">
              {isRecording && <div className="vr-waveform">{[1,2,3,4,5].map(i => <div key={i} className="vr-wave-bar" />)}</div>}
              <div className="vr-rec-timer">{formatTime(recordingTime)}</div>
              <button className={`vr-rec-btn ${isRecording ? 'recording' : 'idle'}`} onClick={handleRecordClick}>
                {isRecording ? '⏹' : source === 'mic' ? '🎤' : '💻'}
              </button>
              <div className="vr-rec-hint">
                {isRecording ? 'اضغط للإيقاف...' : source === 'mic' ? 'اضغط للبدء في التسجيل بالميكروفون' : 'اضغط لتسجيل صوت الكمبيوتر والشاشة'}
              </div>
            </div>
          )}
        </motion.div>

        {/* Recordings List */}
        <div className="vr-section">
          <div className="vr-section-title">📋 التسجيلات ({recordings.length})</div>
          {recordings.length === 0 ? (
            <div className="vr-empty">
              <div className="vr-empty-icon">🎙️</div>
              <div className="vr-empty-text">لا توجد تسجيلات بعد</div>
            </div>
          ) : (
            <div className="vr-rec-list">
              <AnimatePresence>
                {recordings.map(rec => (
                  <motion.div key={rec.id} className="vr-rec-item" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}>
                    {/* Header */}
                    <div className="vr-rec-head">
                      <div className="vr-rec-name">{rec.name}</div>
                      <div className="vr-rec-date">{new Date(rec.createdAt).toLocaleDateString('ar-EG')}</div>
                    </div>

                    {/* Meta: source + duration + scheduled */}
                    <div className="vr-rec-meta">
                      <span className={`vr-badge ${srcBadge(rec.source)}`}>{srcLabel(rec.source)}</span>
                      <span className="vr-badge" style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.5)' }}>{formatTime(rec.duration)}</span>
                      {rec.schedule?.enabled && <span className="vr-badge vr-badge-green">مجدول ✓</span>}
                    </div>

                    {/* Controls */}
                    <div className="vr-rec-controls">
                      <button className="vr-rec-ctrl play" onClick={() => playRecording(rec)}>{playingId === rec.id ? '⏸' : '▶'}</button>
                      <button className="vr-rec-ctrl stop" onClick={() => setEditingId(editingId === rec.id ? null : rec.id)}>⚙️</button>
                      <button className="vr-rec-ctrl del" onClick={() => deleteRecording(rec.id)}>🗑️</button>
                    </div>

                    {/* Progress */}
                    {playingId === rec.id && <div className="vr-progress"><div className="vr-progress-fill" style={{ width: `${playProgress}%` }} /></div>}

                    {/* Settings Panel */}
                    {editingId === rec.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12, marginTop: 4 }}>

                          {/* Time */}
                          <div className="vr-label">⏰ وقت التشغيل</div>
                          <input type="time" value={rec.schedule?.time || '07:00'} onChange={e => updateSchedule(rec.id, 'time', e.target.value)}
                            className="vr-input" style={{ marginBottom: 10, colorScheme: 'dark', textAlign: 'center' }} />

                          {/* Frequency */}
                          <div className="vr-label">🔄 تكرار التشغيل</div>
                          <div className="vr-schedule">
                            {FREQ_OPTIONS.map(o => (
                              <button key={o.v} onClick={() => updateSchedule(rec.id, 'freq', o.v)}
                                className={`vr-sched-chip ${rec.schedule?.freq === o.v ? 'on' : ''}`}>{o.l}</button>
                            ))}
                          </div>

                          {rec.schedule?.freq === 'custom' && (
                            <div style={{ marginTop: 8 }}>
                              <div className="vr-label">📅 كل كم يوم</div>
                              <input type="number" min="1" max="30" value={rec.schedule?.customDays || 1}
                                onChange={e => updateSchedule(rec.id, 'customDays', parseInt(e.target.value) || 1)}
                                className="vr-input" style={{ textAlign: 'center', width: 100 }} />
                            </div>
                          )}

                          {rec.schedule?.freq === 'weekly' && (
                            <div style={{ marginTop: 8 }}>
                              <div className="vr-label">📅 أيام الأسبوع</div>
                              <div className="vr-days-row">
                                {DAYS_AR.map((d, i) => (
                                  <button key={i} className={`vr-day-chip ${rec.schedule?.days?.includes(i) ? 'sel' : ''}`} onClick={() => toggleDay(rec.id, i)}>{d.slice(0,2)}</button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Toggle Schedule */}
                          <button className="vr-save-btn" onClick={() => updateSchedule(rec.id, 'enabled', !rec.schedule?.enabled)}
                            style={{ background: rec.schedule?.enabled ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#00c896,#059669)' }}>
                            {rec.schedule?.enabled ? '⏸ إيقاف الجدولة' : '▶ تفعيل الجدولة'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Guide */}
        <motion.div className="vr-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="vr-guide-title">💡 دليل التسجيلات الصوتية</div>
          <div className="vr-guide-item">
            <span className="vr-guide-icon">🎤</span>
            <span><b>الميكروفون:</b> سجّل رسائلك الصوتية بmic جهازك مباشرة — مناسب لرسائل شخصية لعائلتك</span>
          </div>
          <div className="vr-guide-item">
            <span className="vr-guide-icon">💻</span>
            <span><b>صوت الكمبيوتر:</b> سجّل أي صوت يُشغّل على جهازك — مثل أذكار مسموعة أو قرآن من موقع (تأكد من إذن الصوت)</span>
          </div>
          <div className="vr-guide-item">
            <span className="vr-guide-icon">📁</span>
            <span><b>رفع ملف:</b> ارفع ملف MP3 أو WAV أو OGG جاهز — مناسب لأذكار أو رسائل صوتية محفوظة مسبقاً</span>
          </div>
          <div className="vr-guide-item">
            <span className="vr-guide-icon">⏰</span>
            <span><b>الجدولة:</b> حدد وقت التشغيل والتكرار — يمكن تشغيل التسجيل يومياً أو كل عدد أيام أو أسبوعياً</span>
          </div>
          <div className="vr-guide-item">
            <span className="vr-guide-icon">✅</span>
            <span><b>مقبول:</b> رسائلك الخاصة، أذكار مسموعة، القرآن الكريم، تنبيهات دينية لأهلك وأولادك</span>
          </div>
          <div className="vr-guide-item">
            <span className="vr-guide-icon">⚠️</span>
            <span><b>تنبيه:</b> لا تسجل محتوى محمي بحقوق النشر أو موسيقى ملكية عامة — استخدم محتوى حراً فقط</span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
