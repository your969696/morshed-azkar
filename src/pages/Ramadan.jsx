import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';
import { RAMADAN_ADKAR, RAMADAN_DUAAS, RAMADAN_TIPS, QURAN_JUZ } from '../data/ramadan-azkar.js';

const ramadanCss = `
.rm-page{width:100%;background:var(--bg-primary);padding-bottom:120px;transition:background .3s}
.rm-hero{background:linear-gradient(175deg,#1c1040 0%,#2d1b69 50%,#0f0a1a 100%);padding:28px 20px 24px;position:relative;overflow:hidden}
html.light .rm-hero{background:linear-gradient(175deg,#e8e0f0 0%,#c4b5e0 50%,#f5f3f7 100%)}
.rm-glow{position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(240,176,64,.15) 0%,transparent 70%);border-radius:50%;pointer-events:none}
.rm-glow2{position:absolute;bottom:-30px;left:-30px;width:160px;height:160px;background:radial-gradient(circle,rgba(0,200,150,.1) 0%,transparent 70%);border-radius:50%;pointer-events:none}
.rm-hero-title{font-size:28px;font-weight:800;color:var(--text-primary);margin-bottom:4px;text-align:center}
.rm-hero-sub{font-size:13px;color:var(--text-muted);text-align:center}
.rm-countdown{text-align:center;margin-top:18px}
.rm-countdown-num{font-size:52px;font-weight:800;color:var(--accent-gold);text-shadow:0 0 20px rgba(240,176,64,.3)}
.rm-countdown-label{font-size:12px;color:var(--text-muted);margin-top:2px}
.rm-tabs{display:flex;gap:6px;padding:12px 16px;overflow-x:auto;scrollbar-width:none}
.rm-tabs::-webkit-scrollbar{display:none}
.rm-tab{flex-shrink:0;padding:8px 18px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-muted);transition:all .25s}
.rm-tab.active{background:var(--accent-purple);color:#fff;border-color:var(--accent-purple);box-shadow:0 2px 12px rgba(139,92,246,.3)}
.rm-content{padding:0 16px}
.rm-card{background:var(--bg-card);border:1px solid var(--border-card);border-radius:18px;padding:18px;margin-bottom:12px;transition:all .2s}
.rm-card:hover{border-color:var(--border-color)}
.rm-card-title{font-size:15px;font-weight:800;color:var(--text-primary);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.rm-card-icon{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px}
.rm-adkar-item{display:flex;align-items:center;justify-content:space-between;padding:14px;border-radius:14px;margin-bottom:8px;cursor:pointer;transition:all .2s;border:1px solid var(--border-card);background:var(--bg-primary)}
.rm-adkar-item:active{transform:scale(.98)}
.rm-adkar-item.done{background:rgba(0,200,150,.05);border-color:rgba(0,200,150,.15)}
.rm-adkar-text{font-size:14px;color:var(--text-primary);flex:1;line-height:1.8;font-weight:500;padding-left:10px}
.rm-adkar-counter{min-width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;transition:all .25s;flex-shrink:0}
.rm-adkar-counter.pending{background:rgba(240,176,64,.08);border:1px solid rgba(240,176,64,.18);color:var(--accent-gold)}
.rm-adkar-counter.done{background:var(--accent-green);color:#fff;box-shadow:0 4px 12px rgba(0,200,150,.3)}
.rm-adkar-source{font-size:10px;color:var(--text-muted);margin-top:6px}
.rm-dua-item{padding:14px;border-radius:14px;margin-bottom:8px;border:1px solid var(--border-card);background:var(--bg-primary)}
.rm-dua-title{font-size:13px;font-weight:700;color:var(--accent-purple);margin-bottom:6px}
.rm-dua-text{font-size:15px;color:var(--text-primary);line-height:1.8;font-weight:500;font-family:'Amiri Quran',serif}
.rm-dua-source{font-size:10px;color:var(--text-muted);margin-top:8px}
.rm-tip-item{display:flex;gap:12px;padding:14px;border-radius:14px;margin-bottom:8px;border:1px solid var(--border-card);background:var(--bg-primary);align-items:flex-start}
.rm-tip-icon{font-size:24px;flex-shrink:0;margin-top:2px}
.rm-tip-content{flex:1}
.rm-tip-title{font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px}
.rm-tip-text{font-size:12px;color:var(--text-secondary);line-height:1.6}
.rm-juz-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.rm-juz-item{padding:12px 4px;border-radius:12px;text-align:center;cursor:pointer;transition:all .2s;border:1px solid var(--border-card);background:var(--bg-primary)}
.rm-juz-item:active{transform:scale(.95)}
.rm-juz-item.completed{background:rgba(0,200,150,.08);border-color:rgba(0,200,150,.2)}
.rm-juz-num{font-size:16px;font-weight:800;color:var(--text-primary)}
.rm-juz-name{font-size:9px;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-juz-item.completed .rm-juz-num{color:var(--accent-green)}
.rm-deeds-item{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:12px;margin-bottom:6px;border:1px solid var(--border-card);background:var(--bg-primary);cursor:pointer;transition:all .2s}
.rm-deeds-item:active{transform:scale(.98)}
.rm-deeds-item.done{background:rgba(0,200,150,.05);border-color:rgba(0,200,150,.15)}
.rm-deeds-text{font-size:13px;color:var(--text-primary);flex:1}
.rm-deeds-check{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;border:2px solid var(--border-color);transition:all .2s;font-size:14px}
.rm-deeds-item.done .rm-deeds-check{background:var(--accent-green);border-color:var(--accent-green);color:#fff}
.rm-times{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rm-time-card{padding:14px;border-radius:14px;text-align:center;border:1px solid var(--border-card);background:var(--bg-primary)}
.rm-time-label{font-size:11px;color:var(--text-muted);margin-bottom:4px;font-weight:600}
.rm-time-value{font-size:18px;font-weight:800;color:var(--accent-gold)}
.rm-time-icon{font-size:20px;margin-bottom:6px}
.rm-section-label{font-size:12px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.2px;margin:20px 0 12px;padding:0 4px}
.rm-reset-btn{display:block;width:100%;padding:12px;border-radius:12px;font-size:13px;font-weight:700;font-family:'Cairo',sans-serif;cursor:pointer;transition:all .2s;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-muted);margin-top:16px}
.rm-reset-btn:hover{background:var(--bg-card-hover);border-color:var(--accent-purple);color:var(--accent-purple)}
`;

