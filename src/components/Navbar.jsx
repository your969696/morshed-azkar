import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';

function Icon({ name, size = 24, color = 'currentColor' }) {
  const s = { width: size, height: size };
  const icons = {
    home: <svg {...s} viewBox="0 0 24 24" fill={color}><path d="M12 3L4 9v12h5v-7h6v7h5V9z" /></svg>,
    morning: <svg {...s} viewBox="0 0 24 24" fill={color}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" /></svg>,
    evening: <svg {...s} viewBox="0 0 24 24" fill={color}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    quran: <svg {...s} viewBox="0 0 24 24" fill={color}><path d="M6 2v20l6-4 6 4V2z" /><path d="M12 2v16" stroke={color} strokeWidth="1.5" fill="none" /></svg>,
    tasbih: <svg {...s} viewBox="0 0 24 24" fill={color}><circle cx="12" cy="4" r="3" /><circle cx="12" cy="12" r="3" /><circle cx="12" cy="20" r="3" /><circle cx="6" cy="8" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="6" cy="16" r="2.5" /><circle cx="18" cy="16" r="2.5" /></svg>,
    qibla: <svg {...s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" /><polygon points="12,5 9,15 12,13 15,15" fill={color} /></svg>,
    quiz: <svg {...s} viewBox="0 0 24 24" fill={color}><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3.5 6V17a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2c2-1.5 3.5-3.5 3.5-6a7 7 0 0 0-7-7z" /><rect x="9" y="19" width="6" height="3" rx="1" /></svg>,
    hajj: <svg {...s} viewBox="0 0 24 24" fill={color}><rect x="4" y="8" width="16" height="13" rx="2" /><path d="M12 8V4m-3 4h6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" /><rect x="4" y="13" width="16" height="1.5" /></svg>,
    sahaba: <svg {...s} viewBox="0 0 24 24" fill={color}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    mosque: <svg {...s} viewBox="0 0 24 24" fill={color}><path d="M12 2L2 7v2h20V7L12 2zM4 11v7h3v-7H4zm5 0v7h3v-7H9zm5 0v7h3v-7h-3zm5 0v7h2v-7h-2zM2 20v2h20v-2H2z"/></svg>,
    duas: <svg {...s} viewBox="0 0 24 24" fill={color}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
    calendar: <svg {...s} viewBox="0 0 24 24" fill={color}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.5" fill="none"/><circle cx="12" cy="16" r="2" fill={color}/></svg>,
    days: <svg {...s} viewBox="0 0 24 24" fill={color}><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3.5 6V17a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2c2-1.5 3.5-3.5 3.5-6a7 7 0 0 0-7-7z"/><path d="M9 22h6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/></svg>,
    radio: <svg {...s} viewBox="0 0 24 24" fill={color}><rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="12" cy="13" r="2.5"/><path d="M7 6V4.5A1.5 1.5 0 018.5 3h7A1.5 1.5 0 0117 4.5V6" stroke={color} strokeWidth="1.5" fill="none"/></svg>,
    puzzle: <svg {...s} viewBox="0 0 24 24" fill={color}><path d="M20.5 11H17V7a2 2 0 00-2-2h-1V3.5a1.5 1.5 0 00-3 0V5h-1V3.5a1.5 1.5 0 00-3 0V5H7a2 2 0 00-2 2v4H3.5a1.5 1.5 0 000 3H5v4a2 2 0 002 2h4v1.5a1.5 1.5 0 003 0V19h4a2 2 0 002-2v-4h1.5a1.5 1.5 0 000-3z"/></svg>,
  };
  return icons[name] || null;
}

const navItems = [
  { path: '/', key: 'home', accent: '#00c896', icon: 'home' },
  { path: '/morning', key: 'morning', accent: '#f0b040', icon: 'morning' },
  { path: '/evening', key: 'evening', accent: '#8b5cf6', icon: 'evening' },
  { path: '/quran', key: 'quran', accent: '#00c896', icon: 'quran' },
  { path: '/tasbih', key: 'tasbih', accent: '#ec4899', icon: 'tasbih' },
  { path: '/qibla', key: 'qibla', accent: '#3b82f6', icon: 'qibla' },
  { path: '/quiz', key: 'quiz', accent: '#8b5cf6', icon: 'quiz' },
  { path: '/sahaba', key: 'sahaba', accent: '#10b981', icon: 'sahaba' },
  { path: '/mosques', key: 'mosqueFinder', accent: '#00c896', icon: 'mosque' },
  { path: '/date-converter', key: 'dateConverter', accent: '#8b5cf6', icon: 'calendar' },
  { path: '/islamic-days', key: 'islamicDays', accent: '#ec4899', icon: 'days' },
  { path: '/radio', key: 'radio', accent: '#8b5cf6', icon: 'radio' },
  { path: '/puzzle', key: 'puzzle', accent: '#f0b040', icon: 'puzzle' },
];

const navCss = `
.n-bar{width:100%;background:var(--bg-card);border-top:1px solid var(--border-color);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);padding:6px 8px 10px;z-index:100;transition:background .3s,border-color .3s;flex-shrink:0}
.n-items{display:flex;justify-content:space-around;align-items:stretch}
.n-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:8px 4px 6px;border-radius:16px;cursor:pointer;min-width:0;flex:1;transition:all .2s;text-decoration:none;position:relative}
.n-item.on{background:rgba(0,200,150,.1)}
.n-icon-wrap{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;transition:all .2s}
.n-item.on .n-icon-wrap{background:rgba(0,200,150,.15)}
.n-label{font-size:10px;font-weight:700;letter-spacing:.2px;transition:color .2s;line-height:1}
.n-dot{width:4px;height:4px;border-radius:50%;margin-top:2px}
.n-item:not(.on) .n-label{color:var(--text-muted)}
.n-item:not(.on) svg{opacity:.4}
`;

export default function Navbar() {
  const { t } = useTranslation();
  const navLabels = t.nav;

  return (
    <>
      <style>{navCss}</style>
      <nav className="n-bar">
        <div className="n-items">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}>
              {({ isActive }) => (
                <motion.div
                  className={`n-item${isActive ? ' on' : ''}`}
                  whileTap={{ scale: 0.85 }}
                >
                  <div className="n-icon-wrap">
                    <Icon name={item.icon} size={26} color={isActive ? item.accent : 'var(--text-muted)'} />
                  </div>
                  <span className="n-label" style={{ color: isActive ? item.accent : 'var(--text-muted)' }}>{navLabels[item.key]}</span>
                  {isActive && (
                    <motion.div layoutId="navDot" className="n-dot" style={{ background: item.accent, boxShadow: `0 0 10px ${item.accent}60` }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
