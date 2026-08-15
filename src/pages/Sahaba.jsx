import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';
import { speakArabic, stopSpeaking } from '../utils/sound';
import { sahabaData } from '../data/sahaba';

const sahabaCss = `
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.sp-wrap{width:100%;background:var(--bg-primary);min-height:100vh;padding-bottom:120px;transition:background .3s}
.sp-hero{background:linear-gradient(175deg,var(--bg-card) 0%,#1b4332 40%,var(--bg-primary) 100%);padding:32px 20px 28px;position:relative;overflow:hidden}
html.light .sp-hero{background:linear-gradient(175deg,#e8f5e9 0%,#a5d6a7 40%,#f5f5f5 100%)}
.sp-glow{position:absolute;top:-60px;right:-60px;width:240px;height:240px;background:radial-gradient(circle,rgba(0,200,150,.15) 0%,transparent 70%);border-radius:50%}
.sp-hero-content{position:relative;z-index:1}
.sp-back{display:inline-flex;align-items:center;gap:6px;color:var(--text-muted);text-decoration:none;font-size:13px;font-weight:600;margin-bottom:16px;transition:color .2s}
.sp-back:hover{color:var(--text-primary)}
.sp-title{font-size:24px;font-weight:800;color:var(--text-primary);margin-bottom:4px}
.sp-subtitle{font-size:13px;color:var(--text-muted)}
.sp-search{padding:0 16px;margin-top:-20px;position:relative;z-index:10;margin-bottom:20px}
.sp-search input{width:100%;padding:14px 18px 14px 44px;border-radius:16px;border:1px solid var(--border-card);background:var(--bg-card);color:var(--text-primary);font-size:14px;font-weight:600;font-family:'Cairo',sans-serif;outline:none;transition:all .2s;box-shadow:0 4px 20px rgba(0,0,0,.15)}
.sp-search input:focus{border-color:var(--accent-green);box-shadow:0 4px 20px rgba(0,200,150,.15)}
.sp-search input::placeholder{color:var(--text-muted)}
.sp-search-icon{position:absolute;left:32px;top:50%;transform:translateY(-50%);color:var(--text-muted)}
.sp-count{padding:0 20px;margin-bottom:16px;font-size:12px;color:var(--text-muted);font-weight:700}
.sp-count strong{color:var(--accent-green)}
.sp-grid{display:grid;grid-template-columns:1fr;gap:14px;padding:0 16px}
.sp-card{background:var(--bg-card);border:1px solid var(--border-card);border-radius:20px;overflow:hidden;transition:all .3s;cursor:pointer}
.sp-card:hover{border-color:var(--accent-green);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.25)}
html.light .sp-card:hover{box-shadow:0 12px 32px rgba(0,0,0,.08)}
.sp-card:active{transform:scale(.98)}
.sp-card-top{padding:20px 20px 16px;position:relative;overflow:hidden}
.sp-card-glow{position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;opacity:.12;pointer-events:none}
.sp-card-emoji{font-size:36px;margin-bottom:10px;display:block;animation:float 3s ease infinite}
.sp-card-name{font-size:18px;font-weight:800;color:var(--text-primary);margin-bottom:2px;line-height:1.4}
.sp-card-title{font-size:12px;color:var(--accent-green);font-weight:700;margin-bottom:6px}
.sp-card-nickname{display:inline-flex;align-items:center;gap:4px;background:rgba(0,200,150,.08);border:1px solid rgba(0,200,150,.15);border-radius:12px;padding:3px 10px;font-size:11px;color:var(--accent-green);font-weight:700}
.sp-card-body{padding:0 20px 20px}
.sp-card-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-card)}
.sp-card-row:last-child{border-bottom:none}
.sp-card-label{font-size:11px;color:var(--text-muted);min-width:60px;font-weight:600}
.sp-card-value{font-size:12px;color:var(--text-primary);font-weight:600}
.sp-card-story{font-size:13px;color:var(--text-secondary);line-height:1.9;margin-top:12px;padding:12px;background:var(--bg-primary);border-radius:12px;border:1px solid var(--border-card)}
.sp-card-virtues{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.sp-virtue-tag{background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.12);border-radius:10px;padding:4px 10px;font-size:10px;color:var(--accent-green);font-weight:700}
.sp-card-hadith{margin-top:12px;padding:12px;background:rgba(240,176,64,.05);border:1px solid rgba(240,176,64,.12);border-radius:12px}
.sp-card-hadith-text{font-size:13px;color:var(--text-primary);line-height:1.9;font-family:'Amiri Quran',serif}
.sp-card-actions{display:flex;gap:8px;margin-top:14px}
.sp-btn{flex:1;padding:10px;border-radius:12px;border:none;font-family:'Cairo',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px}
.sp-btn-speak{background:rgba(0,200,150,.1);color:var(--accent-green);border:1px solid rgba(0,200,150,.2)}
.sp-btn-speak:hover{background:rgba(0,200,150,.2)}
.sp-btn-speak.speaking{background:rgba(239,68,68,.1);color:#ef4444;border-color:rgba(239,68,68,.2)}
.sp-btn-share{background:rgba(139,92,246,.1);color:#8b5cf6;border:1px solid rgba(139,92,246,.2)}
.sp-btn-share:hover{background:rgba(139,92,246,.2)}
.sp-empty{text-align:center;padding:60px 20px;color:var(--text-muted)}
.sp-empty-icon{font-size:48px;margin-bottom:12px}
.sp-empty-text{font-size:14px;font-weight:700}
.sp-tabs{display:flex;gap:8px;padding:0 16px;margin-bottom:16px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}
.sp-tabs::-webkit-scrollbar{display:none}
.sp-tab{padding:8px 16px;border-radius:20px;border:1px solid var(--border-card);background:var(--bg-card);color:var(--text-muted);font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:'Cairo',sans-serif}
.sp-tab.active{background:var(--accent-green);color:#fff;border-color:var(--accent-green)}
.sp-tab:hover:not(.active){border-color:var(--accent-green);color:var(--accent-green)}
.sp-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:0 16px}
.sp-mini-card{background:var(--bg-card);border:1px solid var(--border-card);border-radius:14px;padding:12px;text-align:center;cursor:pointer;transition:all .25s}
.sp-mini-card:hover{border-color:var(--accent-green);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.15)}
.sp-mini-emoji{font-size:28px;margin-bottom:6px;display:block}
.sp-mini-name{font-size:12px;font-weight:700;color:var(--text-primary);line-height:1.4}
.sp-mini-title{font-size:10px;color:var(--text-muted);margin-top:2px}
.sp-view-toggle{display:flex;gap:6px;padding:0 16px;margin-bottom:14px}
.sp-view-btn{padding:6px 12px;border-radius:10px;border:1px solid var(--border-card);background:var(--bg-card);color:var(--text-muted);font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:4px}
.sp-view-btn.active{background:var(--accent-green);color:#fff;border-color:var(--accent-green)}
.sp-view-btn svg{width:14px;height:14px}
`;

