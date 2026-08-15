import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n.jsx';

const CATEGORIES = [
  { id: 'mother', nameAr: 'الوالدة', nameEn: 'Mother', nameEs: 'Madre', ico: '👩‍🦳', parent: 'parents' },
  { id: 'father', nameAr: 'الوالد', nameEn: 'Father', nameEs: 'Padre', ico: '👨‍🦳', parent: 'parents' },
  { id: 'brother', nameAr: 'أخي', nameEn: 'Brother', nameEs: 'Hermano', ico: '👦', parent: 'family' },
  { id: 'sister', nameAr: 'أختي', nameEn: 'Sister', nameEs: 'Hermana', ico: '👧', parent: 'family' },
  { id: 'uncle_p', nameAr: 'العم', nameEn: 'Paternal Uncle', nameEs: 'Tío', ico: '👨', parent: 'family' },
  { id: 'aunt_p', nameAr: 'العمة', nameEn: 'Paternal Aunt', nameEs: 'Tía', ico: '👩', parent: 'family' },
  { id: 'uncle_m', nameAr: 'الخال', nameEn: 'Maternal Uncle', nameEs: 'Tío', ico: '👨', parent: 'family' },
  { id: 'aunt_m', nameAr: 'الخالة', nameEn: 'Maternal Aunt', nameEs: 'Tía', ico: '👩', parent: 'family' },
  { id: 'cousin', nameAr: 'ابن العم/الخال', nameEn: 'Cousin', nameEs: 'Primo', ico: '🧑', parent: 'family' },
  { id: 'friend', nameAr: 'صديق', nameEn: 'Friend', nameEs: 'Amigo', ico: '🤝', parent: 'friends' },
  { id: 'beloved', nameAr: 'محب في الله', nameEn: 'Beloved in Allah', nameEs: 'Amado en Allah', ico: '💚', parent: 'love' },
  { id: 'other', nameAr: 'أخرى', nameEn: 'Other', nameEs: 'Otro', ico: '👤', parent: 'family' },
];

const FREQS = [
  { id: 'daily', nameAr: 'يومي', nameEn: 'Daily', nameEs: 'Diario' },
  { id: 'weekly', nameAr: 'أسبوعي', nameEn: 'Weekly', nameEs: 'Semanal' },
  { id: 'monthly', nameAr: 'شهري', nameEn: 'Monthly', nameEs: 'Mensual' },
];

const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_SHORT = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

