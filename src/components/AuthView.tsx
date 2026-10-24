import React, { useState, useEffect } from 'react';
import { UserProfile, AuthAccount, ThemeMode, NavTab } from '../types';
import { SUPPORTED_COUNTRIES, formatCurrencyValue } from '../data/tasksData';
import { PayNovaLogo } from './PayNovaLogo';
import { 
  X, 
  Gift, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Mail, 
  Globe2, 
  Lock, 
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Sparkles,
  User,
  Sun,
  Moon,
  MessageCircle,
  HelpCircle,
  Bot
} from 'lucide-react';

interface AuthViewProps {
  user: UserProfile;
  onLogin: (user: UserProfile) => void;
  onNavigate: (tab: NavTab) => void;
  themeMode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
  isDark?: boolean;
}

const SEED_ACCOUNTS: AuthAccount[] = [
  {
    identifier: '+225 07 48 92 10',
    password: 'Password2026!',
    createdAt: '2026-10-20',
    isVerified: true,
    userProfile: {
      id: 'usr-demo-amadou',
      name: 'Amadou Koné',
      identifier: '+225 07 48 92 10',
      country: 'Côte d’Ivoire',
      countryCode: 'CI',
      currencyCode: 'XOF',
      currencySymbol: 'F CFA',
      currencyRate: 1,
      balanceCfa: 750,
      totalEarnedCfa: 750,
      signupBonusReceived: true,
      dailyVideosWatched: 12,
      dailyVideosTarget: 45,
      dailyRewardCfa: 250,
      dailyRewardClaimed: false,
      referralCode: 'PN-AMADOU225',
      referralsCount: 1,
      referrals: [
        { id: 'ref-1', name: 'Moussa Diakité', date: '21 oct. 2026', status: 'Actif (1+ tâche effectuée)', isActive: true },
      ],
      claimedSocialTasks: [],
      earningsHistory: [
        {
          id: 'earn-bonus',
          taskTitle: '🎁 Bonus de bienvenue à l\'inscription',
          sponsor: 'PayNova',
          amountCfa: 750,
          date: 'À l\'ouverture',
          status: 'Crédité',
        }
      ],
      withdrawals: [],
    }
  }
];

