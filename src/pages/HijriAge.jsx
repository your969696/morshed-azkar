import { useState } from 'react';
import { motion } from 'framer-motion';

function gregorianToHijri(gYear, gMonth, gDay) {
  try {
    const jd = Math.floor(365.25 * (gYear + 4716)) + Math.floor(30.6001 * (gMonth + 1)) + gDay - 1524.5;
    const l = Math.floor(jd - 1948439.5 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const lr = l - 10631 * n + 354;
    const j = Math.floor((10985 - lr) / 5316) * Math.floor((50 * lr) / 17719) + Math.floor(lr / 5670) * Math.floor((43 * lr) / 15238);
    const ld = lr - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const hm = Math.floor((24 * ld) / 709);
    const hd = ld - Math.floor((709 * hm) / 24);
    const hy = 30 * n + j - 30;
    return { year: hy, month: hm, day: hd };
  } catch {
    return null;
  }
}

function calculateAge(birthYear, birthMonth, birthDay) {
  const now = new Date();
  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

  let years = today.year - birthYear;
  let months = today.month - birthMonth;
  let days = today.day - birthDay;

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.year, today.month - 1, 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

function calculateDifference(birthGreg, birthHijri) {
  const nowGreg = new Date();
  const todayHijri = gregorianToHijri(nowGreg.getFullYear(), nowGreg.getMonth() + 1, nowGreg.getDate());

  if (!todayHijri) return null;

  const gregAge = calculateAge(birthGreg.year, birthGreg.month, birthGreg.day);
  const hijriAge = {
    years: todayHijri.year - birthHijri.year,
    months: todayHijri.month - birthHijri.month,
    days: todayHijri.day - birthHijri.day,
  };

  if (hijriAge.days < 0) {
    hijriAge.months--;
    hijriAge.days += 29;
  }
  if (hijriAge.months < 0) {
    hijriAge.years--;
    hijriAge.months += 12;
  }

  const gregTotalDays = gregAge.years * 365 + gregAge.months * 30 + gregAge.days;
  const hijriTotalDays = hijriAge.years * 354 + hijriAge.months * 29 + hijriAge.days;
  const diffDays = gregTotalDays - hijriTotalDays;

  return { gregAge, hijriAge, diffDays };
}

const HIJRI_MONTHS = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const GREG_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const pageCss = `
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
.hijri-page{background:#0c0818;min-height:100vh;padding:16px 16px 100px;font-family:'Segoe UI',Tahoma,sans-serif;color:#fff;direction:rtl}
.hijri-hero{background:linear-gradient(170deg,#1c1040 0%,#0c0818 100%);border-radius:20px;padding:24px 20px;margin-bottom:20px;position:relative;overflow:hidden}
.hijri-hero::before{content:'';position:absolute;top:-60px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(240,176,64,.15),transparent 70%);pointer-events:none}
.hijri-hero-icon{font-size:48px;margin-bottom:12px}
.hijri-hero-title{font-size:22px;font-weight:800;color:#fff;margin-bottom:4px}
.hijri-hero-sub{font-size:12px;color:rgba(255,255,255,.45);line-height:1.6}
.hijri-input-card{background:#151030;border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:20px;margin-bottom:16px}
.hijri-input-label{font-size:12px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:10px;display:block}
.hijri-input-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
.hijri-input-wrap{display:flex;flex-direction:column;gap:4px}
.hijri-input-field{width:100%;padding:12px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#fff;font-size:16px;font-weight:700;text-align:center;font-family:inherit;outline:none;transition:all .2s}
.hijri-input-field:focus{border-color:rgba(240,176,64,.4);background:rgba(240,176,64,.06)}
.hijri-input-field::placeholder{color:rgba(255,255,255,.2)}
.hijri-input-hint{font-size:10px;color:rgba(255,255,255,.3);text-align:center}
.hijri-btn{width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#f0b040,#e09020);color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:all .2s}
.hijri-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(240,176,64,.3)}
.hijri-btn:active{transform:scale(.98)}
.hijri-result{animation:fadeIn .4s ease}
.hijri-result-card{background:#151030;border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:20px;margin-bottom:16px}
.hijri-age-display{display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:16px}
.hijri-age-box{text-align:center;flex:1}
.hijri-age-num{font-size:36px;font-weight:900;line-height:1;animation:countUp .5s ease}
.hijri-age-label{font-size:11px;color:rgba(255,255,255,.4);margin-top:4px;font-weight:600}
.hijri-age-sub{font-size:12px;color:rgba(255,255,255,.5);text-align:center;margin-bottom:16px;line-height:1.6}
.hijri-sep{width:1px;height:40px;background:rgba(255,255,255,.1)}
.hijri-diff-badge{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;border-radius:12px;background:rgba(240,176,64,.08);border:1px solid rgba(240,176,64,.15)}
.hijri-diff-text{font-size:12px;color:#f0b040;font-weight:700}
.hijri-section{background:#151030;border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:20px;margin-bottom:16px}
.hijri-section-title{font-size:14px;font-weight:800;color:#f0b040;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.hijri-section-text{font-size:12px;color:rgba(255,255,255,.55);line-height:2}
.hijri-section-text strong{color:rgba(255,255,255,.8)}
.hijri-example{background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.12);border-radius:12px;padding:14px;margin-top:12px}
.hijri-example-title{font-size:11px;font-weight:700;color:#00c896;margin-bottom:6px}
.hijri-example-text{font-size:11px;color:rgba(255,255,255,.5);line-height:1.8}
.hijri-table{width:100%;border-collapse:collapse;margin-top:12px}
.hijri-table th{font-size:10px;font-weight:700;color:rgba(255,255,255,.4);padding:8px 6px;text-align:right;border-bottom:1px solid rgba(255,255,255,.06)}
.hijri-table td{font-size:11px;color:rgba(255,255,255,.6);padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.04)}
.hijri-table tr:last-child td{border-bottom:none}
.hijri-fact{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.hijri-fact:last-child{border-bottom:none}
.hijri-fact-icon{font-size:18px;flex-shrink:0;margin-top:2px}
.hijri-fact-text{font-size:11px;color:rgba(255,255,255,.5);line-height:1.7}
.hijri-fact-text strong{color:rgba(255,255,255,.75)}
`;

export default function HijriAge() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1 || y > 2026) return;

    const birthDate = new Date(y, m - 1, d);
    if (birthDate > new Date()) return;

    const hijriBirth = gregorianToHijri(y, m, d);
    if (!hijriBirth) return;

    const age = calculateDifference({ year: y, month: m, day: d }, hijriBirth);
    if (!age) return;

    setResult({ birth: { year: y, month: m, day: d }, hijriBirth, ...age });
  };

  return (
    <>
      <style>{pageCss}</style>
      <div className="hijri-page">
        <motion.div className="hijri-hero" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="hijri-hero-icon">📅</div>
          <h1 className="hijri-hero-title">حساب العمر الهجري</h1>
          <p className="hijri-hero-sub">أدخل تاريخ ميلادك الميلادي وسنتعرف على عمرك بالهجري والفرق بين التقويمين</p>
        </motion.div>

        <motion.div className="hijri-input-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="hijri-input-label">📅 تاريخ الميلاد الميلادي</label>
          <div className="hijri-input-row">
            <div className="hijri-input-wrap">
              <input type="number" min="1" max="31" placeholder="15" value={day} onChange={e => setDay(e.target.value)} className="hijri-input-field" />
              <span className="hijri-input-hint">اليوم</span>
            </div>
            <div className="hijri-input-wrap">
              <input type="number" min="1" max="12" placeholder="8" value={month} onChange={e => setMonth(e.target.value)} className="hijri-input-field" />
              <span className="hijri-input-hint">الشهر</span>
            </div>
            <div className="hijri-input-wrap">
              <input type="number" min="1" max="2026" placeholder="1990" value={year} onChange={e => setYear(e.target.value)} className="hijri-input-field" />
              <span className="hijri-input-hint">السنة</span>
            </div>
          </div>
          <button className="hijri-btn" onClick={handleCalculate}>احسب عمري بالهجري</button>
        </motion.div>

        {result && (
          <motion.div className="hijri-result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="hijri-result-card">
              <div className="hijri-age-display">
                <div className="hijri-age-box">
                  <div className="hijri-age-num" style={{ color: '#f0b040' }}>{result.hijriAge.years}</div>
                  <div className="hijri-age-label">سنة هجرية</div>
                </div>
                <div className="hijri-sep" />
                <div className="hijri-age-box">
                  <div className="hijri-age-num" style={{ color: '#00c896', fontSize: 28 }}>{result.hijriAge.months}</div>
                  <div className="hijri-age-label">شهر</div>
                </div>
                <div className="hijri-sep" />
                <div className="hijri-age-box">
                  <div className="hijri-age-num" style={{ color: '#8b5cf6', fontSize: 28 }}>{result.hijriAge.days}</div>
                  <div className="hijri-age-label">يوم</div>
                </div>
              </div>

              <div className="hijri-age-sub">
                تاريخ ميلادك الميلادي: {result.birth.day} {GREG_MONTHS[result.birth.month - 1]} {result.birth.year}<br/>
                تاريخ ميلادك الهجري: {result.hijriBirth.day} {HIJRI_MONTHS[result.hijriBirth.month - 1]} {result.hijriBirth.year} هـ
              </div>

              <div className="hijri-diff-badge">
                <span style={{ fontSize: 16 }}>📊</span>
                <span className="hijri-diff-text">
                  عمرك الهجري أقل من الميلادي بـ {result.diffDays} يوم
                </span>
              </div>
            </div>

            <div className="hijri-section">
              <div className="hijri-section-title">🔍 لماذا عمرك الهجري أقل؟</div>
              <div className="hijri-section-text">
                <strong>التقويم الهجري قمري والميلادي شمسي:</strong><br/>
                التقويم الهجري مبني على دورة القمر حول الأرض، whereas التقويم الميلادي مبني على دوران الأرض حول الشمس.
                <br/><br/>
                <strong>الفرق في عدد الأيام:</strong><br/>
                • السنة الهجرية: <strong>354.33 يوم</strong> (12 شهر قمري)<br/>
                • السنة الميلادية: <strong>365.25 يوم</strong><br/>
                • الفرق: <strong>~10.92 يوم</strong> كل سنة
                <br/><br/>
                <strong>النتيجة:</strong><br/>
                كل سنة هجرية، يتقدم التقويم الهجري بـ 10-11 يوم مقارنة بالميلادي. هذا يعني أنك كلما تقدمت في العمر، يصبح فرق العمر أكبر.
              </div>

              <div className="hijri-example">
                <div className="hijri-example-title">💡 مثال عملي</div>
                <div className="hijri-example-text">
                  {(() => {
                    const refYear = 2000;
                    const refAge = new Date().getFullYear() - refYear;
                    const refHijri = Math.floor((refAge * 365.25) / 354.33);
                    const refDiff = Math.floor((refAge * 10.92) / 365.25);
                    return `إذا ولدت في 1 يناير ${refYear}م:\n• عمرك الميلادي: ${refAge} سنة\n• عمرك الهجري: حوالي ${refHijri} سنة\n• الفرق: حوالي ${refDiff} سنة هجرية`;
                  })().split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </div>
              </div>
            </div>

            <div className="hijri-section">
              <div className="hijri-section-title">📊 جدول مقارنة</div>
              <table className="hijri-table">
                <thead>
                  <tr>
                    <th>البند</th>
                    <th>التقويم الهجري</th>
                    <th>التقويم الميلادي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>عدد أيام السنة</td>
                    <td style={{ color: '#f0b040' }}>354 يوم</td>
                    <td style={{ color: '#00c896' }}>365 يوم</td>
                  </tr>
                  <tr>
                    <td>عدد أشهر السنة</td>
                    <td style={{ color: '#f0b040' }}>12 شهر</td>
                    <td style={{ color: '#00c896' }}>12 شهر</td>
                  </tr>
                  <tr>
                    <td>مدة الشهر</td>
                    <td style={{ color: '#f0b040' }}>29 أو 30 يوم</td>
                    <td style={{ color: '#00c896' }}>28-31 يوم</td>
                  </tr>
                  <tr>
                    <td>نوع التقويم</td>
                    <td style={{ color: '#f0b040' }}>قمري</td>
                    <td style={{ color: '#00c896' }}>شمسي</td>
                  </tr>
                  <tr>
                    <td>السنة الكبيسة</td>
                    <td style={{ color: '#f0b040' }}>كل 30 سنة</td>
                    <td style={{ color: '#00c896' }}>كل 4 سنوات</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="hijri-section">
              <div className="hijri-section-title">💡 حقائق مثيرة</div>
              <div className="hijri-fact">
                <span className="hijri-fact-icon">🌙</span>
                <span className="hijri-fact-text">
                  <strong>القمر هو السبب:</strong> التقويم الهجري يعتمد على رؤية الهلال الجديد، مما يجعله أقصر بحوالي 11 يوماً من التقويم الشمسي.
                </span>
              </div>
              <div className="hijri-fact">
                <span className="hijri-fact-icon">🔄</span>
                <span className="hijri-fact-text">
                  <strong>دورة الـ 33 سنة:</strong> بعد حوالي 33 سنة هجرية (32.5 سنة ميلادية)، يعود التقويم الهجري لنفس الموسم تقريباً.
                </span>
              </div>
              <div className="hijri-fact">
                <span className="hijri-fact-icon">📅</span>
                <span className="hijri-fact-text">
                  <strong>رمضان يتقدم:</strong> بسبب هذا الفرق، يتحرك شهر رمضان حوالي 10-11 يوماً للأقدم كل سنة ميلادية.
                </span>
              </div>
              <div className="hijri-fact">
                <span className="hijri-fact-icon">🌍</span>
                <span className="hijri-fact-text">
                  <strong>استخدام مزدوج:</strong> المسلمين يستخدمون التقويم الهجري للعبادات والتقويم الميلادي للأعمال والمعاملات اليومية.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
