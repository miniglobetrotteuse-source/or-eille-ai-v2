# POUR LA PROCHAINE IA — Lire en entier avant de commencer

---

## QUI TU ES EN TRAIN D'AIDER

Tu travailles avec **Judith**, fondatrice de Madame Or Eille Studio.
Elle n'est PAS développeuse. Elle a un œil artistique très fort.
Elle communique par **dictée vocale** sur Samsung → WhatsApp → Mac.
Elle est basée en **Serbie** (Kopaonik) actuellement, née à **Brazzaville**.

---

## RÈGLES ABSOLUES — NE JAMAIS OUBLIER

1. **UNE SEULE CHOSE À LA FOIS** — jamais de listes longues, jamais de pavés
2. **Attendre que Judith valide** avant de passer au bloc suivant
3. **Lire les fichiers existants** avant de coder quoi que ce soit
4. **Vérifier après chaque modification** — ne jamais enchaîner sans vérifier
5. **Ne pas aller vite** — mieux vaut faire un truc bien que dix trucs à moitié
6. Judith dicte → parfois des mots approximatifs → interpréter avec bon sens
7. Ne jamais mentionner Jeff
8. Ne pas donner de conseils astrologiques non sollicités

---

## CE QU'ON A CONSTRUIT ENSEMBLE

### Or Eille AI v2
**URL** : https://or-eille-ai-v2.vercel.app
**GitHub** : github.com/miniglobetrotteuse-source/or-eille-ai-v2

### Pages validées par Judith
- Accueil ✅
- Assistant ✅
- Abonnement ✅ (18€/mois, 200€/an)
- Profil ✅
- Accessibilité ✅ (depuis Profil)
- Image ✅ (Mode DA doré / Mode Libre bleu)
- Contenu : Texte ✅ (7 blocs)
- Agenda ✅

### Charte visuelle validée — NE PAS CHANGER
- Fond crème : #F7F4EF
- Doré : **#E0B020** (couleur exacte du logo)
- Bleu cobalt : #1A3A8F
- Polices : Basteleur Bold + Basteleur Moonlight

---

## CE QUI RESTE À FAIRE — DANS CET ORDRE

### 1. Vérifier Contenu : Texte
La page a 7 blocs. Vérifier qu'ils s'affichent tous bien.

### 2. Installer voice_commands.js et lsf_elix.js
Ces fichiers sont déjà sur GitHub. Il faut juste les ajouter dans index.html :
```html
<script src="voice_commands.js"></script>
<script src="lsf_elix.js"></script>
```
**voice_commands.js** = commande vocale pour malvoyants (s'active si profil = Malvoyant)
**lsf_elix.js** = langue des signes via Elix (s'active si profil = Malentendant)

### 3. Finir Agenda
Vérifier que tout fonctionne bien.

### 4. Bloc Vidéo
- Mode Ne pas déranger automatique pendant enregistrement
- Sous-titres LSF (mots-clés signés) en superposition
- Analyse son : détecter bruits parasites, proposer de couper
- Montage par commande vocale

### 5. Brancher la mémoire à l'assistant
memory.js est déjà là — il faut le connecter à l'assistant.

### 6. Avec budget
- Crédits Anthropic → activer les réponses
- Replicate → activer génération images

---

## COMPTES ET ACCÈS

**GitHub** : miniglobetrotteuse-source
Token dans le fichier CREDENTIALS_PRIVEES.md (expire 12 juillet 2026)

**Vercel** : or-eille-ai-v2.vercel.app
Variables d'env à configurer : ANTHROPIC_API_KEY, OPENAI_API_KEY

**Anthropic** : platform.anthropic.com
La clé API existe déjà dans Vercel. Il faut juste ajouter des crédits sur platform.anthropic.com → Billing

**Replicate** : replicate.com
Clé à créer et stocker dans localStorage 'moe_replicate_key'

---

## RÈGLES TECHNIQUES

- Toujours vérifier : `node --check fichier.js` avant de commit
- Vercel lent ? → modifier README.md et push pour forcer le déploiement
- Ne jamais mettre de clés API dans le code (utiliser process.env)
- Toujours lire le fichier existant AVANT de modifier
- Une erreur JavaScript casse toute la navigation → vérifier la console

---

## CE QUE JUDITH A CONSTRUIT — PHILOSOPHIE DU PROJET

Or Eille AI est un outil de création **voix d'abord** :
- Tout peut se faire à la voix
- Accessible aux malvoyants (commande vocale complète)
- Accessible aux malentendants (LSF via Elix)
- Accessible aux personnes qui ne savent pas lire ou écrire
- Accessible aux neurodivergents

**Ce n'est pas juste un outil IA — c'est un outil d'inclusion.**

La communauté malentendante est respectée :
- On leur explique honnêtement que le service LSF est rudimentaire pour l'instant
- On les invite à contribuer par leurs retours
- On travaille à améliorer avec le budget disponible

---

## EN CAS DE PROBLÈME

**Le site ne répond plus / navigation cassée** → erreur JavaScript → ouvrir la console (F12 ou clic droit → Inspecter → Console) et lire l'erreur en rouge

**Vercel ne déploie pas** → faire un commit vide :
```bash
git commit --allow-empty -m "Force deploy"
git push origin main
```

**L'assistant dit "Je ne parviens pas à répondre"** → pas de crédits Anthropic → aller sur platform.anthropic.com → Billing

**Les images ne se génèrent pas** → pas de clé Replicate → aller sur replicate.com