function getStoredAccounts(): AuthAccount[] {
  try {
    const raw = localStorage.getItem('paynova_accounts_db');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  localStorage.setItem('paynova_accounts_db', JSON.stringify(SEED_ACCOUNTS));
  return SEED_ACCOUNTS;
}

function saveStoredAccounts(accounts: AuthAccount[]) {
  localStorage.setItem('paynova_accounts_db', JSON.stringify(accounts));
}

export const AuthView: React.FC<AuthViewProps> = ({
  user,
  onLogin,
  onNavigate,
  themeMode = 'system',
  onSetThemeMode,
  isDark = false,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [authType, setAuthType] = useState<'phone' | 'email'>('phone');
  const [selectedCountryCode, setSelectedCountryCode] = useState('CI');
  const [phoneNum, setPhoneNum] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Security Verification Step State
  const [verificationStep, setVerificationStep] = useState<'form' | 'verify_code' | 'verified_success'>('form');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [inputOtp, setInputOtp] = useState<string>('');
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [antibotAnswer, setAntibotAnswer] = useState<string>('');
  const [antibotChallenge, setAntibotChallenge] = useState<{ num1: number; num2: number }>({ num1: 14, num2: 6 });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(3);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const currentCountryConfig = SUPPORTED_COUNTRIES.find(c => c.countryCode === selectedCountryCode) || SUPPORTED_COUNTRIES[0];

  const refreshAntibot = () => {
    const n1 = Math.floor(Math.random() * 15) + 5;
    const n2 = Math.floor(Math.random() * 10) + 2;
    setAntibotChallenge({ num1: n1, num2: n2 });
    setAntibotAnswer('');
  };

  useEffect(() => {
    refreshAntibot();
  }, [isRegister]);

  useEffect(() => {
    let interval: any = null;
    if (verificationStep === 'verify_code' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [verificationStep, otpTimer]);

  useEffect(() => {
    let interval: any = null;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (lockoutTimer === 0 && attemptsRemaining === 0) {
      setAttemptsRemaining(3);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer, attemptsRemaining]);

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Vide', color: 'bg-slate-300 dark:bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Faible', color: 'bg-rose-500' };
    if (score === 3 || score === 4) return { score, label: 'Moyen', color: 'bg-amber-500' };
    return { score, label: 'Robuste', color: 'bg-[#2563eb]' };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const getCleanIdentifier = () => {
    if (authType === 'phone') {
      const cleanDigits = phoneNum.replace(/[\s\-\.]/g, '');
      return cleanDigits.startsWith('+') ? cleanDigits : `${cleanDigits}`;
    }
    return email.trim().toLowerCase();
  };

  const handleToggleTheme = () => {
    if (!onSetThemeMode) return;
    onSetThemeMode(isDark ? 'light' : 'dark');
  };

  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const identifier = getCleanIdentifier();

    if (authType === 'phone') {
      const digitsOnly = phoneNum.replace(/\D/g, '');
      if (digitsOnly.length < 8) {
        setErrorMsg('Contrôle de conformité : Numéro de téléphone invalide (minimum 8 chiffres requis).');
        return;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg('Contrôle de conformité : Adresse email invalide.');
        return;
      }
    }

    if (name.trim().length < 2) {
      setErrorMsg('Contrôle de conformité : Veuillez renseigner votre nom complet ou pseudonyme.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Contrôle de sécurité : Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Contrôle de saisie : La confirmation ne correspond pas au mot de passe.');
      return;
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find(a => a.identifier.toLowerCase() === identifier.toLowerCase());
    if (existing) {
      setErrorMsg('Contrôle d\'unicité : Un compte PayNova existe déjà avec cet identifiant.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('Veuillez accepter les conditions d\'utilisation pour continuer.');
      return;
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(generatedCode);
    setInputOtp('');
    setOtpTimer(60);
    refreshAntibot();

    setVerificationStep('verify_code');
    setOtpSentNotice(`Code de validation PayNova envoyé à ${identifier} : ${generatedCode}`);
  };

  const handleVerifyOtpAndCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    const expectedMath = antibotChallenge.num1 + antibotChallenge.num2;
    if (parseInt(antibotAnswer.trim(), 10) !== expectedMath) {
      setIsVerifying(false);
      setErrorMsg(`Contrôle anti-robot échoué : Combien font ${antibotChallenge.num1} + ${antibotChallenge.num2} ?`);
      refreshAntibot();
      return;
    }

    if (inputOtp.trim() !== generatedOtp.trim()) {
      setIsVerifying(false);
      setErrorMsg('Code de sécurité incorrect. Veuillez vérifier le code à 6 chiffres.');
      return;
    }

    setTimeout(() => {
      const identifier = getCleanIdentifier();
      const startingBalanceCfa = 750;

      const newUserProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        identifier,
        country: currentCountryConfig.countryName,
        countryCode: currentCountryConfig.countryCode,
        currencyCode: currentCountryConfig.currencyCode,
        currencySymbol: currentCountryConfig.currencySymbol,
        currencyRate: currentCountryConfig.rateFromCfa,
        balanceCfa: startingBalanceCfa,
        totalEarnedCfa: startingBalanceCfa,
        signupBonusReceived: true,
        dailyVideosWatched: 0,
        dailyVideosTarget: 45,
        dailyRewardCfa: 250,
        dailyRewardClaimed: false,
        referralCode: `PN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        referralsCount: 0,
        referrals: [],
        claimedSocialTasks: [],
        earningsHistory: [
          {
            id: `earn-bonus-${Date.now()}`,
            taskTitle: '🎁 Bonus officiel de bienvenue (Solde de départ)',
            sponsor: 'PayNova',
            amountCfa: 750,
            date: 'À l\'instant',
            status: 'Crédité',
          }
        ],
        withdrawals: [],
      };

      const newAccount: AuthAccount = {
        identifier,
        password,
        userProfile: newUserProfile,
        createdAt: new Date().toISOString(),
        isVerified: true,
      };

      const accounts = getStoredAccounts();
      saveStoredAccounts([...accounts, newAccount]);

      setIsVerifying(false);
      setVerificationStep('verified_success');

      setTimeout(() => {
        onLogin(newUserProfile);
        onNavigate('home');
      }, 1000);
    }, 600);
  };

  const handleRealLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (lockoutTimer > 0) {
      setErrorMsg(`Accès bloqué temporairement. Réessayez dans ${lockoutTimer}s.`);
      return;
    }

    const identifier = getCleanIdentifier();

    if (!identifier) {
      setErrorMsg('Veuillez renseigner votre identifiant.');
      return;
    }

    if (!password) {
      setErrorMsg('Veuillez renseigner votre mot de passe.');
      return;
    }

    const expectedMath = antibotChallenge.num1 + antibotChallenge.num2;
    if (parseInt(antibotAnswer.trim(), 10) !== expectedMath) {
      setErrorMsg(`Contrôle anti-robot obligatoire : Combien font ${antibotChallenge.num1} + ${antibotChallenge.num2} ?`);
      refreshAntibot();
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const accounts = getStoredAccounts();
      const account = accounts.find(a => 
        a.identifier.toLowerCase() === identifier.toLowerCase() ||
        a.identifier.replace(/\s+/g, '') === identifier.replace(/\s+/g, '')
      );

      if (!account) {
        setIsVerifying(false);
        setErrorMsg('Aucun compte enregistré avec cet identifiant.');
        refreshAntibot();
        return;
      }

      if (account.password !== password) {
        setIsVerifying(false);
        const nextAttempts = attemptsRemaining - 1;
        setAttemptsRemaining(nextAttempts);

        if (nextAttempts <= 0) {
          setLockoutTimer(30);
          setErrorMsg('Sécurité : 3 échecs consécutifs. Accès suspendu pendant 30s.');
        } else {
          setErrorMsg(`Mot de passe incorrect (${nextAttempts} tentative(s) restante(s)).`);
        }
        refreshAntibot();
        return;
      }

      setIsVerifying(false);
      onLogin(account.userProfile);
      onNavigate('home');
    }, 500);
  };

  const handleFillDemo = () => {
    setIsRegister(false);
    setAuthType('phone');
    setPhoneNum('+225 07 48 92 10');
    setPassword('Password2026!');
    setAntibotAnswer((antibotChallenge.num1 + antibotChallenge.num2).toString());
    setErrorMsg(null);
  };

  return (
    <div className="relative min-h-[85vh] w-full flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      
      {/* ========================================================
          NEUMORPHIC AMBIENT BACKGROUND ELEMENTS (Like in the image)
          ======================================================== */}
      {/* Top Left Soft Curved Disc */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full border-[18px] border-blue-400/10 dark:border-blue-500/10 pointer-events-none"></div>
      
      {/* Top Right Soft Floating Spheres */}
      <div className="absolute top-12 right-2 sm:right-10 w-28 h-28 rounded-full bg-radial from-blue-300/20 to-transparent dark:from-blue-600/10 blur-xl pointer-events-none"></div>
      
      {/* Bottom Right Planetary Arc */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-[22px] border-blue-300/15 dark:border-blue-400/10 pointer-events-none"></div>

      {/* Main Glassmorphic/Neumorphic Card Container */}
      <div className="relative w-full max-w-[420px] bg-[#f8fbfe]/90 dark:bg-[#0c1424]/90 backdrop-blur-2xl rounded-[38px] p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.15)] dark:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85)] border border-white/80 dark:border-blue-900/40 text-left transition-all duration-300">
        
        {/* Top Control Bar: Brand Badge & Neumorphic Theme Toggle */}
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono text-[#2563eb] dark:text-[#60a5fa] bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse"></span>
            PAYNOVA AUTH
          </div>

          {/* Theme Toggle Button (Round squircle like in screenshot) */}
          {onSetThemeMode && (
            <button
              type="button"
              onClick={handleToggleTheme}
              title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
              className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-[#131d36] border border-blue-100 dark:border-blue-900/50 text-[#2563eb] dark:text-[#60a5fa] shadow-[0_4px_12px_rgba(37,99,235,0.08)] dark:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#1e3a8a]" />}
            </button>
          )}
        </div>

        {/* Center 3D Frosted Squircle Logo (Flame/Ribbon Wave motif) */}
        <div className="text-center pt-1 pb-3">
          <div className="relative inline-block mx-auto mb-3">
            {/* Concentric Glow Ripples */}
            <div className="absolute -inset-3 bg-blue-400/20 dark:bg-blue-600/20 rounded-[34px] blur-md"></div>
            <PayNovaLogo size="xl" className="mx-auto" />
          </div>

          <h1 className="font-display text-2xl sm:text-[28px] font-black tracking-tight text-[#0f172a] dark:text-white">
            {verificationStep === 'verify_code'
              ? 'Contrôle de Sécurité'
              : isRegister
              ? 'Créer un compte'
              : 'Welcome Back'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {verificationStep === 'verify_code'
              ? 'Vérification en deux étapes du compte'
              : isRegister
              ? 'Rejoignez PayNova et recevez vos 750 F de départ'
              : 'Sign in to continue'}
          </p>
        </div>

        {/* Mandatory Privacy Notice (Requested strictly by user) */}
        <div className="mb-4 p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-2.5 shadow-xs">
          <div className="w-7 h-7 rounded-xl bg-money-gradient text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] font-semibold text-[#1e40af] dark:text-blue-200 leading-tight">
            « Le site ne sauvegarde aucunes de vos données personnelles »
          </p>
        </div>

        {/* Segmented Pill Switcher (Connexion / Inscription) */}
        {verificationStep === 'form' && (
          <div className="p-1 mb-4 bg-[#e8f1fc] dark:bg-[#101a2e] rounded-full border border-blue-200/60 dark:border-blue-900/40 flex items-center shadow-inner">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg(null);
                refreshAntibot();
              }}
              className={`flex-1 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer text-center ${
                !isRegister
                  ? 'bg-white dark:bg-[#1b2b4d] text-[#2563eb] dark:text-[#60a5fa] shadow-[0_4px_12px_rgba(37,99,235,0.12)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg(null);
                refreshAntibot();
              }}
              className={`flex-1 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                isRegister
                  ? 'bg-money-gradient text-white shadow-blue'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Inscription</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/25 text-white">
                +750 F
              </span>
            </button>
          </div>
        )}

        {/* ========================================================
            VIEW 1: FORM
            ======================================================== */}
        {verificationStep === 'form' && (
          <>
            {/* Bonus Banner on Registration */}
            {isRegister && (
              <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-sky-400/10 dark:from-blue-600/20 dark:to-sky-500/10 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-money-gradient text-white shadow-blue flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-[#0f172a] dark:text-white flex items-center gap-1.5">
                    <span>Bonus de départ offert :</span>
                    <span className="text-[#2563eb] dark:text-[#60a5fa] font-black">
                      +{formatCurrencyValue(750, currentCountryConfig.currencySymbol, currentCountryConfig.rateFromCfa)}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Crédité immédiatement après contrôle de conformité.
                  </p>
                </div>
              </div>
            )}

            {/* Method switch: Mobile or Email */}
            <div className="flex items-center justify-between pb-2 text-xs font-semibold px-1">
              <span className="text-muted-foreground text-[11px]">Type d'identifiant :</span>
              <div className="inline-flex p-0.5 bg-[#e8f1fc] dark:bg-[#101a2e] rounded-full border border-blue-200/60 dark:border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setAuthType('phone')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    authType === 'phone'
                      ? 'bg-money-gradient text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthType('email')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    authType === 'email'
                      ? 'bg-money-gradient text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            <form onSubmit={isRegister ? handleStartRegistration : handleRealLogin} className="space-y-3.5 text-xs">
              
              {/* Country & Currency Selection (Required on Registration) */}
              {isRegister && (
                <div className="space-y-1">
                  <label className="font-semibold text-[#0f172a] dark:text-white flex items-center justify-between px-2">
                    <span className="flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-[#2563eb] dark:text-[#60a5fa]" />
                      <span>Pays & Devise</span>
                    </span>
                    <span className="text-[10px] text-[#2563eb] dark:text-[#60a5fa] font-mono font-bold">
                      {currentCountryConfig.currencySymbol} ({currentCountryConfig.currencyCode})
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="w-full h-13 pl-4 pr-10 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/15 shadow-neumorphic transition cursor-pointer appearance-none"
                    >
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c.countryCode} value={c.countryCode}>
                          {c.countryFlag} {c.countryName} — {c.currencySymbol} ({c.currencyCode})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>
              )}

              {/* Name Field (Registration) */}
              {isRegister && (
                <div className="space-y-1">
                  <label className="font-semibold text-[#0f172a] dark:text-white px-2 block">
                    Nom complet ou pseudonyme
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563eb] dark:text-[#60a5fa]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex. Amadou Koné"
                      className="w-full h-13 pl-13 pr-4 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/15 shadow-neumorphic transition"
                    />
                  </div>
                </div>
              )}

              {/* Identifier Input (Username or Email) - Styled exactly like the image! */}
              <div className="relative flex items-center">
                <div className="absolute left-3.5 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563eb] dark:text-[#60a5fa]">
                  {authType === 'phone' ? <Smartphone className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                {authType === 'phone' ? (
                  <input
                    type="tel"
                    required
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    placeholder="Numéro de mobile (+225...)"
                    className="w-full h-13 pl-13 pr-4 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/15 shadow-neumorphic transition"
                  />
                ) : (
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username or Email"
                    className="w-full h-13 pl-13 pr-4 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/15 shadow-neumorphic transition"
                  />
                )}
              </div>

              {/* Password Input - Styled exactly like the image! */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563eb] dark:text-[#60a5fa]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-13 pl-13 pr-12 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/15 shadow-neumorphic transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-muted-foreground hover:text-[#2563eb] cursor-pointer p-1 rounded-full transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isRegister && password && (
                  <div className="h-1.5 w-full bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden mt-1 px-1">
                    <div className={`h-full ${passwordStrength.color} rounded-full transition-all duration-300`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                  </div>
                )}
              </div>

              {/* Confirm Password (Registration only) */}
              {isRegister && (
                <div className="space-y-1">
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563eb] dark:text-[#60a5fa]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      className={`w-full h-13 pl-13 pr-4 rounded-full bg-white dark:bg-[#101a2e] border text-[#0f172a] dark:text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-4 shadow-neumorphic transition ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-rose-500 focus:ring-rose-500/20'
                          : 'border-blue-200/80 dark:border-blue-900/60 focus:border-[#2563eb] focus:ring-blue-500/15'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Anti-Robot Challenge on Login */}
              {!isRegister && (
                <div className="p-3 rounded-2xl bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-semibold text-[#0f172a] dark:text-white flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-[#2563eb] dark:text-[#60a5fa]" />
                      <span>Contrôle anti-robot :</span>
                    </span>
                    <button
                      type="button"
                      onClick={refreshAntibot}
                      className="text-muted-foreground hover:text-[#2563eb] transition cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Nouveau</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-[#16233d] border border-blue-200 dark:border-blue-800 text-[#0f172a] dark:text-white font-mono font-bold text-xs">
                      {antibotChallenge.num1} + {antibotChallenge.num2} = ?
                    </div>
                    <input
                      type="number"
                      required
                      value={antibotAnswer}
                      onChange={(e) => setAntibotAnswer(e.target.value)}
                      placeholder="Réponse"
                      className="flex-1 h-10 px-3 rounded-xl bg-blue-50/50 dark:bg-[#16233d] border border-blue-200 dark:border-blue-800 text-[#0f172a] dark:text-white font-mono text-xs focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password Row (Identical to image) */}
              <div className="flex items-center justify-between text-[11px] px-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#0f172a] dark:text-slate-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-blue-300 dark:border-blue-800 text-[#2563eb] focus:ring-0 cursor-pointer accent-[#2563eb]"
                  />
                  <span>Remember Me</span>
                </label>

                {!isRegister ? (
                  <button
                    type="button"
                    onClick={() => setErrorMsg('Pour réinitialiser votre mot de passe, contactez l\'assistance officielle WhatsApp de PayNova.')}
                    className="text-[#2563eb] dark:text-[#60a5fa] font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                ) : (
                  <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground text-[10px]">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-blue-300 dark:border-blue-800 text-[#2563eb] focus:ring-0 cursor-pointer accent-[#2563eb]"
                    />
                    <span>J'accepte le règlement</span>
                  </label>
                )}
              </div>

              {/* Error notice */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ========================================================
                  VIBRANT BLUE GLOWING ACTION BUTTON (With right circular arrow badge!)
                  ======================================================== */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isVerifying || lockoutTimer > 0}
                  className={`group relative w-full h-14 rounded-full font-display font-black text-base tracking-wide transition-all duration-200 flex items-center justify-between px-6 cursor-pointer overflow-hidden ${
                    lockoutTimer > 0
                      ? 'bg-slate-200 dark:bg-slate-800 text-muted-foreground cursor-not-allowed'
                      : 'bg-money-gradient text-white shadow-[0_12px_28px_-6px_rgba(37,99,235,0.55)] hover:shadow-[0_16px_34px_-6px_rgba(37,99,235,0.7)] hover:scale-[1.01] active:scale-[0.98]'
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full pointer-events-none"></div>

                  <span className="truncate">
                    {isVerifying ? (
                      'Vérification en cours...'
                    ) : lockoutTimer > 0 ? (
                      `Bloqué (${lockoutTimer}s)`
                    ) : isRegister ? (
                      'Passer le contrôle'
                    ) : (
                      'Login'
                    )}
                  </span>

                  {/* Circular badge on right containing arrow */}
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform duration-200">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>
            </form>

            {/* ========================================================
                DIVIDER: « OR CONTINUE WITH » (Like in image)
                ======================================================== */}
            <div className="relative py-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-200/60 dark:border-blue-900/40"></div>
              </div>
              <div className="relative inline-block px-3 bg-[#f8fbfe] dark:bg-[#0c1424] text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Or continue with
              </div>
            </div>

            {/* ========================================================
                3 NEUMORPHIC SQUIRCLE BUTTONS (Google, Discord, Facebook)
                ======================================================== */}
            <div className="grid grid-cols-3 gap-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleFillDemo}
                className="h-13 rounded-2xl bg-white dark:bg-[#121c33] border border-blue-100 dark:border-blue-900/50 shadow-neumorphic hover:border-[#2563eb]/50 flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 group"
                title="Remplir le compte Démo officiel"
              >
                <svg className="w-5 h-5 group-hover:rotate-6 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              {/* Discord Button */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="h-13 rounded-2xl bg-white dark:bg-[#121c33] border border-blue-100 dark:border-blue-900/50 shadow-neumorphic hover:border-[#2563eb]/50 flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 group"
                title="Discord Communauté"
              >
                <div className="w-6 h-6 rounded-lg bg-[#5865F2] flex items-center justify-center text-white group-hover:rotate-6 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
              </a>

              {/* Facebook Button */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="h-13 rounded-2xl bg-white dark:bg-[#121c33] border border-blue-100 dark:border-blue-900/50 shadow-neumorphic hover:border-[#2563eb]/50 flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 group"
                title="Facebook Officiel"
              >
                <div className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center text-white group-hover:rotate-6 transition-transform">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              </a>
            </div>

            {/* Bottom Tagline (Directly matching the image footer) */}
            <div className="pt-6 text-center space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#2563eb]/80 dark:text-[#60a5fa]/80">
                GAGNER • RETIRER • PROGRESSER ENSEMBLE
              </p>
              <div className="w-8 h-1 bg-blue-300/40 dark:bg-blue-600/30 rounded-full mx-auto"></div>
            </div>
          </>
        )}

        {/* ========================================================
            VIEW 2: SECURITY OTP STEP
            ======================================================== */}
        {verificationStep === 'verify_code' && (
          <div className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-money-gradient text-white shadow-blue mx-auto flex items-center justify-center mb-2">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="font-display text-base font-bold text-[#0f172a] dark:text-white">
                Contrôle de Sécurité & Validation
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Pour garantir l'intégrité des rémunérations et lutter contre les robots, validez votre code de confirmation.
              </p>
            </div>

            {otpSentNotice && (
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-[#2563eb] dark:text-[#60a5fa] text-xs space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Code de Sécurité PayNova :</span>
                  </span>
                  <span className="font-mono text-sm tracking-widest bg-blue-900 px-2.5 py-0.5 rounded-lg border border-blue-400/50 text-white font-black">
                    {generatedOtp}
                  </span>
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  Saisissez ce code à 6 chiffres ci-dessous pour activer votre solde de 750 F.
                </p>
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndCreate} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="font-semibold text-[#0f172a] dark:text-white flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-[#2563eb] dark:text-[#60a5fa]" />
                    <span>Calcul anti-robot :</span>
                  </span>
                  <button
                    type="button"
                    onClick={refreshAntibot}
                    className="text-muted-foreground hover:text-[#2563eb] transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-[#16233d] border border-blue-200 dark:border-blue-800 text-[#0f172a] dark:text-white font-mono font-bold text-xs">
                    {antibotChallenge.num1} + {antibotChallenge.num2} = ?
                  </div>
                  <input
                    type="number"
                    required
                    value={antibotAnswer}
                    onChange={(e) => setAntibotAnswer(e.target.value)}
                    placeholder="Résultat"
                    className="flex-1 h-11 px-3.5 rounded-xl bg-blue-50/50 dark:bg-[#16233d] border border-blue-200 dark:border-blue-800 text-[#0f172a] dark:text-white font-mono text-xs focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#0f172a] dark:text-white block px-1">
                  Code de confirmation à 6 chiffres
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full h-14 px-4 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white font-mono font-black text-xl text-center tracking-[0.3em] focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/15 transition shadow-neumorphic"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-2 pt-1">
                  <span>Valide encore : <strong>{otpTimer}s</strong></span>
                  {otpTimer === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(newCode);
                        setOtpTimer(60);
                        setOtpSentNotice(`Nouveau code généré : ${newCode}`);
                      }}
                      className="text-[#2563eb] font-bold hover:underline cursor-pointer"
                    >
                      Renvoyer un code
                    </button>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="group relative w-full h-14 rounded-full font-display font-black text-sm tracking-wide bg-money-gradient text-white shadow-blue hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-between px-6 cursor-pointer"
              >
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full pointer-events-none"></div>

                <span>
                  {isVerifying ? 'Activation en cours...' : 'Valider & Activer mon solde (750 F)'}
                </span>

                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVerificationStep('form')}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground cursor-pointer py-1"
              >
                ← Modifier mes informations
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            VIEW 3: SUCCESS ANIMATION
            ======================================================== */}
        {verificationStep === 'verified_success' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-[#2563eb] text-[#2563eb] dark:text-[#60a5fa] mx-auto flex items-center justify-center animate-bounce shadow-blue">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#0f172a] dark:text-white">
              Contrôle réussi & Compte activé !
            </h3>
            <p className="text-xs text-[#2563eb] dark:text-[#60a5fa] font-semibold">
              Votre solde de départ de +750 F CFA a été crédité avec succès.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Redirection vers votre tableau de bord...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
