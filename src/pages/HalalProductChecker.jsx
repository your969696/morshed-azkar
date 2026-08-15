import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HARAM_INGREDIENTS = [
  'pork', 'ham', 'bacon', 'lard', 'gelatin', 'pepsin', 'rennet', 'casein',
  'carmine', 'cochineal', 'e120', 'shellac', 'e904', 'ethanol', 'ethyl alcohol',
  'wine', 'beer', 'rum', 'brandy', 'whiskey', 'vodka', 'champagne', 'sake',
  'vanilla extract', 'pepperoni', 'suet', 'tallow', 'mannitol', 'e441',
  'marshmallow', 'nougat', 'marzipan', 'lipase', 'pancreatin', 'trypsin',
  'l-cysteine', 'e920', 'e921', 'lard oil', 'sodium tallowate',
  'pigskin', 'porcine', 'prosciutto', 'pancetta', 'guanciale', 'salami',
  'chorizo', 'bresaola', 'nduja', 'soppressata', 'coppa', 'lonza',
  'mortadella', 'bologna', 'wurst', 'bratwurst', 'weisswurst',
  'leberwurst', 'blutwurst', 'schinken', 'speck', 'schweine',
  'alcohol', 'spirit', 'liqueur', 'fortified wine', 'cooking wine',
  'sherry', 'port', 'marsala', 'vermouth', 'absinthe', 'ouzo',
  'schnapps', 'grappa', 'tequila', 'mezcal', 'soju', 'baijiu',
  'arak', 'raki', 'e110', 'e102', 'e129', 'e133', 'e151', 'e155', 'e180',
  'carminic acid', 'carmines', 'confectioners glaze', 'resinous glaze',
  'cysteine', 'mannitol', 'e421', 'phosphoric acid', 'e338',
  'chymotrypsin', 'bromelain', 'papain',
];

const SUSPICIOUS_INGREDIENTS = [
  'emulsifier', 'e471', 'e472', 'e473', 'e474', 'e475', 'e476', 'e477', 'e478',
  'glycerol', 'e422', 'glycerin', 'stearic acid', 'e570', 'stearates',
  'whey', 'casein', 'caseinates', 'lactose',
  'natural flavor', 'natural flavoring', 'artificial flavor',
  'lecithin', 'e322',
];

const HISTORY_KEY = 'halalProductHistory';
const ALLERGENS_KEY = 'halalScannerAllergens';
const ALLERGENS = [
  { key: 'gluten', label: 'جلuten', emoji: '🌾' },
  { key: 'milk', label: 'حليب', emoji: '🥛' },
  { key: 'eggs', label: 'بيض', emoji: '🥚' },
  { key: 'nuts', label: 'مكسرات', emoji: '🥜' },
  { key: 'peanuts', label: 'فول سوداني', emoji: '🥜' },
  { key: 'soybeans', label: 'صويا', emoji: '🫘' },
  { key: 'fish', label: 'سمك', emoji: '🐟' },
  { key: 'crustaceans', label: 'جمبري', emoji: '🦐' },
  { key: 'sesame-seeds', label: 'سمسم', emoji: '🌱' },
  { key: 'mustard', label: 'خردل', emoji: '🟡' },
  { key: 'celery', label: 'كرفس', emoji: '🥬' },
  { key: 'sulphur-dioxide-and-sulphites', label: 'سلفايت', emoji: '⚗️' },
  { key: 'lupin', label: 'ترمس', emoji: '🫘' },
  { key: 'molluscs', label: 'رخويات', emoji: '🐌' },
];
function loadAllergens() {
  try { return JSON.parse(localStorage.getItem(ALLERGENS_KEY) || '[]'); } catch { return []; }
}
function saveAllergens(list) {
  localStorage.setItem(ALLERGENS_KEY, JSON.stringify(list));
}

const NUTRI_GRADE_LABELS = { a: 'ممتاز', b: 'جيد', c: 'مقبول', d: 'ضعيف', e: 'سيء' };
const NUTRI_GRADE_COLORS = { a: '#00c896', b: '#60a5fa', c: '#f0b040', d: '#ff7832', e: '#ff4757' };
const NOVA_LABELS = { 1: 'خام', 2: 'معالج بسيط', 3: 'معالج', 4: 'فائق المعالجة' };
const NOVA_COLORS = { 1: '#00c896', 2: '#60a5fa', 3: '#f0b040', 4: '#ff4757' };
const ECO_GRADE_LABELS = { a: 'ممتاز', b: 'جيد', c: 'مقبول', d: 'ضعيف', e: 'سيء' };
const ECO_GRADE_COLORS = { a: '#00c896', b: '#60a5fa', c: '#f0b040', d: '#ff7832', e: '#ff4757' };

const DEMO_PRODUCTS = [
  {
    id: 'd1', name: 'Cadbury Dairy Milk', brand: 'Cadbury — Mondelēz International',
    origin: 'بريطانيا 🇬🇧', status: 'halal', emoji: '🍫',
    tags: ['شكولاتة', 'شهادة حلال ✓'],
    ingredients: ['سكر', 'كاكاو', 'حليب مجفف', 'زيت نخيل', 'ليسيثين فول الصويا', 'فانيليا'],
  },
  {
    id: 'd2', name: 'Nissin Cup Noodles', brand: 'Nissin Foods — اليابان',
    origin: 'اليابان 🇯🇵', status: 'haram', emoji: '🍜',
    tags: ['نودلز', '⚠ يحتوي لحم خنزير'],
    ingredients: ['نودلز قمح', 'مرق لحم خنزير', 'دهن خنزير', 'زيت نخيل', 'ملح', 'نكهات طبيعية', 'مسحوق بصل'],
  },
  {
    id: 'd3', name: 'Kraft Singles', brand: 'Kraft Heinz — أمريكا',
    origin: 'أمريكا 🇺🇸', status: 'mashbooh', emoji: '🧀',
    tags: ['ألبان', '⚠ رنزيم مجهول المصدر'],
    ingredients: ['حليب', 'ماء', 'زيت نخيل', 'منحلجات (قد تحتوي رنزيم)', 'أملاح ذائبة', 'نكهات طبيعية', 'ملح'],
  },
  {
    id: 'd4', name: 'Vimto', brand: 'Vimto International — بريطانيا',
    origin: 'بريطانيا 🇬🇧', status: 'halal', emoji: '🥤',
    tags: ['مشروبات', 'شهادة حلال ✓'],
    ingredients: ['ماء', 'سكر', 'عصير عنب concentrates', 'نكهات طبيعية', 'حامض'],
  },
  {
    id: 'd5', name: 'BreadTalk Flosss', brand: 'BreadTalk — سنغافورة',
    origin: 'سنغافورة 🇸🇬', status: 'halal', emoji: '🍞',
    tags: ['مخبوزات', 'لحوم', 'MUIS حلال ✓'],
    ingredients: ['دقيق', 'حليب', 'بيض', 'سكر', 'زبدة', 'لحوم دجاج'],
  },
  {
    id: 'd6', name: 'Haribo Goldbears', brand: 'Haribo — ألمانيا (النسخة الأوروبية)',
    origin: 'ألمانيا 🇩🇪', status: 'haram', emoji: '🍬',
    tags: ['حلويات', '⚠ جيلاتين خنزير'],
    ingredients: ['سكر', 'شراب جلوكوز', 'جيلاتين خنزير', 'حمض الستريك', 'نكهات طبيعية', 'دهون نباتية'],
  },
];

