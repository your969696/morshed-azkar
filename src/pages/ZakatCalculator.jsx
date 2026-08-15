import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateZakat, ZAKAT_CATEGORIES, ZAKAT_RATE } from '../utils/zakat.js';
import { useTranslation } from '../i18n.jsx';

const wealthFields = [
  { key: 'cash', labelKey: 'cash', icon: '💵', placeholderKey: 'cashPh' },
  { key: 'gold', labelKey: 'gold', icon: '🪙', placeholderKey: 'goldPh' },
  { key: 'silver', labelKey: 'silver', icon: '🥈', placeholderKey: 'silverPh' },
  { key: 'investments', labelKey: 'investments', icon: '📈', placeholderKey: 'investmentsPh' },
  { key: 'savings', labelKey: 'savings', icon: '🏦', placeholderKey: 'savingsPh' },
  { key: 'receivables', labelKey: 'receivables', icon: '📋', placeholderKey: 'receivablesPh' },
  { key: 'realEstate', labelKey: 'realEstate', icon: '🏠', placeholderKey: 'realEstatePh' },
  { key: 'otherAssets', labelKey: 'otherAssets', icon: '📦', placeholderKey: 'otherAssetsPh' },
  { key: 'debts', labelKey: 'debts', icon: '💳', placeholderKey: 'debtsPh', subtract: true },
];

