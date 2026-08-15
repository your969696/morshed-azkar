import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakArabic, stopSpeaking } from '../utils/sound';
import { behaviorInGrief as allBehaviorInGrief } from '../data/behavior-hadiths';

const getDeletedIds = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const behaviorInGrief = allBehaviorInGrief.filter(b => !getDeletedIds('deletedBehaviorIds').includes(b.id));

export default function BehaviorInGrief() {
  const [speakingId, setSpeakingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const handleSpeak = (text, id) => {
    if (speakingId === id) { stopSpeaking(); setSpeakingId(null); return; }
    setSpeakingId(id);
    speakArabic(text, () => setSpeakingId(null));
  };

  return (
    <div className="page-wrap pb-24">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #0a0020 0%, #1a1040 25%, #2d1b69 55%, #1e1545 80%, #0f0a1a 100%)',
        padding: '20px 16px 16px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '30%', left: '50%', width: 60, height: 60, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #e8e0f0 0%, #c4b5d4 40%, #8b5cf6 100%)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 30px rgba(139,92,246,0.35)',
        }} />
        {[{s:2,t:'15%',l:'20%'}, {s:2,t:'25%',l:'75%'}, {s:3,t:'10%',l:'50%'}, {s:2,t:'35%',l:'85%'}].map((st, i) => (
          <div key={i} style={{ position: 'absolute', width: st.s, height: st.s, borderRadius: '50%', background: 'white', top: st.t, left: st.l, opacity: 0.4 }} />
        ))}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))',
              border: '1px solid rgba(139,92,246,0.2)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0, fontFamily: "'Amiri Quran', serif" }}>سلوك المسلم في الحزن</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{behaviorInGrief.length} أحاديث بالسند</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '12px 12px 0' }}>
        {behaviorInGrief.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: '#151030', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '16px 14px 14px', marginBottom: 10,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.grade && (
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 700,
                    background: item.grade === 'صحيح' ? 'rgba(0,200,150,0.12)' : 'rgba(240,176,64,0.12)',
                    color: item.grade === 'صحيح' ? '#00c896' : '#f0b040',
                  }}>{item.grade}</span>
                )}
                <span style={{ fontSize: 10, color: '#7a6f96', fontWeight: 600 }}>{item.category}</span>
              </div>
              <button
                onClick={() => handleSpeak(item.text, item.id)}
                style={{
                  width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', background: speakingId === item.id ? 'rgba(0,200,150,0.12)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', color: speakingId === item.id ? '#00c896' : '#7a6f96',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  {speakingId === item.id ? <><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></> : <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>}
                </svg>
              </button>
            </div>

            {/* Title */}
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#8b5cf6', marginBottom: 6 }}>{item.title}</h3>

            {/* Zikr text */}
            <p style={{
              fontFamily: "'Amiri Quran', serif", fontSize: 16, lineHeight: 2.2,
              textAlign: 'right', color: '#ffffff', margin: 0, direction: 'rtl',
            }}>{item.text}</p>

            {/* Expand button */}
            <button
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '8px 0', marginTop: 10,
                background: expandedId === item.id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${expandedId === item.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 10, cursor: 'pointer',
                color: '#8b5cf6', fontSize: 12, fontWeight: 600,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>{expandedId === item.id ? 'إخفاء' : 'الحديث الكامل والسند'}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transform: expandedId === item.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Expanded */}
            <AnimatePresence>
              {expandedId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
                    borderRadius: 12, padding: 14, marginTop: 10,
                  }}>
                    {item.isnad && <p style={{ fontSize: 12, color: '#8b5cf6', fontStyle: 'italic', lineHeight: 1.8, marginBottom: 8, textAlign: 'center' }}>{item.isnad}</p>}
                    <p style={{ fontFamily: "'Amiri Quran', serif", fontSize: 15, lineHeight: 2.2, textAlign: 'right', color: '#ffffff', margin: 0, direction: 'rtl' }}>
                      {item.hadithFull}
                    </p>
                    {item.narrator && <p style={{ fontSize: 11, color: '#7a6f96', marginTop: 10, textAlign: 'center' }}>رواه <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{item.narrator}</span></p>}
                    {item.reference && (
                      <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(139,92,246,0.06)', borderRadius: 8, border: '1px solid rgba(139,92,246,0.1)' }}>
                        <p style={{ fontSize: 11, color: '#8b5cf6', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          {item.reference}
                        </p>
                        {item.source && item.source.includes('بخاري') && (
                          <a href="https://sunnah.com/bukhari" target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 10, color: '#3b82f6', textDecoration: 'none', fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.08)' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            رابط المصدر على Sunnah.com
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