const pageCss = `
@keyframes krFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes krFadeIn{from{opacity:0}to{opacity:1}}
@keyframes krPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
@keyframes krGlow{0%,100%{box-shadow:0 0 10px rgba(0,180,150,.06)}50%{box-shadow:0 0 20px rgba(0,180,150,.12)}}
@keyframes krBreathe{0%,100%{box-shadow:0 0 0 0 rgba(0,200,150,.2)}50%{box-shadow:0 0 0 12px rgba(0,200,150,0)}}
@keyframes krSlideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes krNotifPop{0%{transform:translate(-50%,-30px) scale(.8);opacity:0}60%{transform:translate(-50%,0) scale(1.05)}100%{transform:translate(-50%,0) scale(1);opacity:1}}
@keyframes krNotifOut{to{transform:translate(-50%,-30px) scale(.8);opacity:0}}
@keyframes krShake{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
@keyframes krDotPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,200,150,.3)}50%{box-shadow:0 0 0 6px rgba(0,200,150,0)}}

.kr-page{background:var(--bg-primary,#06050e);min-height:100vh;padding:0 14px 100px;font-family:'Cairo',sans-serif;color:var(--text-primary,#f0ece4);direction:rtl}
.kr-page::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 80% 50% at 40% 20%,rgba(0,200,150,.03),transparent 60%),radial-gradient(ellipse 60% 40% at 70% 80%,rgba(167,139,250,.02),transparent 50%)}
.kr-app{position:relative;z-index:2;max-width:540px;margin:0 auto}

.kr-hdr{padding:16px 0 8px;display:flex;align-items:center;justify-content:space-between;animation:krFadeUp .5s ease}
.kr-hdr-r{display:flex;align-items:center;gap:10px}
.kr-logo{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,rgba(0,200,150,.06),rgba(167,139,250,.06));border:1px solid rgba(0,200,150,.06);display:flex;align-items:center;justify-content:center;font-size:20px}
.kr-hdr-title{font-size:16px;font-weight:900;background:linear-gradient(135deg,#00c896,#50e8c0);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.kr-hdr-sub{font-size:9px;color:var(--text-muted,#6b6250);font-weight:600}
.kr-badge{display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.06)}
.kr-dot{width:6px;height:6px;border-radius:50%;background:#00c896;animation:krDotPulse 2s ease infinite}
.kr-badge span{font-size:10px;font-weight:700;color:#00c896}

.kr-verse{text-align:center;padding:10px 16px;margin-bottom:10px;animation:krFadeUp .5s ease .05s forwards;opacity:0}
.kr-verse-text{font-family:'Amiri',serif;font-size:15px;font-weight:700;color:rgba(0,200,150,.35);line-height:1.8;margin-bottom:2px}
.kr-verse-src{font-size:9px;color:var(--text-muted,#3d3628);font-weight:600}

.kr-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;animation:krFadeUp .5s ease .1s forwards;opacity:0}
.kr-st{padding:12px 8px;border-radius:14px;text-align:center;background:var(--card-bg,rgba(255,255,255,.025));border:1px solid var(--border-color,rgba(255,255,255,.045));position:relative;overflow:hidden}
.kr-st::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:24px;height:2px;border-radius:1px}
.kr-st.s1::before{background:#00c896}.kr-st.s2::before{background:#ffa832}.kr-st.s3::before{background:#a78bfa}
.kr-st-val{font-size:22px;font-weight:900;line-height:1;margin-bottom:2px}
.kr-st.s1 .kr-st-val{color:#00c896}.kr-st.s2 .kr-st-val{color:#ffa832}.kr-st.s3 .kr-st-val{color:#a78bfa}
.kr-st-lbl{font-size:9px;font-weight:600;color:var(--text-muted,#6b6250)}

.kr-add-btn{width:100%;padding:11px;border-radius:14px;border:1px dashed rgba(0,200,150,.12);background:rgba(0,200,150,.02);color:#00c896;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .3s;margin-bottom:14px;animation:krFadeUp .5s ease .12s forwards;opacity:0}
.kr-add-btn:hover{background:rgba(0,200,150,.05);border-color:rgba(0,200,150,.2);transform:translateY(-1px)}
.kr-add-btn svg{width:18px;height:18px}

.kr-tabs{display:flex;gap:4px;margin-bottom:14px;animation:krFadeUp .5s ease .15s forwards;opacity:0}
.kr-tab{flex:1;padding:9px;border-radius:10px;border:1px solid var(--border-color,rgba(255,255,255,.045));background:var(--card-bg,rgba(255,255,255,.025));text-align:center;cursor:pointer;font-size:11px;font-weight:700;color:var(--text-muted,#6b6250);font-family:inherit;transition:all .2s}
.kr-tab:hover{background:rgba(255,255,255,.03)}
.kr-tab.sel{border-color:rgba(0,200,150,.15);background:rgba(0,200,150,.06);color:#00c896}

.kr-list{display:flex;flex-direction:column;gap:8px;animation:krFadeUp .5s ease .2s forwards;opacity:0}
.kr-card{padding:12px 14px;border-radius:14px;border:1px solid var(--border-color,rgba(255,255,255,.045));background:var(--card-bg,rgba(255,255,255,.025));display:flex;align-items:center;gap:10px;transition:all .3s;position:relative;overflow:hidden;animation:krSlideIn .4s ease forwards}
.kr-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,150,.06),transparent)}
.kr-card:hover{background:rgba(255,255,255,.04);transform:translateX(-2px)}
.kr-card.reminding{border-color:rgba(0,200,150,.15);animation:krGlow 2s ease infinite,krSlideIn .4s ease forwards}
.kr-card.reminding .kr-avatar{animation:krBreathe 2s ease infinite}

.kr-avatar{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;border:1px solid var(--border-color,rgba(255,255,255,.045))}
.kr-avatar.cat-parents{background:rgba(255,168,50,.06);border-color:rgba(255,168,50,.08)}
.kr-avatar.cat-family{background:rgba(0,200,150,.06);border-color:rgba(0,200,150,.08)}
.kr-avatar.cat-friends{background:rgba(167,139,250,.06);border-color:rgba(167,139,250,.08)}
.kr-avatar.cat-love{background:rgba(255,107,157,.06);border-color:rgba(255,107,157,.08)}

.kr-info{flex:1;min-width:0}
.kr-name{font-size:13px;font-weight:800;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kr-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.kr-tag{padding:2px 7px;border-radius:6px;font-size:8px;font-weight:700}
.kr-tag.freq-d{background:rgba(0,200,150,.06);color:#00c896}
.kr-tag.freq-w{background:rgba(255,168,50,.06);color:#ffa832}
.kr-tag.freq-m{background:rgba(167,139,250,.06);color:#a78bfa}
.kr-tag.cat{background:rgba(255,255,255,.03);color:var(--text-muted,#6b6250)}

.kr-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.kr-time{font-size:14px;font-weight:900;color:#00c896;font-variant-numeric:tabular-nums;direction:ltr}
.kr-next{font-size:8px;font-weight:600;color:var(--text-muted,#6b6250)}
.kr-actions{display:flex;gap:4px}
.kr-act{width:26px;height:26px;border-radius:6px;border:1px solid var(--border-color,rgba(255,255,255,.045));background:transparent;color:var(--text-muted,#6b6250);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .2s;font-family:inherit}
.kr-act:hover{background:rgba(255,255,255,.05);color:var(--text-primary,#f0ece4)}
.kr-act.del:hover{color:#ff4757;border-color:rgba(255,71,87,.15)}

.kr-empty{text-align:center;padding:40px 20px;animation:krFadeIn .5s ease}
.kr-empty-ico{font-size:48px;margin-bottom:10px;opacity:.3}
.kr-empty-title{font-size:14px;font-weight:800;color:var(--text-secondary,#b0a898);margin-bottom:4px}
.kr-empty-sub{font-size:11px;color:var(--text-muted,#6b6250)}

.kr-modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;padding:16px}
.kr-modal-overlay.show{display:flex}
.kr-modal{width:100%;max-width:460px;max-height:90vh;overflow-y:auto;background:linear-gradient(180deg,rgba(18,15,30,.99),rgba(10,8,18,1));border:1px solid rgba(255,255,255,.07);border-radius:20px;animation:krFadeUp .3s ease;position:relative}
.kr-modal::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,150,.15),transparent)}
.kr-modal-h{padding:16px 20px 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.045)}
.kr-modal-h h3{font-size:15px;font-weight:900;background:linear-gradient(135deg,#00c896,#50e8c0);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.kr-modal-close{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.045);background:transparent;color:var(--text-muted,#6b6250);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s;font-family:inherit}
.kr-modal-close:hover{background:rgba(255,255,255,.05);color:var(--text-primary,#f0ece4)}
.kr-modal-b{padding:16px 20px 20px}

.kr-fg{margin-bottom:12px}
.kr-fl{font-size:11px;font-weight:700;color:var(--text-secondary,#b0a898);margin-bottom:5px;display:flex;align-items:center;gap:4px}
.kr-fl span{font-size:13px}
.kr-fi{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.045);background:rgba(255,255,255,.02);color:var(--text-primary,#f0ece4);font-size:13px;font-weight:600;font-family:inherit;outline:none;transition:border .2s}
.kr-fi::placeholder{color:var(--text-muted,#3d3628)}
.kr-fi:focus{border-color:rgba(0,200,150,.25)}

.kr-cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.kr-cat{padding:10px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.045);background:var(--card-bg,rgba(255,255,255,.025));text-align:center;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:3px}
.kr-cat:hover{background:rgba(255,255,255,.03)}
.kr-cat.sel{border-color:rgba(0,200,150,.2);background:rgba(0,200,150,.06)}
.kr-cat-ico{font-size:20px;line-height:1}
.kr-cat-name{font-size:9px;font-weight:700;color:var(--text-muted,#6b6250);line-height:1.2}
.kr-cat.sel .kr-cat-name{color:#00c896}

.kr-freq-row{display:flex;gap:6px}
.kr-freq{flex:1;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.045);background:var(--card-bg,rgba(255,255,255,.025));text-align:center;cursor:pointer;font-size:12px;font-weight:700;color:var(--text-muted,#6b6250);font-family:inherit;transition:all .2s}
.kr-freq:hover{background:rgba(255,255,255,.03)}
.kr-freq.sel{border-color:rgba(0,200,150,.2);background:rgba(0,200,150,.06);color:#00c896}

.kr-day-row{display:flex;gap:4px;flex-wrap:wrap}
.kr-day{width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.045);background:var(--card-bg,rgba(255,255,255,.025));text-align:center;cursor:pointer;font-size:11px;font-weight:700;color:var(--text-muted,#6b6250);font-family:inherit;transition:all .2s;display:flex;align-items:center;justify-content:center}
.kr-day:hover{background:rgba(255,255,255,.03)}
.kr-day.sel{border-color:rgba(0,200,150,.2);background:rgba(0,200,150,.06);color:#00c896}

.kr-time-row{display:flex;gap:8px;align-items:center}
.kr-time-input{flex:1;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.045);background:rgba(255,255,255,.02);color:#00c896;font-size:16px;font-weight:900;font-family:inherit;outline:none;text-align:center;direction:ltr;font-variant-numeric:tabular-nums}
.kr-time-input:focus{border-color:rgba(0,200,150,.25)}

.kr-submit{width:100%;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#00c896,#00a87d);color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:all .3s;display:flex;align-items:center;justify-content:center;gap:8px}
.kr-submit:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,200,150,.25)}
.kr-submit svg{width:18px;height:18px}

.kr-notif{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2000;min-width:300px;max-width:90%;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,rgba(18,15,30,.98),rgba(10,8,18,1));border:1px solid rgba(0,200,150,.15);backdrop-filter:blur(20px);box-shadow:0 10px 40px rgba(0,0,0,.5);animation:krNotifPop .4s ease;display:none}
.kr-notif.show{display:block}
.kr-notif.out{animation:krNotifOut .3s ease forwards}
.kr-notif-top{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.kr-notif-dot{width:8px;height:8px;border-radius:50%;background:#00c896;animation:krPulse 1s ease infinite}
.kr-notif-title{font-size:9px;font-weight:700;color:#00c896;letter-spacing:.5px}
.kr-notif-body{display:flex;align-items:center;gap:10px}
.kr-notif-ico{font-size:32px;animation:krShake 1s ease .3s}
.kr-notif-text{flex:1}
.kr-notif-name{font-size:15px;font-weight:900;margin-bottom:2px}
.kr-notif-desc{font-size:10px;color:var(--text-muted,#6b6250)}
.kr-notif-close{position:absolute;top:10px;left:10px;width:24px;height:24px;border-radius:6px;border:none;background:rgba(255,255,255,.05);color:var(--text-muted,#6b6250);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;font-family:inherit}
.kr-notif-btns{display:flex;gap:6px;margin-top:10px}
.kr-notif-btn{flex:1;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.045);background:var(--card-bg,rgba(255,255,255,.025));color:var(--text-secondary,#b0a898);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
.kr-notif-btn:hover{background:rgba(255,255,255,.05)}
.kr-notif-btn.primary{background:rgba(0,200,150,.06);border-color:rgba(0,200,150,.12);color:#00c896}
.kr-notif-btn.primary:hover{background:rgba(0,200,150,.1)}
`;

