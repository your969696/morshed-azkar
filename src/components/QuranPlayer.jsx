import { useEffect, useRef, useState } from 'react';
import { getPrayerTimesSync, parseTime } from '../utils/prayer-times';
import { isAzanPlaying, stopAllAudio } from '../utils/sound';

const B = 'https://server14.mp3quran.net/refat';
const PL = [
  { id: 1, t: 'سورة الفاتحة', r: 'الشيخ محمد رفعت', s: 'الفاتحة', d: '2:15', ds: 135, url: B + '/001.mp3' },
  { id: 2, t: 'سورة البقرة', r: 'الشيخ محمد رفعت', s: 'البقرة', d: '1:25:30', ds: 5130, url: B + '/002.mp3' },
  { id: 3, t: 'سورة آل عمران', r: 'الشيخ محمد رفعت', s: 'آل عمران', d: '52:10', ds: 3130, url: B + '/003.mp3' },
  { id: 4, t: 'سورة الرحمن', r: 'الشيخ محمد رفعت', s: 'الرحمن', d: '7:40', ds: 460, url: B + '/055.mp3' },
  { id: 5, t: 'سورة الواقعة', r: 'الشيخ محمد رفعت', s: 'الواقعة', d: '6:30', ds: 390, url: B + '/056.mp3' },
  { id: 6, t: 'سورة يس', r: 'الشيخ محمد رفعت', s: 'يس', d: '8:15', ds: 495, url: B + '/036.mp3' },
  { id: 7, t: 'سورة الملك', r: 'الشيخ محمد رفعت', s: 'الملك', d: '5:45', ds: 345, url: B + '/067.mp3' },
  { id: 8, t: 'سورة الكهف', r: 'الشيخ محمد رفعت', s: 'الكهف', d: '18:20', ds: 1100, url: B + '/018.mp3' },
  { id: 9, t: 'سورة مريم', r: 'الشيخ محمد رفعت', s: 'مريم', d: '10:20', ds: 620, url: B + '/019.mp3' },
  { id: 10, t: 'سورة الدخان', r: 'الشيخ محمد رفعت', s: 'الدخان', d: '4:20', ds: 260, url: B + '/044.mp3' },
  { id: 11, t: 'سورة ص', r: 'الشيخ محمد رفعت', s: 'ص', d: '5:55', ds: 355, url: B + '/038.mp3' },
  { id: 12, t: 'سورة الزخرف', r: 'الشيخ محمد رفعت', s: 'الزخرف', d: '8:45', ds: 525, url: B + '/043.mp3' },
];
const SPDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const NB = 48;

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = Math.floor(s % 60);
  if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(sc).padStart(2, '0');
  return m + ':' + String(sc).padStart(2, '0');
}

function barColor(p, on) {
  if (!on) return 'rgba(0,200,150,.08)';
  if (p < .2) return `rgba(0,200,150,${.5 + Math.random() * .5})`;
  if (p < .4) return `rgba(0,212,255,${.4 + Math.random() * .5})`;
  if (p < .6) return `rgba(100,180,255,${.4 + Math.random() * .5})`;
  if (p < .8) return `rgba(167,139,250,${.4 + Math.random() * .5})`;
  return `rgba(200,160,255,${.3 + Math.random() * .5})`;
}

