import { VideoTask, CurrencyConfig, LeaderboardUser } from '../types';

export const SUPPORTED_COUNTRIES: CurrencyConfig[] = [
  {
    countryCode: 'CI',
    countryName: 'Côte d’Ivoire',
    countryFlag: '🇨🇮',
    currencyCode: 'XOF',
    currencySymbol: 'F CFA',
    rateFromCfa: 1,
    mobileOperators: ['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money'],
    bankOptions: ['Ecobank CI', 'Société Générale CI', 'NSIA Banque', 'BOA Côte d’Ivoire', 'Coris Bank', 'UBA CI'],
  },
  {
    countryCode: 'SN',
    countryName: 'Sénégal',
    countryFlag: '🇸🇳',
    currencyCode: 'XOF',
    currencySymbol: 'F CFA',
    rateFromCfa: 1,
    mobileOperators: ['Wave', 'Orange Money', 'Free Money', 'Moov Money'],
    bankOptions: ['CBAO Groupe Attijariwafa', 'Ecobank Sénégal', 'Société Générale Sénégal', 'BOA Sénégal', 'Orabank'],
  },
  {
    countryCode: 'CM',
    countryName: 'Cameroun',
    countryFlag: '🇨🇲',
    currencyCode: 'XAF',
    currencySymbol: 'F CFA',
    rateFromCfa: 1,
    mobileOperators: ['MTN Mobile Money', 'Orange Money Cameroun', 'Express Union'],
    bankOptions: ['Afriland First Bank', 'Société Générale Cameroun', 'UBA Cameroun', 'BGFIBank', 'Ecobank Cameroun'],
  },
  {
    countryCode: 'BJ',
    countryName: 'Bénin',
    countryFlag: '🇧🇯',
    currencyCode: 'XOF',
    currencySymbol: 'F CFA',
    rateFromCfa: 1,
    mobileOperators: ['MTN MoMo', 'Moov Money', 'Celtiis Cash'],
    bankOptions: ['Ecobank Bénin', 'BOA Bénin', 'NSIA Bénin', 'BIIC Bénin', 'UBA Bénin'],
  },
  {
    countryCode: 'TG',
    countryName: 'Togo',
    countryFlag: '🇹🇬',
    currencyCode: 'XOF',
    currencySymbol: 'F CFA',
    rateFromCfa: 1,
    mobileOperators: ['Mixx by Yas', 'Flooz (Moov Togo)', 'Coris Money'],
    bankOptions: ['Ecobank Togo', 'Orabank Togo', 'BOA Togo', 'UTB (Union Togolaise de Banque)'],
  },
  {
    countryCode: 'BF',
    countryName: 'Burkina Faso',
    countryFlag: '🇧🇫',
    currencyCode: 'XOF',
    currencySymbol: 'F CFA',
    rateFromCfa: 1,
    mobileOperators: ['Orange Money', 'Moov Money', 'Wave'],
    bankOptions: ['Coris Bank International', 'Ecobank Burkina', 'BOA Burkina', 'UBA Burkina'],
  },
  {
    countryCode: 'ML',
    countryName: 'Mali',
    countryFlag: '🇲🇱',
    currencyCode: 'XOF',
    currencySymbol: 'F CFA',
    rateFromCfa: 1,
    mobileOperators: ['Orange Money', 'Moov Money', 'Wave Mali'],
    bankOptions: ['BDM-SA (Banque de Développement)', 'BMS-SA', 'BOA Mali', 'Ecobank Mali'],
  },
  {
    countryCode: 'GN',
    countryName: 'Guinée (Conakry)',
    countryFlag: '🇬🇳',
    currencyCode: 'GNF',
    currencySymbol: 'GNF',
    rateFromCfa: 14.2, // 1 CFA ~ 14.2 GNF
    mobileOperators: ['Orange Money Guinée', 'MTN Mobile Money (Areeba)', 'PayCard'],
    bankOptions: ['Ecobank Guinée', 'Société Générale Guinée', 'FBNBank Guinée', 'Vista Bank'],
  },
  {
    countryCode: 'GA',
    countryName: 'Gabon',
    countryFlag: '🇬🇦',
    currencyCode: 'XAF',
    currencySymbol: 'F CFA',
    rateFromCfa: 1,
    mobileOperators: ['Airtel Money Gabon', 'Moov Money Gabon'],
    bankOptions: ['BGFIBank Gabon', 'UGB (Union Gabonaise de Banque)', 'Ecobank Gabon'],
  },
  {
    countryCode: 'CD',
    countryName: 'RD Congo',
    countryFlag: '🇨🇩',
    currencyCode: 'USD',
    currencySymbol: '$',
    rateFromCfa: 0.0016, // 45 000 CFA ~ $72
    mobileOperators: ['M-Pesa (Vodacom)', 'Orange Money RDC', 'Airtel Money'],
    bankOptions: ['Rawbank', 'Equity BCDC', 'Ecobank RDC', 'Sofibanque'],
  },
  {
    countryCode: 'NG',
    countryName: 'Nigeria',
    countryFlag: '🇳🇬',
    currencyCode: 'NGN',
    currencySymbol: '₦',
    rateFromCfa: 2.5, // 45 000 CFA ~ 112 500 NGN
    mobileOperators: ['OPay', 'PalmPay', 'MTN MoMo PSB', 'Airtel Smartcash'],
    bankOptions: ['Zenith Bank', 'Access Bank', 'GTBank (Guaranty Trust)', 'First Bank of Nigeria', 'UBA Nigeria'],
  },
  {
    countryCode: 'GH',
    countryName: 'Ghana',
    countryFlag: '🇬🇭',
    currencyCode: 'GHS',
    currencySymbol: '₵',
    rateFromCfa: 0.024, // 45 000 CFA ~ 1 080 GHS
    mobileOperators: ['MTN Mobile Money', 'Vodafone Cash (Telecel)', 'AirtelTigo Money'],
    bankOptions: ['GCB Bank', 'Ecobank Ghana', 'Stanbic Bank Ghana', 'Absa Bank Ghana'],
  },
  {
    countryCode: 'INT',
    countryName: 'International / Diaspora (EUR)',
    countryFlag: '🌍',
    currencyCode: 'EUR',
    currencySymbol: '€',
    rateFromCfa: 0.001524, // 45 000 CFA ~ 68.58 €
    mobileOperators: ['Wave International', 'Transfert Direct'],
    bankOptions: ['Virement SEPA / IBAN International', 'Boursorama / Revolut', 'BNP Paribas', 'Crédit Agricole'],
  },
];

