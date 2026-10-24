import React, { useState } from 'react';
import { UserProfile } from '../types';
import { formatCurrencyValue } from '../data/tasksData';
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  PlusCircle, 
  MessageSquare, 
  Send,
  ShieldCheck
} from 'lucide-react';

interface InviteViewProps {
  user: UserProfile;
  onSimulateReferral: () => void;
}

export const InviteView: React.FC<InviteViewProps> = ({
  user,
  onSimulateReferral,
}) => {
  const [copied, setCopied] = useState(false);
  const referralBonusCfa = 500;
  const referralUrl = `https://paynova.app/join?ref=${user.referralCode}`;
  const referralsCount = user.referralsCount || user.referrals?.length || 0;
  const totalEarnedFromRefsCfa = referralsCount * referralBonusCfa;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Rejoins PayNova pour gagner de l'argent réel au quotidien (45 vidéos quotidiennes = 250 F/jour, 750 F offerts à l'inscription et retraits dès 45 000 F sans frais) : ${referralUrl}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'PayNova Récompenses',
        text: shareText,
        url: referralUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6 pb-24 text-left">
      {/* View Header */}
      <header className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-[#1c1017] dark:text-white">
          Programme Parrainage
        </h1>
        <p className="text-xs text-muted-foreground">
          Gagnez <strong className="text-bordeaux-brand font-bold">+{formatCurrencyValue(referralBonusCfa, user.currencySymbol, user.currencyRate)}</strong> par ami invité devenant actif.
        </p>
      </header>

      {/* Hero Bonus Card (Rouge Bordeaux Gradient) */}
      <div className="relative overflow-hidden rounded-3xl bg-money-gradient p-6 sm:p-7 shadow-bordeaux text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/90">
              <Gift className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Bonus d'invitation direct
              </span>
            </div>
            <p className="font-display text-3xl sm:text-4xl font-black text-white">
              +{formatCurrencyValue(referralBonusCfa, user.currencySymbol, user.currencyRate)}
            </p>
            <p className="text-xs text-white/90">
              Par nouvel ami actif · Condition obligatoire de retrait : minimum 3 parrainages.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center min-w-[130px] border border-white/20">
            <span className="text-[10px] text-white/80 block uppercase font-bold">Vos Parrainages</span>
            <span className="font-display text-2xl font-black text-white">{referralsCount} / 3</span>
            <span className="text-[10px] text-rose-200 block font-semibold">
              {referralsCount >= 3 ? 'Condition débloquée ✓' : `Plus que ${Math.max(0, 3 - referralsCount)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Share Link Box */}
      <div className="rounded-3xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-5 shadow-card space-y-4 transition-colors">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#1c1017] dark:text-white uppercase tracking-wider block">
            Votre lien d'invitation officiel
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 h-12 px-3.5 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-[#1c1017] dark:text-white font-mono text-xs focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 h-12 rounded-xl bg-money-gradient text-white text-xs font-bold shadow-bordeaux hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 text-xs font-semibold transition cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleShareTelegram}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#29b6f6] border border-[#0088cc]/30 text-xs font-semibold transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Telegram</span>
          </button>

          <button
            onClick={handleShareFacebook}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1877f2]/15 hover:bg-[#1877f2]/25 text-[#42a5f5] border border-[#1877f2]/30 text-xs font-semibold transition cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Facebook</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] hover:bg-[#ead7e0] dark:hover:bg-[#2e1b29] text-[#1c1017] dark:text-white border border-[#ead7e0] dark:border-[#331e2d] text-xs font-semibold transition cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Plus d'options</span>
          </button>
        </div>
      </div>

      {/* Referrals List & Test Simulator */}
      <div className="rounded-3xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-5 shadow-card space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-bordeaux-brand" />
            <h3 className="font-display text-sm font-bold text-[#1c1017] dark:text-white uppercase tracking-wider">
              Amis inscrits ({referralsCount})
            </h3>
          </div>

          <button
            onClick={onSimulateReferral}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#881337]/15 hover:bg-[#881337]/25 border border-[#be123c]/30 text-bordeaux-brand text-xs font-semibold transition cursor-pointer"
            title="Simuler un ami inscrit pour tester le parrainage"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>+1 Ami (Test Démo)</span>
          </button>
        </div>

        {user.referrals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs space-y-1">
            <p>Aucun parrainage enregistré pour le moment.</p>
            <p className="text-[11px]">Partagez votre lien pour débloquer votre premier bonus de {formatCurrencyValue(referralBonusCfa, user.currencySymbol, user.currencyRate)} !</p>
          </div>
        ) : (
          <div className="space-y-2">
            {user.referrals.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-xs"
              >
                <div>
                  <p className="font-bold text-[#1c1017] dark:text-white">{ref.name}</p>
                  <p className="text-[10px] text-muted-foreground">{ref.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-bordeaux-brand font-bold block">
                    +{formatCurrencyValue(referralBonusCfa, user.currencySymbol, user.currencyRate)}
                  </span>
                  <span className="text-[10px] text-rose-500/80 dark:text-rose-300/80">{ref.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
