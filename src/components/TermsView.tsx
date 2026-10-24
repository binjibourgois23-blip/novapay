import React from 'react';
import { NavTab } from '../types';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, FileText, HelpCircle, Mail, Building2, Smartphone, Coins } from 'lucide-react';

interface TermsViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 pb-24 text-left">
      {/* Header with Back Button */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="rounded-full border border-[#ead7e0] dark:border-[#331e2d] p-2 text-muted-foreground hover:text-foreground transition cursor-pointer"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div>
          <h1 className="font-display text-2xl font-bold text-[#1c1017] dark:text-white">
            Conditions Générales
          </h1>
          <p className="text-xs text-muted-foreground">
            Règlement officiel d'utilisation & engagement éthique PayNova
          </p>
        </div>
      </header>

      {/* Bordeaux Highlight Card */}
      <div className="rounded-2xl border border-[#be123c]/30 bg-card-gradient p-5 shadow-card space-y-3 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-money-gradient text-white shadow-bordeaux">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-[#1c1017] dark:text-white">
              Garantie d'absence d'investissement
            </h2>
            <p className="text-xs text-bordeaux-brand font-semibold">
              Plateforme 100% sans frais, sans dépôt préalable
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          PayNova ne demandera <strong className="text-[#1c1017] dark:text-white">JAMAIS</strong> à aucun de ses membres d'effectuer un versement bancaire, d'acheter un abonnement VIP, de verser des frais de dossier ou d'investir de l'argent réel. La totalité des rémunérations est financée par les budgets publicitaires de nos partenaires annonceurs mondiaux et panafricains.
        </p>
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {/* Article 1 */}
        <section className="rounded-2xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-5 space-y-2.5 shadow-card transition-colors">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-bordeaux-brand shrink-0" />
            <h3 className="font-display text-sm font-bold text-[#1c1017] dark:text-white">
              Article 1 — Modèle économique & Financement partenaire
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Les tâches consistent à visionner des publicités sponsorisées et participer à des campagnes partenaires (applications mobiles, marques locales, sondages). Les annonceurs rémunèrent la plateforme pour la diffusion. Une redistribution directe est créditée à chaque membre actif.
          </p>
        </section>

        {/* Article 2 */}
        <section className="rounded-2xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-5 space-y-2.5 shadow-card transition-colors">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-bordeaux-brand shrink-0" />
            <h3 className="font-display text-sm font-bold text-[#1c1017] dark:text-white">
              Article 2 — Barème de rémunération & Quotas
            </h3>
          </div>
          <ul className="text-xs text-muted-foreground space-y-2 list-none">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-bordeaux-brand shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1c1017] dark:text-white">Solde de départ :</strong> 750 F CFA offerts et crédités immédiatement dès l'inscription pour tout nouveau membre.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-bordeaux-brand shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1c1017] dark:text-white">Quota quotidien :</strong> 45 vidéos par jour = 250 F CFA par jour crédités dès que les 45 vidéos quotidiennes sont visionnées.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-bordeaux-brand shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1c1017] dark:text-white">Tâches sociales :</strong> 500 F CFA attribués pour avoir rejoint les canaux officiels d'information.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-bordeaux-brand shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1c1017] dark:text-white">Parrainage :</strong> 500 F CFA pour chaque membre invité devenant actif.
              </span>
            </li>
          </ul>
        </section>

        {/* Article 3 */}
        <section className="rounded-2xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-5 space-y-2.5 shadow-card transition-colors">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-bordeaux-brand shrink-0" />
            <h3 className="font-display text-sm font-bold text-[#1c1017] dark:text-white">
              Article 3 — Modalités et Conditions de Retrait
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pour demander un versement par Mobile Money, Virement Bancaire ou Cryptomonnaie :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="rounded-xl border border-[#ead7e0] dark:border-[#331e2d] bg-[#f6eaf0] dark:bg-[#1e131b] p-3 text-xs">
              <span className="text-muted-foreground block text-[11px]">Seuil minimum</span>
              <span className="font-bold text-[#1c1017] dark:text-white text-sm">45 000 F CFA (ou équivalent local)</span>
            </div>
            <div className="rounded-xl border border-[#ead7e0] dark:border-[#331e2d] bg-[#f6eaf0] dark:bg-[#1e131b] p-3 text-xs">
              <span className="text-muted-foreground block text-[11px]">Condition parrainage</span>
              <span className="font-bold text-[#1c1017] dark:text-white text-sm">Minimum 3 parrainages</span>
            </div>
            <div className="rounded-xl border border-[#ead7e0] dark:border-[#331e2d] bg-[#f6eaf0] dark:bg-[#1e131b] p-3 text-xs">
              <span className="text-muted-foreground block text-[11px]">Moyens acceptés</span>
              <span className="font-bold text-bordeaux-brand text-sm">Mobile Money, Virement & Crypto</span>
            </div>
            <div className="rounded-xl border border-[#ead7e0] dark:border-[#331e2d] bg-[#f6eaf0] dark:bg-[#1e131b] p-3 text-xs">
              <span className="text-muted-foreground block text-[11px]">Frais de transaction</span>
              <span className="font-bold text-bordeaux-brand text-sm">0 F CFA (100% net)</span>
            </div>
          </div>
        </section>

        {/* Article 4 */}
        <section className="rounded-2xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-5 space-y-2.5 shadow-card transition-colors">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <h3 className="font-display text-sm font-bold text-[#1c1017] dark:text-white">
              Article 4 — Protection des données & Antifraude
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            « Le site ne sauvegarde aucunes de vos données personnelles ». Vos coordonnées bancaires ou numéros de téléphone sont uniquement utilisés de façon éphémère pour le routage de vos demandes de virement. L'usage de robots ou multi-comptes est strictement prohibé.
          </p>
        </section>

        {/* Contact */}
        <section className="rounded-2xl border border-[#ead7e0] dark:border-[#331e2d] bg-card p-5 space-y-3 shadow-card transition-colors">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-bordeaux-brand shrink-0" />
            <h3 className="font-display text-sm font-bold text-[#1c1017] dark:text-white">
              Assistance & Support PayNova
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Notre équipe d'assistance répond à toutes vos questions relatives aux paiements sous 24h.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1 text-xs">
            <a
              href="mailto:support@paynova.app"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#ead7e0] dark:border-[#331e2d] bg-[#f6eaf0] dark:bg-[#1e131b] hover:border-[#be123c]/50 transition text-[#1c1017] dark:text-white font-medium"
            >
              <Mail className="h-4 w-4 text-bordeaux-brand" />
              <span>support@paynova.app</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