const DEEDS = [
  'إفطار صائم',
  'سحور',
  'صلاة التراويح',
  'قراءة القرآن صفحة',
  'دعاء للأهل والأصدقاء',
  'صدقة',
  'ذكر الله 100 مرة',
  'صلة الرحم',
  'طلب العلم الشرعي',
];

function RamadanAdkarItem({ item }) {
  const [count, setCount] = useState(() => {
    try { return parseInt(localStorage.getItem(`rm_adkar_${item.id}`) || '0'); } catch { return 0; }
  });
  const done = count >= item.count;
  const pct = Math.min((count / item.count) * 100, 100);

  const tap = useCallback(() => {
    if (done) return;
    const next = count + 1;
    setCount(next);
    try { localStorage.setItem(`rm_adkar_${item.id}`, next.toString()); } catch {}
    if (navigator.vibrate) navigator.vibrate(25);
  }, [count, done, item.id]);

  return (
    <motion.div className={`rm-adkar-item${done ? ' done' : ''}`} onClick={tap} whileTap={{ scale: 0.97 }} layout>
      <div style={{ flex: 1 }}>
        <div className="rm-adkar-text">{item.text}</div>
        {item.count > 1 && (
          <div style={{ height: 3, background: 'var(--border-color)', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: done ? 'var(--accent-green)' : 'var(--accent-gold)', borderRadius: 4, transition: 'width .4s ease' }} />
          </div>
        )}
        {item.source && <div className="rm-adkar-source">{item.source}</div>}
      </div>
      <motion.div
        className={`rm-adkar-counter${done ? ' done' : ' pending'}`}
        key={done ? 'done' : count}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {done ? '\u2713' : item.count - count}
      </motion.div>
    </motion.div>
  );
}

