import { motion } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';

export default function Sources() {
  const { t } = useTranslation();

  const sources = [
    {
      category: t.sources?.catQuran || 'القرآن الكريم',
      icon: "📖",
      items: [
        { name: "Al-Quran Cloud API", url: "https://alquran.cloud", license: "مجاني - مفتوح المصدر", description: "API للنصوص القرآنية by Islamic Network" },
        { name: "Islamic Network CDN", url: "https://cdn.islamic.network", license: "مجاني - CC BY-NC 3.0", description: "ملفات صوتية للقرآن الكريم - أصوات القراء" },
        { name: "مشاري راشد العفاسي", url: "https://alafasy.com", license: "مرتّل القرآن الكريم", description: "صوت الشيخ مشاري راشد العفاسي - تم الحصول على الإذن من خلال Islamic Network" },
      ],
    },
    {
      category: t.sources?.catAzkar || 'الأذكار والأدعية',
      icon: "📿",
      items: [
        { name: "حصن المسلم", url: "https://hissnulmuslim.com", license: "مجاني", description: "مصدر الأذكار اليومية من حصن المسلم" },
        { name: "سنن أبي داود", url: "https://sunnah.com/abudawud", license: "مجاني - مفتوح المصدر", description: "مرجع الأحاديث النبوية" },
        { name: "صحيح البخاري", url: "https://sunnah.com/bukhari", license: "مجاني - مفتوح المصدر", description: "مرجع الأحاديث النبوية" },
        { name: "صحيح مسلم", url: "https://sunnah.com/muslim", license: "مجاني - مفتوح المصدر", description: "مرجع الأحاديث النبوية" },
        { name: "سنن الترمذي", url: "https://sunnah.com/tirmidhi", license: "مجاني - مفتوح المصدر", description: "مرجع الأحاديث النبوية" },
        { name: "سنن ابن ماجه", url: "https://sunnah.com/ibnmajah", license: "مجاني - مفتوح المصدر", description: "مرجع الأحاديث النبوية" },
      ],
    },
    {
      category: t.sources?.catTech || 'التقنية والتصميم',
      icon: "💻",
      items: [
        { name: "React", url: "https://react.dev", license: "MIT License", description: "مكتبة بناء واجهات المستخدم" },
        { name: "Vite", url: "https://vitejs.dev", license: "MIT License", description: "أداة بناء المشاريع" },
        { name: "Tailwind CSS", url: "https://tailwindcss.com", license: "MIT License", description: "مكتبة تصميم CSS" },
        { name: "Framer Motion", url: "https://www.framer.com/motion/", license: "MIT License", description: "مكتبة الحركات والتأثيرات" },
        { name: "Lucide Icons", url: "https://lucide.dev", license: "ISC License", description: "أيقونات مجانية ومفتوحة المصدر" },
      ],
    },
    {
      category: t.sources?.catFonts || 'الخطوط',
      icon: "🔤",
      items: [
        { name: "Amiri Font", url: "https://www.amiri-font.com", license: "SIL Open Font License", description: "خط عربي أنيق للقرآن" },
        { name: "Noto Naskh Arabic", url: "https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic", license: "SIL Open Font License", description: "خط عربي من Google" },
        { name: "Cairo", url: "https://fonts.google.com/specimen/Cairo", license: "SIL Open Font License", description: "خط عربي حديث من Google" },
        { name: "Amiri Quran", url: "https://fonts.google.com/specimen/Amiri+Quran", license: "SIL Open Font License", description: "خط عربي للقرآن الكريم" },
      ],
    },
    {
      category: t.sources?.catAudio || 'الصوت',
      icon: "🔊",
      items: [
        { name: "Web Speech API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API", license: "مجاني - مدمج في المتصفح", description: "تحويل النص إلى كلام - يستخدم أصوات النظام" },
        { name: "Islamic Network Audio", url: "https://cdn.islamic.network/quran/audio", license: "CC BY-NC 3.0", description: "ملفات صوتية مجانية للقرآن الكريم" },
      ],
    },
  ];

  return (
    <div className="page-wrap pb-24 px-4 pt-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📋</span>
          <h1 className="text-2xl font-bold text-text-primary">{t.sources?.title || 'المصادر والتراخيص'}</h1>
        </div>
        <p className="text-text-secondary text-sm">{t.sources?.subtitle || 'جميع المصادر المستخدمة في التطبيق'}</p>
      </motion.div>

      <div className="space-y-4">
        {sources.map((source, i) => (
          <motion.div
            key={source.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card rounded-2xl p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{source.icon}</span>
              <h2 className="text-accent-gold font-bold text-sm">{source.category}</h2>
            </div>
            <div className="space-y-2">
              {source.items.map((item, j) => (
                <div key={j} className="bg-bg-primary rounded-xl p-3 border border-border-light">
                  <div className="flex items-start justify-between mb-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-green text-sm font-bold hover:underline"
                    >
                      {item.name} ↗
                    </a>
                    <span className="text-accent-gold text-[10px] bg-accent-gold/10 px-1.5 py-0.5 rounded-full shrink-0">
                      {item.license}
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-bg-card rounded-2xl p-4 border border-border text-center"
      >
        <p className="text-text-muted text-xs leading-relaxed">
          {t.sources?.footer || 'هذا التطبيق مجاني ومفتوح المصدر جميع الحقوق محفوظة للمصادر المعتمدة'}
        </p>
        <p className="text-text-muted text-[10px] mt-2">
          {t.sources?.credit || 'صُنع بحب لوجه الله تعالى'} 🤲
        </p>
      </motion.div>
    </div>
  );
}
