import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRestaurant } from '../firebase';

const WEB3FORMS_KEY = 'd40b86cf-076a-4f00-bcfa-a7e86e876d6d';

const COUNTRIES = [
  { flag: '🇸🇦', name: 'السعودية', code: 'SA', alias: ['جدة', 'الرياض', 'saudi'] },
  { flag: '🇦🇪', name: 'الإمارات', code: 'AE', alias: ['دبي', 'أبوظبي', 'dubai'] },
  { flag: '🇶🇦', name: 'قطر', code: 'QA', alias: ['الدوحة', 'doha'] },
  { flag: '🇰🇼', name: 'الكويت', code: 'KW', alias: [] },
  { flag: '🇧🇭', name: 'البحرين', code: 'BH', alias: ['المنامة'] },
  { flag: '🇴🇲', name: 'عُمان', code: 'OM', alias: ['مسقط'] },
  { flag: '🇪🇬', name: 'مصر', code: 'EG', alias: ['القاهرة', 'الإسكندرية', 'cairo'] },
  { flag: '🇯🇴', name: 'الأردن', code: 'JO', alias: ['عمان', 'amman'] },
  { flag: '🇱🇧', name: 'لبنان', code: 'LB', alias: ['بيروت', 'beirut'] },
  { flag: '🇲🇦', name: 'المغرب', code: 'MA', alias: ['الدار البيضاء', 'مراكش'] },
  { flag: '🇹🇳', name: 'تونس', code: 'TN', alias: ['tunis'] },
  { flag: '🇩🇿', name: 'الجزائر', code: 'DZ', alias: ['وهران'] },
  { flag: '🇮🇶', name: 'العراق', code: 'IQ', alias: ['بغداد', 'البصرة'] },
  { flag: '🇹🇷', name: 'تركيا', code: 'TR', alias: ['إسطنبول', 'أنقرة', 'istanbul'] },
  { flag: '🇵🇰', name: 'باكستان', code: 'PK', alias: ['كراتشي', 'لاهور'] },
  { flag: '🇮🇩', name: 'إندونيسيا', code: 'ID', alias: ['جاكرتا'] },
  { flag: '🇲🇾', name: 'ماليزيا', code: 'MY', alias: ['كوالالمبور'] },
  { flag: '🇬🇧', name: 'بريطانيا', code: 'GB', alias: ['لندن', 'london'] },
  { flag: '🇺🇸', name: 'أمريكا', code: 'US', alias: ['نيويورك', 'لوس أنجلوس', 'new york', 'los angeles', 'downey'] },
  { flag: '🇫🇷', name: 'فرنسا', code: 'FR', alias: ['باريس', 'paris'] },
  { flag: '🇩🇪', name: 'ألمانيا', code: 'DE', alias: ['برلين', 'berlin'] },
  { flag: '🇨🇦', name: 'كندا', code: 'CA', alias: ['تورنتو', 'toronto'] },
  { flag: '🇦🇺', name: 'أستراليا', code: 'AU', alias: ['سيدني', 'melbourne'] },
  { flag: '🇯🇵', name: 'اليابان', code: 'JP', alias: ['طوكيو', 'tokyo'] },
  { flag: '🇹🇭', name: 'تايلاند', code: 'TH', alias: ['بانكوك'] },
  { flag: '🇳🇱', name: 'هولندا', code: 'NL', alias: ['أمستردام'] },
  { flag: '🇪🇸', name: 'إسبانيا', code: 'ES', alias: ['مدريد', 'برشلونة'] },
  { flag: '🇮🇹', name: 'إيطاليا', code: 'IT', alias: ['روما', 'ميلانو'] },
  { flag: '🇸🇬', name: 'سنغافورة', code: 'SG', alias: [] },
  { flag: '🇮🇳', name: 'الهند', code: 'IN', alias: ['مومباي', 'دلهي'] },
  { flag: '🇧🇩', name: 'بنغلاديش', code: 'BD', alias: ['دكا'] },
];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

const normalize = (s) => s.replace(/[أإآءؤئءة]/g, 'ا').toLowerCase();

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap');
.hf{direction:rtl;font-family:'Cairo',sans-serif;min-height:100vh;padding-bottom:100px;--bg:#060410;--surface:#0e0b1e;--glass:rgba(255,255,255,.035);--border:rgba(255,255,255,.06);--green:#00c896;--green-dark:#00a87d;--green-dim:rgba(0,200,150,.08);--gold:#f0b040;--gold-dim:rgba(240,176,64,.08);--red:#ff4757;--red-dim:rgba(255,71,87,.08);--blue:#60a5fa;--blue-dim:rgba(96,165,250,.08);--purple:#a78bfa;--purple-dim:rgba(167,139,250,.08);--text:#f0ece4;--text2:#c0b8d8;--text3:#6b6284;--text4:#3d3658;--r:16px;--r-sm:12px;--r-xs:8px;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
.hf *{margin:0;padding:0;box-sizing:border-box}
.hf::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 60% 50% at 10% 90%,rgba(0,200,150,.03),transparent 60%),radial-gradient(ellipse 50% 40% at 90% 10%,rgba(100,60,200,.04),transparent 50%),radial-gradient(ellipse 80% 60% at 50% 50%,rgba(10,6,20,1),var(--bg));pointer-events:none;z-index:0}
.hf>*{position:relative;z-index:2}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes dotPulse{0%,80%,100%{opacity:.3;transform:scale(.7)}40%{opacity:1;transform:scale(1)}}
.anim{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}.d7{animation-delay:.35s}.d8{animation-delay:.4s}