function QuranTracker({ t }) {
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem('rm_quran_juz');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const toggleJuz = (id) => {
    setCompleted(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('rm_quran_juz', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <div>
      <div className="rm-section-label">{completed.length}/30</div>
      <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(completed.length / 30) * 100}%`, background: 'linear-gradient(90deg, var(--accent-green), #10b981)', borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <div className="rm-juz-grid">
        {QURAN_JUZ.map(juz => (
          <motion.div
            key={juz.id}
            className={`rm-juz-item${completed.includes(juz.id) ? ' completed' : ''}`}
            onClick={() => toggleJuz(juz.id)}
            whileTap={{ scale: 0.92 }}
          >
            <div className="rm-juz-num">{juz.number}</div>
            <div className="rm-juz-name">{juz.name}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DeedsTracker() {
  const [done, setDone] = useState(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem('rm_deeds');
      const data = saved ? JSON.parse(saved) : {};
      return data.date === today ? data.done : [];
    } catch { return []; }
  });

  const toggle = (id) => {
    setDone(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('rm_deeds', JSON.stringify({ date: new Date().toDateString(), done: next }));
      } catch {}
      return next;
    });
  };

  return (
    <div>
      <div className="rm-section-label">{done.length}/{DEEDS.length}</div>
      {DEEDS.map((deed, i) => (
        <motion.div
          key={i}
          className={`rm-deeds-item${done.includes(i) ? ' done' : ''}`}
          onClick={() => toggle(i)}
          whileTap={{ scale: 0.98 }}
        >
          <div className="rm-deeds-text">{deed}</div>
          <div className="rm-deeds-check">{done.includes(i) ? '\u2713' : ''}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Ramadan() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('azkar');

  const getDaysRemaining = () => {
    const now = new Date();
    const year = now.getFullYear();
    const ramadanStart = new Date(year, 2, 1);
    const ramadanEnd = new Date(year, 3, 1);
    if (now >= ramadanStart && now < ramadanEnd) {
      return { remaining: 30 - Math.floor((now - ramadanStart) / 86400000), active: true };
    }
    return { remaining: 0, active: false };
  };

  const { remaining, active } = getDaysRemaining();

  const tabs = [
    { key: 'azkar', label: t.ramadan.azkar },
    { key: 'duas', label: t.ramadan.tabDuas || t.ramadan.duas },
    { key: 'quran', label: t.ramadan.quran },
    { key: 'deeds', label: t.ramadan.deeds },
    { key: 'tips', label: t.ramadan.tabTips || t.ramadan.tips },
  ];

  return (
    <>
      <style>{ramadanCss}</style>
      <div className="rm-page">
        <div className="rm-hero">
          <div className="rm-glow" />
          <div className="rm-glow2" />
          <div className="rm-hero-title">{t.ramadan.title}</div>
          <div className="rm-hero-sub">{t.ramadan.subtitle}</div>
          <div className="rm-countdown">
            <div className="rm-countdown-num">
              {active ? remaining : '--'}
            </div>
            <div className="rm-countdown-label">
              {active ? t.ramadan.daysLeft : t.ramadan.waiting}
            </div>
          </div>
        </div>

        <div className="rm-tabs">
          {tabs.map(tb => (
            <motion.button
              key={tb.key}
              className={`rm-tab${tab === tb.key ? ' active' : ''}`}
              onClick={() => setTab(tb.key)}
              whileTap={{ scale: 0.95 }}
            >
              {tb.label}
            </motion.button>
          ))}
        </div>

        <div className="rm-content">
          <AnimatePresence mode="wait">
            {tab === 'azkar' && (
              <motion.div key="azkar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="rm-section-label">{t.ramadan.dailyAzkar}</div>
                {RAMADAN_ADKAR.map(item => (
                  <RamadanAdkarItem key={item.id} item={item} />
                ))}
              </motion.div>
            )}
            {tab === 'duas' && (
              <motion.div key="duas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="rm-section-label">{t.ramadan.duas}</div>
                {RAMADAN_DUAAS.map(dua => (
                  <div key={dua.id} className="rm-dua-item">
                    <div className="rm-dua-title">{dua.title}</div>
                    <div className="rm-dua-text">{dua.text}</div>
                    <div className="rm-dua-source">{dua.source}</div>
                  </div>
                ))}
              </motion.div>
            )}
            {tab === 'quran' && (
              <motion.div key="quran" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <QuranTracker t={t} />
              </motion.div>
            )}
            {tab === 'deeds' && (
              <motion.div key="deeds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DeedsTracker t={t} />
              </motion.div>
            )}
            {tab === 'tips' && (
              <motion.div key="tips" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="rm-section-label">{t.ramadan.tips}</div>
                {RAMADAN_TIPS.map(tip => (
                  <div key={tip.id} className="rm-tip-item">
                    <div className="rm-tip-icon">{tip.icon}</div>
                    <div className="rm-tip-content">
                      <div className="rm-tip-title">{tip.title}</div>
                      <div className="rm-tip-text">{tip.tip}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
