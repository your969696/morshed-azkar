import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   Web3Forms — https://web3forms.com
   Access Key هيوصلك على azkarfeedback@proton.me
   ═══════════════════════════════════════════════════════════ */
const WEB3FORMS_KEY = 'd40b86cf-076a-4f00-bcfa-a7e86e876d6d';

/* ═══════════════════════════════════════════════════════════
   Security: Detect links/URLs in text
   ═══════════════════════════════════════════════════════════ */
const URL_REGEX = /(?:https?:\/\/|www\.|ftp:\/\/|file:\/\/|mailto:|\.com|\.net|\.org|\.edu|\.gov|\.io|\.me|\.co|\.ly|\.cc|\.xyz|\.site|\.online|\.click|\.link|\.url|bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|buff\.ly|ow\.ly|cutt\.ly|shorturl|rebrand\.ly|tiny\.cc|v\.gd|qr\.ae|rb\.gy|short\.io|bl\.ink|lnkd\.in|dw\.pw|cut\.py|shorturl\.at|shorter\.io|clck\.ru|vju\.ly|tny\.im|qr\.net|qr\.co|qrlink\.io)/i;
const hasLinks = (text) => URL_REGEX.test(text);

const FILE_REGEX = /\.\w{2,5}\b/gi;
const DANGEROUS_EXTS = ['exe','bat','cmd','sh','ps1','vbs','js','msi','dll','scr','pif','com','jar','app','dmg','pkg','deb','rpm','apk','xap'];
const hasAttachments = (text) => {
  const matches = text.match(FILE_REGEX) || [];
  return matches.some(m => DANGEROUS_EXTS.includes(m.replace('.','').toLowerCase()));
};