const CATEGORIES = [
  { emoji: '🍽️', label: 'الكل' }, { emoji: '🥛', label: 'ألبان' },
  { emoji: '🍞', label: 'مخبوزات' }, { emoji: '🍬', label: 'حلويات' },
  { emoji: '🥤', label: 'مشروبات' }, { emoji: '🥩', label: 'لحوم' },
  { emoji: '🥫', label: 'معلبات' }, { emoji: '🧂', label: 'توابل' },
  { emoji: '🍫', label: 'شكولاتة' }, { emoji: '🍕', label: 'جاهز' },
];

function analyzeIngredients(text) {
  const t = text.toLowerCase();
  const found = HARAM_INGREDIENTS.filter(i => t.includes(i));
  const suspicious = SUSPICIOUS_INGREDIENTS.filter(i => t.includes(i));
  let status = 'halal';
  if (found.length > 0) status = 'haram';
  else if (suspicious.length > 0) status = 'mashbooh';
  return { status, found, suspicious };
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(entry) {
  const h = loadHistory();
  h.unshift(entry);
  if (h.length > 30) h.length = 30;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}
function clearHistory() { localStorage.removeItem(HISTORY_KEY); }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap');
.hsp{direction:rtl;font-family:'Cairo',sans-serif;min-height:100vh;padding-bottom:100px;--bg:#060410;--surface:#0e0b1e;--glass:rgba(255,255,255,.035);--border:rgba(255,255,255,.06);--green:#00c896;--green-dark:#00a87d;--green-dim:rgba(0,200,150,.08);--gold:#f0b040;--gold-dim:rgba(240,176,64,.08);--red:#ff4757;--red-dim:rgba(255,71,87,.08);--orange:#ff7832;--blue:#60a5fa;--blue-dim:rgba(96,165,250,.08);--purple:#a78bfa;--purple-dim:rgba(167,139,250,.08);--text:#f0ece4;--text2:#c0b8d8;--text3:#6b6284;--text4:#3d3658;--r:16px;--r-sm:12px;--r-xs:8px;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
.hsp *{margin:0;padding:0;box-sizing:border-box}
.hsp::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 60% 50% at 10% 90%,rgba(0,200,150,.03),transparent 60%),radial-gradient(ellipse 50% 40% at 90% 10%,rgba(100,60,200,.04),transparent 50%),radial-gradient(ellipse 80% 60% at 50% 50%,rgba(10,6,20,1),var(--bg));pointer-events:none;z-index:0}
.hsp>*{position:relative;z-index:2}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
@keyframes scanLine{0%{top:10%}50%{top:85%}100%{top:10%}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes resultPop{0%{opacity:0;transform:scale(.85)}60%{transform:scale(1.03)}100%{opacity:1;transform:scale(1)}}
.anim{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
.d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}
.d7{animation-delay:.35s}.d8{animation-delay:.4s}

.hsp-bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:50;background:rgba(6,4,16,.92);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-top:1px solid var(--border);padding:6px 8px calc(6px + env(safe-area-inset-bottom));display:flex;justify-content:space-around;max-width:520px;margin:0 auto}
.hsp-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 14px;border-radius:var(--r-sm);cursor:pointer;transition:all .2s;background:transparent;border:none;font-family:inherit;color:var(--text3);position:relative}
.hsp-nav-item.active{color:var(--green)}
.hsp-nav-item.active::after{content:'';position:absolute;top:0;left:30%;right:30%;height:2px;border-radius:2px;background:var(--green);box-shadow:0 0 8px rgba(0,200,150,.4)}
.hsp-nav-item svg{width:22px;height:22px}
.hsp-nav-item span{font-size:9px;font-weight:700}

.hsp-header{padding:16px 20px 14px;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;background:rgba(6,4,16,.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
.hsp-header-row{display:flex;align-items:center;justify-content:space-between}
.hsp-header-right{display:flex;align-items:center;gap:12px}
.hsp-logo{width:44px;height:44px;border-radius:var(--r);background:linear-gradient(135deg,var(--green-dim),rgba(0,150,200,.06));border:1px solid rgba(0,200,150,.1);display:flex;align-items:center;justify-content:center;position:relative}
.hsp-logo svg{width:24px;height:24px}
.hsp-scan-dot{position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:var(--green);border:2px solid var(--bg);animation:pulse 2s ease infinite}
.hsp-header-title{font-size:17px;font-weight:800;line-height:1.2}
.hsp-header-sub{font-size:10.5px;color:var(--text3);margin-top:1px}
.hsp-header-left{display:flex;gap:8px}
.hsp-header-btn{width:38px;height:38px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--glass);color:var(--text3);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-family:inherit}

.hsp-scanner-section{padding:20px}
.hsp-scanner-card{border-radius:22px;overflow:hidden;position:relative;border:1px solid rgba(0,200,150,.1);background:linear-gradient(135deg,rgba(0,200,150,.03),rgba(10,6,20,.95))}
.hsp-scanner-viewport{width:100%;height:300px;position:relative;background:radial-gradient(ellipse at center,rgba(0,200,150,.03),var(--bg));overflow:hidden;display:flex;align-items:center;justify-content:center}
.hsp-scan-frame{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:220px;height:220px}
.hsp-scan-corner{position:absolute;width:30px;height:30px;border-color:var(--green);border-style:solid;border-width:0}
.hsp-scan-corner.tl{top:0;left:0;border-top-width:3px;border-left-width:3px;border-radius:8px 0 0 0}
.hsp-scan-corner.tr{top:0;right:0;border-top-width:3px;border-right-width:3px;border-radius:0 8px 0 0}
.hsp-scan-corner.bl{bottom:0;left:0;border-bottom-width:3px;border-left-width:3px;border-radius:0 0 0 8px}
.hsp-scan-corner.br{bottom:0;right:0;border-bottom-width:3px;border-right-width:3px;border-radius:0 0 8px 0}
.hsp-scan-line{position:absolute;left:10px;right:10px;height:2px;background:linear-gradient(90deg,transparent,var(--green),transparent);box-shadow:0 0 15px rgba(0,200,150,.5);animation:scanLine 2.5s ease-in-out infinite;border-radius:2px}
.hsp-scan-hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-size:11px;color:var(--text3);text-align:center;background:rgba(0,0,0,.5);padding:6px 16px;border-radius:20px;backdrop-filter:blur(8px);white-space:nowrap}

.hsp-scanner-controls{padding:16px 20px;display:flex;gap:8px;border-top:1px solid rgba(0,200,150,.06)}
.hsp-scan-mode-btn{flex:1;padding:10px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--glass);color:var(--text3);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s}
.hsp-scan-mode-btn:hover{background:rgba(255,255,255,.05);color:var(--text2)}
.hsp-scan-mode-btn.active{background:var(--green-dim);color:var(--green);border-color:rgba(0,200,150,.15)}
.hsp-scan-mode-btn svg{width:16px;height:16px}

