# PASSATION COMPLÈTE — Madame Or Eille Studio
## À lire OBLIGATOIREMENT avant de commencer

---

## RÈGLES DE COMMUNICATION — NON NÉGOCIABLES

- **UNE SEULE CHOSE À LA FOIS** — jamais de pavés, jamais de listes à rallonge
- **Tutoiement**
- **Patience et méthode** — ne jamais aller trop vite
- **Ne jamais faire les choses à moitié** — si on fait un truc, on le fait complet et on vérifie avant de passer à la suite
- Judith communique par dictée vocale Samsung → WhatsApp → Mac
- Interpréter charitablement les approximations phonétiques
- **Attendre la validation de Judith avant de passer au bloc suivant**
- Ne jamais mentionner Jeff (ne fait plus partie du projet)
- Ne pas donner de conseils astrologiques non sollicités

---

## QUI EST JUDITH

Fondatrice de **Madame Or Eille Studio** (Brazzaville/Serbie).
Elle n'est PAS développeuse. Elle a un **œil artistique fort** et sait exactement ce qu'elle veut visuellement.
Elle maintient une identité publique anonyme : Madame Or Eille.


---

## COMPTES ET ACCÈS

- **GitHub** : miniglobetrotteuse-source — Token : [TOKEN_GITHUB — voir gestionnaire de mots de passe] (expire 12 juillet 2026)
- **Netlify** : madameoreille.studio@gmail.com
- **Render** : madameoreille.studio@gmail.com
- **Stripe** : compte existant
- **Vercel** : or-eille-ai-v2.vercel.app

---

## L'ÉCOSYSTÈME MADAME OR EILLE STUDIO

### 1. LES 7 BOULES DE CRISTAL ✅ TERMINÉ
**URL** : https://7-boules-de-cristal.netlify.app
**Backend** : https://sevenboules-backend.onrender.com

**Reste à faire** :
- Etsy : créer fiche avec lien vers l'appli
- Synchronisation multi-appareils (V2)
- Traduction anglais (V2)

---

### 2. LE JARDIN INTÉRIEUR ✅ EN LIGNE
**URL** : https://jardin-interieur.vercel.app
**Prix** : 27€ — aussi sur Gumroad : madameoreille.gumroad.com/l/pnzom

**Reste à faire** :
- Distribution Pinterest active
- Fiche Etsy vitrine

---

### 3. PODCAST MADAME OR EILLE
- Spotify for Creators + Deezer
- Format : 3-8 minutes, un sujet, une question bien posée
- Production : enregistrement téléphone, assemblage MP3 Cutter & Merger

---

### 4. OR EILLE AI v2 ← PRIORITÉ PRINCIPALE
**URL** : https://or-eille-ai-v2.vercel.app
**GitHub** : miniglobetrotteuse-source/or-eille-ai-v2 (branche main)

---

## OR EILLE AI v2 — ÉTAT DÉTAILLÉ

### Charte visuelle validée
- Fond crème : #F7F4EF
- Doré : #E0B020 (couleur exacte du logo PNG)
- Bleu cobalt : #1A3A8F
- Polices : Basteleur Bold (titres) + Basteleur Moonlight (slogan)
- Slogan : "L'IA qui s'exécute au doigt et à l'œil."

### Navigation validée
Accueil (doré) · Assistant (bleu) · Abonnement (doré) · Profil (bleu) · Contenu (doré) · Agenda (bleu) · Image (doré)

### Pages construites et validées ✅
- **Accueil** : logo, titre, slogan, boutons Essayer/S'abonner, accueil vocal
- **Assistant** : micro continu, bouton crayon pour taper, bulles de chat
- **Abonnement** : Mensuel 18€, Annuel 200€, liens Stripe
- **Profil** : nom/pseudonyme, alter ego vs agent personnel, langue (Lingala par défaut), accessibilité
- **Accessibilité** : taille texte, interligne, dyslexie Lexend, contraste, guide vocal, LSF, profil neurologique (TDAH/TSA/Dys/Malvoyant/Malentendant/Sensibilité non diagnostiquée), daltonisme
- **Image** : Mode DA (doré) / Mode Libre (bleu), import références, description avec micro, formats, formes, variantes 1-8, bouton Générer
- **Contenu : Texte** : 7 blocs dans l'ordre (voir ci-dessous)
- **Agenda** : phase lune, événements, calendrier éditorial durée libre, planification

### Page Contenu : Texte — 7 blocs dans l'ordre
1. Créer du contenu (format + plateformes colorées + micro)
2. Générer une légende (ton libre inclus)
3. Générateur de titres
4. Créer un carrousel
5. Recycler du contenu (import fichier + micro)
6. Créer un livre numérique
7. Préparer mon post (checklist + batterie)