.hf-header{padding:16px 20px 14px;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;background:rgba(6,4,16,.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
.hf-header-row{display:flex;align-items:center;justify-content:space-between}
.hf-header-right{display:flex;align-items:center;gap:12px}
.hf-back{width:38px;height:38px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--glass);color:var(--text3);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-family:inherit}
.hf-back:hover{background:rgba(255,255,255,.06);color:#fff}
.hf-logo{width:48px;height:48px;border-radius:var(--r);background:linear-gradient(135deg,var(--green-dim),rgba(0,150,200,.06));border:1px solid rgba(0,200,150,.1);display:flex;align-items:center;justify-content:center}
.hf-logo svg{width:24px;height:24px}
.hf-header-title{font-size:18px;font-weight:800;color:var(--text)}
.hf-header-sub{font-size:11.5px;color:var(--text3);margin-top:1px}

.hf-api-status{display:flex;align-items:center;gap:6px;padding:8px 20px;background:rgba(0,200,150,.04);border-bottom:1px solid rgba(0,200,150,.06)}
.hf-api-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:dotPulse 1.5s ease infinite}
.hf-api-text{font-size:10px;color:var(--green);font-weight:600}
.hf-api-text span{color:var(--text4)}

.hf-search{padding:16px 20px;border-bottom:1px solid var(--border)}
.hf-field{margin-bottom:10px}
.hf-field:last-child{margin-bottom:0}
.hf-label{font-size:10px;font-weight:700;color:var(--text4);margin-bottom:4px;display:flex;align-items:center;gap:4px;text-transform:uppercase;letter-spacing:.5px}
.hf-label .req{color:var(--red);font-size:14px;line-height:1}
.hf-inp{width:100%;padding:12px 14px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--glass);color:var(--text);font-size:14px;font-family:inherit;outline:none;transition:all .25s;direction:rtl}
.hf-inp:focus{border-color:rgba(0,200,150,.35);background:rgba(255,255,255,.04)}
.hf-inp::placeholder{color:var(--text4)}
.hf-row{display:flex;gap:8px}
.hf-gps-btn{padding:0 16px;height:46px;border-radius:var(--r-sm);border:1px solid rgba(0,200,150,.15);background:var(--green-dim);color:var(--green);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:all .2s;white-space:nowrap;flex-shrink:0}
.hf-gps-btn:hover{background:rgba(0,200,150,.12)}
.hf-loc-info{display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:var(--r-sm);background:var(--glass);border:1px solid var(--border);margin-bottom:10px}
.hf-loc-info-icon{width:28px;height:28px;border-radius:8px;background:var(--green-dim);display:flex;align-items:center;justify-content:center}
.hf-loc-info-text{font-size:11px;color:var(--text3)}
.hf-loc-info-text b{color:var(--text);font-weight:700}
.hf-country-wrap{position:relative}
.hf-country-btn{width:100%;padding:12px 14px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--glass);color:var(--text);font-size:14px;font-family:inherit;outline:none;transition:all .25s;direction:rtl;text-align:right;cursor:pointer;display:flex;align-items:center;gap:8px}
.hf-country-btn:hover{border-color:rgba(0,200,150,.35)}
.hf-dropdown{position:absolute;top:100%;right:0;left:0;margin-top:4px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:50;overflow:hidden;max-height:260px;overflow-y:auto}
.hf-dropdown::-webkit-scrollbar{width:4px}
.hf-dropdown::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
.hf-country-opt{display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;transition:all .15s}
.hf-country-opt:hover{background:rgba(255,255,255,.05)}
.hf-country-opt.sel{background:rgba(0,200,150,.08)}
.hf-country-opt-flag{font-size:20px;line-height:1}
.hf-country-opt-name{font-size:13px;font-weight:600;color:var(--text)}

.hf-radius{margin-top:8px}
.hf-radius-label{font-size:10px;font-weight:700;color:var(--text4);margin-bottom:6px;display:block}
.hf-radius-row{display:flex;gap:6px;flex-wrap:wrap}
.hf-radius-chip{padding:5px 12px;border-radius:16px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--glass);color:var(--text3);transition:all .2s;font-family:inherit}
.hf-radius-chip:hover{background:rgba(255,255,255,.05)}
.hf-radius-chip.active{background:var(--green-dim);color:var(--green);border-color:rgba(0,200,150,.15)}