.hsp-manual-section{padding:0 20px 16px}
.hsp-manual-card{padding:16px;border-radius:var(--r);background:var(--glass);border:1px solid var(--border)}
.hsp-manual-title{font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.hsp-manual-title svg{width:18px;height:18px;color:var(--green)}
.hsp-manual-input{width:100%;padding:12px 14px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--glass);color:var(--text);font-size:14px;font-family:inherit;outline:none;transition:all .25s;margin-bottom:10px}
.hsp-manual-input:focus{border-color:rgba(0,200,150,.35);background:rgba(255,255,255,.04)}
.hsp-manual-input::placeholder{color:var(--text4)}
.hsp-manual-btn{width:100%;padding:12px;border-radius:var(--r-sm);background:linear-gradient(135deg,var(--green),var(--green-dark));border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s}
.hsp-manual-btn:hover{transform:scale(1.01);box-shadow:0 4px 16px rgba(0,200,150,.25)}

.hsp-quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 20px 16px}
.hsp-qa-item{text-align:center;padding:14px 6px;border-radius:var(--r-sm);background:var(--glass);border:1px solid var(--border);cursor:pointer;transition:all .2s}
.hsp-qa-item:hover{background:rgba(255,255,255,.05);transform:translateY(-2px)}
.hsp-qa-icon{width:40px;height:40px;border-radius:var(--r-sm);margin:0 auto 6px;display:flex;align-items:center;justify-content:center}
.hsp-qa-icon.green{background:var(--green-dim)}
.hsp-qa-icon.gold{background:var(--gold-dim)}
.hsp-qa-icon.blue{background:var(--blue-dim)}
.hsp-qa-icon.purple{background:var(--purple-dim)}
.hsp-qa-icon svg{width:20px;height:20px}
.hsp-qa-label{font-size:10px;font-weight:600;color:var(--text3)}

.hsp-stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 20px 16px}
.hsp-stat-card{text-align:center;padding:14px 6px;border-radius:var(--r-sm);background:var(--glass);border:1px solid var(--border)}
.hsp-stat-val{font-size:20px;font-weight:900;line-height:1}
.hsp-stat-label{font-size:9px;font-weight:600;color:var(--text4);margin-top:3px;text-transform:uppercase;letter-spacing:.3px}

.hsp-section-header{padding:16px 20px 10px;display:flex;justify-content:space-between;align-items:center}
.hsp-section-title{font-size:14px;font-weight:800;color:var(--text)}
.hsp-section-link{font-size:11px;color:var(--green);font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px}
.hsp-section-link svg{width:12px;height:12px}

.hsp-categories{display:flex;gap:6px;padding:0 20px 16px;overflow-x:auto;scrollbar-width:none}
.hsp-categories::-webkit-scrollbar{display:none}
.hsp-cat-pill{padding:7px 14px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--glass);color:var(--text3);white-space:nowrap;transition:all .2s;font-family:inherit;display:flex;align-items:center;gap:5px}
.hsp-cat-pill:hover{background:rgba(255,255,255,.05);color:var(--text2)}
.hsp-cat-pill.active{background:var(--green-dim);color:var(--green);border-color:rgba(0,200,150,.15)}

.hsp-products{padding:0 20px;display:flex;flex-direction:column;gap:10px}
.hsp-product-card{background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px;transition:all .3s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;cursor:pointer}
.hsp-product-card::before{content:'';position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,200,150,.12),transparent);opacity:0;transition:opacity .3s}
.hsp-product-card:hover{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.04);transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.2)}
.hsp-product-card:hover::before{opacity:1}
.hsp-prod-top{display:flex;gap:12px;align-items:flex-start}
.hsp-prod-img{width:56px;height:56px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;border:1px solid var(--border)}
.hsp-prod-info{flex:1;min-width:0}
.hsp-prod-name{font-size:14px;font-weight:700;color:var(--text);margin-bottom:2px;display:flex;align-items:center;gap:6px}
.hsp-prod-brand{font-size:11px;color:var(--text3);margin-bottom:4px}
.hsp-prod-meta{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.hsp-prod-origin{font-size:10.5px;color:var(--text3);display:flex;align-items:center;gap:3px}
.hsp-prod-origin svg{width:11px;height:11px}

.hsp-status-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700}
.hsp-status-halal{background:var(--green-dim);color:var(--green);border:1px solid rgba(0,200,150,.12)}
.hsp-status-haram{background:var(--red-dim);color:var(--red);border:1px solid rgba(255,71,87,.12)}
.hsp-status-mashbooh{background:var(--gold-dim);color:var(--gold);border:1px solid rgba(240,176,64,.12)}
.hsp-status-badge svg{width:10px;height:10px}

.hsp-prod-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
.hsp-ptag{padding:2px 8px;border-radius:12px;font-size:9px;font-weight:600}
.hsp-ptag-cat{background:var(--blue-dim);color:var(--blue)}
.hsp-ptag-cert{background:var(--green-dim);color:var(--green)}
.hsp-ptag-warn{background:var(--red-dim);color:var(--red)}
.hsp-ptag-note{background:var(--gold-dim);color:var(--gold)}

.hsp-prod-ingredients{margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:none}
.hsp-prod-ingredients.show{display:block}
.hsp-ing-toggle{font-size:11px;color:var(--text3);cursor:pointer;display:flex;align-items:center;gap:4px;background:none;border:none;font-family:inherit;padding:0;transition:color .2s}
.hsp-ing-toggle:hover{color:var(--text2)}
.hsp-ing-toggle svg{width:12px;height:12px;transition:transform .2s}
.hsp-ing-toggle.open svg{transform:rotate(180deg)}
.hsp-ing-list{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
.hsp-ing-item{padding:3px 10px;border-radius:10px;font-size:10px;font-weight:600}
.hsp-ing-safe{background:rgba(0,200,150,.06);color:rgba(0,200,150,.7);border:1px solid rgba(0,200,150,.08)}
.hsp-ing-danger{background:rgba(255,71,87,.08);color:var(--red);border:1px solid rgba(255,71,87,.1)}
.hsp-ing-question{background:rgba(240,176,64,.06);color:var(--gold);border:1px solid rgba(240,176,64,.08)}

.hsp-modal-overlay{position:fixed;inset:0;z-index:100;background:rgba(6,4,16,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:none;align-items:center;justify-content:center;padding:20px}
.hsp-modal-overlay.show{display:flex}
.hsp-modal{width:100%;max-width:440px;max-height:85vh;background:var(--surface);border:1px solid var(--border);border-radius:24px;overflow:hidden;animation:resultPop .4s cubic-bezier(.16,1,.3,1)}
.hsp-modal-handle{width:36px;height:4px;border-radius:4px;background:var(--text4);margin:10px auto}

.hsp-result-hero{padding:24px 24px 20px;text-align:center;position:relative;overflow:hidden}
.hsp-result-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,var(--green-dim),transparent 70%);opacity:.5}
.hsp-result-hero.haram::before{background:radial-gradient(ellipse at 50% 0%,var(--red-dim),transparent 70%)}
.hsp-result-hero.mashbooh::before{background:radial-gradient(ellipse at 50% 0%,var(--gold-dim),transparent 70%)}
.hsp-result-icon{width:72px;height:72px;border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;position:relative}
.hsp-result-icon.halal-bg{background:var(--green-dim);border:2px solid rgba(0,200,150,.2)}
.hsp-result-icon.haram-bg{background:var(--red-dim);border:2px solid rgba(255,71,87,.2)}
.hsp-result-icon.mashbooh-bg{background:var(--gold-dim);border:2px solid rgba(240,176,64,.2)}
.hsp-result-icon svg{width:36px;height:36px}
.hsp-result-status{font-size:22px;font-weight:900;margin-bottom:4px}
.hsp-result-status.green{color:var(--green)}
.hsp-result-status.red{color:var(--red)}
.hsp-result-status.gold{color:var(--gold)}
.hsp-result-msg{font-size:12px;color:var(--text3);line-height:1.6}

