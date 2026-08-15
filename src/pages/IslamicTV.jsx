import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';

const ISLAMIC_APP_API = 'https://api.islamic.app/v1/radio/stations';

const GOVT_TV_CHANNELS = [
  {
    id: 'makkah-live',
    nameAr: 'الحرم المكي مباشرة',
    nameEn: 'Masjid al-Haram Live',
    desc: 'بث مباشر من المسجد الحرام والكعبة المشرفة - هيئة الإذاعة السعودية',
    emoji: '🕋',
    color: '#00c896',
    youtubeChannel: 'UCos52azQNBgW63_9uDJoPDA',
    type: 'youtube',
    tags: ['مباشر', 'مكة', 'الحرم'],
    source: 'Saudi Broadcasting Authority',
  },
  {
    id: 'madinah-live',
    nameAr: 'المسجد النبوي مباشرة',
    nameEn: 'Masjid an-Nabawi Live',
    desc: 'بث مباشر من المسجد النبوي بالمدينة المنورة - هيئة الإذاعة السعودية',
    emoji: '🕌',
    color: '#8b5cf6',
    youtubeChannel: 'UCROKYPep-UuODNwyipe6JMw',
    type: 'youtube',
    tags: ['مباشر', 'المدينة', 'النبوي'],
    source: 'Saudi Broadcasting Authority',
  },
  {
    id: 'al-aqsa-live',
    nameAr: 'المسجد الأقصى مباشرة',
    nameEn: 'Al-Aqsa Mosque Live',
    desc: 'بث مباشر من المسجد الأقصى المبارك - إدارة الأوقاف والشؤون الإسلامية بالقدس',
    emoji: '🕌',
    color: '#3b82f6',
    youtubeChannel: 'UCioGGqsAlejh7a4Ve7H12EA',
    type: 'youtube',
    tags: ['مباشر', 'الأقصى', 'فلسطين'],
    source: 'Jerusalem Endowments Department',
  },
  {
    id: 'diyanet-tv',
    nameAr: 'ديانت تي في',
    nameEn: 'Diyanet TV',
    desc: 'قناة رئاسة الشؤون الدينية التركية - بث مباشر',
    emoji: '📺',
    color: '#ef4444',
    youtubeChannel: 'UCdiyanet',
    type: 'youtube',
    tags: ['مباشر', 'تركيا', 'official'],
    source: 'Diyanet İşleri Başkanlığı',
  },
  {
    id: 'qatar-quran',
    nameAr: 'قطر TV - القرآن الكريم',
    nameEn: 'Qatar TV - Holy Quran',
    desc: 'قناة القرآن الكريم - مؤسسة قطر للإعلام',
    emoji: '📖',
    color: '#06b6d4',
    streamUrl: 'https://qatartv.akamaized.net/hls/live/20000612/qtvquran/master.m3u8',
    type: 'hls',
    tags: ['قرآن', 'قطر', 'مباشر'],
    source: 'Qatar Media Corporation',
  },
  {
    id: 'bahrain-quran',
    nameAr: 'قناة القرآن الكريم - البحرين',
    nameEn: 'Bahrain Quran TV',
    desc: 'قناة القرآن الكريم - إذاعة وتلفزيون البحرين',
    emoji: '📖',
    color: '#14b8a6',
    streamUrl: 'https://5c7b683162943.streamlock.net/live/ngrp:bahrainquran_all/playlist.m3u8',
    type: 'hls',
    tags: ['قرآن', 'البحرين', 'مباشر'],
    source: 'Bahrain Radio and Television Corporation',
  },
];

const TAGS_AR = ['الكل', 'مباشر', 'إذاعات', 'قنوات'];

