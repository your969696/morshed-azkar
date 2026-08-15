// Zakat rate (2.5% of qualifying wealth)
export const ZAKAT_RATE = 0.025;

// Nisab threshold (minimum wealth required for Zakat)
// Gold nisab: 85 grams of gold
// Silver nisab: 595 grams of silver
export const NISAB_GOLD_GRAMS = 85;
export const NISAB_SILVER_GRAMS = 595;

// Get current gold/silver prices (approximate - can be updated manually)
export function getNisabValues(goldPricePerGram, silverPricePerGram) {
  return {
    gold: goldPricePerGram * NISAB_GOLD_GRAMS,
    silver: silverPricePerGram * NISAB_SILVER_GRAMS
  };
}

// Calculate Zakat on different types of wealth
export function calculateZakat(wealth) {
  // wealth = {
  //   cash: number,           // Cash in hand and bank
  //   gold: number,           // Gold value
  //   silver: number,         // Silver value
  //   investments: number,    // Stocks, business shares
  //   savings: number,        // Savings accounts
  //   receivables: number,    // Money owed to you
  //   realEstate: number,     // Investment properties (not personal home)
  //   otherAssets: number,    // Other assets
  //   debts: number           // Your debts (subtracted)
  // }
  
  const totalWealth = wealth.cash + wealth.gold + wealth.silver + 
    wealth.investments + wealth.savings + wealth.receivables + 
    wealth.realEstate + wealth.otherAssets;
  
  const totalDeductible = wealth.debts;
  const zakatableWealth = Math.max(0, totalWealth - totalDeductible);
  const zakatAmount = zakatableWealth * ZAKAT_RATE;
  
  return {
    totalWealth,
    totalDeductible,
    zakatableWealth,
    zakatAmount,
    nisabThreshold: getNisabValues(450, 6.5), // approximate prices
    isObligatory: zakatableWealth >= getNisabValues(450, 6.5).silver // based on silver nisab
  };
}

// Categories of Zakat recipients (from Quran 9:60)
export const ZAKAT_CATEGORIES = [
  { id: 'fuqara', name_ar: 'الفقراء', name_en: 'The Poor', description: ' الذين لا يجدون كفايتهم' },
  { id: 'masakin', name_ar: 'المساكين', name_en: 'The Needy', description: 'الذين يجدون بعض كفايتهم' },
  { id: 'amilin', name_ar: 'العاملون عليها', name_en: 'Zakat Administrators', description: 'العاملون في جمع Zakat' },
  { id: 'mu\'allaf', name_ar: 'القلوب المؤلفة', name_en: 'Those whose hearts are to be reconciled', description: 'جذب القلوب إلى الإسلام' },
  { id: 'raqab', name_ar: 'الرقب', name_en: 'Freeing Captives', description: 'تحرير العبيد والأسرى' },
  { id: 'gharimin', name_ar: 'الغارمون', name_en: 'Those in Debt', description: 'من عليه دين ولا يستطيع سداده' },
  { id: 'sabil', name_ar: 'في سبيل الله', name_en: 'In the Cause of Allah', description: 'المجاهدين وطلبة العلم' },
  { id: 'ibn sabil', name_ar: 'ابن السبيل', name_en: 'The Traveler', description: 'المسافر المنقطع عن وطنه' }
];