export const fastingReminders = [
  { id: 1, title: 'صيام الاثنين', titleEn: 'Monday Fasting', description: 'صيام يوم الاثنين مستحبّ و Sunnah للنبي ﷺ. عن أبي هريرة رضي الله عنه: كان النبي ﷺ يصوم Mondays and Thursdays.', hijri: 'كل اثنين', emoji: '🌙', recurring: 'weekly', dayOfWeek: 1 },
  { id: 2, title: 'صيام الخميس', titleEn: 'Thursday Fasting', description: 'من سنن النبي ﷺ صيام يوم الخميس. كان رسول الله ﷺ يختار أن يصوم أيامًا متّصلة، وكان يصوم يوم الخميس ويوم الاثنين.', hijri: 'كل خميس', emoji: '🌙', recurring: 'weekly', dayOfWeek: 4 },
  { id: 3, title: 'صيام يوم وثلاثة أيام من كل شهر', titleEn: 'White Days Fasting (13, 14, 15)', description: 'الأيام البيض: الثالث عشر والرابع عشر والخامس عشر من كل شهر هجري. كان النبي ﷺ يصومها. عن أبي هريرة: صيام ثلاثة أيام من كل شهر صيام الدهر.', hijri: 'العشر الأبيض', emoji: '⚪', recurring: 'monthly' },
  { id: 4, title: 'صيام يوم عاشوراء', titleEn: 'Ashura Fasting', description: 'يوم عاشوراء هو العاشر من محرم. كان النبي ﷺ يصومه ويأمر بالصيام. فضله عظيم: يكفر ذنوب السنة الماضية.', hijri: '١٠ محرم', emoji: '🌙', recurring: 'yearly', hijriMonth: 1, hijriDay: 10 },
  { id: 5, title: 'صيام يوم عرفة', titleEn: 'Day of Arafah Fasting', description: 'يوم عرفة (تاسع ذو الحجة). من أ最好 الأيام صيامه. عن النبي ﷺ: صيام يوم عرفة أحتسب على الله أن يكفر السنة التي قبله والسنة التي بعده.', hijri: '٩ ذو الحجة', emoji: '🤲', recurring: 'yearly', hijriMonth: 12, hijriDay: 9 },
  { id: 6, title: 'صيام ستة أيام من شوال', titleEn: 'Six Days of Shawwal', description: 'من شوال بعد عيد الفطر. من أتمّ أجر الصيام بعد رمضان. من صام رمضان ثم أتبعه بستة من شوال فكأنما صام الدهر.', hijri: '٦ أيام من شوال', emoji: '✨', recurring: 'yearly', hijriMonth: 10, hijriDay: 2 },
  { id: 7, title: 'صيام تاسوعاء وعاشوراء', titleEn: 'Ninth and Tenth of Muharram', description: 'يُستحبّ صيام التاسع مع العاشر (يوم عاشوراء) للخالف عن اليهود. صيام التاسع مع العاشر يكفر ذنوب سنتين.', hijri: '٩-١٠ محرم', emoji: '🌙', recurring: 'yearly', hijriMonth: 1, hijriDay: 9 },
  { id: 8, title: 'أيام التشريق', titleEn: 'Days of Tashreeq', description: '١١ و١٢ و١٣ من ذو الحجة. لا يجوز صيامها لأنها أيام أكل وشرب وذكر الله. عن النبي ﷺ: أيام الأكل والشرب.', hijri: '١١-١٣ ذو الحجة', emoji: '🍖', recurring: 'yearly', hijriMonth: 12, hijriDay: 11 },
  { id: 9, title: '禁止 صيام يوم الجمعة منفردًا', titleEn: 'Do NOT Fast Friday Alone', description: 'لا يُصام يوم الجمعة منفردًا إلا إذا صام قبله أو بعده. عن أبي هريرة: لا تصوموا يوم الجمعة إلا أن تصوموا قبله أو بعده.', hijri: 'ملاحظة مهمة', emoji: '⚠️', recurring: 'weekly', dayOfWeek: 5 },
];

