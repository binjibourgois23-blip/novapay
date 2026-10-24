import React, { useState, useEffect } from 'react';
import { UserProfile, VideoTask } from '../types';
import { formatCurrencyValue } from '../data/tasksData';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  Tv, 
  Clock, 
  Award, 
  FastForward, 
  Sparkles,
  X
} from 'lucide-react';

interface EarnViewProps {
  user: UserProfile;
  videos: VideoTask[];
  onVideoCompleted: () => void;
  onCompleteAllDaily: () => void;
}

export const EarnView: React.FC<EarnViewProps> = ({
  user,
  videos,
  onVideoCompleted,
  onCompleteAllDaily,
}) => {
  const [activeAdIndex, setActiveAdIndex] = useState<number | null>(null);
  const [adProgress, setAdProgress] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const [adFinished, setAdFinished] = useState<boolean>(false);

  const watchedCount = user.dailyVideosWatched || 0;
  const targetCount = user.dailyVideosTarget || 45;
  const adDuration = 10; // seconds

  const currentVideo = activeAdIndex !== null 
    ? videos[activeAdIndex % videos.length] 
    : videos[0];

  const handleStartAd = (index: number) => {
    if (index !== watchedCount || activeAdIndex !== null) return;
    setActiveAdIndex(index);
    setAdProgress(0);
    setSecondsRemaining(adDuration);
    setAdFinished(false);
  };

  useEffect(() => {
    let timer: any = null;
    if (activeAdIndex !== null && !adFinished) {
      const startTime = Date.now();
      timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(1, elapsed / adDuration);
        setAdProgress(progress);
        const rem = Math.max(0, Math.ceil(adDuration - elapsed));
        setSecondsRemaining(rem);

        if (elapsed >= adDuration) {
          clearInterval(timer);
          setAdFinished(true);
        }
      }, 50);
    }
    return () => clearInterval(timer);
  }, [activeAdIndex, adFinished]);

  const handleClaimAd = () => {
    onVideoCompleted();
    setActiveAdIndex(null);
    setAdFinished(false);
  };

  const handleInstantSkip = () => {
    setAdProgress(1);
    setSecondsRemaining(0);
    setAdFinished(true);
  };

  return (
    <div className="space-y-6 pb-24 text-left">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-[#1c1017] dark:text-white">
          Visionner & Gagner
        </h1>
        <p className="text-xs text-muted-foreground">
          45 vidéos sponsorisées par jour · <strong className="text-bordeaux-brand font-bold">{formatCurrencyValue(250, user.currencySymbol, user.currencyRate)}</strong> crédités dès les 45 validées.
        </p>
      </header>

      {/* Daily Progress summary card */}
      <div className="p-4 sm:p-5 rounded-3xl border border-[#ead7e0] dark:border-[#331e2d] bg-card-gradient shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-bordeaux-brand" />
            <span className="text-xs font-bold text-[#1c1017] dark:text-white font-mono">
              Progression : {watchedCount} / {targetCount} vidéos aujourd'hui
            </span>
          </div>
          <div className="w-full max-w-xs sm:max-w-sm h-2.5 rounded-full bg-[#f6eaf0] dark:bg-[#22141f] overflow-hidden">
            <div
              className="h-full bg-money-gradient transition-all duration-300"
              style={{ width: `${Math.min(100, (watchedCount / targetCount) * 100)}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={onCompleteAllDaily}
          className="text-xs text-bordeaux-brand hover:underline underline-offset-4 cursor-pointer self-start sm:self-auto font-semibold"
          title="Compléter instantanément les 45 vidéos pour tester le crédit du quota quotidien"
        >
          ⚡ Simuler 45/45 vidéos (Mode Test)
        </button>
      </div>

      {/* Grid of 45 video ad buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: targetCount }).map((_, idx) => {
          const isWatched = idx < watchedCount;
          const isCurrent = idx === watchedCount;
          const isLocked = idx > watchedCount;

          return (
            <button
              key={idx}
              disabled={!isCurrent || activeAdIndex !== null}
              onClick={() => handleStartAd(idx)}
              className={`relative flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border p-3 text-center transition cursor-pointer ${
                isWatched
                  ? 'border-[#be123c]/30 bg-card text-[#9f1239] dark:text-[#fb7185]'
                  : isCurrent
                  ? 'border-[#be123c] bg-money-gradient text-white shadow-bordeaux hover:scale-[1.02]'
                  : 'border-[#ead7e0] dark:border-[#331e2d] bg-card/40 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Top Left Number tag */}
              <span
                className={`absolute left-2.5 top-2.5 text-[10px] font-bold font-mono ${
                  isCurrent ? 'text-white/95' : 'text-muted-foreground'
                }`}
              >
                #{idx + 1}
              </span>

              {isWatched && (
                <>
                  <CheckCircle2 className="h-7 w-7 text-bordeaux-brand" />
                  <span className="mt-1 text-[10px] text-muted-foreground font-medium">
                    Regardée
                  </span>
                </>
              )}

              {isCurrent && (
                <>
                  <Play className="h-8 w-8 fill-white text-white drop-shadow-md animate-pulse" />
                  <span className="mt-1 text-xs font-bold text-white">
                    Voir la pub
                  </span>
                </>
              )}

              {isLocked && (
                <>
                  <Lock className="h-6 w-6 text-muted-foreground/60" />
                  <span className="mt-1 text-[10px] text-muted-foreground font-medium">
                    Verrouillée
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Full-screen / Modal Ad Viewer */}
      {activeAdIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm rounded-3xl border border-[#ead7e0] dark:border-[#331e2d] bg-white dark:bg-[#140d12] p-6 shadow-2xl text-center space-y-4 text-left">
            
            {/* Top Close / Info bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono font-bold text-[#1c1017] dark:text-white">
                Publicité #{activeAdIndex + 1} / {targetCount}
              </span>
              <span className="text-bordeaux-brand font-semibold">
                {currentVideo.sponsor}
              </span>
            </div>

            {/* Video Simulated Screen */}
            <div className="relative aspect-video w-full rounded-2xl bg-black border border-[#ead7e0] dark:border-[#331e2d] flex flex-col items-center justify-center p-4 overflow-hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-money-gradient text-white shadow-bordeaux mb-2">
                <Play className="h-6 w-6 fill-white ml-0.5" />
              </div>
              <p className="font-semibold text-xs text-white max-w-[200px] truncate">
                {currentVideo.title}
              </p>
              <p className="text-[10px] text-slate-300 mt-0.5">
                {currentVideo.category}
              </p>
            </div>

            {/* Timer & Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Attention requise :</span>
                <span className="text-[#1c1017] dark:text-white font-bold">
                  {secondsRemaining > 0 ? `${secondsRemaining}s` : 'Terminée ✓'}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-[#f6eaf0] dark:bg-[#22141f] overflow-hidden">
                <div
                  className="h-full bg-money-gradient transition-all duration-100"
                  style={{ width: `${adProgress * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {adFinished ? (
                <button
                  onClick={handleClaimAd}
                  className="w-full py-3.5 rounded-xl bg-money-gradient text-white font-bold text-xs shadow-bordeaux hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {activeAdIndex + 1 === targetCount 
                      ? `Valider la 45e vidéo (+${formatCurrencyValue(250, user.currencySymbol, user.currencyRate)} crédités !)` 
                      : 'Valider et continuer'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleInstantSkip}
                  className="w-full py-2.5 rounded-xl bg-[#f6eaf0] dark:bg-[#1e131b] hover:bg-[#ead7e0] dark:hover:bg-[#2d1b27] text-muted-foreground hover:text-foreground text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FastForward className="h-3.5 w-3.5" />
                  <span>Passer (Mode Test Démo)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
