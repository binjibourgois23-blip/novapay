export type NavTab = 
  | 'home' 
  | 'earn' 
  | 'leaderboard' 
  | 'invite' 
  | 'withdraw' 
  | 'withdraw_history' 
  | 'terms'
  | 'auth';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface VideoTask {
  id: string;
  title: string;
  sponsor: string;
  category: string;
  durationSeconds: number;
  description: string;
}

export type PayoutChannel = 'mobile_money' | 'bank_transfer' | 'crypto';

export interface CurrencyConfig {
  countryCode: string;
  countryName: string;
  countryFlag: string;
  currencyCode: string;
  currencySymbol: string;
  rateFromCfa: number; // 1 F CFA = rateFromCfa in local currency
  mobileOperators: string[];
  bankOptions: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  identifier: string; // email or phone
  country: string;
  countryCode: string;
  currencyCode: string;
  currencySymbol: string;
  currencyRate: number;
  balanceCfa: number; // Starts with 750 F CFA bonus for everyone!
  totalEarnedCfa: number;
  signupBonusReceived: boolean;
  dailyVideosWatched: number; // 0 to 45
  dailyVideosTarget: number; // 45
  dailyRewardCfa: number; // 250 F CFA
  dailyRewardClaimed: boolean;
  referralCode: string;
  referralsCount: number;
  referrals: Referral[];
  claimedSocialTasks: string[];
  earningsHistory: EarningRecord[];
  withdrawals: WithdrawalRecord[];
}

export interface AuthAccount {
  identifier: string; // normalized phone or email
  password: string; // password stored for real authentication verification
  userProfile: UserProfile;
  createdAt: string;
  isVerified: boolean;
}

export interface Referral {
  id: string;
  name: string;
  date: string;
  status: 'Actif (1+ tâche effectuée)' | 'Inscrit récemment';
  isActive: boolean;
}

export interface EarningRecord {
  id: string;
  taskTitle: string;
  sponsor: string;
  amountCfa: number;
  date: string;
  status: 'Crédité';
}

export interface WithdrawalRecord {
  id: string;
  date: string;
  amountCfa: number;
  amountLocal: number;
  currencySymbol: string;
  channel: PayoutChannel;
  operatorOrBank: string;
  country: string;
  recipientDetails: string; // Phone number, IBAN/RIB, or Crypto address
  recipientName: string;
  status: 'approved' | 'pending' | 'rejected';
  reference: string;
  feeCfa: 0;
}

export interface LeaderboardUser {
  id: number;
  username: string;
  total_earned: number;
  withdrawals: number;
}