export const CRYPTO_OPTIONS = [
  { id: 'usdt_trc20', name: 'USDT (Tether - TRC20)', network: 'Tron Network (TRC20)', icon: '🟢', recommended: true },
  { id: 'usdt_bep20', name: 'USDT (Tether - BEP20)', network: 'BNB Smart Chain (BEP20)', icon: '🟡', recommended: false },
  { id: 'btc', name: 'Bitcoin (BTC)', network: 'Bitcoin Mainnet', icon: '🟠', recommended: false },
  { id: 'eth', name: 'Ethereum (ETH)', network: 'Ethereum Mainnet (ERC20)', icon: '🔷', recommended: false },
  { id: 'sol', name: 'Solana (SOL)', network: 'Solana Mainnet', icon: '🟣', recommended: false },
];

export const SPONSOR_VIDEOS: VideoTask[] = [
  {
    id: 'vid-1',
    title: 'Découverte de l\'application de transfert sans frais Wave',
    sponsor: 'Wave Côte d\'Ivoire',
    category: 'FinTech & Paiements',
    durationSeconds: 15,
    description: 'Spot publicitaire sur les fonctionnalités de paiement marchand et d\'envoi d\'argent instantané.',
  },
  {
    id: 'vid-2',
    title: 'Bande-annonce : Nouvelle websérie ouest-africaine',
    sponsor: 'Studio Ciné Afrique',
    category: 'Culture & Médias',
    durationSeconds: 12,
    description: 'Teaser officiel de la saison 1 de la comédie dramatique tournée entre Dakar et Abidjan.',
  },
  {
    id: 'vid-3',
    title: 'Sensibilisation aux kits d\'éclairage solaire pour le foyer',
    sponsor: 'SunAfrique Solutions',
    category: 'Énergie & Habitat',
    durationSeconds: 15,
    description: 'Présentation des kits photovoltaïques payables par tranches Mobile Money.',
  },
  {
    id: 'vid-4',
    title: 'Lancement de la gamme de boissons locales pur Bissap',
    sponsor: 'Saveurs du Terroir UEMOA',
    category: 'Alimentation & Boissons',
    durationSeconds: 10,
    description: 'Clip promotionnel pour les nouveaux jus de fruits 100% naturels sans conservateurs.',
  },
  {
    id: 'vid-5',
    title: 'Plateforme de formation professionnelle certifiante en ligne',
    sponsor: 'EduTech Sahel',
    category: 'Éducation & Emploi',
    durationSeconds: 14,
    description: 'Présentation des cours pratiques en comptabilité, marketing digital et informatique.',
  },
  {
    id: 'vid-6',
    title: 'Application de livraison de repas et courses express',
    sponsor: 'LivraisonFast Abidjan',
    category: 'E-commerce & Logistique',
    durationSeconds: 12,
    description: 'Démonstration de commande en 3 clics avec suivi en direct du livreur.',
  },
  {
    id: 'vid-7',
    title: 'Assurance santé accessible sur smartphone dès 1 000 F/mois',
    sponsor: 'Mutuelle Santé Solidaire',
    category: 'Santé & Prévoyance',
    durationSeconds: 15,
    description: 'Clip explicatif sur la prise en charge des consultations et pharmacies partenaires.',
  },
  {
    id: 'vid-8',
    title: 'Campagne de recrutement d\'artisans qualifiés',
    sponsor: 'ProxiServices Network',
    category: 'Services de proximité',
    durationSeconds: 11,
    description: 'Vidéo d\'information pour les artisans, électriciens et techniciens indépendants.',
  }
];

