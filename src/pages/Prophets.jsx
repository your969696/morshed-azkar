import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prophets, prophetsList } from '../data/prophets-stories';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' },
  }),
};

const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Prophets() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [lang, setLang] = useState('ar');

  const selectedProphet = useMemo(
    () => (selectedId ? prophets.find((p) => p.id === selectedId) : null),
    [selectedId]
  );

  const currentIndex = useMemo(
    () => (selectedId ? prophets.findIndex((p) => p.id === selectedId) : -1),
    [selectedId]
  );

  const nextProphet = useMemo(
    () =>
      currentIndex >= 0 && currentIndex < prophets.length - 1
        ? prophets[currentIndex + 1]
        : null,
    [currentIndex]
  );

  const filteredProphets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return prophetsList;
    return prophetsList.filter(
      (p) =>
        p.name_ar.includes(q) ||
        p.name_en.toLowerCase().includes(q)
    );
  }, [search]);

  const t = (ar, en) => (lang === 'ar' ? ar : en);

  const openStory = (id) => {
    setSelectedId(id);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    if (nextProphet) {
      setSelectedId(nextProphet.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (selectedProphet) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedProphet.id}
          variants={slideIn}
          initial="initial"
          animate="animate"
          exit="exit"
          className="page-wrap pb-24 px-4 pt-6"
        >
          <button
            onClick={goBack}
            className="text-accent-green text-base mb-6 flex items-center gap-2 hover:underline font-bold"
          >
            <span className="text-xl">→</span>
            <span>{t('العودة للقائمة', 'Back to List')}</span>
          </button>

          <motion.div variants={fadeUp} initial="initial" animate="animate" className="text-center mb-8">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold border-2 bg-accent-green/20 text-accent-green border-accent-green/30">
              {selectedProphet.name_ar.charAt(0)}
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-1">
              {selectedProphet.name_ar}
            </h1>
            <p className="text-text-secondary text-base">{selectedProphet.name_en}</p>
          </motion.div>

          <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="mb-6">
            <div className="flex items-center justify-center bg-bg-card rounded-xl p-1 border border-border">
              <button
                onClick={() => setLang('ar')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  lang === 'ar' ? 'bg-accent-green text-white' : 'text-text-secondary'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLang('en')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  lang === 'en' ? 'bg-accent-green text-white' : 'text-text-secondary'
                }`}
              >
                English
              </button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.15 }} className="mb-6">
            <button disabled className="w-full py-3 rounded-xl bg-bg-card text-text-muted text-sm font-bold border border-border cursor-not-allowed opacity-60 flex items-center justify-center gap-2">
              <span>🔊</span>
              <span>{t('الصوت غير متاح حالياً', 'Audio not available yet')}</span>
            </button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="bg-bg-card rounded-2xl p-5 border border-border mb-6"
          >
            <p
              className="text-text-primary leading-loose text-base"
              dir="rtl"
              style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
            >
              {lang === 'ar' ? selectedProphet.story_ar : selectedProphet.story_en}
            </p>
          </motion.div>

          {selectedProphet.miracles && selectedProphet.miracles.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-accent-gold/10 via-bg-card to-accent-gold/5 rounded-2xl p-5 border-2 border-accent-gold/30 mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✨</span>
                <h2 className="text-accent-gold font-bold text-lg">المعجزات الإلهية</h2>
              </div>
              <div className="space-y-2">
                {selectedProphet.miracles.map((miracle, i) => (
                  <div key={i} className="flex items-start gap-3 bg-bg-primary/30 rounded-xl p-3">
                    <span className="w-7 h-7 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold text-xs font-bold shrink-0">{i + 1}</span>
                    <p className="text-text-primary text-sm font-bold" style={{ fontFamily: 'var(--font-naskh)' }}>{miracle}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedProphet.trials && selectedProphet.trials.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-rose-500/10 via-bg-card to-rose-500/5 rounded-2xl p-5 border-2 border-rose-500/30 mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💪</span>
                <h2 className="text-rose-400 font-bold text-lg">الابتلاءات والاختبارات</h2>
              </div>
              <div className="space-y-2">
                {selectedProphet.trials.map((trial, i) => (
                  <div key={i} className="flex items-start gap-3 bg-bg-primary/30 rounded-xl p-3">
                    <span className="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold shrink-0">{i + 1}</span>
                    <p className="text-text-primary text-sm font-bold" style={{ fontFamily: 'var(--font-naskh)' }}>{trial}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.35 }}
            className="bg-bg-card rounded-2xl p-5 border border-border mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-accent-gold text-lg">💎</span>
              <h2 className="text-text-primary font-bold text-base">
                {t('دروس مستفادة', 'Key Lessons')}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(lang === 'ar' ? selectedProphet.key_lessons_ar : selectedProphet.key_lessons_en).map(
                (lesson, i) => (
                  <span
                    key={i}
                    className="bg-accent-green/10 text-accent-green px-3 py-1.5 rounded-full text-xs font-bold border border-accent-green/20"
                  >
                    {lesson}
                  </span>
                )
              )}
            </div>
          </motion.div>

          {selectedProphet.related_surahs.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="bg-bg-card rounded-2xl p-5 border border-border mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-accent-gold text-lg">📖</span>
                <h2 className="text-text-primary font-bold text-base">
                  {t('السور ذات الصلة', 'Related Surahs')}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProphet.related_surahs.map((surah, i) => (
                  <span
                    key={i}
                    className="bg-accent-gold/10 text-accent-gold px-3 py-1.5 rounded-full text-xs font-bold border border-accent-gold/20"
                  >
                    {surah}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.35 }}
            className="bg-bg-card rounded-2xl p-4 border border-border mb-6"
          >
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-sm">📚</span>
              <span className="text-text-muted text-sm" dir="rtl">
                {t('المصدر:', 'Source:')} {selectedProphet.source}
              </span>
            </div>
          </motion.div>

          <div className="space-y-3 mt-4">
            {nextProphet && (
              <motion.button
                onClick={goNext}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-accent-green text-white font-bold text-sm hover:bg-accent-green/90 transition-all flex items-center justify-center gap-2"
              >
                <span>{t('القصة التالية', 'Next Story')}: {nextProphet.name_ar}</span>
                <span>←</span>
              </motion.button>
            )}
            <button
              onClick={goBack}
              className="w-full py-3 rounded-xl bg-bg-card text-text-primary font-bold text-sm border border-border hover:border-accent-green/30 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">→</span>
              <span>{t('العودة للقائمة', 'Back to List')}</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="page-wrap pb-24 px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🕌</span>
          <h1 className="text-2xl font-bold text-text-primary">قصص الأنبياء</h1>
        </div>
        <p className="text-text-secondary text-sm">
          {prophets.length} قصة من قصص الأنبياء في القرآن الكريم
        </p>
      </motion.div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder={t('ابحث عن نبي...', 'Search for a prophet...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-right text-sm focus:outline-none focus:border-accent-green"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredProphets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-text-primary text-lg font-bold mb-2">
            {t('لم يتم العثور على نتائج', 'No results found')}
          </h3>
          <p className="text-text-secondary text-sm">
            {t('جرب البحث باسم آخر', 'Try searching with a different name')}
          </p>
        </motion.div>
      )}

      <div className="space-y-3">
        {filteredProphets.map((prophet, index) => {
          const prophetData = prophets.find((p) => p.id === prophet.id);
          return (
            <motion.button
              key={prophet.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileTap={{ scale: 0.98 }}
              onClick={() => openStory(prophet.id)}
              className="w-full text-right"
            >
              <div className="bg-bg-card rounded-2xl p-5 border border-border hover:border-accent-green/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green text-lg font-bold border border-accent-green/30 shrink-0">
                    {prophet.name_ar.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-text-primary font-bold text-base truncate">
                      {prophet.name_ar}
                    </h3>
                    <p className="text-text-muted text-xs truncate">{prophet.name_en}</p>
                    {prophetData && prophetData.related_surahs.length > 0 && (
                      <div className="flex gap-1.5 mt-2 overflow-hidden">
                        {prophetData.related_surahs.slice(0, 3).map((surah, i) => (
                          <span
                            key={i}
                            className="bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full text-[10px] font-bold border border-accent-gold/20 whitespace-nowrap"
                          >
                            {surah}
                          </span>
                        ))}
                        {prophetData.related_surahs.length > 3 && (
                          <span className="text-text-muted text-[10px] flex items-center">
                            +{prophetData.related_surahs.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-accent-green text-lg">←</div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