.hsp-result-details{padding:0 24px 20px}
.hsp-result-product{display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--r-sm);background:var(--glass);border:1px solid var(--border);margin-bottom:14px}
.hsp-rp-img{font-size:32px}
.hsp-rp-name{font-size:14px;font-weight:700}
.hsp-rp-brand{font-size:11px;color:var(--text3)}

.hsp-result-section{margin-bottom:14px}
.hsp-result-section-title{font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px;display:flex;align-items:center;gap:5px;text-transform:uppercase;letter-spacing:.5px}
.hsp-result-section-title svg{width:14px;height:14px}
.hsp-result-ingredients{display:flex;flex-wrap:wrap;gap:4px}
.hsp-result-btns{display:flex;gap:8px;margin-top:16px}
.hsp-result-btn{flex:1;padding:12px;border-radius:var(--r-sm);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;border:none;transition:all .2s}
.hsp-result-btn svg{width:16px;height:16px}
.hsp-result-btn-primary{background:linear-gradient(135deg,var(--green),var(--green-dark));color:#fff}
.hsp-result-btn-primary:hover{box-shadow:0 4px 16px rgba(0,200,150,.3)}
.hsp-result-btn-secondary{background:var(--glass);color:var(--text3);border:1px solid var(--border)}
.hsp-result-btn-secondary:hover{background:rgba(255,255,255,.05);color:var(--text2)}

.hsp-history-list{padding:0 20px;display:flex;flex-direction:column;gap:6px}
.hsp-history-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r-sm);background:var(--glass);border:1px solid var(--border);cursor:pointer;transition:all .2s}
.hsp-history-item:hover{background:rgba(255,255,255,.04)}
.hsp-history-icon{width:36px;height:36px;border-radius:var(--r-xs);display:flex;align-items:center;justify-content:center;font-size:18px}
.hsp-history-info{flex:1;min-width:0}
.hsp-history-name{font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hsp-history-time{font-size:10px;color:var(--text4)}

.hsp-loading-overlay{position:fixed;inset:0;background:rgba(6,4,16,.85);display:none;align-items:center;justify-content:center;flex-direction:column;gap:12px;z-index:100;backdrop-filter:blur(8px)}
.hsp-loading-overlay.show{display:flex}
.hsp-spinner{width:40px;height:40px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--green);animation:spin .8s linear infinite}
.hsp-loading-text{font-size:13px;color:var(--text3);font-weight:600}

.hsp-toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:var(--r-sm);background:var(--surface);border:1px solid var(--border);color:var(--text2);font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.3);z-index:200;display:flex;align-items:center;gap:8px;max-width:calc(100% - 40px);animation:fadeUp .3s ease}

.hsp-allergen-section{padding:0 20px 16px}
.hsp-allergen-card{padding:14px;border-radius:var(--r);background:var(--glass);border:1px solid var(--border)}
.hsp-allergen-title{font-size:12px;font-weight:700;color:var(--text);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.hsp-allergen-title svg{width:16px;height:16px;color:var(--red)}
.hsp-allergen-chips{display:flex;flex-wrap:wrap;gap:6px}
.hsp-allergen-chip{padding:5px 12px;border-radius:16px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--glass);color:var(--text3);transition:all .2s;font-family:inherit;display:flex;align-items:center;gap:4px}
.hsp-allergen-chip:hover{background:rgba(255,255,255,.05);color:var(--text2)}
.hsp-allergen-chip.active{background:var(--red-dim);color:var(--red);border-color:rgba(255,71,87,.2)}
.hsp-allergen-chip span.emoji{font-size:13px}

.hsp-nutrition-row{display:flex;gap:8px;margin-bottom:14px}
.hsp-nutrition-badge{flex:1;text-align:center;padding:10px 6px;border-radius:var(--r-sm);background:var(--glass);border:1px solid var(--border)}
.hsp-nutrition-badge-letter{font-size:24px;font-weight:900;line-height:1}
.hsp-nutrition-badge-label{font-size:9px;font-weight:600;color:var(--text3);margin-top:2px;text-transform:uppercase;letter-spacing:.3px}
.hsp-nutrition-badge-name{font-size:10px;font-weight:700;color:var(--text2);margin-top:4px}

.hsp-allergen-alert{padding:10px 14px;border-radius:var(--r-sm);background:rgba(255,71,87,.06);border:1px solid rgba(255,71,87,.12);margin-bottom:14px;display:flex;align-items:flex-start;gap:8px}
.hsp-allergen-alert-icon{font-size:16px;flex-shrink:0;margin-top:1px}
.hsp-allergen-alert-text{font-size:11px;color:var(--red);font-weight:600;line-height:1.5}
.hsp-allergen-alert-text strong{font-weight:800}

