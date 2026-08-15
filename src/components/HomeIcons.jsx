import React, { useState, useEffect, useRef } from 'react';
import FastingBar from './FastingBar';

/* ═══════════════════════════════════════════════
   أيقونات SVG احترافية لكل الميزات
   ═══════════════════════════════════════════════ */

export const Icons = {
  // ── أذكار الصباح ──
  morningAdhkar: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="sunrise" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="20" r="9" stroke="url(#sunrise)" strokeWidth="2.2" />
      <path d="M24 5v5M24 30v5" stroke="url(#sunrise)" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 20H6M42 20h-5" stroke="url(#sunrise)" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.9 10.9l-3.5-3.5M36.6 32.6l-3.5-3.5" stroke="url(#sunrise)" strokeWidth="2" strokeLinecap="round" />
      <path d="M33.1 10.9l3.5-3.5M14.9 32.6l-3.5 3.5" stroke="url(#sunrise)" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 36a20 20 0 0040 0" stroke="url(#sunrise)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M10 36h28" stroke="url(#sunrise)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),

  // ── أذكار المساء ──
  eveningAdhkar: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="moonG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C8A2FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M30 8a16 16 0 100 32 12 12 0 010-32z" stroke="url(#moonG)" strokeWidth="2.2" fill="none" />
      <circle cx="18" cy="16" r="1.2" fill="#C8A2FF" opacity="0.6" />
      <circle cx="12" cy="28" r="1" fill="#C8A2FF" opacity="0.4" />
      <circle cx="22" cy="38" r="0.8" fill="#C8A2FF" opacity="0.3" />
      <circle cx="36" cy="12" r="0.7" fill="#C8A2FF" opacity="0.5" />
      <path d="M38 22l2-1M40 30l1.5-0.5" stroke="#C8A2FF" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),

  // ── القرآن الكريم ──
  quran: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="quranG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C896" />
          <stop offset="100%" stopColor="#00A87D" />
        </linearGradient>
      </defs>
      <rect x="8" y="4" width="32" height="40" rx="3" stroke="url(#quranG)" strokeWidth="2.2" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="url(#quranG)" strokeWidth="1.5" />
      <path d="M13 12h8M13 17h6M13 22h7" stroke="#00C896" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <path d="M28 12h8M28 17h6M28 22h7" stroke="#00C896" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <path d="M18 30c0 0 3-3 6-3s6 3 6 3" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="30" r="1.5" fill="#00C896" opacity="0.6" />
      <rect x="10" y="6" width="28" height="2" rx="1" fill="url(#quranG)" opacity="0.15" />
    </svg>
  ),

  // ── أوقات الصلاة ──
  prayerTimes: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="mosqueG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0B040" />
          <stop offset="100%" stopColor="#E8A040" />
        </linearGradient>
      </defs>
      <path d="M24 6l4 8h-8l4-8z" fill="url(#mosqueG)" opacity="0.8" />
      <rect x="10" y="14" width="28" height="24" rx="2" stroke="url(#mosqueG)" strokeWidth="2" />
      <path d="M10 14c0-4 6-10 14-10s14 6 14 10" stroke="url(#mosqueG)" strokeWidth="2" fill="none" />
      <rect x="20" y="26" width="8" height="12" rx="4" stroke="url(#mosqueG)" strokeWidth="1.8" />
      <circle cx="16" cy="24" r="2" stroke="url(#mosqueG)" strokeWidth="1.5" />
      <circle cx="32" cy="24" r="2" stroke="url(#mosqueG)" strokeWidth="1.5" />
      <path d="M6 38h36" stroke="url(#mosqueG)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  // ── التسبيح ──
  tasbih: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="tasbihG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8A0FF" />
          <stop offset="100%" stopColor="#9B59B6" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="15" stroke="url(#tasbihG)" strokeWidth="2" fill="none" />
      <circle cx="24" cy="9" r="3" stroke="url(#tasbihG)" strokeWidth="2" fill="none" />
      <circle cx="24" cy="9" r="1.2" fill="#E8A0FF" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg, i) => {
        const r = 15;
        const cx = 24 + r * Math.cos((deg - 90) * Math.PI / 180);
        const cy = 24 + r * Math.sin((deg - 90) * Math.PI / 180);
        return <circle key={i} cx={cx} cy={cy} r="1.8" fill="url(#tasbihG)" opacity="0.7" />;
      })}
      <path d="M24 39v5" stroke="url(#tasbihG)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="46" r="1.5" fill="url(#tasbihG)" />
    </svg>
  ),

  // ── اتجاه القبلة ──
  qibla: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="qiblaG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00E8A8" />
          <stop offset="100%" stopColor="#00A87D" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="19" stroke="url(#qiblaG)" strokeWidth="2" />
      <circle cx="24" cy="24" r="14" stroke="#00C896" strokeWidth="1" opacity="0.3" />
      <path d="M24 5v4M24 39v4M5 24h4M39 24h4" stroke="url(#qiblaG)" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="24,8 28,24 24,20 20,24" fill="url(#qiblaG)" />
      <path d="M24 20l12 16H12z" fill="url(#qiblaG)" opacity="0.25" />
      <circle cx="24" cy="24" r="2.5" fill="url(#qiblaG)" />
      <text x="24" y="4" textAnchor="middle" fill="#00C896" fontSize="5" fontWeight="800">N</text>
    </svg>
  ),

  // ── اختبر نفسك ──
  quiz: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="quizG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18" stroke="url(#quizG)" strokeWidth="2" />
      <path d="M20 18a4 4 0 018 0c0 2.5-2 3-3 4.5" stroke="url(#quizG)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="31" r="2" fill="url(#quizG)" />
      <path d="M30 8l2-2M18 8l-2-2" stroke="url(#quizG)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  ),

  // ── الحج والعمرة ──
  hajj: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="kaabaG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C8A2FF" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="24" height="24" rx="2" stroke="url(#kaabaG)" strokeWidth="2.5" />
      <rect x="14" y="14" width="20" height="20" rx="1" stroke="url(#kaabaG)" strokeWidth="1" opacity="0.3" />
      <path d="M16 14v20M20 14v20M24 14v20M28 14v20M32 14v20" stroke="url(#kaabaG)" strokeWidth="0.5" opacity="0.2" />
      <path d="M12 16h24M12 20h24M12 24h24M12 28h24M12 32h24" stroke="url(#kaabaG)" strokeWidth="0.5" opacity="0.2" />
      <ellipse cx="24" cy="8" rx="16" ry="3" stroke="url(#kaabaG)" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M20 36v6M28 36v6" stroke="url(#kaabaG)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  // ── قصص الرسل ──
  stories: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="bookG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path d="M6 10a4 4 0 014-4h12v32H10a4 4 0 01-4-4V10z" stroke="url(#bookG)" strokeWidth="2" />
      <path d="M42 10a4 4 0 00-4-4H26v32h12a4 4 0 004-4V10z" stroke="url(#bookG)" strokeWidth="2" />
      <path d="M12 14h8M12 19h6M12 24h7" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M28 14h8M28 19h6M28 24h7" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <circle cx="24" cy="32" r="3" stroke="url(#bookG)" strokeWidth="1.5" fill="none" />
      <path d="M23 31l1 1 2-2" stroke="url(#bookG)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),

  // ── التقويم الهجري ──
  hijriCal: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="calG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C896" />
          <stop offset="100%" stopColor="#0088FF" />
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="36" height="32" rx="4" stroke="url(#calG)" strokeWidth="2" />
      <path d="M14 6v8M34 6v8" stroke="url(#calG)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 20h36" stroke="url(#calG)" strokeWidth="1.5" />
      <text x="16" y="33" fill="#00C896" fontSize="10" fontWeight="800" fontFamily="Cairo">١٤</text>
      <text x="28" y="33" fill="#0088FF" fontSize="7" fontWeight="600" fontFamily="Cairo" opacity="0.5">هـ</text>
      <circle cx="36" cy="36" r="5" fill="url(#calG)" opacity="0.15" />
      <path d="M34 36l1.5 1.5 3-3" stroke="url(#calG)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  // ── التسجيلات الصوتية ──
  audio: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="audioG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B8A" />
          <stop offset="100%" stopColor="#FF2D55" />
        </linearGradient>
      </defs>
      <rect x="17" y="10" width="14" height="20" rx="7" stroke="url(#audioG)" strokeWidth="2.2" />
      <path d="M12 26a12 12 0 0024 0" stroke="url(#audioG)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="24" y1="38" x2="24" y2="42" stroke="url(#audioG)" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="42" x2="30" y2="42" stroke="url(#audioG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 22v4M11 18v8M37 18v8M40 22v4" stroke="url(#audioG)" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),

  // ── تجربة الأذان ──
  adhan: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="adhanG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
      <path d="M8 20v12a2 2 0 002 2h28a2 2 0 002-2V20" stroke="url(#adhanG)" strokeWidth="2" />
      <rect x="6" y="16" width="36" height="4" rx="2" stroke="url(#adhanG)" strokeWidth="1.5" />
      <path d="M24 8l3-3M24 8l-3-3" stroke="url(#adhanG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 8v8" stroke="url(#adhanG)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="27" r="4" stroke="url(#adhanG)" strokeWidth="1.5" fill="none" />
      <path d="M24 23v8M20 27h8" stroke="url(#adhanG)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 28l4-4M44 28l-4-4" stroke="url(#adhanG)" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <path d="M14 38h20" stroke="url(#adhanG)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),

  // ── كيف تصلي ──
  prayGuide: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="prayG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C896" />
          <stop offset="100%" stopColor="#00E8A8" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="10" r="5" stroke="url(#prayG)" strokeWidth="2" />
      <path d="M24 15v10" stroke="url(#prayG)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 22l8-4 8 4" stroke="url(#prayG)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M16 22v10M32 22v10" stroke="url(#prayG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 32h8" stroke="url(#prayG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 35v7M30 35v7" stroke="url(#prayG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 42h28" stroke="url(#prayG)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="10" cy="10" r="1.5" fill="#00C896" opacity="0.3" />
      <circle cx="38" cy="8" r="1" fill="#00C896" opacity="0.2" />
    </svg>
  ),

  // ── التنبيهات ──
  notifications: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="bellG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#F0B040" />
        </linearGradient>
      </defs>
      <path d="M24 4a2 2 0 012 2v2.1A16 16 0 0028 26v4l4 6H16l4-6v-4a16 16 0 002-17.9V6a2 2 0 012-2z" stroke="url(#bellG)" strokeWidth="2.2" />
      <path d="M20 38a4 4 0 008 0" stroke="url(#bellG)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="12" r="1" fill="#FFD700" opacity="0.5" />
    </svg>
  ),

  // ── لم أجد إجابة ──
  faq: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="faqG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C8A2FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18" stroke="url(#faqG)" strokeWidth="2" />
      <path d="M20 18a4 4 0 018 0c0 3-3 3.5-4 5" stroke="url(#faqG)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="30" r="2" fill="url(#faqG)" />
      <path d="M14 4l-2-2M34 4l2-2" stroke="url(#faqG)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),

  // ── المطاعم الحلال ──
  halalFood: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="foodG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C896" />
          <stop offset="100%" stopColor="#00A87D" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="26" r="14" stroke="url(#foodG)" strokeWidth="2" />
      <path d="M14 20a14 14 0 0020 0" stroke="url(#foodG)" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M18 16c0-6 3-10 6-10s6 4 6 10" stroke="url(#foodG)" strokeWidth="2" fill="none" />
      <path d="M20 26h8" stroke="url(#foodG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 22v8" stroke="url(#foodG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 40h32" stroke="url(#foodG)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),

  // ── حلال سكانر ──
  scanner: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="scanG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C896" />
          <stop offset="100%" stopColor="#00E8A8" />
        </linearGradient>
      </defs>
      <path d="M6 14V8a2 2 0 012-2h6" stroke="url(#scanG)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 14V8a2 2 0 00-2-2h-6" stroke="url(#scanG)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 34v6a2 2 0 002 2h6" stroke="url(#scanG)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 34v6a2 2 0 01-2 2h-6" stroke="url(#scanG)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="20" x2="6" y2="28" stroke="url(#scanG)" strokeWidth="2" opacity="0.3" />
      <line x1="42" y1="20" x2="42" y2="28" stroke="url(#scanG)" strokeWidth="2" opacity="0.3" />
      <rect x="14" y="18" width="4" height="12" rx="1" stroke="url(#scanG)" strokeWidth="1.5" />
      <rect x="20" y="18" width="2" height="12" rx="0.5" stroke="url(#scanG)" strokeWidth="1" opacity="0.5" />
      <rect x="24" y="18" width="6" height="12" rx="1" stroke="url(#scanG)" strokeWidth="1.5" />
      <rect x="32" y="18" width="2" height="12" rx="0.5" stroke="url(#scanG)" strokeWidth="1" opacity="0.5" />
      <path d="M20 24h8" stroke="#00C896" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),

  // ── التقويم والأعياد ──
  holidays: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="holG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="18" r="10" stroke="url(#holG)" strokeWidth="2" fill="none" />
      <path d="M24 10v-4M24 26v4" stroke="url(#holG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 8l4-6M24 8l-4-6" stroke="url(#holG)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="18" r="3" fill="url(#holG)" opacity="0.3" />
      <path d="M16 34c0-4 3.5-8 8-8s8 4 8 8" stroke="url(#holG)" strokeWidth="2" fill="none" />
      <path d="M12 38h24" stroke="url(#holG)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="38" r="2" fill="url(#holG)" opacity="0.4" />
      <circle cx="34" cy="38" r="2" fill="url(#holG)" opacity="0.4" />
    </svg>
  ),

  // ── دليل الوضوء ──
  wudu: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="wuduG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path d="M24 6c0 0-12 14-12 24a12 12 0 0024 0C36 20 24 6 24 6z" stroke="url(#wuduG)" strokeWidth="2.2" fill="none" />
      <path d="M24 16c0 0-6 8-6 14a6 6 0 0012 0c0-6-6-14-6-14z" stroke="url(#wuduG)" strokeWidth="1.2" fill="url(#wuduG)" opacity="0.15" />
      <path d="M18 32a6 6 0 0012 0" stroke="url(#wuduG)" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),

  // ── الصلاة (sunrise) ──
  sunrise: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="srG" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
      </defs>
      <path d="M6 34h36" stroke="url(#srG)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="8" stroke="url(#srG)" strokeWidth="2.2" fill="none" />
      <path d="M24 10v4M24 34v-4" stroke="url(#srG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 13l2.8 2.8M35 35l-2.8-2.8" stroke="url(#srG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 13l-2.8 2.8M13 35l2.8-2.8" stroke="url(#srG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 34a14 14 0 0028 0" stroke="url(#srG)" strokeWidth="1.5" fill="none" opacity="0.4" />
    </svg>
  ),

  // ── الغروب (sunset) ──
  sunset: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="ssG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#FF2D55" />
        </linearGradient>
      </defs>
      <path d="M6 34h36" stroke="url(#ssG)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="26" r="8" stroke="url(#ssG)" strokeWidth="2.2" fill="none" />
      <path d="M24 12v4" stroke="url(#ssG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 15l2.8 2.8M35 37l-2.8-2.8" stroke="url(#ssG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 15l-2.8 2.8M13 37l2.8-2.8" stroke="url(#ssG)" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 34a14 14 0 0028 0" stroke="url(#ssG)" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M16 34h16" stroke="url(#ssG)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  // ── ساعات الصيام ──
  fasting: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fastG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C896" />
          <stop offset="100%" stopColor="#0088FF" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18" stroke="url(#fastG)" strokeWidth="2" />
      <circle cx="24" cy="24" r="14" stroke="#00C896" strokeWidth="0.8" opacity="0.2" />
      <line x1="24" y1="24" x2="24" y2="14" stroke="url(#fastG)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="32" y2="28" stroke="url(#fastG)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.5" fill="url(#fastG)" />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((d,i)=>{
        const r=17,x2=24+r*Math.cos((d-90)*Math.PI/180),y2=24+r*Math.sin((d-90)*Math.PI/180);
        const r2=19,x3=24+r2*Math.cos((d-90)*Math.PI/180),y3=24+r2*Math.sin((d-90)*Math.PI/180);
        return <line key={i} x1={x2} y1={y2} x2={x3} y2={y3} stroke="url(#fastG)" strokeWidth={d%90===0?2:1} strokeLinecap="round" />;
      })}
      <text x="24" y="35" textAnchor="middle" fill="#00C896" fontSize="6" fontWeight="700">ساعات</text>
    </svg>
  ),

  // ── التنبيهات الفرعية ──
  dhikr: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke="#E8A0FF" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3" fill="#E8A0FF" opacity="0.4" />
      {[0,72,144,216,288].map((d,i)=>{
        const x=16+8*Math.cos((d-90)*Math.PI/180),y=16+8*Math.sin((d-90)*Math.PI/180);
        return <circle key={i} cx={x} cy={y} r="1.5" fill="#E8A0FF" opacity="0.6" />;
      })}
    </svg>
  ),
  hadith: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="6" y="4" width="20" height="24" rx="3" stroke="#60A5FA" strokeWidth="1.5" />
      <path d="M10 10h12M10 14h8M10 18h10" stroke="#60A5FA" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M10 24l3-3 3 3" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  todayEvent: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="24" height="22" rx="3" stroke="#00C896" strokeWidth="1.5" />
      <path d="M10 3v6M22 3v6" stroke="#00C896" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="18" r="4" fill="#00C896" opacity="0.2" stroke="#00C896" strokeWidth="1" />
    </svg>
  ),
  bestDeeds: (
    <svg viewBox="0 0 32 32" fill="none">
      <polygon points="16,3 19.5,12 29,12 21.5,18 24,27 16,22 8,27 10.5,18 3,12 12.5,12" stroke="#FFD700" strokeWidth="1.5" fill="#FFD700" fillOpacity="0.15" />
    </svg>
  ),
  manners: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke="#FF8C00" strokeWidth="1.5" />
      <path d="M16 8l3 6h-6l3-6z" fill="#FF8C00" opacity="0.4" />
      <rect x="14" y="14" width="4" height="10" rx="2" stroke="#FF8C00" strokeWidth="1.5" />
    </svg>
  ),

  // ── صلة الرحم ──
  kindred: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="kindredG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C896" />
          <stop offset="100%" stopColor="#50E8C0" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="16" r="6" stroke="url(#kindredG)" strokeWidth="2" />
      <circle cx="12" cy="14" r="4" stroke="url(#kindredG)" strokeWidth="1.5" opacity="0.6" />
      <circle cx="36" cy="14" r="4" stroke="url(#kindredG)" strokeWidth="1.5" opacity="0.6" />
      <path d="M18 38c0-4 3-7 6-7s6 3 6 7" stroke="url(#kindredG)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M8 36c0-3 2-5 4-5" stroke="url(#kindredG)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none" />
      <path d="M40 36c0-3-2-5-4-5" stroke="url(#kindredG)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none" />
      <path d="M20 24l4 3 4-3" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════
   بيانات أقسام الصفحة
   ═══════════════════════════════════════════════ */

const MAIN_FEATURES = [
  { id: 'morning-adhkar',   name: 'أذكار الصباح',      icon: Icons.morningAdhkar,  color: '#FFD700', bg: 'rgba(255,215,0,0.06)',    badge: null },
  { id: 'evening-adhkar',   name: 'أذكار المساء',      icon: Icons.eveningAdhkar,  color: '#C8A2FF', bg: 'rgba(200,162,255,0.06)',  badge: null },
  { id: 'quran',            name: 'القرآن الكريم',     icon: Icons.quran,          color: '#00C896', bg: 'rgba(0,200,150,0.06)',    badge: 'محدث' },
  { id: 'prayer-times',     name: 'أوقات الصلاة',     icon: Icons.prayerTimes,    color: '#F0B040', bg: 'rgba(240,176,64,0.06)',   badge: null },
  { id: 'tasbih',           name: 'التسبيح',           icon: Icons.tasbih,         color: '#E8A0FF', bg: 'rgba(232,160,255,0.06)',  badge: null },
  { id: 'qibla',            name: 'اتجاه القبلة',     icon: Icons.qibla,          color: '#00C896', bg: 'rgba(0,200,150,0.06)',    badge: null },
  { id: 'quiz',             name: 'اختبر نفسك',       icon: Icons.quiz,           color: '#FFD700', bg: 'rgba(255,215,0,0.06)',    badge: 'جديد' },
  { id: 'hajj',             name: 'الحج والعمرة',     icon: Icons.hajj,           color: '#C8A2FF', bg: 'rgba(200,162,255,0.06)',  badge: null },
  { id: 'stories',          name: 'قصص الرسل',        icon: Icons.stories,        color: '#60A5FA', bg: 'rgba(96,165,250,0.06)',   badge: null },
  { id: 'hijri-cal',        name: 'التقويم الهجري',  icon: Icons.hijriCal,       color: '#00C896', bg: 'rgba(0,200,150,0.06)',    badge: null },
  { id: 'audio',            name: 'التسجيلات الصوتية',icon: Icons.audio,          color: '#FF6B8A', bg: 'rgba(255,107,138,0.06)',  badge: null },
  { id: 'adhan',            name: 'تجربة الأذان',     icon: Icons.adhan,          color: '#FFD700', bg: 'rgba(255,215,0,0.06)',    badge: null },
  { id: 'pray-guide',       name: 'كيف تصلي',         icon: Icons.prayGuide,      color: '#00C896', bg: 'rgba(0,200,150,0.06)',    badge: null },
  { id: 'notifications',    name: 'التنبيهات',       icon: Icons.notifications,  color: '#FFD700', bg: 'rgba(255,215,0,0.06)',    badge: '5' },
  { id: 'faq',              name: 'لم أجد إجابة',    icon: Icons.faq,            color: '#C8A2FF', bg: 'rgba(200,162,255,0.06)',  badge: null },
  { id: 'halal-food',       name: 'المطاعم الحلال',  icon: Icons.halalFood,      color: '#00C896', bg: 'rgba(0,200,150,0.06)',    badge: null },
  { id: 'scanner',          name: 'حلال سكانر',      icon: Icons.scanner,        color: '#00C896', bg: 'rgba(0,200,150,0.06)',    badge: 'مميز' },
  { id: 'holidays',         name: 'التقويم والأعياد',icon: Icons.holidays,       color: '#FFD700', bg: 'rgba(255,215,0,0.06)',    badge: null },
  { id: 'wudu',             name: 'دليل الوضوء',     icon: Icons.wudu,           color: '#60A5FA', bg: 'rgba(96,165,250,0.06)',   badge: null },
  { id: 'kindred',          name: 'صلة الرحم',       icon: Icons.kindred,        color: '#00C896', bg: 'rgba(0,200,150,0.06)',    badge: 'جديد' },
];

const NOTIFICATION_CATEGORIES = [
  { id: 'dhikr',       name: 'ذكر',            icon: Icons.dhikr,      color: '#E8A0FF' },
  { id: 'hadith',      name: 'حديث',           icon: Icons.hadith,     color: '#60A5FA' },
  { id: 'today-event', name: 'مثل هذا اليوم', icon: Icons.todayEvent, color: '#00C896' },
  { id: 'best-deeds',  name: 'أفضل الأعمال',  icon: Icons.bestDeeds,  color: '#FFD700' },
  { id: 'manners',     name: 'سلوك المسلم',    icon: Icons.manners,    color: '#FF8C00' },
];

const ISLAMIC_HOLIDAYS = [
  { id: 'ramadan',   name: 'رمضان',       icon: Icons.tasbih,    color: '#C8A2FF', month: 'رمضان' },
  { id: 'lailat',    name: 'ليلة القدر',   icon: Icons.eveningAdhkar, color: '#8B5CF6', month: 'رمضان' },
  { id: 'eidfitr',   name: 'عيد الفطر',   icon: Icons.holidays,  color: '#FFD700', month: 'شوال' },
  { id: 'arafat',    name: 'عرفة',         icon: Icons.hajj,      color: '#00C896', month: 'ذو الحجة' },
  { id: 'eidadha',   name: 'عيد الأضحى',  icon: Icons.hajj,      color: '#FF8C00', month: 'ذو الحجة' },
];

/* ═══════════════════════════════════════════════
   المكون الرئيسي — الصفحة الرئيسية
   ═══════════════════════════════════════════════ */

const Home = () => {
  const [activeSection, setActiveSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [prayerData, setPrayerData] = useState({
    fajr: '04:30', sunrise: '06:00', dhuhr: '12:15',
    asr: '15:45', maghrib: '18:45', isha: '20:00',
  });
  const [nextPrayer, setNextPrayer] = useState({ name: '--', time: '--:--', remaining: '--:--:--' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState('١٤ جمادى الآخرة ١٤٤٧');
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef(null);

  // ── تحديث الوقت كل ثانية ──
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── حساب الصلاة القادمة ──
  useEffect(() => {
    const now = currentTime;
    const ns = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const prayers = [
      { name: 'الفجر', key: 'fajr' },
      { name: 'الشروق', key: 'sunrise' },
      { name: 'الظهر', key: 'dhuhr' },
      { name: 'العصر', key: 'asr' },
      { name: 'المغرب', key: 'maghrib' },
      { name: 'العشاء', key: 'isha' },
    ];
    const parse = (s) => { const [h, m] = s.split(':').map(Number); return h * 3600 + m * 60; };
    const fmt = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    for (const p of prayers) {
      const ps = parse(prayerData[p.key]);
      if (ps > ns) {
        setNextPrayer({ name: p.name, time: prayerData[p.key], remaining: fmt(ps - ns) });
        return;
      }
    }
    // بعد العشاء → الفجر
    const fajr = parse(prayerData.fajr);
    setNextPrayer({ name: 'الفجر', time: prayerData.fajr, remaining: fmt((86400 - ns) + fajr) });
  }, [currentTime, prayerData]);

  // ── تأثير التمرير ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── فلترة البحث ──
  const filteredFeatures = MAIN_FEATURES.filter((f) => {
    const matchSearch = !searchQuery || f.name.includes(searchQuery);
    if (activeSection === 'all') return matchSearch;
    if (activeSection === 'prayer') return matchSearch && ['prayer-times', 'qibla', 'adhan', 'pray-guide', 'morning-adhkar', 'evening-adhkar'].includes(f.id);
    if (activeSection === 'quran') return matchSearch && ['quran', 'tasbih', 'stories', 'quiz'].includes(f.id);
    if (activeSection === 'halal') return matchSearch && ['halal-food', 'scanner'].includes(f.id);
    if (activeSection === 'more') return matchSearch && ['hijri-cal', 'holidays', 'hajj', 'wudu', 'audio', 'faq', 'notifications'].includes(f.id);
    return matchSearch;
  });

  // ── فتحات الصلاة ──
  const prayerItems = [
    { name: 'الفجر', time: prayerData.fajr, color: '#7C8CF8' },
    { name: 'الشروق', time: prayerData.sunrise, color: '#FFD700' },
    { name: 'الظهر', time: prayerData.dhuhr, color: '#F0B040' },
    { name: 'العصر', time: prayerData.asr, color: '#E8A040' },
    { name: 'المغرب', time: prayerData.maghrib, color: '#FF7832' },
    { name: 'العشاء', time: prayerData.isha, color: '#A78BFA' },
  ];

  const formatTime12 = (t) => {
    if (!t) return '--:--';
    const [h, m] = t.split(':').map(Number);
    const p = h >= 12 ? 'م' : 'ص';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${p}`;
  };

  const fastingStart = prayerData.fajr;
  const fastingEnd = prayerData.maghrib;
  const fastingHours = (() => {
    const [sh, sm] = fastingStart.split(':').map(Number);
    const [eh, em] = fastingEnd.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return `${Math.floor(diff / 60)}:${String(diff % 60).padStart(2, '0')}`;
  })();

  return (
    <div ref={containerRef} style={styles.container}>
      {/* ════ خلفية متحركة ════ */}
      <div style={styles.bgGradient} />
      <div style={styles.bgNoise} />
      <div style={styles.bgPattern} />

      {/* ════ رأس الصفحة ════ */}
      <header style={{ ...styles.header, boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none' }}>
        <div style={styles.headerContent}>
          <div style={styles.headerRight}>
            <div style={styles.logoContainer}>
              {Icons.prayerTimes}
            </div>
            <div>
              <h1 style={styles.headerTitle}>تطبيق الإسلامي</h1>
              <p style={styles.headerSub}>{hijriDate}</p>
            </div>
          </div>
          <div style={styles.headerLeft}>
            <button style={styles.headerBtn} onClick={() => {}}>
              {Icons.notifications}
            </button>
          </div>
        </div>
      </header>

      {/* ════ بطاقة الصلاة القادمة ════ */}
      <section style={styles.nextPrayerSection}>
        <div style={styles.nextPrayerCard}>
          <div style={styles.nextPrayerGlow} />
          <div style={styles.nextPrayerContent}>
            <div style={styles.nextPrayerRing}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  stroke="url(#npGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 * 0.35}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(0,200,150,0.3))' }}
                />
                <defs>
                  <linearGradient id="npGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00C896" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={styles.ringInner}>
                <div style={styles.countdown}>{nextPrayer.remaining}</div>
                <div style={styles.countdownLabel}>ساعة : دقيقة : ثانية</div>
              </div>
            </div>

            <div style={styles.nextPrayerInfo}>
              <div style={styles.npName}>
                <div style={styles.npDot} />
                {nextPrayer.name}
              </div>
              <div style={styles.npTime}>{formatTime12(nextPrayer.time)} — الصلاة القادمة</div>
              <div style={styles.prayerRow}>
                {prayerItems.map((p, i) => (
                  <div key={i} style={styles.prayerPill}>
                    <div style={{ ...styles.pillDot, background: p.color }} />
                    <span style={styles.pillName}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ عداد الصيام ════ */}
      <section>
        <FastingBar />
      </section>

      {/* ════ حقل البحث ════ */}
      <section style={styles.searchSection}>
        <div style={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="ابحث عن ميزة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* ════ فلاتر الأقسام ════ */}
      <section style={styles.tabsSection}>
        {[
          { key: 'all', label: 'الكل' },
          { key: 'prayer', label: 'عبادات' },
          { key: 'quran', label: 'قرآن' },
          { key: 'halal', label: 'حلال' },
          { key: 'more', label: 'المزيد' },
        ].map((tab) => (
          <button
            key={tab.key}
            style={{
              ...styles.filterTab,
              ...(activeSection === tab.key ? styles.filterTabActive : {}),
            }}
            onClick={() => setActiveSection(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* ════ الشبكة الرئيسية ════ */}
      <section style={styles.featuresGrid}>
        {filteredFeatures.map((f, i) => (
          <div
            key={f.id}
            style={{
              ...styles.featureCard,
              animationDelay: `${i * 0.04}s`,
              borderColor: `${f.color}15`,
            }}
            onClick={() => {}}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.borderColor = `${f.color}30`;
              e.currentTarget.style.boxShadow = `0 12px 40px ${f.color}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = `${f.color}15`;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ ...styles.featureIconBox, background: f.bg }}>
              {f.icon}
            </div>
            <span style={styles.featureName}>{f.name}</span>
            {f.badge && (
              <span style={{
                ...styles.featureBadge,
                background: f.badge === 'جديد' ? 'rgba(0,200,150,0.15)' : f.badge === 'محدث' ? 'rgba(96,165,250,0.15)' : 'rgba(255,107,138,0.15)',
                color: f.badge === 'جديد' ? '#00C896' : f.badge === 'محدث' ? '#60A5FA' : '#FF6B8A',
              }}>
                {f.badge}
              </span>
            )}
          </div>
        ))}
      </section>

      {/* ════ الأعياد الإسلامية ════ */}
      <section style={styles.holidaysSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>الأعياد الإسلامية</h2>
        </div>
        <div style={styles.holidaysRow}>
          {ISLAMIC_HOLIDAYS.map((h, i) => (
            <div key={h.id} style={{ ...styles.holidayCard, borderColor: `${h.color}15` }}>
              <div style={{ ...styles.holidayIcon, background: `${h.color}10` }}>{h.icon}</div>
              <span style={{ ...styles.holidayName, color: h.color }}>{h.name}</span>
              <span style={styles.holidayMonth}>{h.month}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════ أنواع التنبيهات ════ */}
      <section style={styles.notifSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>التنبيهات</h2>
        </div>
        <div style={styles.notifRow}>
          {NOTIFICATION_CATEGORIES.map((n) => (
            <div key={n.id} style={styles.notifCard}>
              <div style={{ width: 32, height: 32 }}>{n.icon}</div>
              <span style={{ ...styles.notifName, color: n.color }}>{n.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════ مساحة أسفلية ════ */}
      <div style={{ height: 100 }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════
   الأنماط
   ═══════════════════════════════════════════════ */

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    background: '#060410',
    fontFamily: "'Cairo', sans-serif",
    color: '#F0ECE4',
    direction: 'rtl',
    maxWidth: 520,
    margin: '0 auto',
    paddingBottom: 80,
    WebkitFontSmoothing: 'antialiased',
  },

  // خلفيات
  bgGradient: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    background: `
      radial-gradient(ellipse 60% 50% at 10% 90%, rgba(0,200,150,0.03), transparent 60%),
      radial-gradient(ellipse 50% 40% at 90% 10%, rgba(100,60,200,0.04), transparent 50%),
      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(10,6,20,1), #060410)
    `,
  },
  bgNoise: {
    position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.35,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
  },
  bgPattern: {
    position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.015,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%2300c896' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='%23a78bfa' stroke-width='0.3'/%3E%3C/svg%3E")`,
    backgroundSize: '60px 60px',
  },

  // رأس الصفحة
  header: {
    position: 'sticky', top: 0, zIndex: 50, padding: '14px 20px',
    background: 'rgba(6,4,16,0.88)', backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
    transition: 'box-shadow 0.3s',
  },
  headerContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  logoContainer: {
    width: 44, height: 44, borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(0,200,150,0.08), rgba(0,150,200,0.06))',
    border: '1px solid rgba(0,200,150,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: 800, margin: 0, lineHeight: 1.2 },
  headerSub: { fontSize: 10.5, color: '#6B6284', margin: 0 },
  headerLeft: { display: 'flex', gap: 8 },
  headerBtn: {
    width: 38, height: 38, borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.035)',
    color: '#6B6284', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: 0,
  },

  // الصلاة القادمة
  nextPrayerSection: { padding: '16px 20px 0' },
  nextPrayerCard: {
    borderRadius: 22, padding: 28, position: 'relative', overflow: 'hidden',
    border: '1px solid rgba(0,200,150,0.06)',
    background: 'linear-gradient(135deg, rgba(0,200,150,0.03), rgba(10,6,20,0.95))',
  },
  nextPrayerGlow: {
    position: 'absolute', inset: 0, borderRadius: 22, pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(6,4,16,0.6), rgba(6,4,16,0.4), rgba(6,4,16,0.7))',
  },
  nextPrayerContent: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 28 },
  nextPrayerRing: { position: 'relative', width: 140, height: 140, flexShrink: 0 },
  ringInner: {
    position: 'absolute', inset: 16, borderRadius: '50%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  countdown: {
    fontSize: '1.8rem', fontWeight: 900, lineHeight: 1, direction: 'ltr',
    background: 'linear-gradient(180deg, #F0ECE4, rgba(0,200,150,0.6))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    fontVariantNumeric: 'tabular-nums',
  },
  countdownLabel: { fontSize: '0.5rem', fontWeight: 600, color: '#6B6284', marginTop: 4 },
  nextPrayerInfo: { flex: 1, position: 'relative', zIndex: 1 },
  npName: {
    fontSize: '1.6rem', fontWeight: 900, color: '#00C896', marginBottom: 4,
    display: 'flex', alignItems: 'center', gap: 10,
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  npDot: {
    width: 10, height: 10, borderRadius: '50%', background: '#00C896',
    boxShadow: '0 0 10px rgba(0,200,150,0.5)',
    animation: 'pulse 2.5s ease infinite',
  },
  npTime: { fontSize: 14, fontWeight: 600, color: '#C0B8D8', marginBottom: 14 },
  prayerRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  prayerPill: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', borderRadius: 10,
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
  },
  pillDot: { width: 5, height: 5, borderRadius: '50%' },
  pillName: { fontSize: 10, fontWeight: 600, color: '#C0B8D8' },

  // الشروق / الغروب / الصيام
  sunRow: { display: 'flex', gap: 10, padding: '12px 20px' },
  sunCard: {
    flex: 1, borderRadius: 16, padding: '16px 10px', textAlign: 'center',
    background: 'rgba(255,255,255,0.025)', border: '1px solid',
    transition: 'all 0.3s',
  },
  sunIcon: { width: 40, height: 40, margin: '0 auto 6px' },
  sunLabel: { fontSize: 10, fontWeight: 700, marginBottom: 4 },
  sunTime: { fontSize: 18, fontWeight: 900, fontVariantNumeric: 'tabular-nums' },

  // البحث
  searchSection: { padding: '8px 20px 12px' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', borderRadius: 14,
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
  },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#F0ECE4', fontSize: 14, fontFamily: "'Cairo', sans-serif",
  },

  // فلاتر
  tabsSection: { display: 'flex', gap: 6, padding: '0 20px 16px', overflowX: 'auto' },
  filterTab: {
    padding: '7px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.035)', color: '#6B6284', whiteSpace: 'nowrap',
    fontFamily: "'Cairo', sans-serif", transition: 'all 0.2s',
  },
  filterTabActive: {
    background: 'rgba(0,200,150,0.08)', color: '#00C896',
    borderColor: 'rgba(0,200,150,0.15)',
  },

  // شبكة الميزات
  featuresGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
    padding: '0 20px 20px',
  },
  featureCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '16px 6px 12px', borderRadius: 16,
    background: 'rgba(255,255,255,0.025)', border: '1px solid',
    cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
    position: 'relative', animation: 'fadeUp 0.5s ease forwards', opacity: 0,
  },
  featureIconBox: {
    width: 48, height: 48, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, border: '1px solid rgba(255,255,255,0.04)',
  },
  featureName: { fontSize: 10.5, fontWeight: 700, color: '#C0B8D8', textAlign: 'center', lineHeight: 1.4 },
  featureBadge: {
    position: 'absolute', top: 6, left: 6,
    padding: '2px 7px', borderRadius: 10, fontSize: 8, fontWeight: 800,
  },

  // الأعياد
  holidaysSection: { padding: '8px 0 16px' },
  sectionHeader: { padding: '0 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: 800, margin: 0 },
  holidaysRow: { display: 'flex', gap: 8, padding: '0 20px', overflowX: 'auto' },
  holidayCard: {
    flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '14px 16px', borderRadius: 14, minWidth: 90,
    background: 'rgba(255,255,255,0.025)', border: '1px solid',
    cursor: 'pointer', transition: 'all 0.3s',
  },
  holidayIcon: {
    width: 40, height: 40, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  holidayName: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  holidayMonth: { fontSize: 9, color: '#6B6284', fontWeight: 600 },

  // التنبيهات
  notifSection: { padding: '8px 0 16px' },
  notifRow: { display: 'flex', gap: 8, padding: '0 20px', overflowX: 'auto' },
  notifCard: {
    flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '14px 16px', borderRadius: 14, minWidth: 75,
    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer', transition: 'all 0.3s',
  },
  notifName: { fontSize: 10, fontWeight: 700, marginTop: 4 },
};

export default Home;