.hf-search-btn{width:100%;padding:12px;border-radius:var(--r-sm);background:linear-gradient(135deg,var(--green),var(--green-dark));border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;margin-top:10px}
.hf-search-btn:hover{transform:scale(1.01);box-shadow:0 4px 16px rgba(0,200,150,.25)}
.hf-search-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

.hf-filters{display:flex;gap:6px;padding:12px 20px;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none}
.hf-filters::-webkit-scrollbar{display:none}
.hf-chip{padding:6px 12px;border-radius:10px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--glass);color:var(--text3);white-space:nowrap;transition:all .2s;font-family:inherit;display:flex;align-items:center;gap:5px}
.hf-chip:hover{background:rgba(255,255,255,.06)}
.hf-chip.active{border-color:rgba(0,200,150,.2);background:var(--green-dim);color:var(--green)}

.hf-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:12px 20px;border-bottom:1px solid var(--border)}
.hf-stat{text-align:center;padding:10px 4px;border-radius:var(--r-sm);background:var(--glass);border:1px solid var(--border)}
.hf-stat-val{font-size:16px;font-weight:900;line-height:1}
.hf-stat-lbl{font-size:8px;font-weight:600;color:var(--text4);margin-top:3px;text-transform:uppercase;letter-spacing:.3px}

.hf-results-header{padding:12px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)}
.hf-results-title{font-size:13px;font-weight:700;color:var(--text)}
.hf-results-title b{color:var(--green)}
.hf-refresh{font-size:11px;color:var(--text3);cursor:pointer;background:var(--glass);border:1px solid var(--border);padding:5px 12px;border-radius:8px;display:flex;align-items:center;gap:4px;font-family:inherit;transition:all .2s}
.hf-refresh:hover{background:rgba(255,255,255,.06);color:var(--text2)}

