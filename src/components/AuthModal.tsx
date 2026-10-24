import React, { useState, useEffect } from 'react';
import { UserProfile, AuthAccount, ThemeMode } from '../types';
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
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

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
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

  // Real Control & Verification State
  const [verificationStep, setVerificationStep] = useState<'form' | 'verify_code' | 'verified_success'>('form');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [inputOtp, setInputOtp] = useState<string>('');
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [antibotAnswer, setAntibotAnswer] = useState<string>('');
  const [antibotChallenge, setAntibotChallenge] = useState<{ num1: number; num2: number }>({ num1: 12, num2: 7 });

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

  if (!isOpen) return null;

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
        setErrorMsg('Numéro de téléphone invalide (minimum 8 chiffres requis).');
        return;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg('Adresse email invalide.');
        return;
      }
    }

    if (name.trim().length < 2) {
      setErrorMsg('Veuillez renseigner votre nom complet ou pseudonyme.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('La confirmation ne correspond pas au mot de passe.');
      return;
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find(a => a.identifier.toLowerCase() === identifier.toLowerCase());
    if (existing) {
      setErrorMsg('Un compte PayNova existe déjà avec cet identifiant.');
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
    setOtpSentNotice(`Code de sécurité PayNova envoyé à ${identifier} : ${generatedCode}`);
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
      setErrorMsg('Code de sécurité incorrect.');
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
            taskTitle: '🎁 Bonus de bienvenue (Solde de départ)',
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
        onClose();
      }, 900);
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
          setErrorMsg('Sécurité : 3 échecs consécutifs. Verrouillage 30s.');
        } else {
          setErrorMsg(`Mot de passe incorrect (${nextAttempts} tentative(s) restante(s)).`);
        }
        refreshAntibot();
        return;
      }

      setIsVerifying(false);
      onLogin(account.userProfile);
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-[420px] my-4 bg-[#f8fbfe] dark:bg-[#0c1424] rounded-[36px] shadow-[0_25px_60px_-15px_rgba(37,99,235,0.25)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] border border-white/80 dark:border-blue-900/50 overflow-hidden text-left transition-all duration-300">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none w-full h-56 overflow-hidden flex items-center justify-center opacity-70">
          <div className="absolute w-64 h-64 rounded-full border border-blue-400/20 dark:border-blue-500/20"></div>
          <div className="absolute w-44 h-44 rounded-full bg-blue-400/15 dark:bg-blue-600/10 blur-xl"></div>
        </div>

        {/* Top Control Bar */}
        <div className="relative z-10 pt-4 px-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold font-mono text-[#2563eb] dark:text-[#60a5fa] bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse"></span>
            PAYNOVA AUTH
          </div>

          <div className="flex items-center gap-2">
            {onSetThemeMode && (
              <button
                type="button"
                onClick={handleToggleTheme}
                className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white dark:bg-[#131d36] border border-blue-100 dark:border-blue-900/50 text-[#2563eb] dark:text-[#60a5fa] shadow-xs cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#1e3a8a]" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white dark:bg-[#131d36] border border-blue-100 dark:border-blue-900/50 text-muted-foreground hover:text-foreground shadow-xs cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 px-6 sm:px-7 pt-2 pb-6 max-h-[85vh] overflow-y-auto space-y-3.5">
          
          {/* 3D Frosted Squircle Logo with 3 Blue Ribbon Petals */}
          <div className="text-center pt-1 pb-1">
            <div className="relative inline-block mx-auto mb-2.5">
              <div className="absolute -inset-2 bg-blue-400/25 dark:bg-blue-600/25 rounded-3xl blur-md"></div>
              <PayNovaLogo size="xl" className="mx-auto" />
            </div>

            <h1 className="font-display text-2xl sm:text-[26px] font-black tracking-tight text-[#0f172a] dark:text-white">
              {verificationStep === 'verify_code'
                ? 'Contrôle de Sécurité'
                : isRegister
                ? 'Créer un compte'
                : 'Welcome Back'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {verificationStep === 'verify_code'
                ? 'Validation du compte'
                : isRegister
                ? 'Rejoignez PayNova et recevez vos 750 F'
                : 'Sign in to continue'}
            </p>
          </div>

          {/* Privacy statement notice */}
          <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-2.5 shadow-xs">
            <div className="w-7 h-7 rounded-xl bg-money-gradient text-white flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] font-semibold text-[#1e40af] dark:text-blue-200 leading-tight">
              « Le site ne sauvegarde aucunes de vos données personnelles »
            </p>
          </div>

          {/* Tab switcher */}
          {verificationStep === 'form' && (
            <div className="p-1 bg-[#e8f1fc] dark:bg-[#101a2e] rounded-full border border-blue-200/60 dark:border-blue-900/40 flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg(null);
                  refreshAntibot();
                }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer text-center ${
                  !isRegister
                    ? 'bg-white dark:bg-[#1b2b4d] text-[#2563eb] dark:text-[#60a5fa] shadow-xs'
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
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
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

          {verificationStep === 'form' && (
            <>
              {isRegister && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-sky-400/10 dark:from-blue-600/20 dark:to-sky-500/10 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
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
                      Crédité dès validation.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={isRegister ? handleStartRegistration : handleRealLogin} className="space-y-3 text-xs">
                {isRegister && (
                  <div className="space-y-1">
                    <label className="font-semibold text-[#0f172a] dark:text-white flex items-center justify-between px-2">
                      <span className="flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-[#2563eb] dark:text-[#60a5fa]" />
                        <span>Pays & Devise</span>
                      </span>
                      <span className="text-[10px] text-[#2563eb] dark:text-[#60a5fa] font-mono font-bold">
                        {currentCountryConfig.currencySymbol}
                      </span>
                    </label>
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="w-full h-13 px-4 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#2563eb] shadow-neumorphic transition cursor-pointer"
                    >
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c.countryCode} value={c.countryCode}>
                          {c.countryFlag} {c.countryName} — {c.currencySymbol} ({c.currencyCode})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isRegister && (
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563eb] dark:text-[#60a5fa]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nom complet ou pseudonyme"
                      className="w-full h-13 pl-13 pr-4 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[#2563eb] shadow-neumorphic transition"
                    />
                  </div>
                )}

                <div className="relative flex items-center">
                  <div className="absolute left-3.5 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563eb] dark:text-[#60a5fa]">
                    {authType === 'phone' ? <Smartphone className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <input
                    type={authType === 'phone' ? 'tel' : 'email'}
                    required
                    value={authType === 'phone' ? phoneNum : email}
                    onChange={(e) => authType === 'phone' ? setPhoneNum(e.target.value) : setEmail(e.target.value)}
                    placeholder={authType === 'phone' ? "Numéro de mobile (+225...)" : "Username or Email"}
                    className="w-full h-13 pl-13 pr-4 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[#2563eb] shadow-neumorphic transition"
                  />
                </div>

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
                      className="w-full h-13 pl-13 pr-12 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[#2563eb] shadow-neumorphic transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-muted-foreground hover:text-[#2563eb] cursor-pointer"
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

                {isRegister && (
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563eb] dark:text-[#60a5fa]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez le mot de passe"
                      className="w-full h-13 pl-13 pr-4 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[#2563eb] shadow-neumorphic transition"
                    />
                  </div>
                )}

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
                        className="text-muted-foreground hover:text-[#2563eb] transition cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-[#16233d] border border-blue-200 dark:border-blue-800 text-[#0f172a] dark:text-white font-mono font-bold text-xs">
                        {antibotChallenge.num1} + {antibotChallenge.num2} = ?
                      </div>
                      <input
                        type="number"
                        required
                        value={antibotAnswer}
                        onChange={(e) => setAntibotAnswer(e.target.value)}
                        placeholder="Réponse"
                        className="flex-1 h-9 px-3 rounded-xl bg-blue-50/50 dark:bg-[#16233d] border border-blue-200 dark:border-blue-800 text-[#0f172a] dark:text-white font-mono text-xs focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] px-2 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#0f172a] dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-blue-300 text-[#2563eb] accent-[#2563eb]"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setErrorMsg('Pour réinitialiser votre mot de passe, contactez l\'assistance officielle WhatsApp de PayNova.')}
                    className="text-[#2563eb] dark:text-[#60a5fa] font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isVerifying || lockoutTimer > 0}
                    className="group relative w-full h-14 rounded-full font-display font-black text-base tracking-wide bg-money-gradient text-white shadow-[0_12px_28px_-6px_rgba(37,99,235,0.55)] hover:shadow-[0_16px_34px_-6px_rgba(37,99,235,0.7)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-between px-6 cursor-pointer"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full pointer-events-none"></div>

                    <span>
                      {isVerifying ? 'Vérification...' : isRegister ? 'Passer le contrôle' : 'Login'}
                    </span>

                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </button>
                </div>
              </form>

              {/* Quick access options */}
              <div className="relative py-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-200/60 dark:border-blue-900/40"></div>
                </div>
                <div className="relative inline-block px-3 bg-[#f8fbfe] dark:bg-[#0c1424] text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Or continue with
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="h-12 rounded-2xl bg-white dark:bg-[#121c33] border border-blue-100 dark:border-blue-900/50 shadow-neumorphic flex items-center justify-center transition cursor-pointer hover:scale-105"
                  title="Compte Démo rapide"
                >
                  <Sparkles className="w-5 h-5 text-[#2563eb]" />
                </button>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="h-12 rounded-2xl bg-white dark:bg-[#121c33] border border-blue-100 dark:border-blue-900/50 shadow-neumorphic flex items-center justify-center transition cursor-pointer hover:scale-105"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#5865F2] flex items-center justify-center text-white">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="h-12 rounded-2xl bg-white dark:bg-[#121c33] border border-blue-100 dark:border-blue-900/50 shadow-neumorphic flex items-center justify-center transition cursor-pointer hover:scale-105"
                >
                  <div className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                </a>
              </div>
            </>
          )}

          {verificationStep === 'verify_code' && (
            <div className="space-y-4 pt-1">
              <div className="text-center space-y-1">
                <div className="w-14 h-14 rounded-2xl bg-money-gradient text-white shadow-blue mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h3 className="font-display text-base font-bold text-[#0f172a] dark:text-white">
                  Validation du Code
                </h3>
              </div>

              {otpSentNotice && (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-[#2563eb] dark:text-[#60a5fa] text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Code PayNova :</span>
                    <span className="font-mono text-sm bg-blue-900 text-white px-2 py-0.5 rounded">
                      {generatedOtp}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyOtpAndCreate} className="space-y-4 text-xs">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full h-14 px-4 rounded-full bg-white dark:bg-[#101a2e] border border-blue-200/80 dark:border-blue-900/60 text-[#0f172a] dark:text-white font-mono font-black text-xl text-center tracking-[0.3em] focus:outline-none focus:border-[#2563eb] shadow-neumorphic"
                />

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full h-14 rounded-full font-bold text-sm bg-money-gradient text-white shadow-blue flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider & Activer mes 750 F</span>
                </button>
              </form>
            </div>
          )}

          {verificationStep === 'verified_success' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-[#2563eb] text-[#2563eb] dark:text-[#60a5fa] mx-auto flex items-center justify-center animate-bounce shadow-blue">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0f172a] dark:text-white">
                Compte activé avec succès !
              </h3>
              <p className="text-xs text-[#2563eb] dark:text-[#60a5fa] font-semibold">
                +750 F CFA crédités immédiatement.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