.hsp-nutrition-facts{margin-top:4px}
.hsp-nutrition-row-item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px}
.hsp-nutrition-row-item:last-child{border-bottom:none}
.hsp-nutrition-row-item .label{color:var(--text3);font-weight:600}
.hsp-nutrition-row-item .value{color:var(--text);font-weight:700}
`;

export default function HalalProductChecker() {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState('barcode');
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(loadHistory());
  const [toast, setToast] = useState(null);
  const [activeCat, setActiveCat] = useState('الكل');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [expandedIngs, setExpandedIngs] = useState({});
  const [cameraOpen, setCameraOpen] = useState(false);
  const [userAllergens, setUserAllergens] = useState(loadAllergens());
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStream = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const toggleAllergen = (key) => {
    setUserAllergens(prev => {
      const next = prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key];
      saveAllergens(next);
      return next;
    });
  };

  const toggleCamera = async () => {
    if (cameraOpen) {
      if (cameraStream.current) {
        cameraStream.current.getTracks().forEach(t => t.stop());
        cameraStream.current = null;
      }
      setCameraOpen(false);
      showToast('تم إغلاق الكاميرا');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      cameraStream.current = stream;
      setCameraOpen(true);
      setScanMode('camera');
      showToast('الكاميرا مفتوحة — وجّه نحو الباركود');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      showToast('لا يمكن الوصول للكاميرا — تأكد من الأذونات');
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream.current) {
        cameraStream.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const searchByBarcode = async (code) => {
    setLoading(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
      const data = await res.json();
      if (data.status === 1) {
        const p = data.product;
        const name = p.product_name || p.product_name_en || 'منتج';
        const brand = p.brands || '';
        const origin = p.origins || p.countries || '';
        const ingText = p.ingredients_text || p.ingredients_text_en || '';
        const analysis = analyzeIngredients(ingText);
        const ings = ingText.split(/[,،]/).map(s => s.trim()).filter(Boolean);
        const nutritionGrade = p.nutrition_grades || '';
        const novaGroup = p.nova_group || null;
        const ecoGrade = p.ecoscore_grade || '';
        const allergensTags = (p.allergens_tags || []).map(t => t.replace('en:', ''));
        const nutriments = p.nutriments || {};
        const entry = {
          id: Date.now(), name, brand, origin, barcode: code,
          ingredients: ings, ...analysis, emoji: '📦',
          nutritionGrade, novaGroup, ecoGrade, allergensTags, nutriments,
          tags: [analysis.status === 'halal' ? 'شهادة حلال ✓' : analysis.status === 'haram' ? '⚠ يحتوي مكونات محرمة' : '⚠ مكونات مشبوهة'],
          date: new Date().toLocaleDateString('ar-EG')
        };
        saveHistory(entry);
        setHistory(loadHistory());
        setModalType(entry);
        setShowModal(true);
      } else {
        showToast('لم نجد هذا المنتج');
      }
    } catch {
      showToast('خطأ في الشبكة');
    }
    setLoading(false);
  };

  const searchByName = async (query) => {
    setLoading(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`);
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        const p = data.products[0];
        const name = p.product_name || p.product_name_en || 'منتج';
        const brand = p.brands || '';
        const origin = p.origins || p.countries || '';
        const ingText = p.ingredients_text || p.ingredients_text_en || '';
        const analysis = analyzeIngredients(ingText);
        const ings = ingText.split(/[,،]/).map(s => s.trim()).filter(Boolean);
        const nutritionGrade = p.nutrition_grades || '';
        const novaGroup = p.nova_group || null;
        const ecoGrade = p.ecoscore_grade || '';
        const allergensTags = (p.allergens_tags || []).map(t => t.replace('en:', ''));
        const nutriments = p.nutriments || {};
        const entry = {
          id: Date.now(), name, brand, origin, barcode: p._id || '',
          ingredients: ings, ...analysis, emoji: '📦',
          nutritionGrade, novaGroup, ecoGrade, allergensTags, nutriments,
          tags: [analysis.status === 'halal' ? 'شهادة حلال ✓' : analysis.status === 'haram' ? '⚠ يحتوي مكونات محرمة' : '⚠ مكونات مشبوهة'],
          date: new Date().toLocaleDateString('ar-EG')
        };
        saveHistory(entry);
        setHistory(loadHistory());
        setModalType(entry);
        setShowModal(true);
      } else {
        showToast('لم نجد هذا المنتج');
      }
    } catch {
      showToast('خطأ في الشبكة');
    }
    setLoading(false);
  };

  const handleManualSearch = () => {
    const v = manualInput.trim();
    if (!v) { showToast('أدخل رقم الباركود أو اسم المنتج'); return; }
    if (/^\d{8,14}$/.test(v)) {
      searchByBarcode(v);
    } else {
      searchByName(v);
    }
  };

  const toggleIngExpand = (id) => {
    setExpandedIngs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openResultModal = (product) => {
    setModalType(product);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setModalType(null); };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    return dateStr;
  };

  return (
    <div className="hsp">
      <style>{CSS}</style>

      {/* Header */}
      <div className="hsp-header anim d1">
        <div className="hsp-header-row">
          <div className="hsp-header-right">
            <div className="hsp-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <path d="M15 14l2 2 4-4" strokeWidth="2"/>
              </svg>
              <div className="hsp-scan-dot"></div>
            </div>
            <div>
              <div className="hsp-header-title">حلال سكانر</div>
              <div className="hsp-header-sub">فحص المنتجات عالميًا</div>
            </div>
          </div>
          <div className="hsp-header-left">
            <button className="hsp-header-btn" onClick={() => showToast('لا توجد إشعارات جديدة')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </button>
            <button className="hsp-header-btn" onClick={() => navigate('/settings')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scanner */}
      <div className="hsp-scanner-section anim d2">
        <div className="hsp-scanner-card">
          <div className="hsp-scanner-viewport" onClick={!cameraOpen ? toggleCamera : undefined} style={!cameraOpen ? { cursor: 'pointer' } : {}}>
            {cameraOpen ? (
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 8 }}>اضغط لفتح الكاميرا</div>
              </div>
            )}
            <div className="hsp-scan-frame">
              <div className="hsp-scan-corner tl"></div>
              <div className="hsp-scan-corner tr"></div>
              <div className="hsp-scan-corner bl"></div>
              <div className="hsp-scan-corner br"></div>
              <div className="hsp-scan-line"></div>
            </div>
            <div className="hsp-scan-hint">وجّه الكاميرا نحو الباركود أو قائمة المكونات</div>
          </div>
          <div className="hsp-scanner-controls">
            {[
              { key: 'barcode', label: 'باركود', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/><line x1="14" y1="8" x2="14" y2="16"/><line x1="18" y1="8" x2="18" y2="16"/></svg> },
              { key: 'ocr', label: 'نص المنتج', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
              { key: 'camera', label: 'كاميرا', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg> },
            ].map(m => (
              <button key={m.key} className={`hsp-scan-mode-btn ${scanMode === m.key ? 'active' : ''}`}
                onClick={() => {
                  if (m.key === 'camera') {
                    toggleCamera();
                  } else {
                    if (cameraOpen) {
                      if (cameraStream.current) {
                        cameraStream.current.getTracks().forEach(t => t.stop());
                        cameraStream.current = null;
                      }
                      setCameraOpen(false);
                    }
                    setScanMode(m.key);
                  }
                }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Entry */}
      <div className="hsp-manual-section anim d3">
        <div className="hsp-manual-card">
          <div className="hsp-manual-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            بحث بالباركود أو اسم المنتج
          </div>
          <input ref={inputRef} className="hsp-manual-input" placeholder="أدخل رقم الباركود أو اسم المنتج..."
            value={manualInput} onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualSearch()} />
          <button className="hsp-manual-btn" onClick={handleManualSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            فحص المنتج
          </button>
        </div>
      </div>

      {/* Allergen Settings */}
      <div className="hsp-allergen-section anim d3">
        <div className="hsp-allergen-card">
          <div className="hsp-allergen-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            حساسيتي ({userAllergens.length})
          </div>
          <div className="hsp-allergen-chips">
            {ALLERGENS.map(a => (
              <button key={a.key} className={`hsp-allergen-chip ${userAllergens.includes(a.key) ? 'active' : ''}`}
                onClick={() => toggleAllergen(a.key)}>
                <span className="emoji">{a.emoji}</span> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hsp-quick-actions anim d4">
        <div className="hsp-qa-item" onClick={() => showToast('فتح الكاميرا...')}>
          <div className="hsp-qa-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div className="hsp-qa-label">مسح سريع</div>
        </div>
        <div className="hsp-qa-item" onClick={() => showToast('قائمة المكونات الشائعة')}>
          <div className="hsp-qa-icon gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="hsp-qa-label">مكونات</div>
        </div>
        <div className="hsp-qa-item" onClick={() => showToast('عرض المنتجات المحفوظة')}>
          <div className="hsp-qa-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </div>
          <div className="hsp-qa-label">المحفوظات</div>
        </div>
        <div className="hsp-qa-item" onClick={() => showToast('عرض سجل الفحص')}>
          <div className="hsp-qa-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="hsp-qa-label">السجل</div>
        </div>
      </div>

      {/* Stats */}
      <div className="hsp-stats-row anim d4">
        <div className="hsp-stat-card">
          <div className="hsp-stat-val" style={{ color: 'var(--green)' }}>12,480</div>
          <div className="hsp-stat-label">منتج مفحوص</div>
        </div>
        <div className="hsp-stat-card">
          <div className="hsp-stat-val" style={{ color: 'var(--gold)' }}>186</div>
          <div className="hsp-stat-label">دولة</div>
        </div>
        <div className="hsp-stat-card">
          <div className="hsp-stat-val" style={{ color: 'var(--blue)' }}>3,200+</div>
          <div className="hsp-stat-label">مكون مُصنّف</div>
        </div>
      </div>

      {/* Categories */}
      <div className="hsp-section-header anim d5">
        <div className="hsp-section-title">تصفح حسب الفئة</div>
        <span className="hsp-section-link">الكل <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg></span>
      </div>
      <div className="hsp-categories anim d5">
        {CATEGORIES.map(c => (
          <button key={c.label} className={`hsp-cat-pill ${activeCat === c.label ? 'active' : ''}`}
            onClick={() => setActiveCat(c.label)}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="hsp-section-header anim d5">
        <div className="hsp-section-title">منتجات مفحوصة مؤخرًا</div>
        <span className="hsp-section-link">عرض الكل <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg></span>
      </div>
      <div className="hsp-products anim d5">
        {DEMO_PRODUCTS.map(p => (
          <div key={p.id} className="hsp-product-card" onClick={() => openResultModal(p)}>
            <div className="hsp-prod-top">
              <div className="hsp-prod-img" style={{
                background: p.status === 'halal' ? 'linear-gradient(135deg,rgba(0,200,150,.08),rgba(0,150,200,.05))'
                  : p.status === 'haram' ? 'linear-gradient(135deg,rgba(255,71,87,.08),rgba(255,71,87,.03))'
                  : 'linear-gradient(135deg,rgba(240,176,64,.08),rgba(240,176,64,.03))'
              }}>{p.emoji}</div>
              <div className="hsp-prod-info">
                <div className="hsp-prod-name">
                  {p.name}
                  <span className={`hsp-status-badge hsp-status-${p.status}`}>
                    {p.status === 'halal' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    ) : p.status === 'haram' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    )}
                    {p.status === 'halal' ? 'حلال' : p.status === 'haram' ? 'حرام' : 'مشبوه'}
                  </span>
                </div>
                <div className="hsp-prod-brand">{p.brand}</div>
                <div className="hsp-prod-meta">
                  <span className="hsp-prod-origin">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                    {p.origin}
                  </span>
                </div>
                <div className="hsp-prod-tags">
                  {p.tags.map((tag, i) => (
                    <span key={i} className={`hsp-ptag ${
                      tag.includes('حلال') ? 'hsp-ptag-cert' :
                      tag.includes('⚠') ? 'hsp-ptag-warn' : 'hsp-ptag-cat'
                    }`}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            {p.ingredients && (
              <div className={`hsp-prod-ingredients ${expandedIngs[p.id] ? 'show' : ''}`}>
                <button className={`hsp-ing-toggle ${expandedIngs[p.id] ? 'open' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleIngExpand(p.id); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  عرض المكونات التفصيلية
                </button>
                <div className="hsp-ing-list">
                  {p.ingredients.map((ing, i) => {
                    const isDanger = ['مرق لحم خنزير', 'دهن خنزير', 'جيلاتين خنزير'].some(d => ing.includes(d));
                    const isQuestion = ['منحلجات', 'نكهات طبيعية', 'رنزيم'].some(q => ing.includes(q));
                    return (
                      <span key={i} className={`hsp-ing-item ${isDanger ? 'hsp-ing-danger' : isQuestion ? 'hsp-ing-question' : 'hsp-ing-safe'}`}>
                        {ing}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scan History */}
      {history.length > 0 && (
        <>
          <div className="hsp-section-header anim d8">
            <div className="hsp-section-title">آخر عمليات الفحص</div>
            <span className="hsp-section-link" onClick={() => { clearHistory(); setHistory([]); showToast('تم مسح السجل'); }}>
              مسح السجل <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
            </span>
          </div>
          <div className="hsp-history-list anim d8">
            {history.slice(0, 5).map(item => (
              <div key={item.id} className="hsp-history-item" onClick={() => openResultModal(item)}>
                <div className="hsp-history-icon" style={{
                  background: item.status === 'halal' ? 'var(--green-dim)' : item.status === 'haram' ? 'var(--red-dim)' : 'var(--gold-dim)'
                }}>{item.emoji || '📦'}</div>
                <div className="hsp-history-info">
                  <div className="hsp-history-name">{item.name}</div>
                  <div className="hsp-history-time">{item.date} — {item.status === 'halal' ? 'حلال ✓' : item.status === 'haram' ? 'حرام ✗' : 'مشبوه ⚠'}</div>
                </div>
                <span className={`hsp-status-badge hsp-status-${item.status}`} style={{ flexShrink: 0 }}>
                  {item.status === 'halal' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : item.status === 'haram' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  )}
                  {item.status === 'halal' ? 'حلال' : item.status === 'haram' ? 'حرام' : 'مشبوه'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom Nav */}
      <div className="hsp-bottom-nav anim d6">
        <button className="hsp-nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span>فحص</span>
        </button>
        <button className="hsp-nav-item" onClick={() => navigate('/halal')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          <span>استكشاف</span>
        </button>
        <button className="hsp-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span>كاميرا</span>
        </button>
        <button className="hsp-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span>محفوظات</span>
        </button>
        <button className="hsp-nav-item" onClick={() => navigate('/settings')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>حسابي</span>
        </button>
      </div>

      {/* Loading Overlay */}
      <div className={`hsp-loading-overlay ${loading ? 'show' : ''}`}>
        <div className="hsp-spinner"></div>
        <div className="hsp-loading-text">جارٍ تحليل المنتج...</div>
      </div>

      {/* Result Modal */}
      <div className={`hsp-modal-overlay ${showModal ? 'show' : ''}`} onClick={closeModal}>
        {showModal && modalType && (
          <div className="hsp-modal" onClick={e => e.stopPropagation()}>
            <div className="hsp-modal-handle"></div>

            {/* Halal */}
            {modalType.status === 'halal' && (
              <div>
                <div className="hsp-result-hero">
                  <div className="hsp-result-icon halal-bg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <div className="hsp-result-status green">حلال ✓</div>
                  <div className="hsp-result-msg">هذا المنتج آمن للأكل — لا يحتوي على مواد محرمة</div>
                </div>
                <div className="hsp-result-details">
                  <div className="hsp-result-product">
                    <span className="hsp-rp-img">{modalType.emoji || '📦'}</span>
                    <div>
                      <div className="hsp-rp-name">{modalType.name}</div>
                      <div className="hsp-rp-brand">{modalType.brand || modalType.origin}</div>
                    </div>
                  </div>
                  {(modalType.nutritionGrade || modalType.novaGroup || modalType.ecoGrade) && (
                    <div className="hsp-nutrition-row">
                      {modalType.nutritionGrade && (
                        <div className="hsp-nutrition-badge">
                          <div className="hsp-nutrition-badge-letter" style={{ color: NUTRI_GRADE_COLORS[modalType.nutritionGrade] || 'var(--text3)' }}>
                            {(modalType.nutritionGrade || '').toUpperCase()}
                          </div>
                          <div className="hsp-nutrition-badge-name">Nutri-Score</div>
                          <div className="hsp-nutrition-badge-label">{NUTRI_GRADE_LABELS[modalType.nutritionGrade] || ''}</div>
                        </div>
                      )}
                      {modalType.novaGroup && (
                        <div className="hsp-nutrition-badge">
                          <div className="hsp-nutrition-badge-letter" style={{ color: NOVA_COLORS[modalType.novaGroup] || 'var(--text3)' }}>
                            {modalType.novaGroup}
                          </div>
                          <div className="hsp-nutrition-badge-name">NOVA</div>
                          <div className="hsp-nutrition-badge-label">{NOVA_LABELS[modalType.novaGroup] || ''}</div>
                        </div>
                      )}
                      {modalType.ecoGrade && (
                        <div className="hsp-nutrition-badge">
                          <div className="hsp-nutrition-badge-letter" style={{ color: ECO_GRADE_COLORS[modalType.ecoGrade] || 'var(--text3)' }}>
                            {(modalType.ecoGrade || '').toUpperCase()}
                          </div>
                          <div className="hsp-nutrition-badge-name">Eco-Score</div>
                          <div className="hsp-nutrition-badge-label">{ECO_GRADE_LABELS[modalType.ecoGrade] || ''}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {modalType.allergensTags && modalType.allergensTags.length > 0 && userAllergens.length > 0 && (() => {
                    const matched = modalType.allergensTags.filter(a => userAllergens.includes(a));
                    if (matched.length === 0) return null;
                    return (
                      <div className="hsp-allergen-alert">
                        <span className="hsp-allergen-alert-icon">⚠️</span>
                        <div className="hsp-allergen-alert-text">
                          <strong>تنبيه حساسية!</strong> يحتوي على:{' '}
                          {matched.map(a => ALLERGENS.find(al => al.key === a)?.label || a).join('، ')}
                        </div>
                      </div>
                    );
                  })()}
                  {modalType.allergensTags && modalType.allergensTags.length > 0 && (
                    <div className="hsp-result-section">
                      <div className="hsp-result-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        الحساسيات المكتشفة
                      </div>
                      <div className="hsp-result-ingredients">
                        {modalType.allergensTags.map((a, i) => (
                          <span key={i} className={`hsp-ing-item ${userAllergens.includes(a) ? 'hsp-ing-danger' : 'hsp-ing-question'}`}>
                            {ALLERGENS.find(al => al.key === a)?.label || a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {modalType.nutriments && Object.keys(modalType.nutriments).length > 0 && (
                    <div className="hsp-result-section">
                      <div className="hsp-result-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                        القيمة الغذائية
                      </div>
                      <div className="hsp-nutrition-facts">
                        {modalType.nutriments.energy_kcal_100g != null && (
                          <div className="hsp-nutrition-row-item">
                            <span className="label">السعرات الحرارية</span>
                            <span className="value">{Math.round(modalType.nutriments.energy_kcal_100g)} سعرة/100غ</span>
                          </div>
                        )}
                        {modalType.nutriments.fat_100g != null && (
                          <div className="hsp-nutrition-row-item">
                            <span className="label">الدهون</span>
                            <span className="value">{modalType.nutriments.fat_100g.toFixed(1)}غ</span>
                          </div>
                        )}
                        {modalType.nutriments.saturated_fat_100g != null && (
                          <div className="hsp-nutrition-row-item">
                            <span className="label">الدهون المشبعة</span>
                            <span className="value">{modalType.nutriments.saturated_fat_100g.toFixed(1)}غ</span>
                          </div>
                        )}
                        {modalType.nutriments.carbohydrates_100g != null && (
                          <div className="hsp-nutrition-row-item">
                            <span className="label">الكربوهيدرات</span>
                            <span className="value">{modalType.nutriments.carbohydrates_100g.toFixed(1)}غ</span>
                          </div>
                        )}
                        {modalType.nutriments.sugars_100g != null && (
                          <div className="hsp-nutrition-row-item">
                            <span className="label">السكريات</span>
                            <span className="value">{modalType.nutriments.sugars_100g.toFixed(1)}غ</span>
                          </div>
                        )}
                        {modalType.nutriments.proteins_100g != null && (
                          <div className="hsp-nutrition-row-item">
                            <span className="label">البروتين</span>
                            <span className="value">{modalType.nutriments.proteins_100g.toFixed(1)}غ</span>
                          </div>
                        )}
                        {modalType.nutriments.salt_100g != null && (
                          <div className="hsp-nutrition-row-item">
                            <span className="label">الملح</span>
                            <span className="value">{modalType.nutriments.salt_100g.toFixed(2)}غ</span>
                          </div>
                        )}
                        {modalType.nutriments.fiber_100g != null && (
                          <div className="hsp-nutrition-row-item">
                            <span className="label">الألياف</span>
                            <span className="value">{modalType.nutriments.fiber_100g.toFixed(1)}غ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {modalType.ingredients && modalType.ingredients.length > 0 && (
                    <div className="hsp-result-section">
                      <div className="hsp-result-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        المكونات الآمنة
                      </div>
                      <div className="hsp-result-ingredients">
                        {(Array.isArray(modalType.ingredients) ? modalType.ingredients : modalType.ingredients.split(/[,،]/)).map((ing, i) => (
                          <span key={i} className="hsp-ing-item hsp-ing-safe">{ing.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="hsp-result-btns">
                    <button className="hsp-result-btn hsp-result-btn-primary" onClick={closeModal}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      حفظ النتيجة
                    </button>
                    <button className="hsp-result-btn hsp-result-btn-secondary" onClick={closeModal}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                      مشاركة
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Haram */}
            {modalType.status === 'haram' && (
              <div>
                <div className="hsp-result-hero haram">
                  <div className="hsp-result-icon haram-bg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </div>
                  <div className="hsp-result-status red">حرام ✗</div>
                  <div className="hsp-result-msg">يحتوي على مواد محرمة — يُنصح بتجنّبه</div>
                </div>
                <div className="hsp-result-details">
                  <div className="hsp-result-product">
                    <span className="hsp-rp-img">{modalType.emoji || '📦'}</span>
                    <div>
                      <div className="hsp-rp-name">{modalType.name}</div>
                      <div className="hsp-rp-brand">{modalType.brand || modalType.origin}</div>
                    </div>
                  </div>
                  {(modalType.nutritionGrade || modalType.novaGroup || modalType.ecoGrade) && (
                    <div className="hsp-nutrition-row">
                      {modalType.nutritionGrade && (
                        <div className="hsp-nutrition-badge">
                          <div className="hsp-nutrition-badge-letter" style={{ color: NUTRI_GRADE_COLORS[modalType.nutritionGrade] || 'var(--text3)' }}>
                            {(modalType.nutritionGrade || '').toUpperCase()}
                          </div>
                          <div className="hsp-nutrition-badge-name">Nutri-Score</div>
                          <div className="hsp-nutrition-badge-label">{NUTRI_GRADE_LABELS[modalType.nutritionGrade] || ''}</div>
                        </div>
                      )}
                      {modalType.novaGroup && (
                        <div className="hsp-nutrition-badge">
                          <div className="hsp-nutrition-badge-letter" style={{ color: NOVA_COLORS[modalType.novaGroup] || 'var(--text3)' }}>
                            {modalType.novaGroup}
                          </div>
                          <div className="hsp-nutrition-badge-name">NOVA</div>
                          <div className="hsp-nutrition-badge-label">{NOVA_LABELS[modalType.novaGroup] || ''}</div>
                        </div>
                      )}
                      {modalType.ecoGrade && (
                        <div className="hsp-nutrition-badge">
                          <div className="hsp-nutrition-badge-letter" style={{ color: ECO_GRADE_COLORS[modalType.ecoGrade] || 'var(--text3)' }}>
                            {(modalType.ecoGrade || '').toUpperCase()}
                          </div>
                          <div className="hsp-nutrition-badge-name">Eco-Score</div>
                          <div className="hsp-nutrition-badge-label">{ECO_GRADE_LABELS[modalType.ecoGrade] || ''}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {modalType.allergensTags && modalType.allergensTags.length > 0 && userAllergens.length > 0 && (() => {
                    const matched = modalType.allergensTags.filter(a => userAllergens.includes(a));
                    if (matched.length === 0) return null;
                    return (
                      <div className="hsp-allergen-alert">
                        <span className="hsp-allergen-alert-icon">⚠️</span>
                        <div className="hsp-allergen-alert-text">
                          <strong>تنبيه حساسية!</strong> يحتوي على:{' '}
                          {matched.map(a => ALLERGENS.find(al => al.key === a)?.label || a).join('، ')}
                        </div>
                      </div>
                    );
                  })()}
                  {modalType.found && modalType.found.length > 0 && (
                    <div className="hsp-result-section">
                      <div className="hsp-result-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        المواد المحرمة المكتشفة
                      </div>
                      <div className="hsp-result-ingredients">
                        {modalType.found.map((ing, i) => (
                          <span key={i} className="hsp-ing-item hsp-ing-danger">{ing}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {modalType.ingredients && modalType.ingredients.length > 0 && (
                    <div className="hsp-result-section">
                      <div className="hsp-result-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        مكونات أخرى
                      </div>
                      <div className="hsp-result-ingredients">
                        {(Array.isArray(modalType.ingredients) ? modalType.ingredients : modalType.ingredients.split(/[,،]/))
                          .filter(ing => {
                            const t = ing.trim().toLowerCase();
                            return !modalType.found?.some(f => t.includes(f.toLowerCase()));
                          })
                          .map((ing, i) => (
                            <span key={i} className="hsp-ing-item hsp-ing-safe">{ing.trim()}</span>
                          ))}
                      </div>
                    </div>
                  )}
                  <div className="hsp-result-btns">
                    <button className="hsp-result-btn hsp-result-btn-secondary" onClick={closeModal}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                      مشاركة التحذير
                    </button>
                    <button className="hsp-result-btn hsp-result-btn-primary" style={{ background: 'linear-gradient(135deg,var(--blue),#4488dd)' }}
                      onClick={() => { showToast('جارٍ البحث عن بدائل...'); closeModal(); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      بدائل حلال
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mashbooh */}
            {modalType.status === 'mashbooh' && (
              <div>
                <div className="hsp-result-hero mashbooh">
                  <div className="hsp-result-icon mashbooh-bg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div className="hsp-result-status gold">مشبوه ⚠</div>
                  <div className="hsp-result-msg">يحتوي على مكونات مشكوك فيها — يُنصح بالتحقق من المصدر</div>
                </div>
                <div className="hsp-result-details">
                  <div className="hsp-result-product">
                    <span className="hsp-rp-img">{modalType.emoji || '📦'}</span>
                    <div>
                      <div className="hsp-rp-name">{modalType.name}</div>
                      <div className="hsp-rp-brand">{modalType.brand || modalType.origin}</div>
                    </div>
                  </div>
                  {(modalType.nutritionGrade || modalType.novaGroup || modalType.ecoGrade) && (
                    <div className="hsp-nutrition-row">
                      {modalType.nutritionGrade && (
                        <div className="hsp-nutrition-badge">
                          <div className="hsp-nutrition-badge-letter" style={{ color: NUTRI_GRADE_COLORS[modalType.nutritionGrade] || 'var(--text3)' }}>
                            {(modalType.nutritionGrade || '').toUpperCase()}
                          </div>
                          <div className="hsp-nutrition-badge-name">Nutri-Score</div>
                          <div className="hsp-nutrition-badge-label">{NUTRI_GRADE_LABELS[modalType.nutritionGrade] || ''}</div>
                        </div>
                      )}
                      {modalType.novaGroup && (
                        <div className="hsp-nutrition-badge">
                          <div className="hsp-nutrition-badge-letter" style={{ color: NOVA_COLORS[modalType.novaGroup] || 'var(--text3)' }}>
                            {modalType.novaGroup}
                          </div>
                          <div className="hsp-nutrition-badge-name">NOVA</div>
                          <div className="hsp-nutrition-badge-label">{NOVA_LABELS[modalType.novaGroup] || ''}</div>
                        </div>
                      )}
                      {modalType.ecoGrade && (
                        <div className="hsp-nutrition-badge">
                          <div className="hsp-nutrition-badge-letter" style={{ color: ECO_GRADE_COLORS[modalType.ecoGrade] || 'var(--text3)' }}>
                            {(modalType.ecoGrade || '').toUpperCase()}
                          </div>
                          <div className="hsp-nutrition-badge-name">Eco-Score</div>
                          <div className="hsp-nutrition-badge-label">{ECO_GRADE_LABELS[modalType.ecoGrade] || ''}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {modalType.allergensTags && modalType.allergensTags.length > 0 && userAllergens.length > 0 && (() => {
                    const matched = modalType.allergensTags.filter(a => userAllergens.includes(a));
                    if (matched.length === 0) return null;
                    return (
                      <div className="hsp-allergen-alert">
                        <span className="hsp-allergen-alert-icon">⚠️</span>
                        <div className="hsp-allergen-alert-text">
                          <strong>تنبيه حساسية!</strong> يحتوي على:{' '}
                          {matched.map(a => ALLERGENS.find(al => al.key === a)?.label || a).join('، ')}
                        </div>
                      </div>
                    );
                  })()}
                  {modalType.suspicious && modalType.suspicious.length > 0 && (
                    <div className="hsp-result-section">
                      <div className="hsp-result-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        مكونات مشكوك فيها
                      </div>
                      <div className="hsp-result-ingredients">
                        {modalType.suspicious.map((ing, i) => (
                          <span key={i} className="hsp-ing-item hsp-ing-question">{ing}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {modalType.ingredients && modalType.ingredients.length > 0 && (
                    <div className="hsp-result-section">
                      <div className="hsp-result-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        مكونات آمنة
                      </div>
                      <div className="hsp-result-ingredients">
                        {(Array.isArray(modalType.ingredients) ? modalType.ingredients : modalType.ingredients.split(/[,،]/))
                          .filter(ing => {
                            const t = ing.trim().toLowerCase();
                            return !modalType.suspicious?.some(s => t.includes(s.toLowerCase()));
                          })
                          .map((ing, i) => (
                            <span key={i} className="hsp-ing-item hsp-ing-safe">{ing.trim()}</span>
                          ))}
                      </div>
                    </div>
                  )}
                  <div className="hsp-result-section">
                    <div className="hsp-result-section-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      توصية
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, background: 'var(--gold-dim)', padding: '10px 14px', borderRadius: 'var(--r-xs)', border: '1px solid rgba(240,176,64,.1)' }}>
                      تواصل مع الشركة المصنّعة للتأكد من مصدر الرنزيم والنكهات الطبيعية، أو ابحث عن منتج بديل مُصدّق حلال.
                    </div>
                  </div>
                  <div className="hsp-result-btns">
                    <button className="hsp-result-btn hsp-result-btn-secondary" onClick={closeModal}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72"/></svg>
                      تواصل مع الشركة
                    </button>
                    <button className="hsp-result-btn hsp-result-btn-primary" style={{ background: 'linear-gradient(135deg,var(--blue),#4488dd)' }}
                      onClick={() => { showToast('جارٍ البحث عن بدائل...'); closeModal(); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      بدائل حلال
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="hsp-toast">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        {toast}
      </div>}
    </div>
  );
}