const pageCss = `
@keyframes pulse-live{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes spin-loader{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.tv-wrap{background:#0c0818;min-height:100vh;padding-bottom:100px;font-family:'Segoe UI',Tahoma,sans-serif;color:#fff;direction:rtl}
.tv-hero{background:linear-gradient(170deg,#1c1040 0%,#0c0818 100%);padding:20px 16px 16px;position:relative;overflow:hidden}
.tv-hero::before{content:'';position:absolute;top:-60px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(0,200,150,.15),transparent 70%);pointer-events:none}
.tv-top{display:flex;align-items:center;gap:10px;position:relative;z-index:1;margin-bottom:4px}
.tv-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(0,200,150,.15),rgba(0,200,150,.04));border:1px solid rgba(0,200,150,.15);font-size:22px;flex-shrink:0}
.tv-title{font-size:20px;font-weight:800;color:#fff;margin:0}
.tv-sub{font-size:11px;color:rgba(255,255,255,.35);margin-top:2px;position:relative;z-index:1}
.tv-section{padding:16px}
.tv-section-title{font-size:14px;font-weight:800;color:rgba(255,255,255,.7);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.tv-section-badge{font-size:10px;padding:3px 8px;border-radius:8px;background:rgba(0,200,150,.12);color:#00c896;font-weight:700}
.tv-filters{padding:0 16px 12px;display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.tv-filters::-webkit-scrollbar{display:none}
.tv-filter{padding:7px 16px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.45);white-space:nowrap;transition:all .2s;font-family:inherit;flex-shrink:0}
.tv-filter.on{background:rgba(0,200,150,.12);border-color:rgba(0,200,150,.25);color:#00c896}
.tv-now{padding:0 16px;margin-bottom:16px}
.tv-now-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
.tv-player{background:#151030;border:1px solid rgba(255,255,255,.05);border-radius:18px;overflow:hidden;position:relative}
.tv-player-live{position:absolute;top:12px;left:12px;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.25);font-size:10px;font-weight:700;color:#ef4444;z-index:5}
.tv-player-dot{width:5px;height:5px;border-radius:50%;background:#ef4444;animation:pulse-live 1.5s infinite;display:inline-block}
.tv-player-info{position:absolute;bottom:12px;right:12px;left:12px;padding:10px 14px;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);border-radius:12px;z-index:5}
.tv-player-title{font-size:14px;font-weight:700;color:#fff}
.tv-player-desc{font-size:11px;color:rgba(255,255,255,.55);margin-top:2px}
.tv-video-wrap{position:relative;padding-top:56.25%;background:#0a0518}
.tv-video-wrap iframe,.tv-video-wrap video,.tv-video-wrap audio{position:absolute;top:0;left:0;width:100%;height:100%;border:none;background:#000}
.tv-video-wrap audio{height:50px;top:auto;bottom:0}
.tv-radio-grid{padding:0 16px;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.tv-card{background:#151030;border:1px solid rgba(255,255,255,.05);border-radius:16px;overflow:hidden;cursor:pointer;transition:all .2s;position:relative}
.tv-card:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.1)}
.tv-card:active{transform:scale(.97)}
.tv-card-thumb{position:relative;padding-top:56.25%;background:linear-gradient(135deg,#1a1040,#0c0818)}
.tv-card-thumb-icon{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:36px;opacity:.6}
.tv-card-live{position:absolute;top:6px;left:6px;display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:10px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.2);font-size:8px;font-weight:700;color:#ef4444;z-index:3}
.tv-card-info{padding:10px 12px}
.tv-card-name{font-size:12px;font-weight:700;color:#fff;margin-bottom:2px;line-height:1.3}
.tv-card-desc{font-size:10px;color:rgba(255,255,255,.38);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tv-card-source{font-size:8px;color:rgba(255,255,255,.25);margin-top:4px;font-style:italic}
.tv-card-tags{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}
.tv-card-tag{font-size:8px;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,.04);color:rgba(255,255,255,.35);font-weight:600}
.tv-controls{display:flex;align-items:center;justify-content:center;gap:12px;padding:10px;background:rgba(0,0,0,.3)}
.tv-ctrl-btn{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:all .2s;font-size:18px}
.tv-ctrl-play{background:rgba(0,200,150,.15);color:#00c896}
.tv-ctrl-play:hover{background:rgba(0,200,150,.25)}
.tv-loader{display:flex;align-items:center;justify-content:center;padding:30px;gap:8px;color:rgba(255,255,255,.4);font-size:12px}
.tv-loader-dot{width:6px;height:6px;border-radius:50%;background:#00c896;animation:spin-loader 1s infinite}
.tv-legal{margin:20px 16px;padding:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px}
.tv-legal-title{font-size:11px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.tv-legal-text{font-size:10px;color:rgba(255,255,255,.3);line-height:1.7}
.tv-legal-link{color:#00c896;text-decoration:none;font-weight:600}
`;