**Plateformes** avec vraies couleurs : Instagram (rose), TikTok (noir), YouTube (rouge), LinkedIn (bleu), Pinterest (rouge), Snapchat (jaune)

### Fichiers intégrés sur GitHub
**Racine** : cgu.js, ethics.js, legal.js, memory.js, watermark.js, colorize.js, brand.js, security.js, sharing.js, content_templates.js, editorial_memory.js, publish.js, calendar.js, image_editor.js

**API** : claude.js (system prompt éthique complet), image_system.js, physics.js, whisper.js

**Prêts à installer** : voice_commands.js, lsf_elix.js

### Fichiers prêts à installer — à faire prochaine session
- **voice_commands.js** : commande vocale complète pour malvoyants — s'active automatiquement si profil = Malvoyant(e). Commandes : "Mode DA", "Carré", "Générer", "Accueil", etc.
- **lsf_elix.js** : LSF via Elix (21 000 signes) — barre de recherche en bas, clic sur n'importe quel mot pour voir le signe

### Crédits et APIs
- **Anthropic** : pas encore activé (budget) → l'assistant dit "Je ne parviens pas à répondre"
- **Replicate** : pas encore activé (budget) → génération images non disponible
- **Whisper** : prêt, activable avec clé OpenAI

### Règles techniques importantes
- Vérifier la syntaxe avant tout commit : `node --check fichier.js`
- Vercel parfois lent → forcer avec commit vide ou modifier README.md
- Ne jamais mettre de clés API dans le code (utiliser process.env)
- Lire les fichiers existants AVANT de coder
- Vérifier après chaque intégration

---

## SYSTEM PROMPT ÉTHIQUE — Ce qui est intégré dans claude.js

- Ton professionnel, pas d'attachement émotionnel
- Vérification systématique avant d'affirmer
- Limites claires : pas médecin, pas avocat, pas thérapeute
- Détection détresse / burn-out → renvoi vers Madame Or Eille ou 3114
- Contenus interdits : pédocriminalité, violence, pornographie, racisme, etc.
- Physique quotidien : températures, sécurité, mélanges dangereux
- Détection intentions malveillantes
- Fermeté absolue — ne cède pas à l'insistance
- Transformation de la colère en création
- Mémoire des refus persistante
- Guidage interface avec repères spatiaux précis
- Langue de la personne

---

## ÉTHIQUE CONTENU — CGU

- Floutage automatique des personnes vulnérables (bénéficiaires de dons, migrants, enfants)
- Avertissement éducatif sur les contenus "sauveur blanc"
- Exploitation de la générosité locale → interdit
- Redevance 3% à partir de 3 000€/mois de revenus générés avec Or Eille AI
- Responsabilité limitée + préjudice moral → Madame Or Eille Studios peut poursuivre

---

## ACCESSIBILITÉ — Roadmap

### Fait
- Profil neurologique dans Accessibilité
- voice_commands.js prêt (malvoyants)
- lsf_elix.js prêt (malentendants, 21 000 signes Elix)

### À faire avec budget
- Avatar LSF professionnel (WebSourd) pour traduction en temps réel
- Clavier Braille virtuel (6 points → texte)
- Export format BRF pour impression Braille
- Compatibilité lecteurs d'écran NVDA/JAWS
- Sous-titres LSF sur vidéos (mots-clés signés en superposition)
- Statistiques anonymisées (% guide vocal, % malvoyants, % neurodivergents)

### Message communauté malentendante à intégrer
"Nous avons à cœur de rendre Or Eille AI accessible à la communauté malentendante. Le service LSF proposé aujourd'hui est rudimentaire — des mots-clés signés, pas une traduction complète. Nous en sommes pleinement conscients et nous travaillons à l'améliorer. Vous êtes la communauté la mieux placée pour nous dire ce dont vous avez besoin. Si vous souhaitez partager votre avis ou contribuer, contactez-nous : [email Madame Or Eille Studios]"

---

## PROCHAINE SESSION — Dans l'ordre

1. Vérifier page Contenu : Texte (s'affiche bien ?)
2. Installer voice_commands.js + lsf_elix.js dans index.html
3. Finir et vérifier Agenda
4. Commencer bloc Vidéo
   - Mode Ne pas déranger automatique pendant enregistrement
   - Sous-titres LSF (mots-clés signés)
   - Analyse son : détecter bruits parasites
   - Montage par commande vocale

---

## BLOCS RESTANTS À CONSTRUIRE

**Sans budget** :
- Vidéo
- Mémoire persistante branchée à l'assistant

**Avec budget** :
- Crédits Anthropic → activer les réponses assistant
- Replicate (~3-25$/mois) → activer génération images
- Podcast editor
- Recherche
- Tracker
- Finances