function SahabaCard({ person, onSpeak, isSpeaking, t }) {
  const [expanded, setExpanded] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation();
    onSpeak(person.story);
  };

  return (
    <motion.div
      className="sp-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      onClick={() => setExpanded(!expanded)}
    >
      <div className="sp-card-top">
        <div className="sp-card-glow" style={{ background: person.color }} />
        <span className="sp-card-emoji">{person.emoji}</span>
        <div className="sp-card-name">{person.name}</div>
        <div className="sp-card-title">{person.title}</div>
        <div className="sp-card-nickname">🏷️ {person.nickname}</div>
      </div>

      <div className="sp-card-body">
        <div className="sp-card-row">
          <span className="sp-card-label">{t.sahaba.kunya}</span>
          <span className="sp-card-value">{person.kunya}</span>
        </div>
        <div className="sp-card-row">
          <span className="sp-card-label">{t.sahaba.death}</span>
          <span className="sp-card-value">{person.deathAH}</span>
        </div>
        <div className="sp-card-row">
          <span className="sp-card-label">{t.sahaba.relationship}</span>
          <span className="sp-card-value">{person.relationship}</span>
        </div>

        <div className="sp-card-virtues">
          {person.virtues.slice(0, 3).map((v, i) => (
            <span key={i} className="sp-virtue-tag">{v}</span>
          ))}
          {person.virtues.length > 3 && (
            <span className="sp-virtue-tag" style={{opacity:0.6}}>+{person.virtues.length - 3}</span>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="sp-card-story">{person.story}</div>

              {person.hadithAbout && (
                <div className="sp-card-hadith">
                  <div style={{ fontSize: 11, color: '#f0b040', fontWeight: 700, marginBottom: 6 }}>📖 {t.sahaba.hadithAbout}</div>
                  <div className="sp-card-hadith-text">{person.hadithAbout}</div>
                </div>
              )}

              <div className="sp-card-actions">
                <button className={`sp-btn sp-btn-speak${isSpeaking ? ' speaking' : ''}`} onClick={handleSpeak}>
                  {isSpeaking ? '⏹️' : '🔊'} {isSpeaking ? t.sahaba.stop : t.sahaba.listen}
                </button>
                <button className="sp-btn sp-btn-share" onClick={(e) => {
                  e.stopPropagation();
                  if (navigator.share) navigator.share({ title: person.name, text: `${person.name} - ${person.title}\n${person.story}` });
                }}>
                  📤 {t.sahaba.share}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SahabaMiniCard({ person, onClick }) {
  return (
    <motion.div
      className="sp-mini-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <span className="sp-mini-emoji">{person.emoji}</span>
      <div className="sp-mini-name">{person.name}</div>
      <div className="sp-mini-title">{person.title}</div>
    </motion.div>
  );
}

export default function Sahaba() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleSpeak = (text) => {
    if (speakingIdx !== null) { stopSpeaking(); setSpeakingIdx(null); return; }
    speakArabic(text);
    setSpeakingIdx(0);
    const check = setInterval(() => {
      if (!window.speechSynthesis?.speaking) { setSpeakingIdx(null); clearInterval(check); }
    }, 500);
  };

  const filtered = sahabaData.filter(p => {
    const matchSearch = !search || p.name.includes(search) || p.title.includes(search) || p.nickname.includes(search) || (p.nameEn && p.nameEn.toLowerCase().includes(search.toLowerCase()));
    let matchFilter = true;
    if (filter !== 'all') {
      matchFilter = p.filter && p.filter.includes(filter);
    }
    return matchSearch && matchFilter;
  });

  useEffect(() => { return () => stopSpeaking(); }, []);

  const selected = selectedPerson ? sahabaData.find(p => p.id === selectedPerson) : null;

  const FILTERS = [
    { key: 'all', label: t.sahaba.filterAll, emoji: '👥' },
    { key: 'mubashshar', label: t.sahaba.filterMubashshar, emoji: '🌟' },
    { key: 'khulafa', label: t.sahaba.filterKhulafa, emoji: '👑' },
    { key: 'muhajirun', label: t.sahaba.filterMuhajirun, emoji: '🌙' },
    { key: 'ansar', label: t.sahaba.filterAnsar, emoji: '🤲' },
  ];

  return (
    <>
      <style>{sahabaCss}</style>
      <div className="sp-wrap">
        <div className="sp-hero">
          <div className="sp-glow" />
          <div className="sp-hero-content">
            <Link to="/" className="sp-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              {t.sahaba.home}
            </Link>
            <div className="sp-title">🕌 {t.sahaba.title}</div>
            <div className="sp-subtitle">{t.sahaba.subtitle.replace('{count}', sahabaData.length)}</div>
          </div>
        </div>

        <div className="sp-search">
          <svg className="sp-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder={t.sahaba.search} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="sp-tabs">
          {FILTERS.map(f => (
            <button key={f.key} className={`sp-tab${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        <div className="sp-view-toggle">
          <button className={`sp-view-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            {t.sahaba.cards}
          </button>
          <button className={`sp-view-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            {t.sahaba.list}
          </button>
        </div>

        <div className="sp-count">
          {t.sahaba.showing} <strong>{filtered.length}</strong> {t.sahaba.ofTotal} <strong>{sahabaData.length}</strong>
        </div>

        {filtered.length === 0 ? (
          <div className="sp-empty">
            <div className="sp-empty-icon">🔍</div>
            <div className="sp-empty-text">{t.sahaba.noResults}</div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="sp-grid-2">
            {filtered.map((person) => (
              <SahabaMiniCard key={person.id} person={person} onClick={() => setSelectedPerson(person.id)} />
            ))}
          </div>
        ) : (
          <div className="sp-grid">
            {filtered.map((person, idx) => (
              <SahabaCard key={person.id} person={person} onSpeak={handleSpeak} isSpeaking={speakingIdx === idx} t={t} />
            ))}
          </div>
        )}

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
              onClick={() => setSelectedPerson(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{ width: '100%', maxWidth: 500, maxHeight: '85vh', background: 'var(--bg-primary)', borderRadius: '24px 24px 0 0', overflow: 'auto', padding: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>{t.sahaba.details}</div>
                  <button onClick={() => setSelectedPerson(null)} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div style={{ padding: '0 16px 24px' }}>
                  <SahabaCard person={selected} onSpeak={handleSpeak} isSpeaking={false} t={t} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
