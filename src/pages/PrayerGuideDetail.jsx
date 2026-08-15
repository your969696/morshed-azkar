import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import PrayerCard from '../components/PrayerCard';
import { wuduSteps, salahSteps, invalidatesWudu, invalidatesSalah, pillarsOfSalah, obligationsOfSalah } from '../data/prayer-guide';

const tabs = [
  { id: 'wudu', label: 'الوضوء', icon: '💧' },
  { id: 'salah', label: 'الصلاة', icon: '🕌' },
  { id: 'invalidates', label: 'ما يبطلها', icon: '❌' },
  { id: 'pillars', label: 'الأركان', icon: '📋' },
];

export default function PrayerGuideDetail() {
  const [activeTab, setActiveTab] = useState('wudu');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  return (
    <div className="page-wrap pb-24 px-4 pt-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link to="/prayer" className="text-accent-green text-xl">→</Link>
            <h1 className="text-2xl font-bold text-text-primary">شرح الوضوء والصلاة</h1>
          </div>
          <button onClick={() => { const next = !soundEnabled; setSoundEnabled(next); localStorage.setItem('soundEnabled', next.toString()); }}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all ${soundEnabled ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'bg-bg-card text-text-muted border border-border'}`}>
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
          </button>
        </div>
        <p className="text-text-secondary text-sm">شرح مبسّط للوضوء والصلاة مع أحاديث</p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-accent-green text-white' : 'bg-bg-card text-text-secondary border border-border'}`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'wudu' && (
          <motion.div key="wudu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-lg font-bold text-accent-gold mb-4">خطوات الوضوء</h2>
            {wuduSteps.map((step, index) => (
              <PrayerCard key={step.id} step={step} index={index} total={wuduSteps.length} soundEnabled={soundEnabled} />
            ))}
          </motion.div>
        )}

        {activeTab === 'salah' && (
          <motion.div key="salah" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-lg font-bold text-accent-gold mb-4">خطوات الصلاة</h2>
            {salahSteps.map((step, index) => (
              <PrayerCard key={step.id} step={step} index={index} total={salahSteps.length} soundEnabled={soundEnabled} />
            ))}
          </motion.div>
        )}

        {activeTab === 'invalidates' && (
          <motion.div key="invalidates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-lg font-bold text-red-400 mb-4">ما يبطل الوضوء</h2>
            <div className="bg-bg-card rounded-xl p-4 border border-border mb-6">
              {invalidatesWudu.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center text-red-400 text-xs font-bold shrink-0">{index + 1}</span>
                  <span className="text-text-primary text-sm">{item}</span>
                </div>
              ))}
            </div>
            <h2 className="text-lg font-bold text-red-400 mb-4">ما يبطل الصلاة</h2>
            <div className="bg-bg-card rounded-xl p-4 border border-border">
              {invalidatesSalah.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center text-red-400 text-xs font-bold shrink-0">{index + 1}</span>
                  <span className="text-text-primary text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'pillars' && (
          <motion.div key="pillars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-lg font-bold text-accent-gold mb-4">أركان الصلاة</h2>
            <div className="bg-bg-card rounded-xl p-4 border border-border mb-6">
              {pillarsOfSalah.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="w-6 h-6 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold text-xs font-bold shrink-0">{index + 1}</span>
                  <span className="text-text-primary text-sm">{item}</span>
                </div>
              ))}
            </div>
            <h2 className="text-lg font-bold text-accent-green mb-4">واجبات الصلاة</h2>
            <div className="bg-bg-card rounded-xl p-4 border border-border mb-6">
              {obligationsOfSalah.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green text-xs font-bold shrink-0">{index + 1}</span>
                  <span className="text-text-primary text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
