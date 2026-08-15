import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakArabic, stopSpeaking } from '../utils/sound';
import { useTranslation } from '../i18n.jsx';

export default function PrayerCard({ step, index, total: _total, soundEnabled }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = (_text) => {
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    setSpeaking(true);
    const hadithText = Array.isArray(step.hadith) ? step.hadith.join('. ') : (step.hadith || '');
    speakArabic(step.title + '. ' + (step.detail || '') + '. ' + hadithText + '. ' + (step.source || ''));
    setTimeout(() => setSpeaking(false), 5000);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="mb-3">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-right">
        <div className="bg-bg-card rounded-xl p-4 border border-border hover:border-border-light transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold text-sm font-bold shrink-0">{index + 1}</span>
              <div className="text-right">
                <h4 className="text-text-primary font-bold text-base">{step.title}</h4>
                {step.description && <p className="text-text-muted text-xs mt-0.5">{step.description}</p>}
              </div>
            </div>
            <span className="text-text-muted text-lg">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="bg-bg-primary rounded-xl p-4 border border-border-light mr-8 mt-2">
              {step.detail && (
                <p className="text-text-secondary text-sm text-right mb-4 leading-relaxed">{step.detail}</p>
              )}

              {step.hadith && (
                <div className="bg-accent-gold/5 rounded-xl p-3 border border-accent-gold/20 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📖</span>
                    <span className="text-accent-gold text-xs font-bold">{t.prayerCard.hadith}</span>
                  </div>
                  {Array.isArray(step.hadith) ? (
                    <div className="space-y-3">
                      {step.hadith.map((h, i) => (
                        <p key={i} className="text-text-primary text-sm text-right leading-relaxed" style={{ fontFamily: 'var(--font-naskh)' }}>{h}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-primary text-sm text-right leading-relaxed mb-2" style={{ fontFamily: 'var(--font-naskh)' }}>{step.hadith}</p>
                  )}
                  {step.source && (
                    <p className="text-accent-gold text-[11px] text-left font-bold mt-2">📋 {step.source}</p>
                  )}
                  {step.ref && (
                    <p className="text-accent-gold/70 text-[10px] text-left mt-1">{step.ref}</p>
                  )}
                </div>
              )}

              {soundEnabled !== false && (
                <button onClick={(e) => { e.stopPropagation(); handleSpeak(); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${speaking ? 'bg-accent-green text-white' : 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'}`}>
                  <span>🔊</span>
                  <span>{speaking ? t.prayerCard.listening : t.prayerCard.listen}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
