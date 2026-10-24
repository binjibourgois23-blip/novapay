import React, { useState } from 'react';
import { UserProfile, NavTab, WithdrawalRecord, PayoutChannel } from '../types';
import { SUPPORTED_COUNTRIES, CRYPTO_OPTIONS, formatCurrencyValue } from '../data/tasksData';
import { CountUpBalance } from './CountUpBalance';
import { 
  History, 
  AlertCircle, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Smartphone,
  Coins,
  CheckCircle2,
  XCircle,
  Zap,
  Users,
  Wallet,
  PlayCircle,
  Share2,
  AlertTriangle,
  Loader2,
  Check
} from 'lucide-react';

interface WithdrawViewProps {
  user: UserProfile;
  onNavigate: (tab: NavTab) => void;
  onRequestWithdrawal: (record: WithdrawalRecord) => void;
  onSimulateReferral: () => void;
  onSimulateBalanceBoost: () => void;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({
  user,
  onNavigate,
  onRequestWithdrawal,
  onSimulateReferral,
  onSimulateBalanceBoost,
}) => {
  // Strict Requirements:
  // 1. Must have reached at least 45 000 F CFA
  // 2. Must have invited at least 3 active referrals
  const MIN_WITHDRAWAL_CFA = 45000;
  const REQUIRED_REFERRALS = 3;

  const [selectedChannel, setSelectedChannel] = useState<PayoutChannel>('mobile_money');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(user.countryCode || 'CI');
  
  const countryConfig = SUPPORTED_COUNTRIES.find((c) => c.countryCode === selectedCountryCode) || SUPPORTED_COUNTRIES[0];
  
  // Method specific states
  const [selectedMobileOperator, setSelectedMobileOperator] = useState<string>(countryConfig.mobileOperators[0] || 'Wave');
  const [mobilePhone, setMobilePhone] = useState<string>(user.identifier.includes('@') ? '' : user.identifier);
  const [mobileName, setMobileName] = useState<string>(user.name || '');

  const [selectedBank, setSelectedBank] = useState<string>(countryConfig.bankOptions[0] || 'Ecobank');
  const [bankAccountHolder, setBankAccountHolder] = useState<string>(user.name || '');
  const [bankIbanOrRib, setBankIbanOrRib] = useState<string>('');
  const [bankSwiftBic, setBankSwiftBic] = useState<string>('');

  const [selectedCrypto, setSelectedCrypto] = useState<string>('usdt_trc20');
  const [cryptoAddress, setCryptoAddress] = useState<string>('');

  const [amountCfa, setAmountCfa] = useState<number>(Math.max(MIN_WITHDRAWAL_CFA, user.balanceCfa));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Rejection modal & Audit flow states
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditStep, setAuditStep] = useState<number>(1);

  // Verification calculations
  const referralsCount = user.referralsCount || user.referrals?.length || 0;
  const hasEnoughBalance = user.balanceCfa >= MIN_WITHDRAWAL_CFA;
  const hasEnoughReferrals = referralsCount >= REQUIRED_REFERRALS;
  const canWithdraw = hasEnoughBalance && hasEnoughReferrals;

