import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';
import AzkarCard from '../components/AzkarCard';
import { morningAzkar } from '../data/morning-azkar';
import { eveningAzkar } from '../data/evening-azkar';
import { duas } from '../data/duas';

export default function Favorites() {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
  });
  const [duaFavorites, setDuaFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('duaFavorites') || '[]'); } catch { return []; }
  });
  const [filter, setFilter] = useState('all');

  const allAzkar = useMemo(() => [...morningAzkar, ...eveningAzkar], []);

  const favoriteAzkar = useMemo(() => {
    return allAzkar.filter(a => favorites.includes(a.id));
  }, [allAzkar, favorites]);

  const favoriteDuas = useMemo(() => {
    return duas.filter(d => duaFavorites.includes(d.id));
  }, [duaFavorites]);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };

  const toggleDuaFavorite = (id) => {
    setDuaFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('duaFavorites', JSON.stringify(next));
      return next;
    });
  };

  const totalFavorites = favoriteAzkar.length + favoriteDuas.length;

  return (
    <div className="page-wrap pb-24">
      <div className="relative overflow-hidden" style={{ minHeight: '160px' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1c1040 0%, #2d1b69 40%, #0f0a1a 100%)' }}>
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="favGlow" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#f0b040" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#f0b040" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <circle cx="200" cy="100" r="150" fill="url(#favGlow)"/>
            </svg>
          </div>
        </div>
        <div className="relative z-10 px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#f0b040]/15 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#f0b040" stroke="#f0b040" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t.favorites.title}</h1>
              <p className="text-white/50 text-xs mt-0.5">{t.favorites.count.replace('{count}', totalFavorites)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-20">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              filter === 'all' ? 'bg-[#f0b040] text-white shadow-[0_2px_12px_rgba(240,176,64,0.3)]' : 'bg-bg-card text-text-secondary border border-border hover:border-[#f0b040]/30'
            }`}
          >
            {t.favorites.all} ({totalFavorites})
          </button>
          <button
            onClick={() => setFilter('azkar')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              filter === 'azkar' ? 'bg-[#f0b040] text-white shadow-[0_2px_12px_rgba(240,176,64,0.3)]' : 'bg-bg-card text-text-secondary border border-border hover:border-[#f0b040]/30'
            }`}
          >
            {t.favorites.azkar} ({favoriteAzkar.length})
          </button>
          <button
            onClick={() => setFilter('duas')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              filter === 'duas' ? 'bg-[#f0b040] text-white shadow-[0_2px_12px_rgba(240,176,64,0.3)]' : 'bg-bg-card text-text-secondary border border-border hover:border-[#f0b040]/30'
            }`}
          >
            {t.favorites.duas} ({favoriteDuas.length})
          </button>
        </div>

        {totalFavorites === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-[#f0b040]/10 flex items-center justify-center mx-auto mb-5">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f0b040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 className="text-text-primary text-lg font-bold mb-2">{t.favorites.noFavorites}</h3>
            <p className="text-text-muted text-sm max-w-xs mx-auto">{t.favorites.hint}</p>
          </motion.div>
        )}

      {filter !== 'duas' && favoriteAzkar.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">{t.favorites.favAzkar}</h2>
          {favoriteAzkar.map((azkar) => (
            <AzkarCard
              key={azkar.id}
              azkar={azkar}
              onFavorite={toggleFavorite}
              isFavorited={true}
            />
          ))}
        </div>
      )}

      {filter !== 'azkar' && favoriteDuas.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-3">{t.favorites.favDuas}</h2>
          {favoriteDuas.map((dua) => (
            <motion.div
              key={dua.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-card rounded-2xl p-5 border border-border mb-3"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-text-muted text-xs">#{dua.id}</span>
                <button
                  onClick={() => toggleDuaFavorite(dua.id)}
                  className="text-xl"
                >
                  ⭐
                </button>
              </div>
              <p className="azkar-text mb-3 text-right">{dua.text}</p>
              <div className="flex items-center justify-between">
                <span className="azkar-source text-sm">{dua.source}</span>
                <span className="text-accent-gold text-xs bg-accent-gold/10 px-2 py-1 rounded-full">
                  {dua.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
