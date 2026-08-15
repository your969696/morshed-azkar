import { useState } from 'react';
import { useTranslation } from '../i18n.jsx';

const GUIDE_DATA = {
  ar: {
    heroTitle: "في طريقك إلى الحقيقة",
    heroSub: "سواء كنت مسلماً جديداً أو باحثاً بصدق، هذه الصفحة لك",
    tabs: ["الباحثون", "المسلم الجديد", "أدعية"],
    skLabel: "للباحث بقلب صادق",
    skReflection: "إذا كنت تبحث عن الحقيقة بصدق، فاسأل بقلبك: \"يا الله، إن كنت موجوداً فأرني الحقيقة.\" من سأل بصدق ووجد قلبه مفتوحاً — وجد.",
    skAttr: "دعوة للتأمل الصادق",
    skV1Ar: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    skV1: "وإذا سألك عبادي عني فإني قريب، أجيب دعوة الداعي إذا دعاني — البقرة ١٨٦",
    skV2Ar: "فَأَقِمْ وَجْهَكَ لِلدِّينِ حَنِيفًا ۚ فِطْرَتَ اللَّهِ الَّتِي فَطَرَ النَّاسَ عَلَيْهَا",
    skV2: "أقم وجهك للدين حنيفاً — فطرة الله التي فطر الناس عليها — الروم ٣٠",
    skCtaText: "اسأل بصدق وانتظر. الله يسمع كل سؤال يخرج من القلب.",
    skCtaBtn: "أريد أن أعرف أكثر",
    nmLabel: "خطواتك الأولى",
    steps: [
      { n: 1, title: "الشهادة", body: "قل بقلب صادق: أشهد أن لا إله إلا الله وأن محمداً رسول الله. هذه هي البداية." },
      { n: 2, title: "تعلم الصلاة", body: "الصلاة خمس مرات يومياً. ابدأ بصلاة الفجر. لا تقلق إن لم تكمل كل شيء دفعة واحدة — الله يعلم نيتك." },
      { n: 3, title: "اقرأ القرآن", body: "ابدأ بسورة الفاتحة. اقرأها ببطء وتأمل في معناها. هي أم الكتاب." },
      { n: 4, title: "ابحث عن مجتمع", body: "اذهب لأقرب مسجد وعرّف نفسك. المسلمون يفرحون بالأخ الجديد ويساعدون." },
      { n: 5, title: "كن صبوراً على نفسك", body: "الإسلام دين يسر لا عسر. كل خطوة صغيرة تحسب. الله يحب التدرج." },
    ],
    duLabel: "أدعية للبداية",
    duas: [
      { arabic: "رَبِّ زِدْنِي عِلْمًا", trans: "ربِّ زدني علماً — طه ١١٤" },
      { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", trans: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار — البقرة ٢٠١" },
      { arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي", trans: "اللهم اهدني وسددني — رواه مسلم" },
      { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", trans: "ربِّ اشرح لي صدري ويسر لي أمري — طه ٢٥-٢٦" },
    ],
  },
  en: {
    heroTitle: "On your path to truth",
    heroSub: "Whether you're a new Muslim or an honest seeker, this page is for you",
    tabs: ["Seekers", "New Muslim", "Duas"],
    skLabel: "For the sincere seeker",
    skReflection: "If you're searching for truth with sincerity, ask in your heart: \"God, if You exist, show me the truth.\" Whoever asks honestly and keeps their heart open — finds.",
    skAttr: "An invitation to sincere reflection",
    skV1Ar: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    skV1: "And when My servants ask you about Me — I am near. I respond to the call of the caller when he calls upon Me. — Al-Baqarah 2:186",
    skV2Ar: "فَأَقِمْ وَجْهَكَ لِلدِّينِ حَنِيفًا ۚ فِطْرَتَ اللَّهِ الَّتِي فَطَرَ النَّاسَ عَلَيْهَا",
    skV2: "So direct your face toward the religion, inclining to truth. The natural disposition upon which God has created people. — Ar-Rum 30:30",
    skCtaText: "Ask sincerely and wait. God hears every question that comes from the heart.",
    skCtaBtn: "I want to know more",
    nmLabel: "Your first steps",
    steps: [
      { n: 1, title: "The Shahada", body: "Say with a sincere heart: I bear witness that there is no god but Allah, and that Muhammad is His messenger. This is the beginning." },
      { n: 2, title: "Learn to pray", body: "Prayer is five times a day. Start with Fajr. Don't worry if you can't do everything at once — God knows your intention." },
      { n: 3, title: "Read the Quran", body: "Start with Al-Fatiha. Read it slowly and reflect on its meaning. It is the mother of the Book." },
      { n: 4, title: "Find a community", body: "Go to the nearest mosque and introduce yourself. Muslims are happy to welcome a new brother or sister." },
      { n: 5, title: "Be patient with yourself", body: "Islam is a religion of ease, not hardship. Every small step counts. God loves gradual progress." },
    ],
    duLabel: "Duas for the beginning",
    duas: [
      { arabic: "رَبِّ زِدْنِي عِلْمًا", trans: "My Lord, increase me in knowledge. — Ta-Ha 20:114" },
      { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", trans: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of Fire. — Al-Baqarah 2:201" },
      { arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي", trans: "O Allah, guide me and make me steadfast. — Muslim" },
      { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", trans: "My Lord, expand my chest and ease my task for me. — Ta-Ha 20:25-26" },
    ],
  },
  es: {
    heroTitle: "En tu camino hacia la verdad",
    heroSub: "Seas un nuevo musulmán o un buscador sincero, esta página es para ti",
    tabs: ["Buscadores", "Nuevo Musulmán", "Duas"],
    skLabel: "Para el buscador sincero",
    skReflection: "Si buscas la verdad con sinceridad, pregunta en tu corazón: \"Dios, si existes, muéstrame la verdad.\" Quien pregunta honestamente y mantiene el corazón abierto — encuentra.",
    skAttr: "Una invitación a la reflexión sincera",
    skV1Ar: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    skV1: "Y cuando Mis siervos te pregunten sobre Mí — estoy cerca. Respondo a la llamada del que me llama cuando me llama. — Al-Baqarah 2:186",
    skV2Ar: "فَأَقِمْ وَجْهَكَ لِلدِّينِ حَنِيفًا ۚ فِطْرَتَ اللَّهِ الَّتِي فَطَرَ النَّاسَ عَلَيْهَا",
    skV2: "Dirige tu rostro hacia la religión, inclinándote hacia la verdad. La disposición natural sobre la que Dios ha creado a las personas. — Ar-Rum 30:30",
    skCtaText: "Pregunta con sinceridad y espera. Dios escucha cada pregunta que viene del corazón.",
    skCtaBtn: "Quiero saber más",
    nmLabel: "Tus primeros pasos",
    steps: [
      { n: 1, title: "La Shahada", body: "Di con corazón sincero: Testifico que no hay más dios que Alá y que Mahoma es Su mensajero. Este es el comienzo." },
      { n: 2, title: "Aprende a orar", body: "La oración es cinco veces al día. Empieza con Fajr. No te preocupes si no puedes hacer todo de una vez — Dios conoce tu intención." },
      { n: 3, title: "Lee el Corán", body: "Empieza con Al-Fatiha. Léela despacio y reflexiona sobre su significado. Es la madre del Libro." },
      { n: 4, title: "Encuentra una comunidad", body: "Ve a la mezquita más cercana y preséntate. Los musulmanes están felices de dar la bienvenida a un nuevo hermano o hermana." },
      { n: 5, title: "Ten paciencia contigo", body: "El Islam es una religión de facilidad, no de dificultad. Cada pequeño paso cuenta. Dios ama el progreso gradual." },
    ],
    duLabel: "Duas para el comienzo",
    duas: [
      { arabic: "رَبِّ زِدْنِي عِلْمًا", trans: "Señor mío, auméntame en conocimiento. — Ta-Ha 20:114" },
      { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", trans: "Señor nuestro, danos bien en este mundo y bien en el Más Allá, y protégenos del castigo del Fuego. — Al-Baqarah 2:201" },
      { arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي", trans: "Oh Alá, guíame y hazme firme. — Muslim" },
      { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", trans: "Señor mío, ábreme mi pecho y facilítame mi asunto. — Ta-Ha 20:25-26" },
    ],
  },
};

const css = `
.nmg-root { width:100%; background:var(--bg-primary); color:var(--text-primary); }
.nmg-hero { padding:32px 20px 24px; text-align:center; border-bottom:1px solid var(--border-color); }
.nmg-hero-icon { font-size:48px; margin-bottom:16px; }
.nmg-hero h1 { font-size:20px; font-weight:500; margin-bottom:8px; line-height:1.4; }
.nmg-hero p { font-size:14px; color:rgba(255,255,255,.55); line-height:1.7; }
.nmg-tabs { display:flex; border-bottom:1px solid var(--border-color); }
.nmg-tab { flex:1; padding:12px 8px; font-size:12px; font-weight:500; color:var(--text-muted); cursor:pointer; text-align:center; border-bottom:2px solid transparent; transition:all .2s; background:none; border-top:none; border-left:none; border-right:none; font-family:inherit; }
.nmg-tab.on { color:var(--accent-green); border-bottom-color:var(--accent-green); }
.nmg-panel { display:none; padding:20px 16px; }
.nmg-panel.on { display:block; }
.nmg-label { font-size:11px; font-weight:500; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; margin-bottom:12px; }
.nmg-verse { background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px; margin-bottom:12px; }
.nmg-verse-ar { font-size:18px; line-height:1.9; text-align:right; direction:rtl; margin-bottom:10px; font-family:'KFGQPC Uthman Naskh',serif; }
.nmg-verse-trans { font-size:13px; color:rgba(255,255,255,.55); line-height:1.65; border-top:1px solid var(--border-color); padding-top:10px; }
.nmg-reflection { background:rgba(0,200,150,.08); border:1px solid rgba(0,200,150,.2); border-radius:12px; padding:16px; margin-bottom:12px; }
.nmg-reflection p { font-size:14px; line-height:1.75; }
.nmg-reflection .attr { font-size:12px; color:var(--accent-green); margin-top:8px; font-weight:500; }
.nmg-steps { display:flex; flex-direction:column; gap:12px; }
.nmg-step { display:flex; gap:12px; align-items:flex-start; background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:14px; }
.nmg-step-num { min-width:28px; height:28px; border-radius:50%; background:rgba(0,200,150,.15); color:var(--accent-green); font-size:12px; font-weight:500; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.nmg-step-body h3 { font-size:14px; font-weight:500; margin-bottom:4px; }
.nmg-step-body p { font-size:13px; color:rgba(255,255,255,.55); line-height:1.6; }
.nmg-dua { background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px; margin-bottom:12px; }
.nmg-dua-ar { font-size:16px; direction:rtl; text-align:right; line-height:1.9; font-family:'KFGQPC Uthman Naskh',serif; margin-bottom:8px; }
.nmg-dua-trans { font-size:13px; color:rgba(255,255,255,.55); line-height:1.6; }
.nmg-cta { background:rgba(0,200,150,.1); border:1px solid rgba(0,200,150,.2); border-radius:12px; padding:20px 16px; text-align:center; margin-top:8px; }
.nmg-cta p { font-size:14px; line-height:1.7; margin-bottom:12px; }
.nmg-cta-btn { background:var(--accent-green); color:var(--text-primary); border:none; border-radius:12px; padding:10px 20px; font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; transition:opacity .2s; }
.nmg-cta-btn:hover { opacity:.9; }
`;

export default function NewMuslimGuide() {
  const { lang, t } = useTranslation();
  const [tab, setTab] = useState('seekers');
  const d = GUIDE_DATA[lang] || GUIDE_DATA.ar;
  const isRTL = lang === 'ar';

  return (
    <>
      <style>{css}</style>
      <div className="nmg-root" style={{ direction: isRTL ? 'rtl' : 'ltr', fontFamily: t.font }}>
        <div className="nmg-hero">
          <div className="nmg-hero-icon">🌙</div>
          <h1>{d.heroTitle}</h1>
          <p>{d.heroSub}</p>
        </div>

        <div className="nmg-tabs">
          {['seekers', 'newmuslim', 'duas'].map((id, i) => (
            <button key={id} className={`nmg-tab${tab === id ? ' on' : ''}`} onClick={() => setTab(id)}>
              {d.tabs[i]}
            </button>
          ))}
        </div>

        <div className={`nmg-panel${tab === 'seekers' ? ' on' : ''}`}>
          <p className="nmg-label">{d.skLabel}</p>
          <div className="nmg-reflection">
            <p>{d.skReflection}</p>
            <div className="attr">{d.skAttr}</div>
          </div>
          <div className="nmg-verse">
            <div className="nmg-verse-ar">{d.skV1Ar}</div>
            <div className="nmg-verse-trans">{d.skV1}</div>
          </div>
          <div className="nmg-verse">
            <div className="nmg-verse-ar">{d.skV2Ar}</div>
            <div className="nmg-verse-trans">{d.skV2}</div>
          </div>
          <div className="nmg-cta">
            <p>{d.skCtaText}</p>
            <button className="nmg-cta-btn">{d.skCtaBtn} ↗</button>
          </div>
        </div>

        <div className={`nmg-panel${tab === 'newmuslim' ? ' on' : ''}`}>
          <p className="nmg-label">{d.nmLabel}</p>
          <div className="nmg-steps">
            {d.steps.map(s => (
              <div key={s.n} className="nmg-step">
                <div className="nmg-step-num">{s.n}</div>
                <div className="nmg-step-body"><h3>{s.title}</h3><p>{s.body}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className={`nmg-panel${tab === 'duas' ? ' on' : ''}`}>
          <p className="nmg-label">{d.duLabel}</p>
          {d.duas.map((du, i) => (
            <div key={i} className="nmg-dua">
              <div className="nmg-dua-ar">{du.arabic}</div>
              <div className="nmg-dua-trans">{du.trans}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