export const zakatReminders = [
  { id: 1, title: 'زكاة المال', titleEn: 'Zakat on Money', description: 'تُخَرَّج الزكاة عند بلوغ المال نصاب الذهب (٨٥ جرامًا) أو الفضة (٥٩٥ جرامًا) ومضيّ سنة هجرية عليه.', hijri: '١ ذي الحجة', emoji: '💰', percentage: '٢.٥٪ من المال الكلي' },
  { id: 2, title: 'زكاة الفطر', titleEn: 'Zakat al-Fitr', description: 'تُخرج قبل صلاة عيد الفطر بمقدار صاع من طعام (٢.٥ كيلو تقريبًا) عن كل فرد من أهل البيت.', hijri: '١ شوال', emoji: '🍚', percentage: 'صاع (٢.٥ كجم) عن كل فرد' },
  { id: 3, title: 'زكاة النبات والثمار', titleEn: 'Zakat on Crops', description: 'تُخرَج الزكاة على المحاصيل الزراعية عند وصولها النصاب (٥ أوسُق = ٧٢٠ كجم تقريبًا).', hijri: 'عند الحصاد', emoji: '🌾', percentage: '٥٪ أو ١٠٪ حسب نوع الري' },
  { id: 4, title: 'زكاة عروض التجارة', titleEn: 'Zakat on Trade Goods', description: 'تُخرَّج الزكاة على البضائع التجارية عند بلوغ قيمتها نصاب الذهب مع مرور سنة.', hijri: 'عند كل عام', emoji: '📦', percentage: '٢.٥٪ من قيمة البضائع' },
  { id: 5, title: 'زكاة الأسهم والاستثمارات', titleEn: 'Zakat on Stocks & Investments', description: 'تُخرَّج الزكاة على الأسهم والاستثمارات بناءً على القيمة السوقية عند موعد الزكاة السنوي.', hijri: 'سنويًا', emoji: '📈', percentage: '٢.٥٪ من القيمة السوقية' },
  { id: 6, title: 'زكاة الذهب والفضة', titleEn: 'Zakat on Gold & Silver', description: 'النصاب: ٨٥ جرامًا ذهبًا أو ٥٩٥ جرامًا فضة. تُخرَّج الزكاة كل عام مضيّ.', hijri: 'سنويًا', emoji: '🪙', percentage: '٢.٥٪ من الوزن' },
];

