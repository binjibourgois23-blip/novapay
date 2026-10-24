import React from 'react';
import { NavTab, UserProfile } from '../types';
import { Home, Coins, Trophy, Users, Wallet } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
}) => {
  const tabs: { tab: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'home', label: 'Accueil', icon: Home },
    { tab: 'earn', label: 'Gagner', icon: Coins },
    { tab: 'leaderboard', label: 'Top', icon: Trophy },
    { tab: 'invite', label: 'Inviter', icon: Users },
    { tab: 'withdraw', label: 'Retrait', icon: Wallet },
  ];

  const handleTabClick = (tab: NavTab) => {
    if ((tab === 'earn' || tab === 'withdraw' || tab === 'invite') && !user) {
      onOpenAuth();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-3 pb-3 md:hidden z-40 pointer-events-none">
      <nav className="pointer-events-auto bg-white/95 dark:bg-[#120a10]/95 backdrop-blur-xl border border-[#ead7e0] dark:border-[#331e2d] rounded-2xl px-1 py-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.85)] transition-colors">
        <div className="grid grid-cols-5 items-center">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab || (item.tab === 'withdraw' && activeTab === 'withdraw_history');

            return (
              <button
                key={item.tab}
                onClick={() => handleTabClick(item.tab)}
                className={`min-h-[46px] flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-bordeaux-brand font-bold scale-[1.03]'
                    : 'text-muted-foreground hover:text-foreground font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-bordeaux-brand stroke-[2.4]' : 'text-muted-foreground stroke-[1.8]'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full px-0.5">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#2563eb] shadow-blue"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
