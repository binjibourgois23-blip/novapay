import React, { useState, useRef, useEffect } from 'react';
import { NavTab, UserProfile, ThemeMode } from '../types';
import { SUPPORTED_COUNTRIES, formatCurrencyValue } from '../data/tasksData';
import { CountUpBalance } from './CountUpBalance';
import { PayNovaLogo } from './PayNovaLogo';
import { 
  EllipsisVertical, 
  FileText, 
  LogOut, 
  LogIn, 
  Wallet, 
  Coins, 
  Trophy, 
  Users, 
  Home,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  Sun,
  Moon,
  Smartphone,
  Check
} from 'lucide-react';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onChangeCountry?: (countryCode: string) => void;
  themeMode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  onChangeCountry,
  themeMode = 'system',
  onSetThemeMode,
  isDark = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [countrySelectorOpen, setCountrySelectorOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setCountrySelectorOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const currentCountry = SUPPORTED_COUNTRIES.find(c => c.countryCode === user?.countryCode) || SUPPORTED_COUNTRIES[0];

  const cycleTheme = () => {
    if (!onSetThemeMode) return;
    if (themeMode === 'system') onSetThemeMode('light');
    else if (themeMode === 'light') onSetThemeMode('dark');
    else onSetThemeMode('system');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#090507]/90 backdrop-blur-md border-b border-[#ead7e0] dark:border-[#331e2d] transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo / Wordmark PayNova (Bleu Luminous) */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left cursor-pointer transition-opacity hover:opacity-90 group"
        >
          <div className="relative flex items-center justify-center">
            <PayNovaLogo size="md" className="group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <span className="font-display text-lg sm:text-xl font-black tracking-tight bg-money-gradient bg-clip-text text-transparent">
              PayNova
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] text-[#2563eb] dark:text-[#60a5fa] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40">
              OFFICIEL
            </span>
          </div>
        </button>

        {/* Desktop / Tablet Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('home')}
            className={`transition cursor-pointer ${activeTab === 'home' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Accueil
          </button>
          <button
            onClick={() => user ? setActiveTab('earn') : onOpenAuth()}
            className={`transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'earn' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <span>Gagner (45 vidéos)</span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-mono border border-blue-200/60 dark:border-blue-800/40 font-bold">
              +250 F
            </span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`transition cursor-pointer ${activeTab === 'leaderboard' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Classement
          </button>
          <button
            onClick={() => user ? setActiveTab('invite') : onOpenAuth()}
            className={`transition cursor-pointer ${activeTab === 'invite' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Inviter (+500 F)
          </button>
          <button
            onClick={() => user ? setActiveTab('withdraw') : onOpenAuth()}
            className={`transition cursor-pointer ${activeTab === 'withdraw' || activeTab === 'withdraw_history' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Retrait (Dès 45 000 F)
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`transition cursor-pointer px-2.5 py-1 rounded-lg border ${
              activeTab === 'auth'
                ? 'bg-money-gradient text-white font-bold border-transparent shadow-blue'
                : 'text-muted-foreground hover:text-foreground border-blue-200/60 dark:border-blue-900/40 hover:border-blue-400'
            }`}
          >
            Connexion / Inscription
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          
          {/* Theme Quick Switcher (System Phone / Light / Dark) */}
          {onSetThemeMode && (
            <button
              onClick={cycleTheme}
              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer flex items-center justify-center"
              title={
                themeMode === 'system'
                  ? 'Thème : Téléphone (Automatique)'
                  : themeMode === 'light'
                  ? 'Thème : Mode Clair'
                  : 'Thème : Mode Sombre'
              }
              aria-label="Changer le mode d'affichage"
            >
              {themeMode === 'system' ? (
                <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : themeMode === 'light' ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-blue-400" />
              )}
            </button>
          )}

          {user ? (
            <button
              onClick={() => setActiveTab('withdraw')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40 hover:border-blue-500/40 transition cursor-pointer text-xs font-semibold"
            >
              <Wallet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <CountUpBalance
                amountCfa={user.balanceCfa}
                currencySymbol={user.currencySymbol}
                currencyRate={user.currencyRate}
                className="font-mono text-blue-600 dark:text-blue-400 font-bold"
                showFloatingBadge={false}
              />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-money-gradient text-white text-xs font-bold shadow-blue hover:opacity-90 transition cursor-pointer"
            >
              Connexion
            </button>
          )}

          {/* 3-dots Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200/60 dark:hover:border-blue-800/40 transition cursor-pointer"
              aria-label="Options du menu"
            >
              <EllipsisVertical className="h-5 w-5" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-white dark:bg-[#0f172a] p-2 shadow-2xl z-50 text-xs text-foreground">
                {user && (
                  <div className="px-3 py-2 border-b border-blue-100 dark:border-blue-900/40 mb-1.5">
                    <p className="font-bold text-[#0f172a] dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.identifier}</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 font-semibold">
                      Pays : {user.country} ({user.currencySymbol})
                    </p>
                  </div>
                )}

                {/* Theme Selector Section inside Menu */}
                {onSetThemeMode && (
                  <div className="px-2 py-1.5 border-b border-blue-100 dark:border-blue-900/40 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Mode d'affichage
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => onSetThemeMode('system')}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          themeMode === 'system'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-600 ring-2 ring-blue-400/40'
                            : 'text-muted-foreground hover:text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Téléphone</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSetThemeMode('light')}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          themeMode === 'light'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-600 ring-2 ring-blue-400/40'
                            : 'text-muted-foreground hover:text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>Clair</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSetThemeMode('dark')}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          themeMode === 'dark'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-600 ring-2 ring-blue-400/40'
                            : 'text-muted-foreground hover:text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Sombre</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Country changer option */}
                {onChangeCountry && (
                  <div className="px-1 py-1">
                    <button
                      onClick={() => setCountrySelectorOpen(!countrySelectorOpen)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Changer de devise</span>
                      </div>
                      <span className="text-xs">{currentCountry.countryFlag}</span>
                    </button>

                    {countrySelectorOpen && (
                      <div className="mt-1 p-1 max-h-48 overflow-y-auto rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 space-y-0.5">
                        {SUPPORTED_COUNTRIES.map((c) => (
                          <button
                            key={c.countryCode}
                            onClick={() => {
                              onChangeCountry(c.countryCode);
                              setCountrySelectorOpen(false);
                              setMenuOpen(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition cursor-pointer ${
                              user?.countryCode === c.countryCode
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-blue-100/60 dark:hover:bg-blue-900/40'
                            }`}
                          >
                            <span>{c.countryFlag} {c.countryName}</span>
                            <span className="font-mono text-muted-foreground">{c.currencySymbol}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}


                <button
                  onClick={() => {
                    setActiveTab('auth');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                >
                  <LogIn className="h-4 w-4 text-[#2563eb] dark:text-[#60a5fa]" />
                  <span>Page Connexion & Inscription</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('terms');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-[#2563eb] dark:text-[#60a5fa]" />
                  <span>Conditions générales</span>
                </button>

                {user ? (
                  <button
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer mt-1 border-t border-blue-100 dark:border-blue-900/40"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-600 dark:text-blue-400 hover:underline transition cursor-pointer mt-1 border-t border-blue-100 dark:border-blue-900/40"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Se connecter</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