function loadHls() {
  if (window.Hls) return;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js';
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

function FeaturedPlayer({ channel }) {
  const { t } = useTranslation();
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [channel?.id]);

  const handlePlay = async () => {
    if (!audioRef.current || !channel?.streamUrl) return;
    try {
      audioRef.current.src = channel.streamUrl;
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  if (!channel) return null;

  if (channel.type === 'youtube') {
    return (
      <div className="tv-player">
        <div className="tv-player-live"><span className="tv-player-dot" />{t.tv?.live || 'مباشر'}</div>
        <div className="tv-video-wrap">
          <iframe
            src={`https://www.youtube.com/embed/live_stream?channel=${channel.youtubeChannel}&autoplay=1&mute=0`}
            style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none' }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={channel.nameAr}
          />
        </div>
        <div className="tv-player-info">
          <div className="tv-player-title">{channel.emoji} {channel.nameAr}</div>
          <div className="tv-player-desc">{channel.desc}</div>
        </div>
      </div>
    );
  }

  if (channel.type === 'hls') {
    return (
      <div className="tv-player">
        <div className="tv-player-live"><span className="tv-player-dot" />{t.tv?.live || 'مباشر'}</div>
        <div className="tv-video-wrap">
          <video
            ref={(el) => {
              if (!el || !channel.streamUrl) return;
              if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls();
                hls.loadSource(channel.streamUrl);
                hls.attachMedia(el);
                hls.on(window.Hls.Events.ERROR, (_, data) => {
                  if (data.fatal) el.pause();
                });
                el.play().catch(() => {});
              } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
                el.src = channel.streamUrl;
                el.play().catch(() => {});
              } else {
                el.src = channel.streamUrl;
                el.play().catch(() => {});
              }
            }}
            controls
            playsInline
          />
        </div>
        <div className="tv-player-info">
          <div className="tv-player-title">{channel.emoji} {channel.nameAr}</div>
          <div className="tv-player-desc">{channel.desc}</div>
        </div>
      </div>
    );
  }

  if (channel.type === 'audio' || channel.type === 'radio') {
    const streamUrl = channel.streamUrl || channel.streamProxyUrl;
    return (
      <div className="tv-player">
        <div className="tv-player-live"><span className="tv-player-dot" />{t.tv?.live || 'مباشر'}</div>
        <div className="tv-video-wrap" style={{ height:120 }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,bottom:50,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a1040,#0c0818)' }}>
            <span style={{ fontSize:60,opacity:.5 }}>{channel.emoji || '📻'}</span>
          </div>
          <audio ref={audioRef} controls style={{ height:50,position:'absolute',bottom:0,width:'100%' }} />
        </div>
        <div className="tv-controls">
          <button className="tv-ctrl-btn tv-ctrl-play" onClick={handlePlay}>
            {playing ? '⏸️' : '▶️'}
          </button>
        </div>
        <div className="tv-player-info">
          <div className="tv-player-title">{channel.emoji || '📻'} {channel.nameAr}</div>
          <div className="tv-player-desc">{channel.desc}</div>
        </div>
      </div>
    );
  }

  return null;
}

export default function IslamicTV() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState(TAGS_AR[0]);
  const TAGS = [
    { key: TAGS_AR[0], label: t.tv?.all || TAGS_AR[0] },
    { key: TAGS_AR[1], label: t.tv?.liveOnly || TAGS_AR[1] },
    { key: TAGS_AR[2], label: t.tv?.radioOnly || TAGS_AR[2] },
    { key: TAGS_AR[3], label: t.tv?.channelsOnly || TAGS_AR[3] },
  ];
  const [featured, setFeatured] = useState(GOVT_TV_CHANNELS[0]);
  const [radioStations, setRadioStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHls();
    fetch(ISLAMIC_APP_API)
      .then(r => r.json())
      .then(data => {
        if (data?.data?.stations) {
          const stations = data.data.stations
            .filter(s => s.online)
            .map(s => ({
              id: s.slug,
              nameAr: s.name,
              nameEn: s.name,
              desc: `${s.language?.toUpperCase() || ''} · ${s.city || s.country || ''}`,
              emoji: '📻',
              color: '#00c896',
              streamProxyUrl: s.streamProxyUrl,
              streamUrl: s.streamUrl || s.streamProxyUrl,
              type: 'radio',
              tags: ['إذاعة'],
              source: s.tags?.join(', ') || 'islamic.app',
            }));
          setRadioStations(stations);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allChannels = [...GOVT_TV_CHANNELS, ...radioStations];

  const filtered = activeFilter === TAGS_AR[0]
    ? allChannels
    : activeFilter === TAGS_AR[2]
      ? radioStations
      : activeFilter === TAGS_AR[3]
        ? GOVT_TV_CHANNELS
        : allChannels.filter(ch => ch.tags?.some(tag => tag.includes(activeFilter)));

  const handleCardClick = (ch) => {
    setFeatured(ch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style>{pageCss}</style>
      <div className="tv-wrap">
        <div className="tv-hero">
          <div className="tv-top">
            <div className="tv-icon">📺</div>
            <div>
              <h1 className="tv-title">{t.tv?.title || 'البث المباشر الإسلامي'}</h1>
              <p className="tv-sub">{t.tv?.subtitle || `${GOVT_TV_CHANNELS.length} قناة حكومية + ${radioStations.length} إذاعة · مجانية · 24/7`}</p>
            </div>
          </div>
        </div>

        <div className="tv-now">
          <div className="tv-now-label">{t.tv?.liveNow || 'البث الآن'}</div>
          <FeaturedPlayer channel={featured} />
        </div>

        <div className="tv-section">
          <div className="tv-section-title">
            {t.tv?.govChannels || '📺 القنوات الحكومية'}
            <span className="tv-section-badge">{GOVT_TV_CHANNELS.length}</span>
          </div>
        </div>

        <div className="tv-radio-grid" style={{ marginBottom:20 }}>
          {GOVT_TV_CHANNELS.map((ch) => (
            <motion.div
              key={ch.id}
              className="tv-card"
              onClick={() => handleCardClick(ch)}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="tv-card-thumb">
                <div className="tv-card-thumb-icon">{ch.emoji}</div>
                <div className="tv-card-live"><span className="tv-player-dot" />{t.tv?.live || 'مباشر'}</div>
              </div>
              <div className="tv-card-info">
                <div className="tv-card-name">{ch.nameAr}</div>
                <div className="tv-card-desc">{ch.desc}</div>
                <div className="tv-card-source">{ch.source}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="tv-section">
          <div className="tv-section-title">
            {t.tv?.radioStations || '📻 إذاعات القرآن'}
            <span className="tv-section-badge">{loading ? '...' : radioStations.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="tv-loader">
            <div className="tv-loader-dot" />
            <div className="tv-loader-dot" style={{ animationDelay: '0.2s' }} />
            <div className="tv-loader-dot" style={{ animationDelay: '0.4s' }} />
            {t.tv?.loading || 'جاري تحميل الإذاعات...'}
          </div>
        ) : (
          <div className="tv-radio-grid">
            {radioStations.slice(0, 12).map((ch) => (
              <motion.div
                key={ch.id}
                className="tv-card"
                onClick={() => handleCardClick(ch)}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="tv-card-thumb">
                  <div className="tv-card-thumb-icon">📻</div>
                </div>
                <div className="tv-card-info">
                  <div className="tv-card-name">{ch.nameAr}</div>
                  <div className="tv-card-desc">{ch.desc}</div>
                  <div className="tv-card-source">{ch.source}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="tv-legal">
          <div className="tv-legal-title">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            {t.tv?.disclaimer || 'إخلاء المسؤولية والحقوق'}
          </div>
          <div className="tv-legal-text">
            هذا التطبيق هو مشغل وسائط ومجمع لروابط البث العامة المتوفرة مجاناً على الإنترنت. لا يستضيف هذا التطبيق أي محتوى على سيرفراته الخاصة.
            <br/><br/>
            <strong>مصادر البث:</strong><br/>
            • القنوات الحكومية: روابط رسمية مأخوذة مباشرة من مواقع الهيئات الحكومية المعنية<br/>
            • إذاعات القرآن: عبر <a href="https://islamic.app" target="_blank" rel="noopener" className="tv-legal-link">islamic.app API</a> (مرخص MIT، بث مباشر فقط بدون تحميل)<br/>
            • البث المباشر عبر YouTube يخضع لـ <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener" className="tv-legal-link">YouTube Terms of Service</a>
            <br/><br/>
            <strong>DMCA / إبلاغ عن انتهاك:</strong><br/>
            إذا كنت تملك حقوقاً في أي محتوى يظهر في هذا التطبيق وتريد طلب حذفه، يرجى التواصل معنا عبر:
            <br/>📧 Email: dmca@azkar-app.com
            <br/>سنقوم بإزالة المحتوى فوراً خلال 24 ساعة من استلام الطلب.
            <br/><br/>
            <strong>Copyright © 2026 Azkar App. جميع الحقوق محفوظة.</strong>
          </div>
        </div>
      </div>
    </>
  );
}