export default function ContactForm({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [focusField, setFocusField] = useState(null);

  const combinedText = `${form.name} ${form.subject} ${form.message}`;
  const linkDetected = useMemo(() => hasLinks(combinedText), [combinedText]);
  const fileDetected = useMemo(() => hasAttachments(combinedText), [combinedText]);
  const blockMessage = linkDetected
    ? 'يُمنع إرسال الروابط — احذفها وأعد المحاولة'
    : fileDetected
    ? 'يُمنع إرسال أسماء ملفات — احذفها وأعد المحاولة'
    : '';

  const canSend = form.name.trim().length >= 2 && form.email.trim().includes('@') && form.message.trim().length >= 5 && !blockMessage;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canSend || sending) return;
    setSending(true);
    setStatus(null);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          subject: form.subject.trim() || 'رسالة من تطبيق الأذكار',
          message: [
            `الاسم: ${form.name.trim()}`,
            form.email.trim() ? `الإيميل: ${form.email.trim()}` : '',
            form.subject.trim() ? `الموضوع: ${form.subject.trim()}` : '',
            ``,
            form.message.trim(),
            ``,
            `———`,
            `أرسلت من تطبيق الأذكار`,
          ].filter(Boolean).join('\n'),
          from_name: 'تطبيق الأذكار',
          _captcha: 'false',
          reply_to: form.email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Send failed');
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Send error:', err);
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  const update = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const inputStyle = (field) => ({
    width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: 12,
    background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.7)',
    border: focusField === field
      ? '1px solid rgba(124,58,237,.35)'
      : '1px solid rgba(255,255,255,.06)',
    outline: 'none', transition: 'all .2s',
    fontFamily: 'inherit', direction: 'rtl',
    boxShadow: focusField === field ? '0 0 0 3px rgba(124,58,237,.06)' : 'none',
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, height: '100vh', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(12px)',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxHeight: '85vh', overflowY: 'auto',
            background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
            borderRadius: 20, border: '1px solid rgba(139,92,246,.25)',
            padding: '28px 22px',
            boxShadow: '0 0 40px rgba(139,92,246,.15)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✉️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#a78bfa', fontFamily: '"Cairo",sans-serif' }}>
              تواصل معنا
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
              ابعث رسالة أو اقتراح وسنرد عليك بإذن الله
            </div>
            <div style={{ fontSize: 10, color: 'rgba(239,68,68,.6)', marginTop: 6, padding: '4px 8px', borderRadius: 6, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)' }}>
              يُمنع إرسال الروابط والملفات
            </div>
          </div>

          {/* Block warning */}
          {blockMessage && (
            <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', fontSize: 12, color: '#f87171', fontWeight: 600 }}>
              {blockMessage}
            </div>
          )}

          {/* Success */}
          <AnimatePresence mode="wait">
            {status === 'success' && (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                style={{
                  marginBottom: 14, padding: '14px', borderRadius: 12, gap: 8,
                  background: 'linear-gradient(135deg, rgba(5,150,105,.08), rgba(16,185,129,.03))',
                  border: '1px solid rgba(5,150,105,.15)', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>تم الإرسال بنجاح!</div>
                <div style={{ fontSize: 11, color: 'rgba(5,150,105,.5)', marginTop: 2 }}>شكراً لملاحظاتك — سنراجعها قريباً</div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                style={{
                  marginBottom: 14, padding: '10px 14px', borderRadius: 10, gap: 8,
                  background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.12)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>⚠️ فشل الإرسال</div>
                <div style={{ fontSize: 10, color: 'rgba(239,68,68,.4)', marginTop: 2 }}>تأكد من اتصال الإنترنت وحاول مرة أخرى</div>
              </motion.div>
            )}
          </AnimatePresence>

          {status !== 'success' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Name + Subject */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.3)', marginBottom: 3, display: 'block' }}>الاسم *</label>
                  <input type="text" value={form.name} onChange={update('name')}
                    onFocus={() => setFocusField('name')} onBlur={() => setFocusField(null)}
                    placeholder="اسمك الكريم" maxLength={50} required
                    style={inputStyle('name')} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.3)', marginBottom: 3, display: 'block' }}>البريد الإلكتروني *</label>
                  <input type="email" value={form.email} onChange={update('email')}
                    onFocus={() => setFocusField('email')} onBlur={() => setFocusField(null)}
                    placeholder="علشان نقدر نرد عليك" maxLength={100} required
                    style={inputStyle('email')} />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.3)', marginBottom: 3, display: 'block' }}>الموضوع</label>
                <input type="text" value={form.subject} onChange={update('subject')}
                  onFocus={() => setFocusField('subject')} onBlur={() => setFocusField(null)}
                  placeholder="اقتراح / مشكلة / ملاحظة" maxLength={80}
                  style={inputStyle('subject')} />
              </div>

              {/* Message */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.3)' }}>الرسالة *</label>
                  <span style={{ fontSize: 9, color: form.message.length > 900 ? 'rgba(239,68,68,.4)' : 'rgba(255,255,255,.1)' }}>
                    {form.message.length}/1000
                  </span>
                </div>
                <textarea value={form.message}
                  onChange={(e) => { if (e.target.value.length <= 1000) update('message')(e); }}
                  onFocus={() => setFocusField('message')} onBlur={() => setFocusField(null)}
                  placeholder="اكتب ملاحظتك أو اقتراحك هنا..." rows={5} required
                  style={{
                    ...inputStyle('message'), resize: 'none', lineHeight: 1.7, minHeight: 100,
                    border: linkDetected ? '1px solid rgba(239,68,68,.5)' : inputStyle('message').border,
                    background: linkDetected ? 'rgba(239,68,68,.06)' : inputStyle('message').background,
                  }} />
              </div>

              {/* Send button */}
              <motion.button
                type="submit"
                disabled={!canSend || sending}
                whileHover={canSend && !sending ? { scale: 1.01 } : {}}
                whileTap={canSend && !sending ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: canSend ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,.06)',
                  color: canSend ? '#fff' : 'rgba(255,255,255,.3)',
                  border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', position: 'relative', overflow: 'hidden',
                  boxShadow: canSend ? '0 4px 20px rgba(124,58,237,.25)' : 'none',
                  transition: 'all .2s',
                }}>
                <span className="relative z-10 flex items-center justify-center" style={{ gap: 6 }}>
                  {sending ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'inline-block', fontSize: 14 }}>⟳</motion.span>
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 15 }}>📤</span>
                      <span>إرسال الرسالة</span>
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 14, display: 'flex', justifyContent: 'center' }}>
            <button onClick={onClose}
              style={{
                padding: '8px 24px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.04)',
                color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              إغلاق
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,.06)', marginTop: 8 }}>
            رسالتك ستصل مباشرة · لا نشارك بياناتك مع أي طرف
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
