import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { masnoonDuas, masnoonCategories } from '../data/masnoon-duas';
import { useTranslation } from '../i18n.jsx';
import { speakArabic } from '../utils/sound';

export default function MasnoonDuas() {
  const { t, lang } = useTranslation();
  const [selectedCat, setSelectedCat] = useState('all');
  const [expandedDua, setExpandedDua] = useState(null);

  const h = t.masnoonDuas || {};

  const filtered = useMemo(() => {
    if (selectedCat === 'all') return masnoonDuas;
    return masnoonDuas.filter(d => d.category === selectedCat);
  }, [selectedCat]);

  const speakDua = (text) => {
    speakArabic(text);
  };

  const copyText = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const allCats = [{ id: 'all', icon: '📋', label: h.all || 'الكل', labelEn: 'All' }, ...masnoonCategories];

  return (
    <div className="page-wrap pb-24 px-4 pt-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🤲</span>
          <h1 className="text-2xl font-bold text-text-primary">{h.title || 'أدعية مسنونة'}</h1>
        </div>
        <p className="text-text-secondary text-sm">{h.subtitle || `${masnoonDuas.length} دعاء مسنون من السنة النبوية`}</p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {allCats.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCat === cat.id
                ? 'bg-accent-green text-white'
                : 'bg-bg-card text-text-secondary border border-border hover:border-accent-green/50'
            }`}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((dua, i) => (
          <motion.div key={dua.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="bg-bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#f0b040]/10 flex items-center justify-center text-sm font-bold text-[#f0b040]">{dua.id}</div>
              <div className="flex-1">
                <span className="px-2 py-0.5 rounded-full bg-[#f0b040]/10 text-[#f0b040] text-[10px] font-bold">{dua.category}</span>
              </div>
            </div>

            <p className="text-text-primary text-lg leading-relaxed mb-3" style={{ fontFamily: 'var(--font-naskh)' }}>{dua.text}</p>

            {expandedDua === dua.id && dua.transliteration && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <p className="text-[#8b5cf6] text-sm italic mb-2 bg-[#8b5cf6]/5 p-3 rounded-lg">{dua.transliteration}</p>
              </motion.div>
            )}

            <p className="text-text-muted text-xs mb-3">📚 {dua.source}</p>

            <div className="flex gap-2">
              {dua.transliteration && (
                <button onClick={() => setExpandedDua(expandedDua === dua.id ? null : dua.id)}
                  className="flex-1 py-2 rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs font-bold hover:bg-[#8b5cf6]/20 transition-all">
                  {expandedDua === dua.id ? (h.hideTransliteration || 'إخفاء النطق') : (h.showTransliteration || 'النطق الإنجليزي')}
                </button>
              )}
              <button onClick={() => speakDua(dua.text)}
                className="flex-1 py-2 rounded-lg bg-[#00c896]/10 text-[#00c896] text-xs font-bold hover:bg-[#00c896]/20 transition-all">
                🔊 {h.listen || 'استمع'}
              </button>
              <button onClick={() => copyText(dua.text)}
                className="py-2 px-3 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] text-xs font-bold hover:bg-[#3b82f6]/20 transition-all">
                📋
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🤲</div>
          <p className="text-text-muted text-sm">{h.noDuas || 'لا أدعية في هذا التصنيف'}</p>
        </div>
      )}
    </div>
  );
}
