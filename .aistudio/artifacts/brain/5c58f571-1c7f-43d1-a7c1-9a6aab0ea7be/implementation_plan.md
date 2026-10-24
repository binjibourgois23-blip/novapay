# PayNova — Composant FAQView & Centre d'Aide Officiel

Ce plan détaille la conception et l'intégration du nouveau composant `FAQView` dans PayNova, permettant aux utilisateurs de trouver instantanément des réponses claires sur la validation des micro-tâches vidéo, les délais de paiement réels, l'intégration Mobile Money (Orange, MTN, Moov, Wave) et les critères d'éligibilité aux retraits.

### User Review & Critical Decisions

> [!IMPORTANT]
> Les questions de cadrage ayant été passées, les choix ergonomiques recommandés ci-dessous sont retenus pour garantir la meilleure expérience utilisateur :

- **Présentation interactive** : Accordéons fluides avec barre de recherche instantanée par mots-clés et filtres thématiques rapides (Validation des tâches, Retraits & Délais, Mobile Money & Banques, Parrainage).
- **Emplacement de navigation** : Ajout de l'onglet `faq` dans les onglets du `Header` sur bureau, dans le menu déroulant d'options (3 points), dans la bannière de confiance et en raccourci d'aide depuis la page d'accueil.
- **Canaux d'assistance directe** : Présence en bas de page d'un bloc de support direct reliant à la communauté officielle WhatsApp et à l'assistance en direct.

---

### 1. Overview & Core Concept

- **Ce que fait le composant** : `FAQView` offre une base de connaissances interactive et transparente pour dissiper tous les doutes fréquents des utilisateurs sur le fonctionnement des 45 vidéos quotidiennes (+250 F CFA), le seuil de retrait (45 000 F CFA), la règle des 3 parrainages actifs, et le déroulement des virements Mobile Money.
- **Public cible** : Tous les utilisateurs inscrits ou visiteurs découvrant la plateforme, ayant besoin d'éclaircissements sur la fiabilité, la gratuité totale sans dépôt préalable, et les modalités de paiement.
- **Valeur clé** : Réduction des frictions, suppression des incertitudes sur les retraits, renforcement de la confiance grâce à des explications transparentes et vérifiables.

---

### 2. User Experience & Visual Design

- **Parcours utilisateur** :
  1. L'utilisateur clique sur « FAQ » ou « Centre d'aide » depuis l'en-tête ou le menu.
  2. Un en-tête d'accueil met en avant un champ de recherche réactif (« Ex: délai de retrait, Orange Money, 45 000 F... »).
  3. Des filtres par catégories permettent de cibler les questions par sujet.
  4. Les questions s'ouvrent et se ferment en accordéon fluide avec transition d'icône chevron et mise en valeur de la réponse.
  5. Si la question n'est pas résolue, une carte d'assistance WhatsApp officielle offre un point de contact direct.

- **Identité visuelle & Thème** :
  - **Couleurs & Palette** : Respect strict du bleu royal lumineux (`#2563eb`), cyan (`#38bdf8`), et du mode sombre saphir (`#080d1a`, cartes `#0f172a`).
  - **Typographie** : Titres en `Plus Jakarta Sans` (font-display), corps en `Inter`, montants et délais en `font-mono tabular-nums`.
  - **Ergonomie tactile** : Cibles de toucher $\ge 44\text{px}$ pour chaque question d'accordéon, bordures nettes `border-blue-100 dark:border-blue-900/40`, fond clair doux `#edf3fa` et sombre `#080d1a`.

---

### 3. Key Product Decisions & Trade-Offs

- **Décision 1 : Accordéons interactifs avec recherche plutôt qu'une liste statique**
  - *Choix retenu* : Accordéons déroulants avec filtrage dynamique en temps réel.
  - *Pourquoi* : Évite de submerger l'utilisateur sur mobile et permet de trouver la réponse exacte en moins de 3 secondes.
  
- **Décision 2 : Intégration dans le typage global `NavTab`**
  - *Choix retenu* : Extension de `NavTab = ... | 'faq'` dans `src/types.ts`.
  - *Pourquoi* : Permet une navigation fluide sans rechargement de page et s'intègre harmonieusement dans l'architecture React SPA existante.

- **Décision 3 : Couverture exhaustive des sujets sensibles**
  - *Choix retenu* : Répondre sans détour aux 4 piliers critiques :
    1. *Validation des tâches* : Comment les 45 vidéos quotidiennes sont comptabilisées et réinitialisées chaque minuit.
    2. *Délais de paiement* : Délais moyens (15 minutes à 24 heures ouvrées) selon l'opérateur (Orange, MTN, Moov, Wave, Virement).
    3. *Intégration Mobile Money* : Frais de retrait à 0 F CFA, saisie du numéro avec indicatif, validation instantanée.
    4. *Conditions d'éligibilité* : Explication de la règle des 45 000 F CFA et des 3 filleuls actifs pour éviter la fraude.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                        App Component                        │
│                 (activeTab === 'faq')                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 ┌──────────────────────┐              ┌──────────────────────┐
 │      Header.tsx      │              │      FAQView.tsx     │
 │  (Desktop nav link + │              │  - SearchBar         │
 │   Menu option 'faq') │              │  - CategoryFilters   │
 └──────────────────────┘              │  - AccordionList     │
                                       │  - WhatsAppSupportCard│
                                       └──────────┬───────────┘
                                                  ▼
                                       ┌──────────────────────┐
                                       │    data/faqData.ts   │
                                       │  (Questions, Réponses,│
                                       │   Catégories & Tags) │
                                       └──────────────────────┘
```

- **Composants à ajouter ou modifier** :
  1. `src/data/faqData.ts` : Base de données structurée des questions/réponses avec métadonnées (catégorie, icône, tags de recherche).
  2. `src/components/FAQView.tsx` : Composant de la vue avec recherche, accordéons rétractables, et carte de contact.
  3. `src/types.ts` : Ajout de `'faq'` dans le type `NavTab`.
  4. `src/components/Header.tsx` : Ajout du lien dans la barre de navigation et dans le menu déroulant.
  5. `src/App.tsx` : Montage conditionnel de `activeTab === 'faq'`.
