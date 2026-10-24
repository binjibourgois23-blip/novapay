import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface TrustBannerProps {
  onLearnMore?: () => void;
}

export const TrustBanner: React.FC<TrustBannerProps> = ({ onLearnMore }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-blue-50/80 dark:bg-[#0c1424] text-[#0f172a] dark:text-white border-b border-blue-200/60 dark:border-blue-900/40 px-4 py-2 text-xs transition-colors duration-200">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-[#2563eb] dark:text-[#60a5fa] shrink-0" aria-hidden="true" />
          <p className="font-medium text-slate-700 dark:text-slate-200 leading-relaxed truncate sm:text-clip">
            <span className="font-bold text-[#0f172a] dark:text-white">Engagement PayNova :</span> Notre plateforme ne demande <span className="underline decoration-[#2563eb] underline-offset-2 font-bold text-[#2563eb] dark:text-[#60a5fa]">JAMAIS</span> d'investissement, d'avance financière ni de dépôt préalable pour travailler ou retirer vos gains.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="text-[#2563eb] dark:text-[#60a5fa] hover:underline underline-offset-2 whitespace-nowrap text-[11px] font-semibold cursor-pointer transition-colors"
            >
              Conditions
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Masquer la bannière"
            className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