export default function QuranPlayer() {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const stateRef = useRef({
    i: 0, playing: false, cur: 0, dur: 0, vol: 75, muted: false,
    rep: 0, shuf: false, spd: 1, slp: null, slpL: 0, bmk: null, autoPlayed: false
  });
  const eBarsRef = useRef([]);
  const vizIntervalRef = useRef(null);
  const sleepIntervalRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const $ = (id) => root.querySelector('#' + id);
    const state = stateRef.current;

    // Audio Manager — exact copy from HTML
    const AM = {
      _: {}, _a: null,
      create(t, u, o = {}) {
        if (this._a && this._a !== t && this.on(this._a)) {
          if (o.a) this.stop(this._a); else return { c: 1 };
        }
        if (this._[t]) { this._[t].pause(); this._[t].currentTime = 0; }
        const a = new Audio(u); a.volume = o.v ?? 0.75; a.preload = 'metadata';
        this._[t] = a; this._a = t; return { a, c: 0 };
      },
      play(t) { const a = this._[t]; if (a) a.play().catch(() => {}); this._a = t; },
      pause(t) { const a = this._[t]; if (a) a.pause(); },
      stop(t) { const a = this._[t]; if (a) { a.pause(); a.currentTime = 0; a.src = ''; } delete this._[t]; if (this._a === t) this._a = null; },
      stopAll(t) { Object.keys(this._).forEach(k => { if (k !== t) this.stop(k); }); },
      on(t) { const a = this._[t]; return a && !a.paused; },
      get(t) { return this._[t] || null; },
      vol(t, v) { const a = this._[t]; if (a) a.volume = Math.min(1, Math.max(0, v)); },
      spd(t, s) { const a = this._[t]; if (a) a.playbackRate = s; }
    };

    // Init EQ bars
    const eqContainer = $('eqContainer');
    eBarsRef.current = [];
    eqContainer.innerHTML = '';
    for (let j = 0; j < NB; j++) {
      const b = document.createElement('div');
      b.className = 'eq-bar';
      b.style.height = '4px';
      b.style.background = barColor(j / NB, false);
      eqContainer.appendChild(b);
      eBarsRef.current.push(b);
    }

    // Init dropdowns
    let sh = '<div class="dd-t">سرعة التشغيل</div>';
    SPDS.forEach(s => { sh += `<button class="dd-i${s === 1 ? ' on' : ''}" data-s="${s}">${s}x${s === 1 ? ' (عادي)' : ''}</button>`; });
    $('ddSpd').innerHTML = sh;
    $('ddSpd').querySelectorAll('.dd-i').forEach(btn => {
      btn.onclick = () => setSpd(parseFloat(btn.dataset.s));
    });

    let tm = '<div class="dd-t">مؤقت النوم</div>';
    [0, 5, 15, 30, 45, 60].forEach(m => { tm += `<button class="dd-i${m === 0 ? ' on' : ''}" data-m="${m}">${m === 0 ? 'إيقاف' : m + ' دقيقة'}</button>`; });
    $('ddTmr').innerHTML = tm;
    $('ddTmr').querySelectorAll('.dd-i').forEach(btn => {
      btn.onclick = () => setTmr(parseInt(btn.dataset.m));
    });

    // Date
    $('hd').textContent = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (new Date().getDay() === 5) $('mType').textContent = 'سورة الكهف';

    // Seek
    $('progBar').onclick = e => {
      const r = e.currentTarget.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const a = AM.get('q');
      if (a && state.dur) { a.currentTime = p * state.dur; state.cur = p * state.dur; }
    };

    // Volume bar
    function setVolFromEvent(e) {
      const r = e.currentTarget.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      state.vol = Math.round(p * 100);
      state.muted = false;
      AM.vol('q', state.vol / 100);
      $('vFill').style.width = state.vol + '%';
      $('vTh').style.left = state.vol + '%';
      $('vN').textContent = state.vol;
    }

    function toggleMute() {
      state.muted = !state.muted;
      AM.vol('q', state.muted ? 0 : state.vol / 100);
      $('vFill').style.width = (state.muted ? 0 : state.vol) + '%';
      $('vTh').style.left = (state.muted ? 0 : state.vol) + '%';
      $('vN').textContent = state.muted ? 0 : state.vol;
    }

    // Play
    function playAt(idx) {
      const t = PL[idx]; if (!t) return;
      state.i = idx; state.cur = 0; state.dur = 0;
      const r = AM.create('q', t.url, { v: state.muted ? 0 : state.vol / 100, a: 1 });
      if (r.c) { $('conflict').classList.add('show'); return; }
      const a = r.a;
      a.ontimeupdate = () => {
        state.cur = a.currentTime; state.dur = a.duration || 0;
        const p = state.dur > 0 ? (state.cur / state.dur) * 100 : 0;
        $('progFill').style.width = p + '%';
        $('progThumb').style.left = p + '%';
        $('curT').textContent = fmt(state.cur);
        $('vizTime').textContent = fmt(state.cur);
        if (state.dur) $('durT').textContent = fmt(state.dur);
      };
      a.onloadedmetadata = () => { state.dur = a.duration; $('durT').textContent = fmt(state.dur); updateUI(); };
      a.onended = () => {
        state.playing = false; updatePP();
        let nx;
        if (state.rep === 2) nx = state.i;
        else if (state.shuf) nx = Math.floor(Math.random() * PL.length);
        else nx = (state.i + 1) % PL.length;
        if (state.rep === 0 && nx === 0 && state.i === PL.length - 1) return;
        setTimeout(() => playAt(nx), 600);
      };
      a.play().catch(() => {});
      state.playing = true;
      updateUI();
      updatePP();
    }

    function togglePlay() {
      const a = AM.get('q');
      if (a && !a.paused) {
        AM.pause('q'); state.playing = false;
      } else if (a) {
        AM.stopAll('q'); a.play().catch(() => {}); state.playing = true;
      } else {
        playAt(state.i);
      }
      updatePP();
    }

    function updatePP() {
      $('ppIcon').innerHTML = state.playing
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="5" height="18" rx="1"/><rect x="14" y="3" width="5" height="18" rx="1"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg>';
      $('sigText').textContent = state.playing ? 'PLAYING' : 'LIVE';
      $('sigText').style.color = state.playing ? 'var(--green)' : 'var(--text4)';
    }

    function goNext() { playAt(state.shuf ? Math.floor(Math.random() * PL.length) : (state.i + 1) % PL.length); }
    function goPrev() {
      const a = AM.get('q');
      if (a && a.currentTime > 3) { a.currentTime = 0; state.cur = 0; return; }
      playAt(state.i === 0 ? PL.length - 1 : state.i - 1);
    }

    function toggleShuffle() { state.shuf = !state.shuf; $('btnShuf').classList.toggle('on', state.shuf); }

    function cycleRepeat() {
      state.rep = (state.rep + 1) % 3;
      $('btnRep').classList.toggle('on', state.rep > 0);
      const el = $('tRepeat');
      if (state.rep === 0) { el.style.display = 'none'; }
      else if (state.rep === 1) { el.style.display = 'inline-block'; el.textContent = '🔁 تكرار الكل'; }
      else { el.style.display = 'inline-block'; el.textContent = '🔂 تكرار السورة'; }
      if (state.rep === 2) {
        $('btnRep').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/><text x="11.5" y="15" fill="currentColor" fontSize="8" fontWeight="800" textAnchor="middle" stroke="none">1</text></svg>';
      } else {
        $('btnRep').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>';
      }
    }

    function setSpd(s) {
      state.spd = s;
      $('ddSpd').querySelectorAll('.dd-i').forEach(b => b.classList.toggle('on', parseFloat(b.dataset.s) === s));
      $('spdLbl').textContent = s + 'x';
      AM.spd('q', s);
      $('tSpeed').style.display = s !== 1 ? 'inline-block' : 'none';
      $('tSpeed').textContent = s + 'x';
      $('ddSpd').classList.remove('show');
    }

    function setTmr(m) {
      $('ddTmr').querySelectorAll('.dd-i').forEach(b => b.classList.toggle('on', parseInt(b.dataset.m) === m));
      if (m === 0) {
        state.slp = null; state.slpL = 0;
        $('sleepBar').classList.remove('show');
        $('tSleep').style.display = 'none';
      } else {
        state.slp = m; state.slpL = m * 60;
        $('sleepBar').classList.add('show');
        $('tSleep').style.display = 'inline-block';
      }
      $('ddTmr').classList.remove('show');
    }

    function forcePlay() { $('conflict').classList.remove('show'); AM.stopAll('q'); playAt(state.i); }
    function saveBookmark() { state.bmk = { i: state.i, time: state.cur }; $('bmJump').style.display = 'inline-flex'; $('bmSave').classList.add('on'); }
    function jumpBookmark() {
      if (!state.bmk) return;
      if (state.bmk.i !== state.i) playAt(state.bmk.i);
      setTimeout(() => { const a = AM.get('q'); if (a) a.currentTime = state.bmk.time; }, 300);
    }

    function renderPL(q = '') {
      const list = PL.filter(t => !q || t.t.includes(q) || t.s.includes(q));
      $('plCnt').textContent = list.length + ' سورة';
      $('plList').innerHTML = list.map(t => {
        const ri = PL.indexOf(t), act = ri === state.i;
        return `<div class="pl-i${act ? ' on' : ''}" data-idx="${ri}">
          <div class="pl-n">${act && state.playing ? '<div class="eq-sm"><div class="eq-bar-sm"></div><div class="eq-bar-sm"></div><div class="eq-bar-sm"></div></div>' : '<span>' + (ri + 1) + '</span>'}</div>
          <div class="pl-t"><b>${t.t}</b><small>${t.r}</small></div>
          <span class="pl-d">${t.d}</span></div>`;
      }).join('');
      $('plList').querySelectorAll('.pl-i').forEach(el => {
        el.onclick = () => { playAt(parseInt(el.dataset.idx)); $('plPanel').classList.remove('show'); };
      });
    }

    function updateUI() {
      const t = PL[state.i];
      $('tName').textContent = t.t;
      $('tReciter').textContent = t.r;
      $('tSurah').textContent = t.s;
      $('tDur').textContent = t.d;
      $('durT').textContent = t.d;
      renderPL($('plQ') ? $('plQ').value : '');
    }

    // Bind events
    $('btnPlay').onclick = togglePlay;
    $('btnNext').onclick = goNext;
    $('btnPrev').onclick = goPrev;
    $('btnShuf').onclick = toggleShuffle;
    $('btnRep').onclick = cycleRepeat;
    $('btnMute').onclick = toggleMute;
    $('vBar').onclick = setVolFromEvent;
    $('btnFav').onclick = () => { state.fav = !state.fav; $('btnFav').classList.toggle('h-active', state.fav); };
    $('bmSave').onclick = saveBookmark;
    $('bmJump').onclick = jumpBookmark;
    $('forcePlayBtn').onclick = forcePlay;
    $('plToggle').onclick = () => $('plPanel').classList.toggle('show');
    if ($('plQ')) $('plQ').oninput = function () { renderPL(this.value); };

    // Offset buttons — load from localStorage
    const savedOffset = localStorage.getItem('iqamaOffset') || '15';
    const offsetBtns = $('offsetBtns').querySelectorAll('.offset-btn');
    function updateOffsetBtns() {
      const cur = localStorage.getItem('iqamaOffset') || '15';
      offsetBtns.forEach(b => b.classList.toggle('on', b.dataset.m === cur));
    }
    offsetBtns.forEach(b => {
      b.onclick = () => {
        localStorage.setItem('iqamaOffset', b.dataset.m);
        state.autoPlayed = false;
        AM.stop('q');
        state.playing = false;
        updatePP();
        updateOffsetBtns();
      };
    });
    updateOffsetBtns();

    // Speed/timer dropdown toggles
    $('btnSpd').onclick = (e) => { e.stopPropagation(); $('ddTmr').classList.remove('show'); $('ddSpd').classList.toggle('show'); };
    $('btnTmr').onclick = (e) => { e.stopPropagation(); $('ddSpd').classList.remove('show'); $('ddTmr').classList.toggle('show'); };

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dd') && !e.target.closest('.e-btn')) {
        $('ddSpd').classList.remove('show');
        $('ddTmr').classList.remove('show');
      }
    });

    // Main loop — countdown + sleep timer + visualizer
    vizIntervalRef.current = setInterval(() => {
      const eBars = eBarsRef.current;

      // Maghrib countdown — counts down to start of recitation (Maghrib - offset)
      try {
        const offsetMin = parseInt(localStorage.getItem('iqamaOffset') || '15');
        const times = getPrayerTimesSync();
        if (times && times.Maghrib) {
          const maghrib = parseTime(times.Maghrib);
          if (maghrib) {
            const now = new Date();
            const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const maghribSec = maghrib.totalMinutes * 60;
            let rem = maghribSec - nowSec;
            if (rem < 0) rem += 86400;

            // Countdown to recitation start (Maghrib - offset)
            let recRem = rem - (offsetMin * 60);
            if (recRem < 0) recRem = 0;

            const h = Math.floor(recRem / 3600);
            const m = Math.floor((recRem % 3600) / 60);
            const s = recRem % 60;
            $('cdH').textContent = String(h).padStart(2, '0');
            $('cdM').textContent = String(m).padStart(2, '0');
            $('cdS').textContent = String(s).padStart(2, '0');

            // Auto-play when recRem reaches 0 (once)
            if (recRem <= 0 && rem > 60 && !state.autoPlayed && !isAzanPlaying()) {
              state.autoPlayed = true;
              playAt(Math.floor(Math.random() * PL.length));
            }
            // Stop Quran 60 seconds before Maghrib (adhan time)
            if (rem <= 60 && state.playing) {
              AM.stop('q');
              state.playing = false;
              state.autoPlayed = true;
              updatePP();
            }
            // Reset auto-play flag when offset changes or new day
            if (rem > offsetMin * 60 + 120) {
              state.autoPlayed = false;
            }
          }
        }
      } catch {}

      // Sleep timer
      if (state.slp && state.slpL > 0) {
        state.slpL--;
        const sm = Math.floor(state.slpL / 60), ss = state.slpL % 60;
        $('sleepT').textContent = sm + ':' + String(ss).padStart(2, '0');
        if (state.slpL <= 0) {
          AM.pause('q'); state.playing = false; state.slp = null;
          $('sleepBar').classList.remove('show');
          $('tSleep').style.display = 'none';
          updatePP();
        }
      }

      // Visualizer
      eBars.forEach((bar, j) => {
        const p = j / NB;
        if (state.playing) {
          const c = NB / 2, d = Math.abs(j - c) / c, e = (1 - d * .4) * (.2 + Math.random() * .8);
          bar.style.height = Math.max(4, e * 110) + 'px';
          bar.style.background = barColor(p, true);
          bar.style.opacity = .6 + e * .4;
        } else {
          bar.style.height = (3 + Math.sin(j * .3 + Date.now() * .001) * 2) + 'px';
          bar.style.background = barColor(p, false);
          bar.style.opacity = '.12';
        }
      });
      $('vizGlow').style.opacity = state.playing ? '1' : '0.3';
    }, 80);

    // Initial render
    updateUI();
    updatePP();
    renderPL();

    return () => {
      clearInterval(vizIntervalRef.current);
      AM.stop('q');
    };
  }, []);

  return (
    <div ref={containerRef}>
      <style>{`
        @keyframes qpBreathe{0%,100%{box-shadow:0 0 0 0 rgba(0,200,150,.2)}50%{box-shadow:0 0 0 14px rgba(0,200,150,0)}}
        @keyframes qpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
        @keyframes qpDotBlink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes qpSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes qpFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes qpEqBar{0%,100%{height:4px}50%{height:var(--h,18px)}}
        .qpc-card{background:linear-gradient(135deg,#0f0520,#1a0a38,#0a1520);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:16px;margin-bottom:14px}
        .qpc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
        .qpc-title{font-size:13px;font-weight:700;color:#00C896;display:flex;align-items:center;gap:6px}
        .qpc-hd-sub{font-size:9px;color:#3d3658}
        .dd{position:absolute;bottom:110%;left:50%;transform:translateX(-50%);background:rgba(14,11,30,.97);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:6px;min-width:140px;z-index:100;box-shadow:0 10px 30px rgba(0,0,0,.5);display:none}
        .dd.show{display:block}
        .dd-t{font-size:9px;font-weight:700;color:#6b6284;padding:4px;text-align:center;border-bottom:1px solid rgba(255,255,255,.04);margin-bottom:2px}
        .dd-i{display:block;width:100%;padding:6px;border-radius:6px;border:none;background:transparent;color:#c0b8d8;font-size:11px;font-weight:600;cursor:pointer;text-align:center;font-family:'Cairo',sans-serif;transition:all .15s}
        .dd-i:hover{background:rgba(255,255,255,.04)}
        .dd-i.on{background:rgba(0,200,150,.08);color:#00c896}
        .viz-section{position:relative;height:140px;margin-bottom:14px;border-radius:14px;overflow:hidden;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,200,150,.015),rgba(0,0,0,.2));border:1px solid rgba(255,255,255,.025)}
        .viz-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 80%,rgba(0,200,150,.05),transparent 60%),radial-gradient(ellipse at 30% 50%,rgba(167,139,250,.02),transparent 50%);transition:opacity .5s}
        .viz-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:20px 20px}
        .eq-container{position:absolute;bottom:0;left:0;right:0;height:110px;display:flex;align-items:flex-end;justify-content:center;gap:2px;padding:0 14px}
        .eq-bar{flex:1;max-width:7px;border-radius:2px 2px 0 0;transform-origin:bottom;transition:height .12s ease}
        .viz-signal{position:absolute;top:10px;left:14px;display:flex;align-items:center;gap:5px}
        .signal-dot{width:5px;height:5px;border-radius:50%;background:#00c896;box-shadow:0 0 6px rgba(0,200,150,.4);animation:qpPulse 2s ease infinite}
        .signal-text{font-size:7px;font-weight:700;color:#00c896;letter-spacing:1px}
        .viz-time-display{position:absolute;top:8px;right:14px;font-size:18px;font-weight:900;color:rgba(255,255,255,.06);font-variant-numeric:tabular-nums;direction:ltr;letter-spacing:2px}
        .maghrib-section{text-align:center;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,215,0,.06);animation:qpSlideDown .6s ease .2s forwards;opacity:0}
        .maghrib-label{font-size:12px;font-weight:600;color:rgba(255,255,255,.35);margin-bottom:6px;display:flex;align-items:center;justify-content:center;gap:6px}
        .maghrib-label .dot{width:6px;height:6px;border-radius:50%;background:#ffd700;animation:qpDotBlink 1.5s ease infinite}
        .maghrib-label span{color:#ffd700;font-weight:800}
        .maghrib-cd{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:6px;direction:ltr}
        .cd-num{font-size:42px;font-weight:900;color:#ffd700;line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 2px 20px rgba(255,215,0,.15);direction:ltr}
        .cd-sep{font-size:28px;font-weight:800;color:rgba(255,215,0,.2);line-height:1;direction:ltr}
        .cd-sub{font-size:9px;font-weight:600;color:rgba(255,255,255,.2);letter-spacing:.5px}
        .maghrib-type{display:inline-block;font-size:8px;font-weight:700;padding:2px 8px;border-radius:6px;background:rgba(255,215,0,.05);color:rgba(255,215,0,.45);margin-top:4px}
        .track{text-align:center;margin-bottom:10px}
        .track-name{font-size:18px;font-weight:900;margin-bottom:2px}
        .track-reciter{font-size:12px;font-weight:600;color:#00c896;margin-bottom:6px}
        .tags{display:flex;justify-content:center;gap:5px;flex-wrap:wrap}
        .tag{padding:2px 9px;border-radius:8px;font-size:9px;font-weight:700}
        .tag-g{background:rgba(0,200,150,.08);color:#00c896;border:1px solid rgba(0,200,150,.08)}
        .tag-d{background:rgba(255,255,255,.03);color:#6b6284}
        .tag-gold{background:rgba(255,215,0,.08);color:#ffd700;border:1px solid rgba(255,215,0,.08)}
        .tag-p{background:rgba(167,139,250,.08);color:#a78bfa;border:1px solid rgba(167,139,250,.08)}
        .tag-r{background:rgba(255,71,87,.08);color:#ff6b8a;border:1px solid rgba(255,71,87,.08)}
        .bm-row{display:flex;justify-content:center;gap:5px;margin-bottom:10px}
        .bm{padding:4px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.035);color:#6b6284;font-size:9px;font-weight:600;cursor:pointer;font-family:'Cairo',sans-serif;display:flex;align-items:center;gap:4px;transition:all .2s}
        .bm:hover{background:rgba(255,255,255,.05);color:#c0b8d8}
        .bm.on{background:rgba(0,200,150,.08);color:#00c896;border-color:rgba(0,200,150,.1)}
        .bm svg{width:10px;height:10px}
        .prog-sec{padding:0 2px;margin-bottom:8px}
        .prog-bar{position:relative;height:24px;cursor:pointer;display:flex;align-items:center}
        .prog-bg{position:absolute;left:0;right:0;height:5px;border-radius:3px;background:rgba(255,255,255,.04);overflow:hidden}
        .prog-fill{position:absolute;left:0;height:100%;border-radius:3px;background:linear-gradient(90deg,#00c896,#00d4ff,#a78bfa);transition:width .3s linear}
        .prog-thumb{position:absolute;top:50%;width:14px;height:14px;border-radius:50%;background:#00c896;transform:translate(-50%,-50%);box-shadow:0 0 10px rgba(0,200,150,.4);transition:left .3s linear;z-index:3}
        .prog-thumb::after{content:'';position:absolute;inset:3px;border-radius:50%;background:#060410}
        .times{display:flex;justify-content:space-between;margin-top:1px}
        .times span{font-size:10px;font-weight:600;color:#6b6284;font-variant-numeric:tabular-nums;direction:ltr}
        .ctrls{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:12px}
        .c-btn{width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,.04);color:#c0b8d8;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:9px;transition:all .2s}
        .c-btn:hover{background:rgba(255,255,255,.08)}
        .c-btn.on{color:#00c896;background:rgba(0,200,150,.06)}
        .c-btn svg{width:17px;height:17px}
        .pp{width:60px;height:60px;border-radius:50%;border:2px solid rgba(0,200,150,.2);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:all .3s;animation:qpBreathe 3s ease infinite}
        .pp:hover{border-color:rgba(0,200,150,.4);transform:scale(1.05)}
        .pp-in{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#00c896,#00a87d);display:flex;align-items:center;justify-content:center;color:#fff;padding:13px;box-shadow:0 4px 20px rgba(0,200,150,.3)}
        .pp-in svg{width:20px;height:20px}
        .extra{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:10px}
        .e-btn{display:flex;flex-direction:column;align-items:center;gap:1px;border:none;background:transparent;color:#6b6284;cursor:pointer;padding:0;position:relative;transition:color .2s}
        .e-btn:hover{color:#c0b8d8}
        .e-btn svg{width:17px;height:17px}
        .e-lbl{font-size:7px;font-weight:700;color:#3d3658}
        .e-btn.h-active svg{fill:#ff4757;stroke:#ff4757}
        .vol-row{display:flex;align-items:center;gap:6px;padding:0 2px}
        .v-btn{width:28px;height:28px;border-radius:6px;border:none;background:transparent;color:#6b6284;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:5px}
        .v-btn svg{width:15px;height:15px}
        .v-bar{flex:1;position:relative;height:18px;cursor:pointer;display:flex;align-items:center}
        .v-track{position:absolute;left:0;right:0;height:3px;border-radius:2px;background:rgba(255,255,255,.04)}
        .v-fill{position:absolute;left:0;height:3px;border-radius:2px;background:linear-gradient(90deg,#00c896,#00d4ff);transition:width .15s}
        .v-th{position:absolute;top:50%;width:10px;height:10px;border-radius:50%;background:#00c896;transform:translate(-50%,-50%);box-shadow:0 0 6px rgba(0,200,150,.3)}
        .v-n{font-size:10px;font-weight:700;color:#6b6284;width:22px;text-align:center;font-variant-numeric:tabular-nums;direction:ltr}
        .conflict{margin-bottom:10px;padding:8px 12px;border-radius:10px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.08);display:none;align-items:center;gap:6px;font-size:10px;color:#ffd700;font-weight:600}
        .conflict.show{display:flex}
        .conflict-btn{margin-right:auto;padding:4px 10px;border-radius:6px;border:none;background:rgba(255,215,0,.12);color:#ffd700;font-size:9px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif}
        .sleep-bar{display:none;align-items:center;justify-content:center;margin-bottom:6px}
        .sleep-bar.show{display:flex}
        .sleep-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:8px;background:rgba(255,71,87,.08);color:#ff6b8a;font-size:9px;font-weight:700;border:1px solid rgba(255,71,87,.08)}
        .sleep-chip svg{width:11px;height:11px}
        .pl{margin:8px 0;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);display:none;animation:qpFadeUp .3s ease forwards}
        .pl.show{display:block}
        .pl-head{padding:12px 16px 8px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.06)}
        .pl-title{font-size:13px;font-weight:800}
        .pl-cnt{font-size:10px;color:#6b6284;font-weight:600}
        .pl-search{padding:8px 16px;border-bottom:1px solid rgba(255,255,255,.06)}
        .pl-search input{width:100%;padding:7px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:#f0ece4;font-size:12px;font-family:'Cairo',sans-serif;outline:none}
        .pl-search input::placeholder{color:#3d3658}
        .pl-search input:focus{border-color:rgba(0,200,150,.3)}
        .pl-list{max-height:220px;overflow-y:auto;padding:6px 10px}
        .pl-i{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:10px;cursor:pointer;transition:all .2s;margin-bottom:2px;border:1px solid transparent}
        .pl-i:hover{background:rgba(255,255,255,.03)}
        .pl-i.on{background:rgba(0,200,150,.04);border-color:rgba(0,200,150,.06)}
        .pl-n{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .pl-n span{font-size:10px;font-weight:700;color:#3d3658}
        .pl-i.on .pl-n span{color:#00c896}
        .pl-t{flex:1;min-width:0}
        .pl-t b{display:block;font-size:11px;font-weight:700;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#f0ece4}
        .pl-i.on .pl-t b{color:#00c896}
        .pl-t small{font-size:9px;color:#6b6284}
        .pl-d{font-size:9px;color:#6b6284;font-weight:600;direction:ltr;flex-shrink:0}
        .eq-sm{display:flex;align-items:flex-end;gap:2px;height:12px}
        .eq-bar-sm{width:2px;border-radius:1px;background:#00c896;animation:qpEqBar .6s ease infinite alternate}
        .eq-bar-sm:nth-child(1){--h:8px;animation-delay:0s}
        .eq-bar-sm:nth-child(2){--h:12px;animation-delay:.15s}
        .eq-bar-sm:nth-child(3){--h:6px;animation-delay:.3s}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:3px}
        .offset-btns{display:flex;justify-content:center;gap:5px;margin-top:8px;flex-wrap:wrap}
        .offset-btn{padding:4px 12px;border-radius:8px;border:1px solid rgba(255,215,0,.1);background:rgba(255,215,0,.04);color:rgba(255,215,0,.4);font-size:10px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif;transition:all .2s}
        .offset-btn:hover{background:rgba(255,215,0,.08);color:rgba(255,215,0,.7)}
        .offset-btn.on{background:rgba(255,215,0,.12);color:#ffd700;border-color:rgba(255,215,0,.25)}
      `}</style>

      <div className="qpc-card">
        <div className="qpc-head">
          <div>
            <div className="qpc-title">🎵 المشغل القرآني</div>
            <div className="qpc-hd-sub" id="hd">--</div>
          </div>
          <button id="plToggle" style={{width:32,height:32,borderRadius:9,border:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.035)',color:'#6b6284',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:15,height:15}}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
          </button>
        </div>

        <div className="conflict" id="conflict">
          ⚠️ <span>صوت آخر يعمل — سيتم إيقافه</span>
          <button className="conflict-btn" id="forcePlayBtn">تشغيل</button>
        </div>

        <div style={{margin:'8px 0',borderRadius:22,position:'relative',overflow:'hidden',background:'linear-gradient(180deg,rgba(14,11,30,.9),rgba(6,4,16,.95))',border:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{position:'relative',zIndex:2,padding:'18px 18px 14px'}}>

            <div className="maghrib-section">
              <div className="maghrib-label">
                <div className="dot"></div>
                تلاوة قبل <span>المغرب</span>
              </div>
              <div className="maghrib-cd">
                <span className="cd-num" id="cdH">00</span>
                <span className="cd-sep">:</span>
                <span className="cd-num" id="cdM">00</span>
                <span className="cd-sep">:</span>
                <span className="cd-num" id="cdS">00</span>
              </div>
              <div className="cd-sub">متبقي لبداية التلاوة</div>
              <div className="offset-btns" id="offsetBtns">
                {[15,30,45,60,120].map(m => <button key={m} className="offset-btn" data-m={m}>{m} د</button>)}
              </div>
              <span className="maghrib-type" id="mType">سورة عشوائية</span>
            </div>

            <div className="viz-section">
              <div className="viz-glow" id="vizGlow"></div>
              <div className="viz-grid"></div>
              <div className="viz-signal">
                <div className="signal-dot"></div>
                <span className="signal-text" id="sigText">LIVE</span>
              </div>
              <div className="viz-time-display" id="vizTime">0:00</div>
              <div className="eq-container" id="eqContainer"></div>
            </div>

            <div className="track">
              <div className="track-name" id="tName">--</div>
              <div className="track-reciter" id="tReciter">--</div>
              <div className="tags">
                <span className="tag tag-g" id="tSurah">--</span>
                <span className="tag tag-d" id="tDur">--</span>
                <span className="tag tag-gold" id="tSpeed" style={{display:'none'}}>1x</span>
                <span className="tag tag-p" id="tRepeat" style={{display:'none'}}>تكرار</span>
                <span className="tag tag-r" id="tSleep" style={{display:'none'}}>نوم</span>
              </div>
            </div>

            <div className="bm-row">
              <button className="bm" id="bmSave">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                علامة
              </button>
              <button className="bm" id="bmJump" style={{display:'none'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 3 21 3 21 9"/><path d="M4 20L21 3"/></svg>
                القفز
              </button>
            </div>

            <div className="prog-sec">
              <div className="prog-bar" id="progBar">
                <div className="prog-bg"><div className="prog-fill" id="progFill" style={{width:'0%'}}></div></div>
                <div className="prog-thumb" id="progThumb" style={{left:'0%'}}></div>
              </div>
              <div className="times">
                <span id="curT">0:00</span>
                <span id="durT">0:00</span>
              </div>
            </div>

            <div className="ctrls">
              <button className="c-btn" id="btnShuf">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
              </button>
              <button className="c-btn" id="btnPrev">
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2.5" height="16" rx="0.5"/></svg>
              </button>
              <button className="pp" id="btnPlay">
                <div className="pp-in" id="ppIcon">
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg>
                </div>
              </button>
              <button className="c-btn" id="btnNext">
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,4 15,12 5,20"/><rect x="16.5" y="4" width="2.5" height="16" rx="0.5"/></svg>
              </button>
              <button className="c-btn" id="btnRep">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
              </button>
            </div>

            <div className="extra">
              <button className="e-btn" id="btnFav">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </button>
              <div style={{position:'relative'}}>
                <button className="e-btn" id="btnSpd">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"/></svg>
                  <span className="e-lbl" id="spdLbl">1x</span>
                </button>
                <div className="dd" id="ddSpd"></div>
              </div>
              <div style={{position:'relative'}}>
                <button className="e-btn" id="btnTmr">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="e-lbl">نوم</span>
                </button>
                <div className="dd" id="ddTmr"></div>
              </div>
            </div>

            <div className="sleep-bar" id="sleepBar">
              <span className="sleep-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span id="sleepT">--:--</span> متبقي
              </span>
            </div>

            <div className="vol-row">
              <button className="v-btn" id="btnMute">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19" fill="currentColor" opacity=".3"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></svg>
              </button>
              <div className="v-bar" id="vBar">
                <div className="v-track"></div>
                <div className="v-fill" id="vFill" style={{width:'75%'}}></div>
                <div className="v-th" id="vTh" style={{left:'75%'}}></div>
              </div>
              <span className="v-n" id="vN">75</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pl" id="plPanel">
        <div className="pl-head">
          <span className="pl-title">قائمة التشغيل</span>
          <span className="pl-cnt" id="plCnt">--</span>
        </div>
        <div className="pl-search"><input id="plQ" placeholder="ابحث عن سورة..." /></div>
        <div className="pl-list" id="plList"></div>
      </div>
    </div>
  );
}
