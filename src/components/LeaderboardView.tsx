import React from 'react';
import { LeaderboardUser } from '../types';
import { LEADERBOARD_USERS } from '../data/tasksData';
import { Crown, Medal, Banknote, ShieldCheck } from 'lucide-react';

function maskUsername(name: string): string {
  if (name.length <= 3) return name;
  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}***${parts[0].slice(-1)} ${parts[1][0]}.`;
  }
  return `${name[0]}***${name.slice(-1)}`;
}

interface PodiumProps {
  rank: 1 | 2 | 3;
  user: LeaderboardUser;
  heightClass: string;
}

const PodiumItem: React.FC<PodiumProps> = ({ rank, user, heightClass }) => {
  const isFirst = rank === 1;
  const isSecond = rank === 2;

  return (
    <div className="flex w-24 sm:w-28 flex-col items-center">
      {isFirst ? (
        <Crown className="h-6 w-6 text-amber-500 animate-bounce" />
      ) : isSecond ? (
        <Medal className="h-6 w-6 text-slate-400" />
      ) : (
        <Medal className="h-6 w-6 text-amber-700" />
      )}

      <div className="mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-money-gradient text-lg font-bold text-white shadow-bordeaux">
        {user.username[0]?.toUpperCase()}
      </div>

      <p className="privacy-masked-name mt-2 truncate text-xs font-semibold text-[#1c1017] dark:text-white max-w-full">
        {maskUsername(user.username)}
      </p>

      <p className="privacy-masked-amount text-xs font-bold text-bordeaux-brand font-mono">
        {user.total_earned.toLocaleString('fr-FR')} F
      </p>

      <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
        <Banknote className="h-2.5 w-2.5 text-bordeaux-brand" />
        <span>{user.withdrawals} retraits</span>
      </p>

      <div className={`mt-2 w-full ${heightClass} rounded-t-xl border border-[#ead7e0] dark:border-[#331e2d] bg-card-gradient flex items-center justify-center shadow-sm`}>
        <p className="font-display text-xl font-black text-[#1c1017] dark:text-white">
          #{rank}
        </p>
      </div>
    </div>
  );
};

export const LeaderboardView: React.FC = () => {
  const top1 = LEADERBOARD_USERS[0];
  const top2 = LEADERBOARD_USERS[1];
  const top3 = LEADERBOARD_USERS[2];
  const remaining = LEADERBOARD_USERS.slice(3);

  return (
    <div className="space-y-6 pb-24 text-left">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-[#1c1017] dark:text-white">
          Classement PayNova
        </h1>
        <p className="text-xs text-muted-foreground">
          Top membres de la communauté · Gains cumulés et retraits validés
        </p>
      </header>

      {/* Podium Card */}
      <div className="rounded-3xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-6 shadow-card transition-colors">
        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4">
          <PodiumItem rank={2} user={top2} heightClass="h-24" />
          <PodiumItem rank={1} user={top1} heightClass="h-32" />
          <PodiumItem rank={3} user={top3} heightClass="h-16" />
        </div>
      </div>

      {/* Ranks 4 to 10 */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          Autres membres du Top 10
        </h2>

        {remaining.map((user, idx) => {
          const rank = idx + 4;
          return (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-2xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-3.5 shadow-sm hover:border-[#be123c]/40 transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-xs font-bold text-muted-foreground w-6 text-center font-mono">
                  #{rank}
                </span>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6eaf0] dark:bg-[#1e131b] border border-[#ead7e0] dark:border-[#331e2d] text-xs font-bold text-[#1c1017] dark:text-white">
                  {user.username[0]?.toUpperCase()}
                </div>

                <div>
                  <p className="privacy-masked-name text-xs font-semibold text-[#1c1017] dark:text-white">
                    {maskUsername(user.username)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {user.withdrawals} retraits validés
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <p className="font-display text-sm font-bold text-bordeaux-brand">
                  {user.total_earned.toLocaleString('fr-FR')} F CFA
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
