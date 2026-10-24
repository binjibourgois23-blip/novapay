import React, { useState, useEffect } from 'react';
import { UserProfile, NavTab } from '../types';
import { formatCurrencyValue } from '../data/tasksData';
import { CountUpBalance } from './CountUpBalance';
import { 
  Coins, 
  ExternalLink, 
  MessageCircle, 
  TrendingUp, 
  CheckCircle2, 
  Wallet,
  Play,
  Gift,
  ArrowRight,
  ShieldCheck,
  Building2,
  Smartphone
} from 'lucide-react';

interface HomeViewProps {
  user: UserProfile;
  onNavigate: (tab: NavTab) => void;
  onClaimSocialTask: (taskKey: string, reward: number) => void;
}

const LIVE_NAMES = [
  'Awa D.', 'Mamadou K.', 'Fatou S.', 'Ibrahim T.', 'Mariama B.', 
  'Koffi A.', 'Aïcha O.', 'Ousmane N.', 'Adama C.', 'Aminata F.', 
  'Moussa D.', 'Akossiwa K.', 'Cheick O.', 'Yao B.', 'Salimata T.'
];

const LIVE_METHODS = [
  'Wave', 'Orange Money', 'MTN MoMo', 'Virement Ecobank', 'USDT (TRC20)', 'Moov Money', 'Virement BOA'
];

interface LiveWithdrawal {
  id: number;
  name: string;
  method: string;
  amountCfa: number;
  mins: number;
}