function getCatById(id) { return CATEGORIES.find(c => c.id === id); }
function getCatIco(id) { return getCatById(id)?.ico || '👤'; }
function getCatName(id, lang) {
  const cat = getCatById(id);
  if (!cat) return id;
  if (lang === 'en') return cat.nameEn;
  if (lang === 'es') return cat.nameEs;
  return cat.nameAr;
}
function getCatParent(id) { return getCatById(id)?.parent || 'family'; }
function catClass(id) { return 'cat-' + getCatParent(id); }

function getNextOccurrence(c) {
  const now = new Date();
  const [th, tm] = c.time.split(':').map(Number);
  if (c.freq === 'daily') {
    const next = new Date(now); next.setHours(th, tm, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }
  if (c.freq === 'weekly') {
    for (let i = 0; i < 7; i++) {
      const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(th, tm, 0, 0);
      if (d > now && c.days && c.days.includes(d.getDay())) return d;
    }
    const d = new Date(now); d.setDate(d.getDate() + 7); d.setHours(th, tm, 0, 0);
    while (!c.days || !c.days.includes(d.getDay())) d.setDate(d.getDate() + 1);
    return d;
  }
  if (c.freq === 'monthly') {
    const d = new Date(now.getFullYear(), now.getMonth(), c.monthDay || 1, th, tm, 0);
    if (d <= now) d.setMonth(d.getMonth() + 1);
    return d;
  }
  return new Date(now.getTime() + 3600000);
}

function formatCountdown(ms) {
  if (ms <= 0) return 'الآن!';
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = s % 60;
  if (h > 24) return Math.ceil(h / 24) + ' يوم';
  if (h > 0) return h + ' س ' + m + ' د';
  if (m > 0) return m + ' د ' + sc + ' ث';
  return sc + ' ث';
}

function relativeDay(date) {
  const now = new Date();
  const diff = Math.round((date - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
  if (diff === 0) return 'اليوم';
  if (diff === 1) return 'غداً';
  if (diff === 2) return 'بعد غد';
  return DAYS_AR[date.getDay()];
}

export default function KindredReminders() {
  const { t, lang } = useTranslation();
  const [contacts, setContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kindred_reminders') || '[]'); } catch { return []; }
  });
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifContact, setNotifContact] = useState(null);
  const notifContactRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [fName, setFName] = useState('');
  const [fCat, setFCat] = useState('');
  const [fFreq, setFFreq] = useState('daily');
  const [fDays, setFDays] = useState([]);
  const [fTime, setFTime] = useState('10:00');
  const [fNote, setFNote] = useState('');
  const [fMonthDay, setFMonthDay] = useState(1);
  const [formError, setFormError] = useState('');

  const snoozedRef = useRef({});
  const lastShownRef = useRef({});

  function persistList(list) {
    localStorage.setItem('kindred_reminders', JSON.stringify(list));
  }

  function openModal(contact) {
    if (contact) {
      setEditingId(contact.id);
      setFName(contact.name);
      setFCat(contact.cat);
      setFFreq(contact.freq);
      setFDays(contact.days || []);
      setFTime(contact.time);
      setFNote(contact.note || '');
      setFMonthDay(contact.monthDay || 1);
    } else {
      setEditingId(null);
      setFName('');
      setFCat('');
      setFFreq('daily');
      setFDays([]);
      setFTime('10:00');
      setFNote('');
      setFMonthDay(1);
    }
    setFormError('');
    setShowModal(true);
  }

  function saveContact() {
    if (!fName.trim()) { setFormError('اكتب الاسم أولاً'); return; }
    if (!fCat) { setFormError('اخت صلة القرابة'); return; }
    setFormError('');
    const data = {
      id: editingId || Date.now().toString(36),
      name: fName.trim(), cat: fCat, freq: fFreq,
      time: fTime, days: fFreq === 'weekly' ? fDays : [],
      monthDay: fFreq === 'monthly' ? fMonthDay : undefined,
      note: fNote.trim(),
      lastDone: editingId ? (contacts.find(c => c.id === editingId) || {}).lastDone || null : null,
      paused: false,
      created: editingId ? (contacts.find(c => c.id === editingId) || {}).created || new Date().toISOString() : new Date().toISOString(),
    };
    const next = editingId ? contacts.map(c => c.id === editingId ? data : c) : [...contacts, data];
    setContacts(next);
    persistList(next);
    setShowModal(false);
  }

  function deleteContact(id) {
    if (!window.confirm('هل تريد حذف هذا التذكير؟')) return;
    const next = contacts.filter(c => c.id !== id);
    setContacts(next);
    persistList(next);
  }

  function markDone(id) {
    const next = contacts.map(c => c.id === id ? { ...c, lastDone: new Date().toISOString() } : c);
    setContacts(next);
    persistList(next);
  }

  function handleMarkDoneFromNotif() {
    if (notifContactRef.current) {
      markDone(notifContactRef.current.id);
      notifContactRef.current = null;
    }
    setShowNotif(false);
    setNotifContact(null);
  }

  function handleSnoozeNotif() {
    if (notifContactRef.current) {
      snoozedRef.current[notifContactRef.current.id] = Date.now() + 10 * 60 * 1000;
    }
    setShowNotif(false);
    setNotifContact(null);
  }

  function toggleDay(d) {
    setFDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  // Check reminders
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      contacts.forEach(c => {
        if (c.paused) return;
        if (snoozedRef.current[c.id] && now < snoozedRef.current[c.id]) return;
        const next = getNextOccurrence(c);
        const diff = Math.abs(next.getTime() - now);
        if (diff < 60000) {
          const last = lastShownRef.current[c.id] || 0;
          if (now - last > 300000) {
            lastShownRef.current[c.id] = now;
            setNotifContact(c);
            notifContactRef.current = c;
            setShowNotif(true);
            if (Notification.permission === 'granted') {
              new Notification('تذكير صلة الرحم — ' + c.name, {
                body: getCatName(c.cat, lang) + ' — تواصل الآن 💚',
                icon: '🤝',
              });
            }
          }
        }
      });
    };
    const iv = setInterval(check, 1000);
    return () => clearInterval(iv);
  }, [contacts, lang]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const active = contacts.filter(c => !c.paused);
  const totalReminders = contacts.length;
  const thisWeek = contacts.filter(c => {
    const n = getNextOccurrence(c);
    return (n - new Date()) < 7 * 86400000;
  }).length;
  const monthlyDone = contacts.filter(c => c.lastDone && (new Date() - new Date(c.lastDone)) < 30 * 86400000).length;

  let filtered = contacts;
  if (filter !== 'all') {
    filtered = contacts.filter(c => getCatParent(c.cat) === filter);
  }
  filtered = [...filtered].sort((a, b) => getNextOccurrence(a) - getNextOccurrence(b));

  const freqName = (f) => f === 'daily' ? (lang === 'en' ? 'Daily' : lang === 'es' ? 'Diario' : 'يومي') : f === 'weekly' ? (lang === 'en' ? 'Weekly' : lang === 'es' ? 'Semanal' : 'أسبوعي') : (lang === 'en' ? 'Monthly' : lang === 'es' ? 'Mensual' : 'شهري');
  const freqClass = (f) => 'freq-' + f[0];

  const toggleDaysForFreq = (freq) => {
    if (freq === 'weekly') {
      return (
        <div className="kr-fg">
          <div className="kr-fl"><span>📅</span> {lang === 'en' ? 'Reminder Day' : lang === 'es' ? 'Día de recordatorio' : 'يوم التنبيه'}</div>
          <div className="kr-day-row">
            {DAYS_SHORT.map((d, i) => (
              <button key={i} className={`kr-day${fDays.includes(i) ? ' sel' : ''}`} onClick={() => toggleDay(i)}>{d}</button>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <style>{pageCss}</style>
      <div className="kr-page">
        <div className="kr-app">
          {/* Header */}
          <div className="kr-hdr">
            <div className="kr-hdr-r">
              <div className="kr-logo">🤝</div>
              <div>
                <div className="kr-hdr-title">{lang === 'en' ? 'Family Ties' : lang === 'es' ? 'Lazos Familiares' : 'صلة الرحم'}</div>
                <div className="kr-hdr-sub">{lang === 'en' ? 'Reminders to connect with loved ones' : lang === 'es' ? 'Recordatorios para conectar con seres queridos' : 'تذكيرات التواصل مع الأحباب'}</div>
              </div>
            </div>
            <div className="kr-badge"><div className="kr-dot"></div><span>{active.length} {lang === 'en' ? 'Active' : lang === 'es' ? 'Activos' : 'نشط'}</span></div>
          </div>

          {/* Verse */}
          <div className="kr-verse">
            <div className="kr-verse-text">﴿ وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ ﴾</div>
            <div className="kr-verse-src">{lang === 'en' ? 'Surah An-Nisa — Verse 1' : lang === 'es' ? 'Surah An-Nisa — Versículo 1' : 'سورة النساء — آية ١'}</div>
          </div>

          {/* Stats */}
          <div className="kr-stats">
            <div className="kr-st s1"><div className="kr-st-val">{totalReminders}</div><div className="kr-st-lbl">{lang === 'en' ? 'Total' : lang === 'es' ? 'Total' : 'إجمالي التذكيرات'}</div></div>
            <div className="kr-st s2"><div className="kr-st-val">{thisWeek}</div><div className="kr-st-lbl">{lang === 'en' ? 'This Week' : lang === 'es' ? 'Esta Semana' : 'هذا الأسبوع'}</div></div>
            <div className="kr-st s3"><div className="kr-st-val">{monthlyDone}</div><div className="kr-st-lbl">{lang === 'en' ? 'Contacted' : lang === 'es' ? 'Contactado' : 'تواصلت هذا الشهر'}</div></div>
          </div>

          {/* Add Button */}
          <button className="kr-add-btn" onClick={() => openModal(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {lang === 'en' ? 'Add New Reminder' : lang === 'es' ? 'Agregar Nuevo Recordatorio' : 'إضافة تذكير جديد'}
          </button>

          {/* Tabs */}
          <div className="kr-tabs">
            <button className={`kr-tab${filter === 'all' ? ' sel' : ''}`} onClick={() => setFilter('all')}>{lang === 'en' ? 'All' : lang === 'es' ? 'Todos' : 'الكل'} ({contacts.length})</button>
            <button className={`kr-tab${filter === 'parents' ? ' sel' : ''}`} onClick={() => setFilter('parents')}>{lang === 'en' ? 'Parents' : lang === 'es' ? 'Padres' : 'الأبوين'}</button>
            <button className={`kr-tab${filter === 'family' ? ' sel' : ''}`} onClick={() => setFilter('family')}>{lang === 'en' ? 'Family' : lang === 'es' ? 'Familia' : 'العائلة'}</button>
            <button className={`kr-tab${filter === 'friends' ? ' sel' : ''}`} onClick={() => setFilter('friends')}>{lang === 'en' ? 'Friends' : lang === 'es' ? 'Amigos' : 'الأصدقاء'}</button>
            <button className={`kr-tab${filter === 'love' ? ' sel' : ''}`} onClick={() => setFilter('love')}>{lang === 'en' ? 'Loved' : lang === 'es' ? 'Amados' : 'المحبون'}</button>
          </div>

          {/* Contact List */}
          <div className="kr-list">
            {filtered.length === 0 ? (
              <div className="kr-empty">
                <div className="kr-empty-ico">🤝</div>
                <div className="kr-empty-title">{filter === 'all' ? (lang === 'en' ? 'No reminders yet' : lang === 'es' ? 'Sin recordatorios aún' : 'لا توجد تذكيرات بعد') : (lang === 'en' ? 'No reminders in this section' : lang === 'es' ? 'Sin recordatorios en esta sección' : 'لا توجد تذكيرات في هذا القسم')}</div>
                <div className="kr-empty-sub">{lang === 'en' ? 'Add a reminder to start' : lang === 'es' ? 'Agrega un recordatorio para comenzar' : 'أضف تذكيراً للبدء في صلة الرحم'}</div>
              </div>
            ) : filtered.map((c, i) => {
              const next = getNextOccurrence(c);
              const countdown = formatCountdown(next - new Date());
              const relDay = relativeDay(next);
              const isReminding = notifContact && notifContact.id === c.id;
              const lastDoneText = c.lastDone ? (lang === 'en' ? 'Last: ' : lang === 'es' ? 'Último: ' : 'آخر تواصل: ') + new Date(c.lastDone).toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'es' ? 'es' : 'en', { day: 'numeric', month: 'short' }) : '';
              const daysText = c.days && c.days.length ? c.days.map(d => DAYS_SHORT[d]).join('، ') : '';

              return (
                <div key={c.id} className={`kr-card${isReminding ? ' reminding' : ''}`} style={{ animationDelay: i * 0.05 + 's' }}>
                  <div className={`kr-avatar ${catClass(c.cat)}`}>{getCatIco(c.cat)}</div>
                  <div className="kr-info">
                    <div className="kr-name">{c.name}</div>
                    <div className="kr-meta">
                      <span className={`kr-tag ${freqClass(c.freq)}`}>{freqName(c.freq)}</span>
                      <span className="kr-tag cat">{getCatName(c.cat, lang)}</span>
                      {daysText ? <span className="kr-tag" style={{ background: 'rgba(255,255,255,.02)', color: 'var(--text-muted,#3d3628)' }}>{daysText}</span> : null}
                    </div>
                    {c.note ? <div style={{ fontSize: 9, color: 'var(--text-muted,#3d3628)', marginTop: 2 }}>{c.note}</div> : null}
                    {lastDoneText ? <div style={{ fontSize: 8, color: 'rgba(0,200,150,.3)', marginTop: 1 }}>{lastDoneText}</div> : null}
                  </div>
                  <div className="kr-right">
                    <div className="kr-time">{c.time}</div>
                    <div className="kr-next">{relDay} — {countdown}</div>
                    <div className="kr-actions">
                      <button className="kr-act" title={lang === 'en' ? 'Contacted' : lang === 'es' ? 'Contactado' : 'تواصلت'} onClick={() => markDone(c.id)}>✓</button>
                      <button className="kr-act" title={lang === 'en' ? 'Edit' : lang === 'es' ? 'Editar' : 'تعديل'} onClick={() => openModal(c)}>✎</button>
                      <button className="kr-act del" title={lang === 'en' ? 'Delete' : lang === 'es' ? 'Eliminar' : 'حذف'} onClick={() => deleteContact(c.id)}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className={`kr-modal-overlay${showModal ? ' show' : ''}`} onClick={(e) => { if (e.target.classList.contains('kr-modal-overlay')) setShowModal(false); }}>
        <div className="kr-modal">
          <div className="kr-modal-h">
            <h3>{editingId ? (lang === 'en' ? 'Edit Reminder' : lang === 'es' ? 'Editar Recordatorio' : 'تعديل تذكير') : (lang === 'en' ? 'Add Kindred Reminder' : lang === 'es' ? 'Agregar Recordatorio' : 'إضافة تذكير صلة رحم')}</h3>
            <button className="kr-modal-close" onClick={() => setShowModal(false)}>&times;</button>
          </div>
          <div className="kr-modal-b">
            <div className="kr-fg">
              <div className="kr-fl"><span>👤</span> {lang === 'en' ? 'Name' : lang === 'es' ? 'Nombre' : 'الاسم'}</div>
              <input className="kr-fi" placeholder={lang === 'en' ? 'e.g. Umm Muhammad' : lang === 'es' ? 'ej. Umm Muhammad' : 'مثال: أم محمد'} maxLength={40} value={fName} onChange={e => setFName(e.target.value)} />
            </div>
            <div className="kr-fg">
              <div className="kr-fl"><span>👥</span> {lang === 'en' ? 'Relationship' : lang === 'es' ? 'Relación' : 'صلة القرابة'}</div>
              <div className="kr-cat-grid">
                {CATEGORIES.map(c => (
                  <div key={c.id} className={`kr-cat${fCat === c.id ? ' sel' : ''}`} onClick={() => setFCat(c.id)}>
                    <span className="kr-cat-ico">{c.ico}</span>
                    <span className="kr-cat-name">{lang === 'en' ? c.nameEn : lang === 'es' ? c.nameEs : c.nameAr}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="kr-fg">
              <div className="kr-fl"><span>🔁</span> {lang === 'en' ? 'Frequency' : lang === 'es' ? 'Frecuencia' : 'تكرار التنبيه'}</div>
              <div className="kr-freq-row">
                {FREQS.map(f => (
                  <button key={f.id} className={`kr-freq${fFreq === f.id ? ' sel' : ''}`} onClick={() => { setFFreq(f.id); if (f.id !== 'weekly') setFDays([]); }}>{lang === 'en' ? f.nameEn : lang === 'es' ? f.nameEs : f.nameAr}</button>
                ))}
              </div>
            </div>
            {toggleDaysForFreq(fFreq)}
            <div className="kr-fg">
              <div className="kr-fl"><span>🕐</span> {lang === 'en' ? 'Time' : lang === 'es' ? 'Hora' : 'وقت التنبيه'}</div>
              <div className="kr-time-row">
                <input className="kr-time-input" type="time" value={fTime} onChange={e => setFTime(e.target.value)} />
                <span style={{ fontSize: 10, color: 'var(--text-muted,#6b6250)' }}>{lang === 'en' ? '24h' : lang === 'es' ? '24h' : 'بتوقيت 24 ساعة'}</span>
              </div>
            </div>
            <div className="kr-fg">
              <div className="kr-fl"><span>📝</span> {lang === 'en' ? 'Note (optional)' : lang === 'es' ? 'Nota (opcional)' : 'ملاحظة (اختياري)'}</div>
              <input className="kr-fi" placeholder={lang === 'en' ? 'e.g. Asked about health' : lang === 'es' ? 'ej. Preguntó por su salud' : 'مثال: سأل عن صحتها'} maxLength={80} value={fNote} onChange={e => setFNote(e.target.value)} />
            </div>
            {formError ? <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,71,87,.1)', border: '1px solid rgba(255,71,87,.2)', color: '#ff4757', fontSize: 12, fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>{formError}</div> : null}
            <button className="kr-submit" onClick={saveContact}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {lang === 'en' ? 'Save Reminder' : lang === 'es' ? 'Guardar Recordatorio' : 'حفظ التذكير'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      <div className={`kr-notif${showNotif ? ' show' : ''}${!showNotif && notifContact ? ' out' : ''}`}>
        <button className="kr-notif-close" onClick={() => { setShowNotif(false); setNotifContact(null); }}>&times;</button>
        <div className="kr-notif-top"><div className="kr-notif-dot"></div><span className="kr-notif-title">{lang === 'en' ? 'Family Ties Reminder' : lang === 'es' ? 'Recordatorio de Lazos' : 'تذكير صلة الرحم'}</span></div>
        <div className="kr-notif-body">
          <span className="kr-notif-ico">{notifContact ? getCatIco(notifContact.cat) : '💚'}</span>
          <div className="kr-notif-text">
            <div className="kr-notif-name">{notifContact ? notifContact.name : '--'}</div>
            <div className="kr-notif-desc">{notifContact ? getCatName(notifContact.cat, lang) + ' — ' + (notifContact.note || (lang === 'en' ? 'Contact now 💚' : lang === 'es' ? 'Contacta ahora 💚' : 'تواصل معه الآن 💚')) : '--'}</div>
          </div>
        </div>
        <div className="kr-notif-btns">
          <button className="kr-notif-btn primary" onClick={handleMarkDoneFromNotif}>{lang === 'en' ? 'Contacted' : lang === 'es' ? 'Contactado' : 'تم التواصل'}</button>
          <button className="kr-notif-btn" onClick={handleSnoozeNotif}>{lang === 'en' ? 'Snooze 10min' : lang === 'es' ? 'Posponer 10min' : 'تأجيل 10 دقائق'}</button>
        </div>
      </div>
    </>
  );
}