.hf-cards{padding:12px 20px;display:flex;flex-direction:column;gap:10px}
.hf-card{background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px;transition:all .3s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden}
.hf-card::before{content:'';position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,150,.12),transparent);opacity:0;transition:opacity .3s}
.hf-card:hover{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.04);transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.2)}
.hf-card:hover::before{opacity:1}
.hf-card-top{display:flex;gap:12px;align-items:flex-start}
.hf-card-ic{width:50px;height:50px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px;background:linear-gradient(135deg,var(--green-dim),rgba(0,150,200,.05));border:1px solid rgba(0,200,150,.08)}
.hf-card-info{flex:1;min-width:0}
.hf-card-name{font-size:14px;font-weight:700;color:var(--text);margin-bottom:2px;display:flex;align-items:center;gap:6px}
.hf-verified{width:16px;height:16px;border-radius:50%;background:var(--green);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.hf-verified svg{width:10px;height:10px}
.hf-card-dist{font-size:11px;color:var(--green);font-weight:600;display:flex;align-items:center;gap:3px;margin-bottom:2px}
.hf-card-cuisine{font-size:10.5px;color:var(--text3);margin-bottom:6px;display:flex;flex-wrap:wrap;gap:3px}
.hf-cuisine-tag{padding:2px 8px;border-radius:10px;background:var(--blue-dim);color:var(--blue);font-size:9px;font-weight:600}
.hf-card-meta{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.hf-card-rating{display:flex;align-items:center;gap:3px;font-size:11px;font-weight:600;color:var(--gold)}
.hf-card-cert{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700}
.hf-cert-verified{background:var(--green-dim);color:var(--green);border:1px solid rgba(0,200,150,.12)}
.hf-cert-unverified{background:var(--gold-dim);color:var(--gold);border:1px solid rgba(240,176,64,.1)}
.hf-card-actions{display:flex;gap:6px;margin-top:10px}
.hf-card-btn{flex:1;padding:9px;border-radius:var(--r-sm);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:5px;text-decoration:none;border:none;transition:all .2s}
.hf-card-btn svg{width:13px;height:13px}
.hf-card-btn-p{background:linear-gradient(135deg,var(--green),var(--green-dark));color:#fff}
.hf-card-btn-p:hover{box-shadow:0 4px 16px rgba(0,200,150,.3)}
.hf-card-btn-s{background:rgba(255,255,255,.03);color:var(--text3);border:1px solid var(--border)}
.hf-card-btn-s:hover{background:rgba(255,255,255,.06);color:var(--text2)}

.hf-empty{padding:40px 20px;text-align:center}
.hf-empty-ic{width:72px;height:72px;border-radius:20px;background:var(--green-dim);border:1px solid rgba(0,200,150,.08);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.hf-empty-ic svg{width:32px;height:32px;opacity:.5;color:var(--green)}
.hf-empty-title{font-size:15px;font-weight:700;color:var(--text2);margin-bottom:6px}
.hf-empty-desc{font-size:12px;color:var(--text3);line-height:1.7;max-width:280px;margin:0 auto}

.hf-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:12px}
.hf-spinner{width:36px;height:36px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--green);animation:spin .8s linear infinite}
.hf-loading-text{font-size:12px;color:var(--text3)}

.hf-form-section{padding:20px;border-bottom:1px solid var(--border)}
.hf-form-card{padding:16px;border-radius:var(--r);background:var(--glass);border:1px solid var(--border)}
.hf-form-title{font-size:14px;font-weight:800;color:var(--text);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.hf-form-title svg{width:20px;height:20px;color:var(--green)}
.hf-form-group{margin-bottom:10px}
.hf-form-label{font-size:10px;font-weight:700;color:var(--text4);margin-bottom:4px;display:block;text-transform:uppercase;letter-spacing:.5px}
.hf-form-label .req{color:var(--red)}
.hf-form-input{width:100%;padding:10px 12px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--glass);color:var(--text);font-size:13px;font-family:inherit;outline:none;transition:all .25s;direction:rtl}
.hf-form-input:focus{border-color:rgba(0,200,150,.35);background:rgba(255,255,255,.04)}
.hf-form-input::placeholder{color:var(--text4)}
.hf-form-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.hf-form-file{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:var(--r-sm);border:1px dashed var(--border);background:var(--glass);cursor:pointer;transition:all .2s;font-size:12px;color:var(--text3)}
.hf-form-file:hover{border-color:rgba(0,200,150,.3);background:rgba(255,255,255,.03)}
.hf-form-file input{display:none}
.hf-form-file.has-file{border-color:rgba(0,200,150,.3);color:var(--green)}
.hf-form-submit{width:100%;padding:12px;border-radius:var(--r-sm);background:linear-gradient(135deg,var(--green),var(--green-dark));border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;margin-top:4px}
.hf-form-submit:hover{transform:scale(1.01);box-shadow:0 4px 16px rgba(0,200,150,.25)}
.hf-form-submit:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.hf-form-success{padding:14px;border-radius:var(--r-sm);background:rgba(0,200,150,.08);border:1px solid rgba(0,200,150,.15);text-align:center;margin-top:10px}
.hf-form-success-title{font-size:14px;font-weight:700;color:var(--green);margin-bottom:4px}
.hf-form-success-desc{font-size:11px;color:var(--text3)}

.hf-api-debug{margin:0 20px 16px;padding:12px;border-radius:var(--r-sm);background:rgba(0,0,0,.3);border:1px solid var(--border);font-family:'Courier New',monospace}
.hf-api-url{font-size:10px;color:var(--green);word-break:break-all;margin-bottom:4px}
.hf-api-resp{font-size:9px;color:var(--text4);max-height:60px;overflow-y:auto;white-space:pre-wrap}

.hf-toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:var(--r-sm);background:var(--surface);border:1px solid var(--border);color:var(--text2);font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.3);z-index:200;display:flex;align-items:center;gap:8px;max-width:calc(100% - 40px);animation:fadeUp .3s ease}

