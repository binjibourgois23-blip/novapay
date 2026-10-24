/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, UserProfile, VideoTask, WithdrawalRecord, ThemeMode } from './types';
import { SPONSOR_VIDEOS, SUPPORTED_COUNTRIES, formatCurrencyValue } from './data/tasksData';
import { TrustBanner } from './components/TrustBanner';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { EarnView } from './components/EarnView';
import { LeaderboardView } from './components/LeaderboardView';
import { InviteView } from './components/InviteView';
import { WithdrawView } from './components/WithdrawView';
import { WithdrawHistoryView } from './components/WithdrawHistoryView';
import { TermsView } from './components/TermsView';
import { AuthModal } from './components/AuthModal';
import { AuthView } from './components/AuthView';
import { MobileBottomNav } from './components/MobileBottomNav';

// As requested: "le solde de sur chaque d'utilisateur doit être au départ 750f"
const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr-amadou-kone',
  name: 'Amadou Koné',
  identifier: '+225 07 48 92 10',
  country: 'Côte d’Ivoire',
  countryCode: 'CI',
  currencyCode: 'XOF',
  currencySymbol: 'F CFA',
  currencyRate: 1,
  balanceCfa: 750, // Starts at 750 F CFA for every user!
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
      taskTitle: '🎁 Bonus de bienvenue à l\'inscription (Solde de départ)', 
      sponsor: 'PayNova', 
      amountCfa: 750, 
      date: 'À l\'ouverture', 
      status: 'Crédité' 
    },
  ],
  withdrawals: [],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('paynova_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure currency fields are present
        if (!parsed.currencySymbol) {
          parsed.currencySymbol = 'F CFA';
          parsed.currencyRate = 1;
          parsed.countryCode = 'CI';
        }
        return parsed;
      } catch (e) {
        return DEFAULT_DEMO_USER;
      }
    }
    return DEFAULT_DEMO_USER;
  });

  const [videos] = useState<VideoTask[]>(SPONSOR_VIDEOS);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Theme Mode: 'system' (phone default), 'light', or 'dark'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('paynova_theme') as ThemeMode) || 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Automatically listen to user's phone / OS dark-mode setting changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDark = themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('paynova_theme', mode);
      const activeIsDark = mode === 'system' ? systemPrefersDark : mode === 'dark';
      if (activeIsDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch (e) {}
  };

  // Apply .dark class to root documentElement based on phone or user preference
  useEffect(() => {
    try {
      localStorage.setItem('paynova_theme', themeMode);
    } catch (e) {}
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDark, themeMode]);

  // Sync user state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('paynova_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('paynova_user');
    }
  }, [user]);

  // Social task reward handler (+500 F CFA)
  const handleClaimSocialTask = (taskKey: string, rewardCfa: number) => {
    if (!user) return;
    if (user.claimedSocialTasks?.includes(taskKey)) return;

    const updatedUser: UserProfile = {
      ...user,
      balanceCfa: user.balanceCfa + rewardCfa,
      totalEarnedCfa: user.totalEarnedCfa + rewardCfa,
      claimedSocialTasks: [...(user.claimedSocialTasks || []), taskKey],
      earningsHistory: [
        {
          id: `earn-social-${Date.now()}`,
          taskTitle: '💬 Adhésion à la communauté officielle WhatsApp',
          sponsor: 'PayNova',
          amountCfa: rewardCfa,
          date: 'À l\'instant',
          status: 'Crédité',
        },
        ...user.earningsHistory,
      ],
    };

    setUser(updatedUser);
  };

  // Video watched step handler (1 video watched out of 45)
  const handleVideoWatched = () => {
    if (!user) return;

    const nextCount = (user.dailyVideosWatched || 0) + 1;
    const reachedGoal = nextCount >= user.dailyVideosTarget;

    let newBalance = user.balanceCfa;
    let newTotalEarned = user.totalEarnedCfa;
    let newEarnings = [...user.earningsHistory];
    let isClaimed = user.dailyRewardClaimed;

    // When 45th video is reached, award the daily 250 F CFA!
    if (reachedGoal && !user.dailyRewardClaimed) {
      newBalance += user.dailyRewardCfa; // +250 F CFA
      newTotalEarned += user.dailyRewardCfa;
      isClaimed = true;
      newEarnings = [
        {
          id: `earn-daily-${Date.now()}`,
          taskTitle: '🎉 45 vidéos quotidiennes terminées (Quota 250 F)',
          sponsor: 'Régie Partenaire',
          amountCfa: user.dailyRewardCfa,
          date: 'Aujourd\'hui à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          status: 'Crédité',
        },
        ...newEarnings
      ];
    }

    setUser({
      ...user,
      dailyVideosWatched: Math.min(user.dailyVideosTarget, nextCount),
      balanceCfa: newBalance,
      totalEarnedCfa: newTotalEarned,
      earningsHistory: newEarnings,
      dailyRewardClaimed: isClaimed,
    });
  };

  // Instant simulator for testing the 45 videos quota (+250 F)
  const handleCompleteAllDaily = () => {
    if (!user) return;

    let newBalance = user.balanceCfa;
    let newTotalEarned = user.totalEarnedCfa;
    let newEarnings = [...user.earningsHistory];

    if (!user.dailyRewardClaimed) {
      newBalance += user.dailyRewardCfa; // +250 F CFA
      newTotalEarned += user.dailyRewardCfa;
      newEarnings = [
        {
          id: `earn-daily-${Date.now()}`,
          taskTitle: '🎉 45 vidéos quotidiennes terminées (Quota 250 F)',
          sponsor: 'Régie Partenaire',
          amountCfa: user.dailyRewardCfa,
          date: 'À l\'instant',
          status: 'Crédité',
        },
        ...newEarnings
      ];
    }

    setUser({
      ...user,
      dailyVideosWatched: 45,
      balanceCfa: newBalance,
      totalEarnedCfa: newTotalEarned,
      earningsHistory: newEarnings,
      dailyRewardClaimed: true,
    });
  };

  // Simulator helper: boost balance so reviewer can immediately test the 45 000 F CFA withdrawal flow
  const handleSimulateBalanceBoost = () => {
    if (!user) return;
    const boostAmount = 45000;
    setUser({
      ...user,
      balanceCfa: user.balanceCfa + boostAmount,
      totalEarnedCfa: user.totalEarnedCfa + boostAmount,
      earningsHistory: [
        {
          id: `earn-boost-${Date.now()}`,
          taskTitle: '⚡ Déblocage Simulation Seuil (+45 000 F)',
          sponsor: 'PayNova Simulateur',
          amountCfa: boostAmount,
          date: 'À l\'instant',
          status: 'Crédité',
        },
        ...user.earningsHistory,
      ],
    });
  };

  // Handle withdrawal submission
  const handleRequestWithdrawal = (record: WithdrawalRecord) => {
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      balanceCfa: Math.max(0, user.balanceCfa - record.amountCfa),
      withdrawals: [record, ...user.withdrawals],
    };

    setUser(updatedUser);
  };

  // Simulate +1 referral for prototyping
  const handleSimulateReferral = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const firstNames = ['Ibrahim', 'Fatou', 'Mamadou', 'Aminata', 'Cheick', 'Salimata', 'Koffi', 'Yao'];
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`;

    const newRef = {
      id: `ref-${Date.now()}`,
      name: randomName,
      date: 'À l\'instant',
      status: 'Actif (1+ tâche effectuée)' as const,
      isActive: true,
    };

    const nextReferralsCount = (user.referralsCount || user.referrals?.length || 0) + 1;
    const referralBonus = 500; // 500 F per active referral

    setUser({
      ...user,
      balanceCfa: user.balanceCfa + referralBonus,
      totalEarnedCfa: user.totalEarnedCfa + referralBonus,
      referralsCount: nextReferralsCount,
      referrals: [newRef, ...user.referrals],
      earningsHistory: [
        {
          id: `earn-ref-${Date.now()}`,
          taskTitle: `👥 Parrainage validé (${randomName})`,
          sponsor: 'Programme Parrainage',
          amountCfa: referralBonus,
          date: 'À l\'instant',
          status: 'Crédité',
        },
        ...user.earningsHistory,
      ],
    });
  };

  // Change country & currency
  const handleChangeCountry = (countryCode: string) => {
    if (!user) return;
    const country = SUPPORTED_COUNTRIES.find(c => c.countryCode === countryCode);
    if (!country) return;

    setUser({
      ...user,
      country: country.countryName,
      countryCode: country.countryCode,
      currencyCode: country.currencyCode,
      currencySymbol: country.currencySymbol,
      currencyRate: country.rateFromCfa,
    });
  };

  // Logout handler resets to default account
  const handleLogout = () => {
    localStorage.removeItem('paynova_user');
    setUser(DEFAULT_DEMO_USER);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#edf3fa] dark:bg-[#080d1a] text-[#0f172a] dark:text-[#f1f6fd] flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* 1. Trust Banner (Zero upfront deposit / Anti-scam guarantee) */}
      <TrustBanner onLearnMore={() => setActiveTab('terms')} />

      {/* 2. Top Header Navigation with country/currency changer & theme switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onChangeCountry={handleChangeCountry}
        themeMode={themeMode}
        onSetThemeMode={handleSetThemeMode}
        isDark={isDark}
      />

      {/* 3. Main Views Container (Styled like PayNova mobile & tablet centered frame) */}
      <main className="flex-1 max-w-md w-full mx-auto sm:max-w-lg md:max-w-2xl px-4 pt-4 pb-20">
        {activeTab === 'home' && (
          <HomeView
            user={user}
            onNavigate={setActiveTab}
            onClaimSocialTask={handleClaimSocialTask}
          />
        )}

        {activeTab === 'earn' && (
          <EarnView
            user={user}
            videos={videos}
            onVideoCompleted={handleVideoWatched}
            onCompleteAllDaily={handleCompleteAllDaily}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView />
        )}

        {activeTab === 'invite' && (
          <InviteView
            user={user}
            onSimulateReferral={handleSimulateReferral}
          />
        )}

        {activeTab === 'withdraw' && (
          <WithdrawView
            user={user}
            onNavigate={setActiveTab}
            onRequestWithdrawal={handleRequestWithdrawal}
            onSimulateReferral={handleSimulateReferral}
            onSimulateBalanceBoost={handleSimulateBalanceBoost}
          />
        )}

        {activeTab === 'withdraw_history' && (
          <WithdrawHistoryView
            user={user}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'terms' && (
          <TermsView onNavigate={setActiveTab} />
        )}

        {activeTab === 'auth' && (
          <AuthView
            user={user}
            onLogin={(newUser) => setUser(newUser)}
            onNavigate={setActiveTab}
            themeMode={themeMode}
            onSetThemeMode={setThemeMode}
            isDark={isDark}
          />
        )}
      </main>

      {/* Auth Modal with Country / Currency Selection & Privacy notice */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(newUser) => setUser(newUser)}
        themeMode={themeMode}
        onSetThemeMode={setThemeMode}
        isDark={isDark}
      />

      {/* Mobile Bottom Dock (5 Tabs) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
}
