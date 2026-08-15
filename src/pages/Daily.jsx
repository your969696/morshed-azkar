import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';
import { dailyHadiths } from '../data/daily-hadiths';
import { dailyWisdoms } from '../data/daily-wisdoms';
import { speakArabic, stopSpeaking } from '../utils/sound';

export default function Daily() {
  const { t } = useTranslation();
  const [todayIndex, setTodayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('hadith');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wisdomCompleted, setWisdomCompleted] = useState(false);

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    setTodayIndex(dayOfYear);
    
    const saved = localStorage.getItem('wisdomCompleted_' + today.toDateString());
    if (saved) setWisdomCompleted(true);
  }, []);

  const todayHadith = dailyHadiths[todayIndex % dailyHadiths.length];
  const todayWisdom = dailyWisdoms[todayIndex % dailyWisdoms.length];

  const handleSpeak = (text) => {
    if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); return; }
    setIsSpeaking(true);
    speakArabic(text);
    setTimeout(() => setIsSpeaking(false), 8000);
  };

  const handleWisdomComplete = () => {
    setWisdomCompleted(true);
    localStorage.setItem('wisdomCompleted_' + new Date().toDateString(), 'true');
  };

  return (
    <div className="page-wrap pb-24">
      <div className="relative overflow-hidden" style={{ minHeight: '160px' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1c1040 0%, #2d1b69 40%, #0f0a1a 100%)' }}>
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="dailyGlow" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#00c896" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#00c896" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <circle cx="200" cy="100" r="150" fill="url(#dailyGlow)"/>
            </svg>
          </div>
        </div>
        <div className="relative z-10 px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#00c896]/15 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <line x1="8" y1="7" x2="16" y2="7"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t.daily.title}</h1>
              <p className="text-white/50 text-xs mt-0.5">{t.daily.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-20">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('hadith')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === 'hadith'
                ? 'bg-[#00c896] text-white shadow-[0_2px_12px_rgba(0,200,150,0.3)]'
                : 'bg-bg-card text-text-secondary border border-border hover:border-[#00c896]/30'
            }`}
          >
            📖 {t.daily.hadithTab}
          </button>
          <button
            onClick={() => setActiveTab('wisdom')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === 'wisdom'
                ? 'bg-[#f0b040] text-white shadow-[0_2px_12px_rgba(240,176,64,0.3)]'
                : 'bg-bg-card text-text-secondary border border-border hover:border-[#f0b040]/30'
            }`}
          >
            💡 {t.daily.wisdomTab}
          </button>
        </div>

      {activeTab === 'hadith' && todayHadith && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-bg-card rounded-2xl p-5 border border-border mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{todayHadith.emoji}</span>
              <h3 className="text-accent-gold font-bold text-lg">{todayHadith.category}</h3>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                todayHadith.grade === 'صحيح' 
                  ? 'bg-accent-green/20 text-accent-green' 
                  : todayHadith.grade === 'حسن'
                  ? 'bg-accent-gold/20 text-accent-gold'
                  : 'bg-red-400/20 text-red-400'
              }`}>
                {todayHadith.grade}
              </span>
              <span className="text-text-muted text-xs">{todayHadith.source}</span>
            </div>

            <p className="azkar-text mb-4 text-right leading-loose">{todayHadith.text}</p>
            
            <div className="bg-bg-primary rounded-xl p-4 mb-4">
              <p className="text-text-muted text-sm mb-2 font-bold">{t.daily.chain}</p>
              <p className="text-text-secondary text-sm italic leading-relaxed text-right">
                {todayHadith.isnad}
              </p>
            </div>

            <div className="bg-bg-primary rounded-xl p-4 mb-4">
              <p className="text-text-muted text-sm mb-2 font-bold">{t.daily.fullHadith}</p>
              <p className="text-text-primary text-sm leading-relaxed text-right">
                {todayHadith.hadithFull}
              </p>
            </div>

            <div className="bg-accent-green/10 rounded-xl p-4 border border-accent-green/20">
              <p className="text-accent-green text-sm font-bold mb-1">💡 {t.daily.explanation}</p>
              <p className="text-text-secondary text-sm leading-relaxed text-right">
                {todayHadith.explanation}
              </p>
            </div>

            <p className="text-text-muted text-xs mt-3 text-center">{todayHadith.reference}</p>

            <button
              onClick={() => handleSpeak(todayHadith.hadithFull)}
              className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isSpeaking
                  ? 'bg-accent-green text-white'
                  : 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
              }`}
            >
              <span>{isSpeaking ? '⏹️' : '🔊'}</span>
              <span>{isSpeaking ? t.daily.stop : t.daily.listenHadith}</span>
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'wisdom' && todayWisdom && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-bg-card rounded-2xl p-5 border border-border mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{todayWisdom.emoji}</span>
              <h3 className="text-accent-gold font-bold text-lg">{todayWisdom.title}</h3>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                todayWisdom.category === 'فعل الخير'
                  ? 'bg-accent-green/20 text-accent-green'
                  : 'bg-red-400/20 text-red-400'
              }`}>
                {todayWisdom.category === 'فعل الخير' ? `👍 ${t.daily.doGood}` : `🚫 ${t.daily.avoidEvil}`}
              </span>
            </div>

            <p className="azkar-text mb-4 text-right leading-loose">{todayWisdom.text}</p>

            <div className="bg-bg-primary rounded-xl p-4 mb-4">
              <p className="text-text-muted text-sm mb-1">{todayWisdom.source}</p>
            </div>

            <div className="bg-accent-gold/10 rounded-xl p-4 border border-accent-gold/20">
              <p className="text-accent-gold text-sm font-bold mb-2">💡 {t.daily.todayAction}</p>
              <p className="text-text-primary text-sm leading-relaxed text-right font-medium">
                {todayWisdom.tip}
              </p>
            </div>

            {!wisdomCompleted ? (
              <button
                onClick={handleWisdomComplete}
                className="mt-4 w-full bg-accent-green text-white px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-accent-green-dark"
              >
                ✅ {t.daily.done}
              </button>
            ) : (
              <div className="mt-4 w-full bg-accent-green/20 text-accent-green px-4 py-3 rounded-xl text-sm font-bold text-center">
                ✅ {t.daily.completeMsg}
              </div>
            )}
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}