export default function ZakatCalculator() {
  const { t } = useTranslation();
  const [wealth, setWealth] = useState({
    cash: 0, gold: 0, silver: 0, investments: 0,
    savings: 0, receivables: 0, realEstate: 0,
    otherAssets: 0, debts: 0,
  });

  const result = useMemo(() => calculateZakat(wealth), [wealth]);

  const handleChange = (key, value) => {
    const num = parseFloat(value) || 0;
    setWealth(prev => ({ ...prev, [key]: num }));
  };

  return (
    <div className="page-wrap pb-24">
      <style>{`
        .zakat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
        }
        .zakat-input {
          width: 100%;
          padding: 14px 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: white;
          font-size: 16px;
          text-align: right;
          direction: rtl;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .zakat-input:focus {
          border-color: var(--accent-purple);
        }
        .zakat-input::placeholder {
          color: var(--text-muted);
        }
        .zakat-input-subtract {
          border-color: rgba(239,68,68,0.2);
        }
        .zakat-input-subtract:focus {
          border-color: #ef4444;
        }
        .zakat-result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .zakat-result-row:last-child {
          border-bottom: none;
        }
        .zakat-amount {
          color: var(--accent-green);
          font-size: 22px;
          font-weight: bold;
        }
        .zakat-category-card {
          background: #1a1230;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 8px;
        }
        .zakat-yes {
          color: var(--accent-green);
          background: rgba(0,200,150,0.1);
          border: 1px solid rgba(0,200,150,0.25);
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: bold;
        }
        .zakat-no {
          color: #f59e0b;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: bold;
        }
        .zakat-info-box {
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="relative overflow-hidden" style={{ minHeight: '160px' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1c1040 0%, #2d1b69 40%, #1e1545 70%, #0f0a1a 100%)' }}>
          <svg viewBox="0 0 400 60" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,60 L0,50 L20,50 L25,35 L30,50 L45,50 L50,25 L55,50 L70,50 L75,40 L80,50 L120,50 L130,20 L140,50 L180,50 L185,42 L190,50 L220,50 L225,30 L230,50 L260,50 L270,22 L280,50 L310,50 L315,38 L320,50 L350,50 L360,15 L370,50 L400,50 L400,60 Z" fill="#0f0a1a" opacity="0.6" />
          </svg>
        </div>
        <div className="relative z-10 px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🧮</span>
            <h1 className="text-2xl font-bold text-white">{t.zakat?.title || 'حاسبة الزكاة'}</h1>
          </div>
          <p className="text-white/70 text-sm">{t.zakat?.subtitle || 'احسب زكاة أموالك بسهولة'}</p>
        </div>
      </div>

      <div className="px-4 -mt-2 relative z-20">

        <motion.div
          className="zakat-info-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-white/90 text-sm font-bold mb-2">{t.zakat?.infoTitle || 'معلومات عن الزكاة'}</p>
          <p className="text-white/60 text-xs leading-relaxed" style={{ textAlign: 'right' }}>
            {t.zakat?.info1 || 'نِصاب الذهب: 85 جرام | نِصاب الفضة: 595 جرام'}
            <br />
            نسبة الزكاة: {ZAKAT_RATE * 100}% من الثروة الخاضعة للزكاة
            <br />
            {t.zakat?.info2 || 'تُجب الزكاة إذا بلغت ثروتك النِصاب ومرّ عليها عام هجري'}
          </p>
        </motion.div>

        <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#8b5cf6] rounded-full"></span>
          {t.zakat?.assets || 'الأصول'}
        </h2>

        {wealthFields.filter(f => !f.subtract).map((field, i) => (
          <motion.div
            key={field.key}
            className="zakat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{field.icon}</span>
              <label className="text-white font-bold text-sm">{t.zakat?.[field.labelKey] || field.labelKey}</label>
            </div>
            <input
              type="number"
              className="zakat-input"
              placeholder={t.zakat?.[field.placeholderKey] || field.placeholderKey}
              value={wealth[field.key] || ''}
              onChange={e => handleChange(field.key, e.target.value)}
              min="0"
            />
          </motion.div>
        ))}

        <h2 className="text-white font-bold text-lg mb-3 mt-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#ef4444] rounded-full"></span>
          {t.zakat?.liabilities || 'الخصومات'}
        </h2>

        {wealthFields.filter(f => f.subtract).map((field, i) => (
          <motion.div
            key={field.key}
            className="zakat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + 0.05 * i }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{field.icon}</span>
              <label className="text-white font-bold text-sm">{t.zakat?.[field.labelKey] || field.labelKey}</label>
            </div>
            <input
              type="number"
              className="zakat-input zakat-input-subtract"
              placeholder={t.zakat?.[field.placeholderKey] || field.placeholderKey}
              value={wealth[field.key] || ''}
              onChange={e => handleChange(field.key, e.target.value)}
              min="0"
            />
          </motion.div>
        ))}

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#00c896] rounded-full"></span>
            {t.zakat?.results || 'النتائج'}
          </h2>

          <div className="zakat-card">
            <div className="zakat-result-row">
              <span className="text-[#7a6f96] text-sm">{t.zakat?.totalWealth || 'إجمالي الثروة'}</span>
              <span className="text-white font-bold">{result.totalWealth.toLocaleString('ar-EG')} ر.س</span>
            </div>
            <div className="zakat-result-row">
              <span className="text-[#7a6f96] text-sm">{t.zakat?.totalDebts || 'إجمالي الديون'}</span>
              <span className="text-[#ef4444] font-bold">-{result.totalDeductible.toLocaleString('ar-EG')} ر.س</span>
            </div>
            <div className="zakat-result-row">
              <span className="text-[#7a6f96] text-sm">{t.zakat?.taxableWealth || 'الثروة الخاضعة للزكاة'}</span>
              <span className="text-white font-bold">{result.zakatableWealth.toLocaleString('ar-EG')} ر.س</span>
            </div>
            <div className="zakat-result-row" style={{ borderBottom: 'none', paddingTop: 16, paddingBottom: 4 }}>
              <span className="text-white font-bold text-base">{t.zakat?.zakatAmount || 'مبلغ الزكاة'}</span>
              <span className="zakat-amount">{result.zakatAmount.toLocaleString('ar-EG')} ر.س</span>
            </div>
            <div className="zakat-result-row" style={{ borderBottom: 'none', paddingTop: 8, paddingBottom: 0 }}>
              <span className="text-[#7a6f96] text-sm">{t.zakat?.isZakatDue || 'هل تجب الزكاة؟'}</span>
              <span className={result.isObligatory ? 'zakat-yes' : 'zakat-no'}>
                {result.isObligatory ? (t.zakat?.yes || 'نعم') : (t.zakat?.no || 'لا')}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#ec4899] rounded-full"></span>
            {t.zakat?.recipients || 'مستحقو الزكاة (٩:٦٠)'}
          </h2>

          <AnimatePresence>
            {ZAKAT_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                className="zakat-category-card"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.04 }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-[#8b5cf6] font-bold text-lg mt-0.5">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{cat.name_ar}</p>
                    <p className="text-[#7a6f96] text-xs mt-0.5">{cat.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}