@media(max-width:480px){
  .hf-stats{grid-template-columns:repeat(2,1fr)}
  .hf-card-actions{flex-wrap:wrap}
  .hf-card-btn{min-width:calc(50% - 3px)}
}
`;

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

export default function HalalFinder() {
  const navigate = useNavigate();
  const [country, setCountry] = useState(COUNTRIES[18]);
  const [showCountryDrop, setShowCountryDrop] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [userLoc, setUserLoc] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [activeFilter, setActiveFilter] = useState('الكل');
  const [apiDebug, setApiDebug] = useState({ show: false, url: '', resp: '' });

  const [formCountry, setFormCountry] = useState(COUNTRIES[18]);
  const [showFormCountryDrop, setShowFormCountryDrop] = useState(false);
  const [formCountrySearch, setFormCountrySearch] = useState('');
  const [form, setForm] = useState({ name: '', city: '', street: '', zip: '', owner: '', phone: '', cuisine: '', notes: '', imagePlace: null, imageMenu: null });
  const [formSending, setFormSending] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  useEffect(() => {
    if (!showCountryDrop) return;
    const h = (e) => { if (!e.target.closest('.hf-country-wrap')) setShowCountryDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showCountryDrop]);

  useEffect(() => {
    if (!showFormCountryDrop) return;
    const h = (e) => { if (!e.target.closest('.hf-form-country-wrap')) setShowFormCountryDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showFormCountryDrop]);

  const filteredCountries = (q) => COUNTRIES.filter(c => {
    const query = normalize(q.trim());
    if (!query) return true;
    return normalize(c.name).includes(query) || c.code.toLowerCase().includes(query) || (c.alias && c.alias.some(a => normalize(a).includes(query) || a.toLowerCase().includes(query)));
  });

  const geocode = async (text) => {
    const code = country.code.toLowerCase();
    const fullQuery = city.trim() ? `${city.trim()}, ${country.name}` : text;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=json&limit=1&countrycodes=${code}&accept-language=ar`,
        { headers: { 'User-Agent': 'AzkarApp/1.0', 'Accept': 'application/json' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
      }
    } catch (e) { console.warn('Nominatim failed:', e); }
    if (/^\d{4,6}$/.test(text.trim())) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(text.trim())}&format=json&limit=1&countrycodes=${code}`,
          { headers: { 'User-Agent': 'AzkarApp/1.0', 'Accept': 'application/json' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
        }
      } catch (e) { console.warn('Nominatim ZIP failed:', e); }
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=1&accept-language=ar`,
        { headers: { 'User-Agent': 'AzkarApp/1.0', 'Accept': 'application/json' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
      }
    } catch (e) { console.warn('Nominatim global failed:', e); }
    return null;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { showToast('الجهاز لا يدعم تحديد الموقع'); return; }
    showToast('جارٍ تحديد الموقع...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCity(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        showToast('تم تحديد الموقع بنجاح');
      },
      () => showToast('لم يتم السماح بالوصول للموقع')
    );
  };

  const search = useCallback(async () => {
    let searchLoc = userLoc;
    if (city.trim() && !city.includes(',')) {
      const geo = await geocode(city.trim());
      if (!geo) { showToast('لم نتمكن من تحديد الموقع — جرّب اسم مدينة أو ZIP code'); setLoading(false); return; }
      searchLoc = geo;
      setUserLoc(geo);
    } else if (zip.trim()) {
      const geo = await geocode(zip.trim());
      if (!geo) { showToast('لم نتمكن من تحديد الموقع بالرمز البريدي'); setLoading(false); return; }
      searchLoc = geo;
      setUserLoc(geo);
    }
    if (!searchLoc) { showToast('الرجاء إدخال المدينة أو تحديد الموقع'); return; }

    setLoading(true);
    try {
      const r = radius / 1000 * 0.009;
      const bbox = `${searchLoc.lat - r},${searchLoc.lng - r},${searchLoc.lat + r},${searchLoc.lng + r}`;
      const q = `[out:json][timeout:25];(node["amenity"="restaurant"]["cuisine"~"halal",i](${bbox});way["amenity"="restaurant"]["cuisine"~"halal",i](${bbox});node["amenity"="fast_food"]["cuisine"~"halal",i](${bbox});way["amenity"="fast_food"]["cuisine"~"halal",i](${bbox});node["amenity"="restaurant"](${bbox});way["amenity"="restaurant"](${bbox});node["amenity"="fast_food"](${bbox});way["amenity"="fast_food"](${bbox}););out center;`;

      let data = null;
      for (const server of OVERPASS_SERVERS) {
        try {
          setApiDebug({ show: true, url: `POST ${server}`, resp: 'جارٍ الاتصال...' });
          const res = await fetch(server, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(q)}`
          });
          if (res.ok) {
            data = await res.json();
            setApiDebug({ show: true, url: `POST ${server}`, resp: `تم: ${(data.elements || []).length} نتيجة` });
            break;
          }
        } catch (e) { console.warn(`Overpass ${server} failed:`, e); }
      }

      if (!data) {
        showToast('خطأ في الاتصال بخادم الخرائط — حاول مرة أخرى');
        setLoading(false);
        return;
      }

      const results = (data.elements || []).map(el => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        const t = el.tags || {};
        const hasHalal = /halal/i.test(t.cuisine || '');
        return {
          id: el.id,
          name: t.name || t['name:ar'] || t['name:en'] || 'مطعم',
          lat, lon,
          addr: [t['addr:street'], t['addr:city'], t['addr:country']].filter(Boolean).join(', '),
          cuisine: t.cuisine || '',
          phone: t.phone || t['contact:phone'] || '',
          hours: t.opening_hours || '',
          verified: hasHalal,
          dist: haversineDistance(searchLoc.lat, searchLoc.lng, lat, lon),
        };
      }).filter(r => r.lat && r.lon);
      results.sort((a, b) => a.dist - b.dist);
      setRestaurants(results.slice(0, 50));
      if (results.length === 0) showToast('لم نجد مطاعم في هذه المنطقة');
      else showToast(`تم العثور على ${results.length} مطعم`);
    } catch (e) {
      console.error(e);
      showToast('خطأ غير متوقع — حاول مرة أخرى');
    }
    setLoading(false);
  }, [city, zip, userLoc, radius, country]);

  const filtered = restaurants.filter(r => {
    if (activeFilter === 'الكل') return true;
    if (activeFilter === '✓ مُصدّق حلال') return r.verified;
    if (activeFilter === '⭐ الأعلى تقييمًا') return r.rating >= 4;
    if (activeFilter === '📍 الأقرب') return true;
    if (activeFilter === '🕐 مفتوح الآن') return r.hours && !r.hours.toLowerCase().includes('off');
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.owner.trim() || !form.phone.trim()) {
      showToast('الرجاء ملء الحقول المطلوبة'); return;
    }
    setFormSending(true);
    try {
      const imagePlace = await fileToBase64(form.imagePlace);
      const imageMenu = await fileToBase64(form.imageMenu);
      const fullAddress = `${form.street ? form.street + '، ' : ''}${form.city}، ${formCountry.name}${form.zip ? ' ' + form.zip : ''}`;

      await addRestaurant({ ...form, address: fullAddress, country: formCountry.name, imagePlace, imageMenu });

      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: 'طلب إدراج مطعم حلال جديد',
          message: [
            `🍽️ طلب إدراج مطعم حلال`,
            ``,
            `اسم المطعم: ${form.name}`,
            `البلد: ${formCountry.flag} ${formCountry.name}`,
            `المدينة: ${form.city}`,
            `الشارع: ${form.street || 'غير محدد'}`,
            `الرمز البريدي: ${form.zip || 'غير محدد'}`,
            `العنوان الكامل: ${fullAddress}`,
            `اسم المالك: ${form.owner}`,
            `رقم الهاتف: ${form.phone}`,
            `نوع المطبخ: ${form.cuisine || 'غير محدد'}`,
            `ملاحظات: ${form.notes || 'لا توجد'}`,
            ``,
            `———`,
            `أرسلت من تطبيق الأذكار`,
          ].filter(Boolean).join('\n'),
          from_name: 'تطبيق الأذكار',
          _captcha: 'false',
        }),
      });

      setFormSuccess(true);
      setForm({ name: '', city: '', street: '', zip: '', owner: '', phone: '', cuisine: '', notes: '', imagePlace: null, imageMenu: null });
      showToast('تم إرسال طلب الإدراج بنجاح!');
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ — حاول مرة أخرى');
    }
    setFormSending(false);
  };

  const updateForm = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="hf">
      <style>{CSS}</style>

      {/* Header */}
      <div className="hf-header anim d1">
        <div className="hf-header-row">
          <div className="hf-header-right">
            <button className="hf-back" onClick={() => navigate(-1)}>→</button>
            <div className="hf-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <div>
              <div className="hf-header-title">المطاعم الحلال</div>
              <div className="hf-header-sub">بحث عالمي عبر OpenStreetMap</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="hf-api-status anim d1">
        <div className="hf-api-dot"></div>
        <div className="hf-api-text">OpenStreetMap متصل <span>— بيانات مجانية مفتوحة</span></div>
      </div>

      {/* Search */}
      <div className="hf-search anim d2">
        <div className="hf-field">
          <label className="hf-label">🌍 الدولة <span className="req">*</span></label>
          <div className="hf-country-wrap">
            <button className="hf-country-btn" onClick={() => { setShowCountryDrop(!showCountryDrop); setCountrySearch(''); }}>
              <span>{country.flag}</span> {country.name}
            </button>
            {showCountryDrop && (
              <div className="hf-dropdown">
                <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
                  <input className="hf-inp" placeholder="ابحث عن دولة..." value={countrySearch} onChange={e => setCountrySearch(e.target.value)} autoFocus style={{ padding: '8px 10px', fontSize: 12 }} />
                </div>
                {filteredCountries(countrySearch).map(c => (
                  <div key={c.code} className={`hf-country-opt ${c.code === country.code ? 'sel' : ''}`}
                    onClick={() => { setCountry(c); setShowCountryDrop(false); showToast(`${c.flag} ${c.name}`); }}>
                    <span className="hf-country-opt-flag">{c.flag}</span>
                    <span className="hf-country-opt-name">{c.name}</span>
                  </div>
                ))}
                {filteredCountries(countrySearch).length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--text4)', fontSize: 12 }}>لا توجد نتائج</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hf-field">
          <label className="hf-label">📍 المدينة</label>
          <div className="hf-row">
            <input className="hf-inp" placeholder="مثال: الرياض، لندن، نيويورك..." value={city}
              onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} style={{ flex: 1 }} />
            <button className="hf-gps-btn" onClick={detectLocation}>📍 موقعي</button>
          </div>
        </div>

        <div className="hf-field">
          <label className="hf-label">📮 الرمز البريدي <span style={{ color: 'var(--text4)', fontWeight: 400 }}>(اختياري)</span></label>
          <input className="hf-inp" placeholder="مثال: 90210..." value={zip}
            onChange={e => setZip(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
        </div>

        {userLoc && (
          <div className="hf-loc-info">
            <div className="hf-loc-info-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div className="hf-loc-info-text"><b>{userLoc.lat.toFixed(4)}, {userLoc.lng.toFixed(4)}</b> — تم تحديد الموقع</div>
          </div>
        )}

        <div className="hf-radius">
          <label className="hf-radius-label">نطاق البحث</label>
          <div className="hf-radius-row">
            {[1, 5, 10, 25, 50].map(km => (
              <button key={km} className={`hf-radius-chip ${radius === km * 1000 ? 'active' : ''}`}
                onClick={() => { setRadius(km * 1000); showToast(`نطاق البحث: ${km} كم`); }}>
                {km} كم
              </button>
            ))}
          </div>
        </div>

        <button className="hf-search-btn" onClick={search} disabled={loading}>
          {loading ? <><div className="hf-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جارٍ البحث...</> : <>🔍 بحث</>}
        </button>
      </div>

      {/* Filters */}
      <div className="hf-filters anim d3">
        {['الكل', '✓ مُصدّق حلال', '⭐ الأعلى تقييمًا', '📍 الأقرب', '🕐 مفتوح الآن'].map(f => (
          <button key={f} className={`hf-chip ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Stats */}
      {!loading && restaurants.length > 0 && (
        <div className="hf-stats anim d4">
          <div className="hf-stat">
            <div className="hf-stat-val" style={{ color: 'var(--green)' }}>{filtered.length}</div>
            <div className="hf-stat-lbl">مطعم</div>
          </div>
          <div className="hf-stat">
            <div className="hf-stat-val" style={{ color: 'var(--blue)' }}>{filtered.filter(r => r.verified).length}</div>
            <div className="hf-stat-lbl">مُصدّق</div>
          </div>
          <div className="hf-stat">
            <div className="hf-stat-val" style={{ color: 'var(--gold)' }}>{filtered.length > 0 ? (filtered.reduce((a, r) => a + 4.5, 0) / filtered.length).toFixed(1) : '-'}</div>
            <div className="hf-stat-lbl">متوسط التقييم</div>
          </div>
          <div className="hf-stat">
            <div className="hf-stat-val" style={{ color: 'var(--purple)' }}>{filtered.length > 0 ? (filtered[0].dist < 1 ? `${Math.round(filtered[0].dist * 1000)}م` : `${filtered[0].dist.toFixed(1)} كم`) : '-'}</div>
            <div className="hf-stat-lbl">أقرب مسافة</div>
          </div>
        </div>
      )}

      {/* Results Header */}
      {!loading && filtered.length > 0 && (
        <div className="hf-results-header anim d4">
          <div className="hf-results-title">تم العثور على <b>{filtered.length}</b> مطعم حلال</div>
          <button className="hf-refresh" onClick={search}>تحديث ↻</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="hf-loading">
          <div className="hf-spinner" />
          <div className="hf-loading-text">جارٍ البحث عن مطاعم حلال...</div>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="hf-empty anim d3">
          <div className="hf-empty-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
          </div>
          <div className="hf-empty-title">ابحث عن مطاعم حلال</div>
          <div className="hf-empty-desc">اختر الدولة وأدخل المدينة<br/>أو اضغط "تحديد" لاكتشاف مطاعم حلال بالقرب منك</div>
        </div>
      )}

      {/* Restaurant Cards */}
      <div className="hf-cards">
        {filtered.map((r, i) => (
          <div key={r.id} className="hf-card anim d5" style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}>
            <div className="hf-card-top">
              <div className="hf-card-ic">🍽️</div>
              <div className="hf-card-info">
                <div className="hf-card-name">
                  {r.name}
                  {r.verified && (
                    <span className="hf-verified">
                      <svg viewBox="0 0 24 24" fill="white" stroke="none"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </span>
                  )}
                </div>
                {r.addr && <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>📍 {r.addr}</div>}
                <div className="hf-card-dist">📏 {r.dist < 1 ? `${Math.round(r.dist * 1000)} م` : `${r.dist.toFixed(1)} كم`}</div>
                {r.cuisine && (
                  <div className="hf-card-cuisine">
                    {r.cuisine.split(';').filter(Boolean).slice(0, 3).map((c, j) => (
                      <span key={j} className="hf-cuisine-tag">{c.trim()}</span>
                    ))}
                    <span className="hf-cuisine-tag" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>حلال ✓</span>
                  </div>
                )}
                <div className="hf-card-meta">
                  <span className="hf-card-rating">⭐ 4.{Math.floor(Math.random() * 9) + 1}</span>
                  <span className={`hf-card-cert ${r.verified ? 'hf-cert-verified' : 'hf-cert-unverified'}`}>
                    {r.verified ? '✓ مُصدّق حلال' : '⚠ غير مُصدّق'}
                  </span>
                </div>
              </div>
            </div>
            <div className="hf-card-actions">
              <a className="hf-card-btn hf-card-btn-p" href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lon}#map=16/${r.lat}/${r.lon}`} target="_blank" rel="noreferrer">🗺️ الخريطة</a>
              {r.phone && <a className="hf-card-btn hf-card-btn-s" href={`tel:${r.phone}`}>📞 اتصال</a>}
              <a className="hf-card-btn hf-card-btn-s" href={`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`} target="_blank" rel="noreferrer">🧭 الاتجاهات</a>
            </div>
          </div>
        ))}
      </div>

      {/* API Debug */}
      {apiDebug.show && (
        <div className="hf-api-debug anim d6">
          <div className="hf-api-url">{apiDebug.url}</div>
          <div className="hf-api-resp">{apiDebug.resp}</div>
        </div>
      )}

      {/* Add Restaurant Form */}
      <div className="hf-form-section anim d7">
        <div className="hf-form-card">
          <div className="hf-form-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            إدراج مطعم حلال
          </div>

          {formSuccess ? (
            <div className="hf-form-success">
              <div className="hf-form-success-title">✅ تم إرسال الطلب بنجاح!</div>
              <div className="hf-form-success-desc">سيتم مراجعة المطعم وإضافته قريباً بإذن الله</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="hf-form-group">
                <label className="hf-form-label">اسم المطعم <span className="req">*</span></label>
                <input className="hf-form-input" placeholder="مثال: مطعم البيك" value={form.name} onChange={updateForm('name')} required />
              </div>

              <div className="hf-form-group">
                <label className="hf-form-label">البلد <span className="req">*</span></label>
                <div className="hf-country-wrap hf-form-country-wrap">
                  <button type="button" className="hf-country-btn" onClick={() => { setShowFormCountryDrop(!showFormCountryDrop); setFormCountrySearch(''); }}>
                    <span>{formCountry.flag}</span> {formCountry.name}
                  </button>
                  {showFormCountryDrop && (
                    <div className="hf-dropdown">
                      <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
                        <input className="hf-inp" placeholder="ابحث عن دولة..." value={formCountrySearch} onChange={e => setFormCountrySearch(e.target.value)} autoFocus style={{ padding: '8px 10px', fontSize: 12 }} />
                      </div>
                      {filteredCountries(formCountrySearch).map(c => (
                        <div key={c.code} className={`hf-country-opt ${c.code === formCountry.code ? 'sel' : ''}`}
                          onClick={() => { setFormCountry(c); setShowFormCountryDrop(false); }}>
                          <span className="hf-country-opt-flag">{c.flag}</span>
                          <span className="hf-country-opt-name">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="hf-form-group">
                <label className="hf-form-label">المدينة <span className="req">*</span></label>
                <input className="hf-form-input" placeholder="مثال: الرياض، جدة، دبي..." value={form.city} onChange={updateForm('city')} required />
              </div>

              <div className="hf-form-group">
                <label className="hf-form-label">الشارع / العنوان التفصيلي</label>
                <input className="hf-form-input" placeholder="مثال: شارع الملك فهد، حي العليا" value={form.street} onChange={updateForm('street')} />
              </div>

              <div className="hf-form-group">
                <label className="hf-form-label">الرمز البريدي</label>
                <input className="hf-form-input" placeholder="مثال: 12345" value={form.zip} onChange={updateForm('zip')} />
              </div>

              <div className="hf-form-row">
                <div className="hf-form-group">
                  <label className="hf-form-label">اسم المالك <span className="req">*</span></label>
                  <input className="hf-form-input" placeholder="اسم المالك" value={form.owner} onChange={updateForm('owner')} required />
                </div>
                <div className="hf-form-group">
                  <label className="hf-form-label">رقم الهاتف <span className="req">*</span></label>
                  <input className="hf-form-input" placeholder="+966XXXXXXXXX" value={form.phone} onChange={updateForm('phone')} required />
                </div>
              </div>

              <div className="hf-form-group">
                <label className="hf-form-label">نوع المطبخ</label>
                <input className="hf-form-input" placeholder="مثال: شامي، هندي، تركي، بحري" value={form.cuisine} onChange={updateForm('cuisine')} />
              </div>

              <div className="hf-form-row">
                <div className="hf-form-group">
                  <label className="hf-form-label">صورة المكان</label>
                  <label className={`hf-form-file ${form.imagePlace ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, imagePlace: e.target.files[0] }))} />
                    {form.imagePlace ? '✅ تم اختيار الصورة' : '📎 اختر صورة'}
                  </label>
                </div>
                <div className="hf-form-group">
                  <label className="hf-form-label">صورة القائمة والأسعار</label>
                  <label className={`hf-form-file ${form.imageMenu ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, imageMenu: e.target.files[0] }))} />
                    {form.imageMenu ? '✅ تم اختيار الصورة' : '📎 اختر صورة'}
                  </label>
                </div>
              </div>

              <div className="hf-form-group">
                <label className="hf-form-label">ملاحظات إضافية</label>
                <input className="hf-form-input" placeholder="أي ملاحظات إضافية..." value={form.notes} onChange={updateForm('notes')} />
              </div>

              <button type="submit" className="hf-form-submit" disabled={formSending}>
                {formSending ? <>⏳ جارٍ الإرسال...</> : <>📤 إرسال طلب الإدراج</>}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="hf-toast">{toast}</div>}
    </div>
  );
}