export const islamicHistory = [
  { month: 1, day: 1, eventAr: 'وقعة بدر الكبرى - أول معركة فاصلة في تاريخ الإسلام', description: 'هزم المسلمون بقيادة النبي محمد ﷺ قريش في بدر رغم قلة عددهم.', description_en: 'The Muslims, led by Prophet Muhammad ﷺ, defeated the Quraysh at Badr despite being outnumbered.', description_es: 'Los musulmanes, liderados por el Profeta Muhammad ﷺ, derrotaron a los Quraysh en Badr a pesar de ser superados en número.', emoji: '⚔️', hijri: '١ محرم ٢ هـ' },
  { month: 1, day: 10, eventAr: 'يوم عاشوراء - نجاة موسى عليه السلام من فرعون', description: 'يُستحب صيام يوم عاشوراء تأسّياً بني إسرائيل.', description_en: 'It is recommended to fast on the day of Ashura, following the example of the Children of Israel.', description_es: 'Se recomienda ayunar el día de Ashura, siguiendo el ejemplo de los Hijos de Israel.', emoji: '🌙', hijri: '١٠ محرم' },
  { month: 1, day: 27, eventAr: 'فتح مكة المكرمة', description: 'دخل النبي ﷺ مكة منتصرًا دون قتال، وحطّم الأصنام.', description_en: 'The Prophet ﷺ entered Makkah victorious without fighting and smashed the idols.', description_es: 'El Profeta ﷺ entró en La Meca victorioso sin combatir y destruyó los ídolos.', emoji: '🕋', hijri: '٢٠ رمضان ٨ هـ' },
  { month: 2, day: 10, eventAr: 'وفاة خديجة بنت خويلد - أول زوجات النبي ﷺ', description: 'أول من آمن بالنبي ﷺ، وسُمّيت بأم المؤمنين.', description_en: 'She was the first to believe in the Prophet ﷺ and was called the Mother of the Believers.', description_es: 'Fue la primera en creer en el Profeta ﷺ y fue llamada la Madre de los Creyentes.', emoji: '💙', hijri: '١٠ رمضان ٣ هـ' },
  { month: 2, day: 27, eventAr: 'ليلة القدر - خير من ألف شهر', description: 'ليلة نزول القرآن الكريم، وهي في الليالي الوتر من العشر الأواخر من رمضان.', description_en: 'The night of the revelation of the Holy Quran, which falls on the odd nights of the last ten days of Ramadan.', description_es: 'La noche de la revelación del Sagrado Corán, que cae en las noches impares de los últimos diez días de Ramadan.', emoji: '✨', hijri: '٢٧ رمضان' },
  { month: 3, day: 12, eventAr: 'مولد النبي محمد ﷺ', description: 'وُلد في يوم الاثنين ١٢ ربيع الأول عام الفيل (570 م).', description_en: 'He was born on Monday, 12 Rabi\' al-Awwal, in the Year of the Elephant (570 CE).', description_es: 'Nació el lunes 12 de Rabi\' al-Awwal, en el Año del Elefante (570 d.C.).', emoji: '🌟', hijri: '١٢ ربيع الأول' },
  { month: 3, day: 27, eventAr: 'الإسراء والمعراج', description: 'سُري بالنبي ﷺ من مكة إلى القدس ثم عُرج به إلى السماوات السبع.', description_en: 'The Prophet ﷺ was taken by night from Makkah to Jerusalem and then ascended through the seven heavens.', description_es: 'El Profeta ﷺ fue trasladado de noche de La Meca a Jerusalén y luego ascendió a través de los siete cielos.', emoji: '🕌', hijri: '٢٧ رجب' },
  { month: 4, day: 15, eventAr: 'غزوة أحد', description: 'كانت اختباراً للإيمان، وأُنزل فيها قول الله تعالى: {مَا كان الله لِيَذَرَ الْمُؤْمِنِينَ عَلَى مَا أَنتُمْ عَلَيْهِ}.', description_en: 'It was a test of faith, and in it the verse was revealed: {Allah would not leave the believers in that state you are in}.', description_es: 'Fue una prueba de fe, y en ella se reveló el versículo: {Allah no dejaría a los creyentes en el estado en que ustedes están}.', emoji: '⚔️', hijri: '٧ شوال ٣ هـ' },
  { month: 5, day: 1, eventAr: 'الهجرة النبوية إلى المدينة المنورة', description: 'بدأ التقويم الإسلامي من هذا التاريخ.', description_en: 'The Islamic calendar began from this date.', description_es: 'El calendario islámico comenzó a partir de esta fecha.', emoji: '🌙', hijri: '١ محرم ١ هـ' },
  { month: 5, day: 17, eventAr: 'غزوة الخندق - الأحزاب', description: 'حفر المسلمون الخندق لحماية المدينة من الأحزاب.', description_en: 'The Muslims dug the trench to protect Madinah from the confederate tribes.', description_es: 'Los musulmanes cavaron la trinchera para proteger a Medina de las tribus confederadas.', emoji: '🛡️', hijri: '٥ شوال ٥ هـ' },
  { month: 6, day: 1, eventAr: 'صلح الحديبية', description: 'كان انتصاراً سياسياً للإسلام.', description_en: 'It was a political victory for Islam.', description_es: 'Fue una victoria política para el Islam.', emoji: '🕊️', hijri: '١ ذي القعدة ٦ هـ' },
  { month: 7, day: 27, eventAr: 'استرداد القدس على يد صلاح الدين الأيوبي', description: 'بعد معركة حطين ٥٨٣ هـ / ١١٨٧ م.', description_en: 'After the Battle of Hattin in 583 AH / 1187 CE.', description_es: 'Después de la Batalla de Hattin en 583 AH / 1187 d.C.', emoji: '🏰', hijri: '٢٧ محرم ٥٨٤ هـ' },
  { month: 8, day: 1, eventAr: 'حجة الوداع - آخر حج للنبي ﷺ', description: 'خطبة الوداع الشهيرة: "أيُّها الناسُ، إنَّ دماءَكم وأموالَكم عليكم حرامٌ..."', description_en: 'The famous Farewell Sermon: "O people, your blood and your property are sacred to you..."', description_es: 'El famoso Sermon de Despedida: "¡Oh gente, vuestra sangre y vuestros bienes son sagrados para vosotros..."', emoji: '🕋', hijri: '٩ ذو الحجة ١٠ هـ' },
  { month: 8, day: 9, eventAr: 'يوم عرفة', description: 'يوم صيامه يكفر ذنوب سنتين: سنة ماضية وسنة آتية.', description_en: 'Fasting on this day expiates sins of two years: a past year and a coming year.', description_es: 'Ayunar en este día expía los pecados de dos años: un año pasado y un año venidero.', emoji: '🤲', hijri: '٩ ذو الحجة' },
  { month: 8, day: 10, eventAr: 'عيد الأضحى وذبح إسماعيل عليه السلام', description: 'يحتفل المسلمون بيوم عرفة ويوم النحر.', description_en: 'Muslims celebrate the Day of Arafah and the Day of Sacrifice (Eid al-Adha).', description_es: 'Los musulmanes celebran el Día de Arafah y el Día del Sacrificio (Eid al-Adha).', emoji: '🐑', hijri: '١٠ ذو الحجة' },
  { month: 9, day: 1, eventAr: 'فتح مصر على يد عمرو بن العاص', description: 'افتتحت مصر للإسلام عام ٢١ هـ / ٦٤٢ م.', description_en: 'Egypt was opened for Islam in 21 AH / 642 CE.', description_es: 'Egipto fue abierto para el Islam en 21 AH / 642 d.C.', emoji: '🏛️', hijri: '٢١ هـ' },
  { month: 9, day: 25, eventAr: 'معركة القادسية', description: 'انتصار المسلمين على الساسانيين وفتح بلاد الرافدين.', description_en: 'The Muslims\' victory over the Sassanids and the conquest of Mesopotamia.', description_es: 'La victoria de los musulmanes sobre los sasánidas y la conquista de Mesopotamia.', emoji: '⚔️', hijri: '١٧ هـ' },
  { month: 10, day: 1, eventAr: 'دخول الإسلام إلى الأندلس', description: 'قادها طارق بن زياد عام ٩٢ هـ / ٧١١ م.', description_en: 'It was led by Tariq ibn Ziyad in 92 AH / 711 CE.', description_es: 'Fue liderada por Tariq ibn Ziyad en 92 AH / 711 d.C.', emoji: '🇪🇸', hijri: '٩٢ هـ' },
  { month: 11, day: 1, eventAr: 'وفاة أبي بكر الصديق - أول الخلفاء الراشدين', description: 'تولى الخلافة سنتين وثلاثة أشهر.', description_en: 'He served as Caliph for two years and three months.', description_es: 'Sirvió como Califa durante dos años y tres meses.', emoji: '💙', hijri: '٢٢ جمادى الآخرة ١٣ هـ' },
  { month: 12, day: 2, eventAr: 'وفاة النبي محمد ﷺ', description: 'تُوفي يوم الاثنين ١٢ ربيع الأول ١١ هـ / ٦٣٢ م.', description_en: 'He passed away on Monday, 12 Rabi\' al-Awwal, 11 AH / 632 CE.', description_es: 'Falleció el lunes 12 de Rabi\' al-Awwal, 11 AH / 632 d.C.', emoji: '💔', hijri: '١٢ ربيع الأول ١١ هـ' },
  { month: 12, day: 11, eventAr: 'معركة حطين', description: 'انتصار صلاح الدين الأيوبي على الصليبيين عام ٥٨٣ هـ.', description_en: 'Salah ad-Din al-Ayyubi\'s victory over the Crusaders in 583 AH.', description_es: 'La victoria de Salah ad-Din al-Ayyubi sobre los Cruzados en 583 AH.', emoji: '⚔️', hijri: '٤ رجب ٥٨٣ هـ' },
  { month: 4, day: 3, eventAr: 'وفاة علي بن أبي طالب - رابع الخلفاء الراشدين', description: 'assassinated by Abd al-Rahman ibn Muljam during Fajr prayer.', description_en: 'Assassinated by Abd al-Rahman ibn Muljam during Fajr prayer.', description_es: 'Asesinado por Abd al-Rahman ibn Muljam durante la oración del Fajr.', emoji: '💙', hijri: '٢١ رمضان ٤٠ هـ' },
  { month: 6, day: 15, eventAr: 'معركة اليرموك', description: 'انتصار حاسم للمسلمين على الروم البيزنطيين.', description_en: 'A decisive victory for the Muslims over the Byzantine Romans.', description_es: 'Una victoria decisiva para los musulmanes sobre los romanos bizantinos.', emoji: '⚔️', hijri: '١٥ رجب ١٥ هـ' },
  { month: 9, day: 12, eventAr: 'سقوط غرناطة ونهاية الإسلام في الأندلس', description: 'سقطت آخر دولة إسلامية في الأندلس عام ٨٩٧ هـ / ١٤٩٢ م.', description_en: 'The last Islamic state in Andalusia fell in 897 AH / 1492 CE.', description_es: 'El último estado islámico en Andalucía cayó en 897 AH / 1492 d.C.', emoji: '🏰', hijri: '٢ جمادى الأولى ٨٩٧ هـ' },
];

export function getTodayEvent() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const events = islamicHistory.filter(e => e.month === month && e.day === day);
  if (events.length > 0) {
    return events[Math.floor(Math.random() * events.length)];
  }
  const randomEvents = islamicHistory.filter(e => e.month === month);
  if (randomEvents.length > 0) {
    return randomEvents[Math.floor(Math.random() * randomEvents.length)];
  }
  return islamicHistory[Math.floor(Math.random() * islamicHistory.length)];
}

export function getHijriDate() {
  try {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(today);
  } catch {
    return '';
  }
}

export function getHijriDayOfWeek() {
  try {
    const today = new Date();
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return dayNames[today.getDay()];
  } catch {
    return '';
  }
}

export function getTodayFastingReminders() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return fastingReminders.filter(r => {
    if (r.recurring === 'weekly' && r.dayOfWeek === dayOfWeek) return true;
    return false;
  });
}

export function getZakatReminders() {
  return zakatReminders;
}
