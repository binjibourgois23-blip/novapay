import React from 'react';
import { UserProfile, NavTab } from '../types';
import { formatCurrencyValue } from '../data/tasksData';
import { ArrowLeft, Wallet, CheckCircle2, Clock, XCircle, Building2, Smartphone, Coins } from 'lucide-react';

interface WithdrawHistoryViewProps {
  user: UserProfile;
  onNavigate: (tab: NavTab) => void;
}

export const WithdrawHistoryView: React.FC<WithdrawHistoryViewProps> = ({
  user,
  onNavigate,
}) => {
  const withdrawals = user.withdrawals || [];

  return (
    <div className="space-y-6 pb-24 text-left">
      {/* Header with Back Arrow */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('withdraw')}
          className="rounded-full border border-[#ead7e0] dark:border-[#331e2d] p-2 text-muted-foreground hover:text-foreground transition cursor-pointer"
          aria-label="Retour"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div>
          <h1 className="font-display text-2xl font-bold text-[#1c1017] dark:text-white">
            Historique des retraits
          </h1>
          <p className="text-xs text-muted-foreground">
            Suivi des virements Mobile Money, Bancaires et Crypto
          </p>
        </div>
      </header>

      {withdrawals.length === 0 ? (
        <div className="rounded-3xl border border-[#ead7e0] dark:border-[#331e2d] bg-card-gradient p-10 text-center shadow-card space-y-3 transition-colors">
          <Wallet className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-[#1c1017] dark:text-white">Aucun retrait pour le moment</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Votre historique de transactions apparaîtra ici dès votre première demande à partir de {formatCurrencyValue(45000, user.currencySymbol, user.currencyRate)}.
          </p>
          <button
            onClick={() => onNavigate('withdraw')}
            className="px-4 py-2 rounded-xl bg-money-gradient text-white text-xs font-bold shadow-bordeaux cursor-pointer"
          >
            Faire une demande de retrait
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((wth) => {
            const isApproved = wth.status === 'approved';
            const isPending = wth.status === 'pending';

            return (
              <div
                key={wth.id}
                className="rounded-2xl border border-[#ead7e0] dark:border-[#331e2d] bg-card-gradient p-4 shadow-card space-y-2.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] flex items-center justify-center text-bordeaux-brand">
                      {wth.channel === 'bank_transfer' ? (
                        <Building2 className="w-5 h-5" />
                      ) : wth.channel === 'crypto' ? (
                        <Coins className="w-5 h-5" />
                      ) : (
                        <Smartphone className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <p className="font-display text-lg font-extrabold text-[#1c1017] dark:text-white">
                        {formatCurrencyValue(wth.amountCfa, user.currencySymbol, user.currencyRate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {wth.operatorOrBank} · {wth.country}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isApproved
                        ? 'bg-[#881337]/15 text-bordeaux-brand border border-[#be123c]/30'
                        : isPending
                        ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Transféré</span>
                      </>
                    ) : isPending ? (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        <span>En cours</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Rejeté</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-[#ead7e0] dark:border-[#331e2d]">
                  <span className="font-mono truncate max-w-[200px]">{wth.recipientDetails}</span>
                  <span>{wth.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