export const LEADERBOARD_USERS: LeaderboardUser[] = [
  { id: 1, username: 'Mamadou K.', total_earned: 245000, withdrawals: 5 },
  { id: 2, username: 'Awa Diallo', total_earned: 192500, withdrawals: 4 },
  { id: 3, username: 'Ibrahim T.', total_earned: 148000, withdrawals: 3 },
  { id: 4, username: 'Fatou Sow', total_earned: 135200, withdrawals: 3 },
  { id: 5, username: 'Koffi Assan', total_earned: 96500, withdrawals: 2 },
  { id: 6, username: 'Aïcha Oumar', total_earned: 94000, withdrawals: 2 },
  { id: 7, username: 'Ousmane N.', total_earned: 58500, withdrawals: 1 },
  { id: 8, username: 'Mariama Ba', total_earned: 51200, withdrawals: 1 },
  { id: 9, username: 'Adama Cissé', total_earned: 47000, withdrawals: 1 },
  { id: 10, username: 'Aminata Fofana', total_earned: 46500, withdrawals: 1 },
];

// Helper to format currency accurately based on user's selected country
export function formatCurrencyValue(amountCfa: number, currencySymbol: string = 'F CFA', rate: number = 1): string {
  const converted = amountCfa * rate;
  if (currencySymbol === '$' || currencySymbol === '€') {
    return `${currencySymbol} ${converted.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${Math.round(converted).toLocaleString('fr-FR')} ${currencySymbol}`;
}