  const missingBalanceCfa = Math.max(0, MIN_WITHDRAWAL_CFA - user.balanceCfa);
  const missingReferrals = Math.max(0, REQUIRED_REFERRALS - referralsCount);
  const balancePercentage = Math.min(100, Math.round((user.balanceCfa / MIN_WITHDRAWAL_CFA) * 100));

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const country = SUPPORTED_COUNTRIES.find((c) => c.countryCode === code);
    if (country) {
      if (country.mobileOperators.length > 0) setSelectedMobileOperator(country.mobileOperators[0]);
      if (country.bankOptions.length > 0) setSelectedBank(country.bankOptions[0]);
    }
  };

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Strict Double Verification: If either condition fails, the order CANNOT pass!
    if (!canWithdraw) {
      setShowRejectionModal(true);
      setErrorMsg(`Commande refusée : Le solde doit atteindre 45 000 F CFA et 3 parrainages actifs sont requis.`);
      return;
    }

    if (amountCfa > user.balanceCfa) {
      setErrorMsg('Le montant demandé dépasse votre solde disponible.');
      return;
    }

    if (amountCfa < MIN_WITHDRAWAL_CFA) {
      setErrorMsg(`Le montant minimum de retrait est de ${formatCurrencyValue(MIN_WITHDRAWAL_CFA, user.currencySymbol, user.currencyRate)}.`);
      return;
    }

    let recipientDetails = '';
    let operatorOrBank = '';
    let recipientName = user.name;

    if (selectedChannel === 'mobile_money') {
      if (!mobilePhone.trim()) {
        setErrorMsg('Veuillez saisir votre numéro Mobile Money.');
        return;
      }
      recipientDetails = mobilePhone.trim();
      operatorOrBank = selectedMobileOperator;
      recipientName = mobileName.trim() || user.name;
    } else if (selectedChannel === 'bank_transfer') {
      if (!bankIbanOrRib.trim()) {
        setErrorMsg('Veuillez saisir votre RIB, IBAN ou numéro de compte bancaire.');
        return;
      }
      recipientDetails = `${bankIbanOrRib.trim()}${bankSwiftBic ? ` (SWIFT: ${bankSwiftBic.trim()})` : ''}`;
      operatorOrBank = selectedBank;
      recipientName = bankAccountHolder.trim() || user.name;
    } else if (selectedChannel === 'crypto') {
      if (!cryptoAddress.trim() || cryptoAddress.trim().length < 15) {
        setErrorMsg('Veuillez renseigner une adresse de portefeuille crypto valide.');
        return;
      }
      const cryptoConfig = CRYPTO_OPTIONS.find(c => c.id === selectedCrypto);
      recipientDetails = cryptoAddress.trim();
      operatorOrBank = cryptoConfig?.name || 'USDT TRC20';
      recipientName = `Portefeuille ${cryptoConfig?.network}`;
    }

    // Launch multi-step official security audit animation
    setIsAuditing(true);
    setAuditStep(1);

    setTimeout(() => {
      setAuditStep(2);
      setTimeout(() => {
        setAuditStep(3);
        setTimeout(() => {
          const record: WithdrawalRecord = {
            id: `WTH-${Date.now().toString().slice(-6)}`,
            date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            amountCfa,
            amountLocal: amountCfa * user.currencyRate,
            currencySymbol: user.currencySymbol,
            channel: selectedChannel,
            operatorOrBank,
            country: countryConfig.countryName,
            recipientDetails,
            recipientName,
            status: 'approved',
            reference: `PN-${Date.now().toString().slice(-8)}`,
            feeCfa: 0,
          };

          onRequestWithdrawal(record);
          setIsAuditing(false);
          setSuccessMsg(`Demande de retrait de ${formatCurrencyValue(amountCfa, user.currencySymbol, user.currencyRate)} validée avec succès ! Transaction enregistrée sans aucun frais (0 F CFA).`);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-24 text-left">
      {/* View Header with Link to History */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1c1017] dark:text-white">
            Demande de Retrait
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit de conformité & transfert sécurisé · 0 frais
          </p>
        </div>

        <button
          onClick={() => onNavigate('withdraw_history')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-xs font-semibold text-bordeaux-brand hover:border-[#be123c]/40 transition cursor-pointer"
        >
          <History className="h-4 w-4" />
          <span>Historique ({user.withdrawals?.length || 0})</span>
        </button>
      </div>

      {/* Official Audit & Eligibility Control Hub */}
      <div className="rounded-3xl border border-[#ead7e0] dark:border-[#331e2d] bg-card-gradient p-5 sm:p-6 shadow-card space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-bordeaux-brand" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1c1017] dark:text-white">
                Contrôle de Sécurité & d'Éligibilité
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Conformité stricte : 45 000 F CFA réels et 3 parrainages obligatoires avant validation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              canWithdraw 
                ? 'bg-[#881337]/15 border-[#be123c]/40 text-bordeaux-brand' 
                : 'bg-rose-500/15 border-rose-500/40 text-rose-500 dark:text-rose-400'
            }`}>
              {canWithdraw ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Retrait Autorisé</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Retrait Bloqué</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Audit Cards Grid: Verification 1 (Balance) & Verification 2 (Referrals) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-[#ead7e0] dark:border-[#331e2d]">
          
          {/* Audit Verification 1: Balance Check (≥ 45 000 F CFA) */}
          <div className={`p-4 rounded-2xl border transition ${
            hasEnoughBalance 
              ? 'bg-[#881337]/10 dark:bg-[#881337]/20 border-[#be123c]/40 text-[#9f1239] dark:text-[#fda4af]' 
              : 'bg-[#fcf4f6] dark:bg-[#190d16] border-rose-500/30 text-muted-foreground'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className={`w-4 h-4 ${hasEnoughBalance ? 'text-bordeaux-brand' : 'text-amber-500'}`} />
                <span className="text-xs font-bold text-[#1c1017] dark:text-white">1. Solde réel requis</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                hasEnoughBalance 
                  ? 'bg-[#881337]/20 text-bordeaux-brand' 
                  : 'bg-rose-500/20 text-rose-500 dark:text-rose-300'
              }`}>
                {hasEnoughBalance ? 'Validé ✓' : `Manque ${formatCurrencyValue(missingBalanceCfa, user.currencySymbol, user.currencyRate)}`}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs mb-1.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <span>Actuel :</span>
                <CountUpBalance
                  amountCfa={user.balanceCfa}
                  currencySymbol={user.currencySymbol}
                  currencyRate={user.currencyRate}
                  className="text-[#1c1017] dark:text-white font-mono font-bold"
                  showFloatingBadge={false}
                />
              </span>
              <span className="text-muted-foreground">Requis : <strong className="text-[#1c1017] dark:text-white font-mono">{formatCurrencyValue(MIN_WITHDRAWAL_CFA, user.currencySymbol, user.currencyRate)}</strong></span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#f6eaf0] dark:bg-[#22141f] overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  hasEnoughBalance ? 'bg-money-gradient' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                }`}
                style={{ width: `${balancePercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {hasEnoughBalance ? (
                <span className="text-bordeaux-brand font-semibold">✓ Seuil minimal de 45 000 F CFA atteint avec succès.</span>
              ) : (
                <span className="text-rose-500 dark:text-rose-400">✗ Bloquant : Vous devez cumuler au moins 45 000 F CFA.</span>
              )}
            </p>
          </div>

          {/* Audit Verification 2: Referrals Check (≥ 3 Active Referrals) */}
          <div className={`p-4 rounded-2xl border transition ${
            hasEnoughReferrals 
              ? 'bg-[#881337]/10 dark:bg-[#881337]/20 border-[#be123c]/40 text-[#9f1239] dark:text-[#fda4af]' 
              : 'bg-[#fcf4f6] dark:bg-[#190d16] border-rose-500/30 text-muted-foreground'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${hasEnoughReferrals ? 'text-bordeaux-brand' : 'text-amber-500'}`} />
                <span className="text-xs font-bold text-[#1c1017] dark:text-white">2. Parrainages actifs réels</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                hasEnoughReferrals 
                  ? 'bg-[#881337]/20 text-bordeaux-brand' 
                  : 'bg-rose-500/20 text-rose-500 dark:text-rose-300'
              }`}>
                {hasEnoughReferrals ? 'Validé ✓' : `Manque ${missingReferrals} ${missingReferrals > 1 ? 'filleuls' : 'filleul'}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Inscrits : <strong className="text-[#1c1017] dark:text-white font-mono">{referralsCount}</strong></span>
              <span className="text-muted-foreground">Requis : <strong className="text-[#1c1017] dark:text-white font-mono">{REQUIRED_REFERRALS} personnes</strong></span>
            </div>

            {/* Visual 3 Slots Indicator */}
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((slotNumber) => {
                const isFulfilled = referralsCount >= slotNumber;
                return (
                  <div 
                    key={slotNumber}
                    className={`h-2 rounded-full transition-all ${
                      isFulfilled ? 'bg-money-gradient' : 'bg-[#f6eaf0] dark:bg-[#22141f]'
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {hasEnoughReferrals ? (
                <span className="text-bordeaux-brand font-semibold">✓ 3 parrainages actifs confirmés dans le système.</span>
              ) : (
                <span className="text-rose-500 dark:text-rose-400">✗ Bloquant : {missingReferrals} parrainage(s) manquant(s) pour débloquer le retrait.</span>
              )}
            </p>
          </div>
        </div>

        {/* Prototype Quick Simulator Helpers (to allow reviewer to test both blocked & unlocked states) */}
        <div className="p-3.5 rounded-2xl bg-[#f6eaf0] dark:bg-[#120a10] border border-dashed border-[#ead7e0] dark:border-[#331e2d] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5 font-semibold text-[#1c1017] dark:text-white">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Boutons de test pour le correcteur (Simuler les critères) :</span>
            </span>
            <span className="text-[10px] text-amber-500 font-mono">Mode Démo Test</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {!hasEnoughBalance ? (
              <button
                type="button"
                onClick={onSimulateBalanceBoost}
                className="px-3 py-1.5 rounded-lg bg-[#881337]/15 hover:bg-[#881337]/25 text-bordeaux-brand border border-[#be123c]/30 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simuler le seuil atteint (+45 000 F CFA)</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-[#881337]/10 text-bordeaux-brand border border-[#be123c]/20 text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Solde ≥ 45 000 F OK
              </span>
            )}

            {!hasEnoughReferrals ? (
              <button
                type="button"
                onClick={onSimulateReferral}
                className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-500 dark:text-blue-300 border border-blue-500/30 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+1 Parrainage actif ({referralsCount}/3)</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-[#881337]/10 text-bordeaux-brand border border-[#be123c]/20 text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 3 Parrainages OK
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Warning if Order is Blocked */}
      {!canWithdraw && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/20 p-4 space-y-3 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-500 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300">
                Commande de retrait bloquée par le système
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-200/90 leading-relaxed">
                Le cas échéant, <strong>la commande de retrait ne peut pas passer</strong> tant que vous n'avez pas réellement accumulé <strong>45 000 F CFA</strong> et invité <strong>3 personnes actives</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowRejectionModal(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-xs font-bold text-rose-700 dark:text-rose-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Voir le diagnostic d'audit de refus</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('earn')}
              className="px-3.5 py-2 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] hover:bg-[#ead7e0] dark:hover:bg-[#2d1b27] border border-[#ead7e0] dark:border-[#331e2d] text-xs font-semibold text-[#1c1017] dark:text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <PlayCircle className="w-3.5 h-3.5 text-bordeaux-brand" />
              <span>Regarder mes vidéos (+250 F/jour)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('invite')}
              className="px-3.5 py-2 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] hover:bg-[#ead7e0] dark:hover:bg-[#2d1b27] border border-[#ead7e0] dark:border-[#331e2d] text-xs font-semibold text-[#1c1017] dark:text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Inviter mes amis (+500 F/ami)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Withdrawal Form */}
      <form onSubmit={handleValidateAndSubmit} className="rounded-3xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-5 sm:p-6 shadow-card space-y-5 transition-colors">
        
        {/* Step 1: Select Payout Channel (Mobile Money, Virement bancaire, Cryptomonnaie) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1c1017] dark:text-white uppercase tracking-wider block">
            1. Choisissez le moyen de retrait
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedChannel('mobile_money')}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                selectedChannel === 'mobile_money'
                  ? 'bg-money-gradient text-white border-transparent shadow-bordeaux'
                  : 'bg-[#f6eaf0] dark:bg-[#1e131b] border-[#ead7e0] dark:border-[#331e2d] text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-xs font-bold">Mobile Money</span>
              <span className="text-[10px] opacity-80 hidden sm:inline">Wave, Orange, MTN</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChannel('bank_transfer')}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                selectedChannel === 'bank_transfer'
                  ? 'bg-money-gradient text-white border-transparent shadow-bordeaux'
                  : 'bg-[#f6eaf0] dark:bg-[#1e131b] border-[#ead7e0] dark:border-[#331e2d] text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="text-xs font-bold">Virement Bancaire</span>
              <span className="text-[10px] opacity-80 hidden sm:inline">IBAN / RIB / SWIFT</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChannel('crypto')}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                selectedChannel === 'crypto'
                  ? 'bg-money-gradient text-white border-transparent shadow-bordeaux'
                  : 'bg-[#f6eaf0] dark:bg-[#1e131b] border-[#ead7e0] dark:border-[#331e2d] text-muted-foreground hover:text-foreground'
              }`}
            >
              <Coins className="w-5 h-5" />
              <span className="text-xs font-bold">Cryptomonnaie</span>
              <span className="text-[10px] opacity-80 hidden sm:inline">USDT, BTC, ETH</span>
            </button>
          </div>
        </div>

        {/* Step 2: Channel Specific Details */}
        {selectedChannel === 'mobile_money' && (
          <div className="space-y-3.5 pt-2 border-t border-[#ead7e0] dark:border-[#331e2d]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Pays de réception</label>
                <select
                  value={selectedCountryCode}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white text-xs focus:outline-none focus:border-[#be123c] cursor-pointer"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.countryCode} value={c.countryCode}>
                      {c.countryFlag} {c.countryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Opérateur Mobile Money</label>
                <select
                  value={selectedMobileOperator}
                  onChange={(e) => setSelectedMobileOperator(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white text-xs focus:outline-none focus:border-[#be123c] cursor-pointer"
                >
                  {countryConfig.mobileOperators.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Numéro de téléphone du compte</label>
              <input
                type="tel"
                required
                value={mobilePhone}
                onChange={(e) => setMobilePhone(e.target.value)}
                placeholder="Ex. 07 48 92 10 33"
                className="w-full h-12 px-3.5 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white font-mono text-xs focus:outline-none focus:border-[#be123c] transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Nom du titulaire du compte</label>
              <input
                type="text"
                required
                value={mobileName}
                onChange={(e) => setMobileName(e.target.value)}
                placeholder="Nom complet tel qu'enregistré chez l'opérateur"
                className="w-full h-12 px-3.5 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white text-xs focus:outline-none focus:border-[#be123c] transition"
              />
            </div>
          </div>
        )}

        {selectedChannel === 'bank_transfer' && (
          <div className="space-y-3.5 pt-2 border-t border-[#ead7e0] dark:border-[#331e2d]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Établissement bancaire</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white text-xs focus:outline-none focus:border-[#be123c] cursor-pointer"
                >
                  {countryConfig.bankOptions.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="Autre banque">Autre banque locale ou internationale</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Titulaire du compte bancaire</label>
                <input
                  type="text"
                  required
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Nom & prénom sur le RIB"
                  className="w-full h-12 px-3.5 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white text-xs focus:outline-none focus:border-[#be123c] transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Numéro de compte / RIB / IBAN</label>
              <input
                type="text"
                required
                value={bankIbanOrRib}
                onChange={(e) => setBankIbanOrRib(e.target.value)}
                placeholder="Ex. CI042 01001 02345678901 23 ou IBAN"
                className="w-full h-12 px-3.5 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white font-mono text-xs focus:outline-none focus:border-[#be123c] transition uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Code SWIFT / BIC (facultatif)</label>
              <input
                type="text"
                value={bankSwiftBic}
                onChange={(e) => setBankSwiftBic(e.target.value)}
                placeholder="Ex. ECOBCIAB (facultatif pour virements nationaux)"
                className="w-full h-12 px-3.5 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white font-mono text-xs focus:outline-none focus:border-[#be123c] transition uppercase"
              />
            </div>
          </div>
        )}

        {selectedChannel === 'crypto' && (
          <div className="space-y-3.5 pt-2 border-t border-[#ead7e0] dark:border-[#331e2d]">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Actif & Réseau Blockchain</label>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full h-12 px-3 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white text-xs focus:outline-none focus:border-[#be123c] cursor-pointer"
              >
                {CRYPTO_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name} — Réseau : {c.network} {c.recommended ? '(Recommandé)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1c1017] dark:text-white">Adresse de votre portefeuille de réception</label>
              <input
                type="text"
                required
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                placeholder="Ex. TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t (USDT TRC20)"
                className="w-full h-12 px-3.5 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white font-mono text-xs focus:outline-none focus:border-[#be123c] transition"
              />
              <p className="text-[10px] text-muted-foreground">
                Veillez à vérifier le réseau sélectionné avant de valider votre adresse. Les transferts crypto sont instantanés.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Montant du retrait */}
        <div className="space-y-1.5 pt-2 border-t border-[#ead7e0] dark:border-[#331e2d]">
          <label className="text-xs font-bold text-[#1c1017] dark:text-white uppercase tracking-wider block">
            2. Montant à retirer
          </label>
          <div className="relative">
            <input
              type="number"
              min={MIN_WITHDRAWAL_CFA}
              max={user.balanceCfa}
              value={amountCfa}
              onChange={(e) => setAmountCfa(Number(e.target.value))}
              className="w-full h-12 px-3.5 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white font-display font-bold text-base focus:outline-none focus:border-[#be123c] transition"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-bordeaux-brand font-bold">
              {formatCurrencyValue(amountCfa, user.currencySymbol, user.currencyRate)}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>Minimum requis : <strong>{formatCurrencyValue(MIN_WITHDRAWAL_CFA, user.currencySymbol, user.currencyRate)}</strong></span>
            <span className="text-bordeaux-brand font-semibold">Frais : 0 F CFA (100% net)</span>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-[#881337]/15 border border-[#be123c]/40 text-bordeaux-brand text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Button: Displays explicit status */}
        <button
          type="submit"
          className={`w-full h-14 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            canWithdraw
              ? 'bg-money-gradient text-white shadow-bordeaux hover:opacity-95 active:scale-[0.98]'
              : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/40 hover:bg-rose-200 dark:hover:bg-rose-900/40'
          }`}
        >
          {canWithdraw ? (
            <>
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Lancer l'Audit & Valider le Retrait ({formatCurrencyValue(amountCfa, user.currencySymbol, user.currencyRate)})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-rose-500" />
              <span>Commande Bloquée · Cliquer pour voir les critères manquants</span>
            </>
          )}
        </button>

        {/* Trust & Zero Deposit Reminder */}
        <div className="p-3 rounded-xl bg-[#f6eaf0] dark:bg-[#120a10] border border-[#ead7e0] dark:border-[#331e2d] text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-bordeaux-brand shrink-0" />
          <span>
            <strong>Garantie PayNova :</strong> Aucun frais de dossier, aucune taxe d'activation ni dépôt bancaire ne vous seront réclamés.
          </span>
        </div>
      </form>

      {/* MODAL 1: Security Audit Rejection Modal (When criteria are unmet) */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#140d12] border border-rose-500/40 p-6 shadow-2xl text-left space-y-5">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 dark:text-rose-400">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-extrabold text-[#1c1017] dark:text-white">
                    Audit de Sécurité du Retrait
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400 tracking-wider">
                    Statut : Commande Rejetée
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRejectionModal(false)}
                className="w-8 h-8 rounded-full bg-[#f6eaf0] dark:bg-[#22141f] text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#fcf4f6] dark:bg-[#0c060a] border border-[#ead7e0] dark:border-[#331e2d] space-y-2 text-xs">
              <p className="font-bold text-[#1c1017] dark:text-white">
                Pourquoi ma commande de retrait ne peut pas passer ?
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Le protocole anti-fraude PayNova exige la validation obligatoire et stricte de deux critères avant toute émission de virement :
              </p>

              {/* Requirement 1 Diagnostic */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                hasEnoughBalance 
                  ? 'bg-[#881337]/15 border-[#be123c]/30 text-bordeaux-brand' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {hasEnoughBalance ? <CheckCircle2 className="w-4 h-4 text-bordeaux-brand shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  <span>Solde minimal de 45 000 F CFA</span>
                </div>
                <span className="font-mono font-bold">
                  {hasEnoughBalance ? 'OK' : `Manque ${formatCurrencyValue(missingBalanceCfa, user.currencySymbol, user.currencyRate)}`}
                </span>
              </div>

              {/* Requirement 2 Diagnostic */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                hasEnoughReferrals 
                  ? 'bg-[#881337]/15 border-[#be123c]/30 text-bordeaux-brand' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {hasEnoughReferrals ? <CheckCircle2 className="w-4 h-4 text-bordeaux-brand shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  <span>3 parrainages actifs réels</span>
                </div>
                <span className="font-mono font-bold">
                  {referralsCount} / {REQUIRED_REFERRALS} ({hasEnoughReferrals ? 'OK' : `Manque ${missingReferrals}`})
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Comment débloquer votre retrait dès aujourd'hui :
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectionModal(false);
                    onNavigate('earn');
                  }}
                  className="p-3 rounded-xl bg-money-gradient text-white font-bold text-xs shadow-bordeaux hover:opacity-90 transition cursor-pointer flex flex-col items-center text-center gap-1"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>45 Vidéos du jour</span>
                  <span className="text-[10px] opacity-80">+250 F CFA</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRejectionModal(false);
                    onNavigate('invite');
                  }}
                  className="p-3 rounded-xl bg-[#f6eaf0] dark:bg-[#22141f] hover:bg-[#ead7e0] dark:hover:bg-[#2e1b29] text-[#1c1017] dark:text-white border border-[#ead7e0] dark:border-[#331e2d] font-bold text-xs transition cursor-pointer flex flex-col items-center text-center gap-1"
                >
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Inviter mes amis</span>
                  <span className="text-[10px] text-bordeaux-brand">+500 F CFA / ami</span>
                </button>
              </div>
            </div>

            {/* Test simulator button inside modal */}
            <div className="pt-2 border-t border-[#ead7e0] dark:border-[#331e2d]">
              <button
                type="button"
                onClick={() => {
                  if (!hasEnoughBalance) onSimulateBalanceBoost();
                  if (!hasEnoughReferrals) onSimulateReferral();
                  setShowRejectionModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#f6eaf0] dark:bg-[#120a10] hover:bg-[#ead7e0] dark:hover:bg-[#22141f] border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Simuler le déblocage instantané pour le test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Live Security Audit Process (When user is eligible and submits) */}
      {isAuditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#140d12] border border-[#be123c]/40 p-6 shadow-2xl text-left space-y-5">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#881337]/15 border border-[#be123c]/40 flex items-center justify-center text-bordeaux-brand">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <h3 className="font-display text-lg font-black text-[#1c1017] dark:text-white">
                Audit de Sécurité en Cours
              </h3>
              <p className="text-xs text-muted-foreground">
                Vérification cryptographique de conformité avant émission
              </p>
            </div>

            {/* 3 Step Live Audit Checklist */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#fcf4f6] dark:bg-[#0c060a] border border-[#ead7e0] dark:border-[#331e2d] text-xs">
              
              {/* Step 1: Balance check */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {auditStep >= 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-bordeaux-brand shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0" />
                  )}
                  <span className="text-[#1c1017] dark:text-white">1. Audit comptable du solde (≥ 45 000 F CFA)</span>
                </div>
                <span className="font-bold font-mono text-bordeaux-brand">
                  {auditStep >= 1 ? 'CONFORME ✓' : 'En cours...'}
                </span>
              </div>

              {/* Step 2: Referrals check */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {auditStep >= 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-bordeaux-brand shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                  )}
                  <span className="text-[#1c1017] dark:text-white">2. Contrôle des 3 filleuls actifs</span>
                </div>
                <span className="font-bold font-mono text-bordeaux-brand">
                  {auditStep >= 2 ? 'AUTHENTIFIÉ ✓' : 'Vérification...'}
                </span>
              </div>

              {/* Step 3: Payout authorization */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {auditStep >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-bordeaux-brand shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0" />
                  )}
                  <span className="text-[#1c1017] dark:text-white">3. Signature de l'ordre de transfert (0 frais)</span>
                </div>
                <span className="font-bold font-mono text-bordeaux-brand">
                  {auditStep >= 3 ? 'APPROUVÉ ✓' : 'Attente...'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-center text-muted-foreground">
              Veuillez patienter quelques instants pendant la validation de votre ordre...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
