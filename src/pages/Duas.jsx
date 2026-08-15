import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { duas } from '../data/duas';

export default function Duas() {
  const [filter, setFilter] = useState('الكل');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('duaFavorites') || '[]'); } catch { return []; }
  });

  const categories = useMemo(() => ['الكل', ...new Set(duas.map(d => d.category))], []);

  const filteredDuas = useMemo(() => {
    if (filter === 'الكل') return duas;
    return duas.filter(d => d.category === filter);
  }, [filter]);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('duaFavorites', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="page-wrap pb-24 px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📖</span>
          <h1 className="text-2xl font-bold text-text-primary">الأدعية</h1>
        </div>
        <p className="text-text-secondary text-sm">{duas.length} دعاء من القرآن والسنة</p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === cat
                ? 'bg-accent-green text-white'
                : 'bg-bg-card text-text-secondary border border-border hover:border-accent-green/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredDuas.map((dua, index) => (
          <motion.div
            key={dua.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-bg-card rounded-2xl p-5 border border-border"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-text-muted text-xs">#{dua.id}</span>
              <button
                onClick={() => toggleFavorite(dua.id)}
                className="text-xl transition-transform hover:scale-110"
              >
                {favorites.includes(dua.id) ? '⭐' : '☆'}
              </button>
            </div>

            <p className="azkar-text mb-4 text-right">{dua.text}</p>

            <div className="flex items-center justify-between">
              <span className="azkar-source text-sm">{dua.source}</span>
              <span className="text-accent-gold text-xs bg-accent-gold/10 px-2 py-1 rounded-full">
                {dua.category}
              </span>
            </div>

            {dua.description && (
              <p className="text-text-muted text-xs mt-2 italic">{dua.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
