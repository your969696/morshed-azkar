export const islamicDays = [
  { id: 1, month: 1, day: 1, nameAr: "رأس السنة الهجرية", nameEn: "Islamic New Year", icon: "🕌", desc: "بداية عام هجري جديد", hijriDate: "1 محرم" },
  { id: 2, month: 1, day: 9, nameAr: "تاسوعاء", nameEn: "Tashreeq", icon: "🤲", desc: "صيام يوم قبل عاشوراء", hijriDate: "9 محرم" },
  { id: 3, month: 1, day: 10, nameAr: "يوم عاشوراء", nameEn: "Day of Ashura", icon: "🤲", desc: "يوم نجّى الله فيه موسى", hijriDate: "10 محرم" },
  { id: 4, month: 3, day: 12, nameAr: "المولد النبوي", nameEn: "Prophet's Birthday", icon: "🌙", desc: "ذكرى ميلاد النبي ﷺ", hijriDate: "12 ربيع الأول" },
  { id: 5, month: 7, day: 27, nameAr: "الإسراء والمعراج", nameEn: "Isra and Mi'raj", icon: "⭐", desc: "رحلة الإسراء والمعراج", hijriDate: "27 رجب" },
  { id: 6, month: 8, day: 15, nameAr: "ليلة النصف من شعبان", nameEn: "Mid-Sha'ban", icon: "🌙", desc: "ليلة الدعاء والاستغفار", hijriDate: "15 شعبان" },
  { id: 7, month: 9, day: 1, nameAr: "بداية رمضان", nameEn: "Start of Ramadan", icon: "🌙", desc: "شهر الصيام المبارك", hijriDate: "1 رمضان" },
  { id: 8, month: 9, day: 27, nameAr: "ليلة القدر", nameEn: "Night of Power", icon: "⭐", desc: "خير من ألف شهر", hijriDate: "27 رمضان" },
  { id: 9, month: 10, day: 1, nameAr: "عيد الفطر", nameEn: "Eid al-Fitr", icon: "🎉", desc: "عيد الفرح بعد الصيام", hijriDate: "1 شوال" },
  { id: 10, month: 12, day: 9, nameAr: "يوم عرفة", nameEn: "Day of Arafat", icon: "🕋", desc: "أفضل يوم في السنة", hijriDate: "9 ذو الحجة" },
  { id: 11, month: 12, day: 10, nameAr: "عيد الأضحى", nameEn: "Eid al-Adha", icon: "🐑", desc: "عيد النحر وذبح الأضاحي", hijriDate: "10 ذو الحجة" },
  { id: 12, month: 12, day: 11, nameAr: "أيام التشريق", nameEn: "Days of Tashreeq", icon: "🤲", desc: "أيام ذكر لله بعد الأضحى", hijriDate: "11-13 ذو الحجة" },
];

const HIJRI_MONTH_DAYS = [0, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

function hijriToDays(month, day) {
  let total = 0;
  for (let i = 1; i < month; i++) total += HIJRI_MONTH_DAYS[i];
  total += day;
  return total;
}

export function getUpcomingIslamicDays(hijriMonth, hijriDay) {
  const todayHijri = hijriToDays(hijriMonth, hijriDay);
  const yearDays = 354;

  return islamicDays
    .map(event => {
      const eventHijri = hijriToDays(event.month, event.day);
      let daysUntil = eventHijri - todayHijri;
      if (daysUntil < 0) daysUntil += yearDays;
      return { ...event, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