function generateLiveWithdrawal(): LiveWithdrawal {
  const amounts = [45000, 50000, 55000, 60000, 75000, 90000, 110000];
  return {
    id: Math.random(),
    name: LIVE_NAMES[Math.floor(Math.random() * LIVE_NAMES.length)],
    method: LIVE_METHODS[Math.floor(Math.random() * LIVE_METHODS.length)],
    amountCfa: amounts[Math.floor(Math.random() * amounts.length)],
    mins: Math.floor(Math.random() * 8) + 1,
  };
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  onClaimSocialTask,
}) => {
  const [liveWithdrawals, setLiveWithdrawals] = useState<LiveWithdrawal[]>(() => 
    Array.from({ length: 4 }, generateLiveWithdrawal)
  );

  const [hasVisitedChannel, setHasVisitedChannel] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const socialTaskKey = 'whatsapp_channel_1';
  const isSocialClaimed = user.claimedSocialTasks?.includes(socialTaskKey);
  const socialRewardCfa = 500;

  // Real-time animated ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveWithdrawals((prev) => [generateLiveWithdrawal(), ...prev.slice(0, 5)]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleClaimSocial = () => {
    if (isSocialClaimed || !hasVisitedChannel) return;
    setIsClaiming(true);
    setTimeout(() => {
      onClaimSocialTask(socialTaskKey, socialRewardCfa);
      setIsClaiming(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-24 text-left">
      {/* PayNova Rouge Bordeaux Gradient Headline */}
      <div className="text-center space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">
          <span className="bg-money-gradient bg-clip-text text-transparent">
            PayNova
          </span>
        </h1>
        <p className="text-xs text-muted-foreground">
          Plateforme officielle de micro-missions · {user.country}
        </p>
      </div>

      {/* Main Total Balance Card (PayNova Rouge Bordeaux Gradient) */}
      <div className="relative overflow-hidden rounded-3xl bg-money-gradient p-7 sm:p-8 shadow-bordeaux text-white">
        {/* Ambient blurred glow circles */}
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-2xl pointer-events-none"></div>
        <div className="absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-sky-300/30 blur-2xl pointer-events-none"></div>

        <div className="relative flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-white/95">
            <Coins className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Solde Disponible
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-center gap-2">
            <CountUpBalance
              amountCfa={user.balanceCfa}
              currencySymbol={user.currencySymbol}
              currencyRate={user.currencyRate}
              className="text-5xl sm:text-6xl text-white"
              showFloatingBadge={true}
            />
          </div>

          {user.currencySymbol !== 'F CFA' && (
            <p className="mt-1 text-xs text-sky-100/90 font-mono">
              Équivalent de référence : {user.balanceCfa.toLocaleString('fr-FR')} F CFA
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/95 font-medium">
            <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm font-semibold">
              🎁 750 F CFA offerts dès le départ
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm font-semibold">
              Seuil de retrait : {formatCurrencyValue(45000, user.currencySymbol, user.currencyRate)}
            </span>
          </div>
        </div>
      </div>

      {/* 45 Videos Daily Quota Quick Banner */}
      <div className="rounded-3xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-5 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#be123c] animate-pulse"></span>
            <p className="text-xs uppercase tracking-wider font-bold text-bordeaux-brand">
              Programme Quotidien
            </p>
          </div>
          <h2 className="text-base font-bold text-[#1c1017] dark:text-white">
            45 vidéos quotidiennes = {formatCurrencyValue(250, user.currencySymbol, user.currencyRate)} par jour
          </h2>
          <p className="text-xs text-muted-foreground">
            Progression : <strong className="text-[#1c1017] dark:text-white">{user.dailyVideosWatched || 0} / 45 vidéos</strong> regardées aujourd'hui.
          </p>
        </div>

        <button
          onClick={() => onNavigate('earn')}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-money-gradient text-white text-xs font-bold shadow-bordeaux hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Lancer mes vidéos</span>
        </button>
      </div>

      {/* Social task card · Rejoindre la chaîne WhatsApp (500 F CFA) */}
      <div className="space-y-3">
        <h3 className="font-display text-base font-bold text-[#1c1017] dark:text-white flex items-center justify-between">
          <span>Mission communautaire</span>
          <span className="text-xs text-bordeaux-brand font-semibold">
            +{formatCurrencyValue(socialRewardCfa, user.currencySymbol, user.currencyRate)}
          </span>
        </h3>

        <div className="rounded-2xl border border-[#ead7e0] dark:border-[#331e2d] bg-card-gradient p-4 shadow-card transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/15 text-[#25D366]">
              <MessageCircle className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-sm text-[#1c1017] dark:text-white">
                Rejoindre la chaîne WhatsApp officielle
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Suivez les preuves de paiements et les nouvelles campagnes annonceurs.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {!hasVisitedChannel && !isSocialClaimed && (
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => setHasVisitedChannel(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] hover:border-[#be123c]/50 px-4 py-2.5 text-xs font-semibold text-[#1c1017] dark:text-white transition cursor-pointer"
              >
                <span>Rejoindre la chaîne</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {isSocialClaimed ? (
              <div className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#881337]/10 dark:bg-[#881337]/25 border border-[#be123c]/30 px-4 py-2.5 text-xs font-bold text-bordeaux-brand">
                <CheckCircle2 className="h-4 w-4" />
                <span>Bonus de {formatCurrencyValue(socialRewardCfa, user.currencySymbol, user.currencyRate)} déjà crédité</span>
              </div>
            ) : (
              <button
                onClick={handleClaimSocial}
                disabled={!hasVisitedChannel || isClaiming}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                  hasVisitedChannel
                    ? 'bg-money-gradient text-white shadow-bordeaux hover:opacity-90'
                    : 'bg-[#f6eaf0] dark:bg-[#1e131b] text-muted-foreground cursor-not-allowed opacity-60'
                }`}
              >
                {isClaiming ? (
                  <span>Vérification...</span>
                ) : (
                  <>
                    <Gift className="h-4 w-4" />
                    <span>Réclamer +{formatCurrencyValue(socialRewardCfa, user.currencySymbol, user.currencyRate)}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Retraits en direct (Live Ticker) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#be123c] animate-ping"></span>
            <h3 className="font-display text-sm font-bold text-[#1c1017] dark:text-white uppercase tracking-wider">
              Retraits en direct
            </h3>
          </div>
          <span className="text-[11px] font-bold text-bordeaux-brand bg-[#881337]/10 dark:bg-[#881337]/25 px-2 py-0.5 rounded-full border border-[#be123c]/30">
            EN DIRECT
          </span>
        </div>

        <div className="space-y-2">
          {liveWithdrawals.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded-2xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-3 shadow-sm transition hover:border-[#be123c]/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6eaf0] dark:bg-[#1e131b] text-xs font-bold text-bordeaux-brand font-mono border border-[#ead7e0] dark:border-[#331e2d]">
                  {w.name[0]}
                </div>
                <div>
                  <p className="privacy-masked-name text-xs font-bold text-[#1c1017] dark:text-white">
                    {w.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {w.method} · Il y a {w.mins} min
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-display text-xs sm:text-sm font-bold text-bordeaux-brand">
                  +{formatCurrencyValue(w.amountCfa, user.currencySymbol, user.currencyRate)}
                </p>
                <p className="text-[10px] text-[#9f1239] dark:text-[#fda4af] font-medium">Validé</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
