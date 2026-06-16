# SPÉCIFICATION — Mémoire longue et Profil
## Document technique pour le développeur
## Or Eille AI — différenciateur principal

---

## LE PRINCIPE

Or Eille AI n'est pas une IA générique. Elle connaît la personne.

Quand Tamara ouvre l'appli, l'assistant dit :
"Bonjour Tamara, c'est Monsieur Bricolage. Aujourd'hui on enregistre quoi ?"

Pas "Bonjour, comment puis-je vous aider ?"

---

## CE QUE LE PROFIL CONTIENT

### Identité
- Prénom / nom d'usage
- Alter ego / persona créatif (ex: Madame Or Eille, Monsieur Bricolage)
- Nom de l'assistant IA personnalisé (ex: "Monsieur Bricolage" pour les podcasts bricolage)

### Activité créative
- Type de contenu (podcast, YouTube, Instagram, TikTok, musique, peinture...)
- Niche / sujet (bricolage, cuisine africaine, bien-être, artisanat...)
- Plateformes actives
- Fréquence de publication

### Accessibilité
- Profil neurologique (standard, dyslexie, TDAH, autisme...)
- Vision (standard, malvoyant, aveugle)
- Audition (standard, malentendant, sourd)
- Taille de police préférée
- Guide vocal ON/OFF
- Langue préférée

### Projets en cours
- Liste des séries en cours (ex: "Porte-écran", "Micati", "Rumba pour débutants")
- Pour chaque série : épisodes planifiés, matériel nécessaire, prochaine étape

---

## COMMENT ÇA MARCHE DANS LES BLOCS

### Dans le bloc Podcast Visuel
L'assistant connaît le nom de la série et le matériel nécessaire pour chaque épisode.

Exemple — Tamara, aveugle, podcast bricolage :

1. L'assistant dit : "Bonjour Tamara, c'est Monsieur Bricolage."
2. "Aujourd'hui on enregistre l'épisode porte-écran. Pour cet épisode il te faut :"
3. "Tes quatre planches — tu les as ?"
4. Tamara dit : "Oui."
5. "Ta perceuse et tes vis — c'est bon ?"
6. "Oui."
7. "Ton tube de colle ?"
8. "Oui."
9. "Ton texte — tu veux que je te le lise ?"
10. "Non ça va."
11. "Ta batterie est à 75%, ça va aller. Le micro est prêt. Tu veux l'image de l'atelier en fond ou autre chose ?"
12. "L'atelier."
13. "Parfait. Quand tu es prête, dis prête. Je compte jusqu'à trois."
14. Tamara dit : "Prête."
15. "Un... deux... trois. À toi Tamara."

Tout à la voix. Zéro bouton.

---

### Dans le bloc Musique
L'assistant sait que Tamara fait des podcasts, pas de la musique. Il ne lui propose pas le bloc Musique en premier.

Mais si une utilisatrice s'appelle Amina et fait de l'afrobeat, l'assistant dit :
"Bonjour Amina. On continue ton album Racines ? Tu en es au titre 4."

---

### Dans le bloc Agenda
L'assistant connaît les calendriers actifs de la personne et les intègre dans ses suggestions.

"Ta prochaine publication c'est vendredi. C'est Chuseok ce jour-là pour ton audience coréenne — tu veux intégrer ça dans ton contenu ?"

---

## MÉMOIRE LONGUE — DIFFÉRENCE AVEC LES AUTRES IA

| IA standard | Or Eille AI |
|------------|-------------|
| Oublie tout entre les sessions | Se souvient du projet, des épisodes, du matériel |
| Répond de façon générique | Répond selon le profil exact de la personne |
| Ne sait pas qui parle | Connaît le prénom, l'alter ego, la niche |
| Ne sait pas où en est le projet | Sait qu'on en est à l'épisode 4 de la série |

---

## IMPLÉMENTATION TECHNIQUE

### Stockage
- localStorage pour les données de profil (côté client)
- Les données sont injectées dans chaque prompt envoyé à Claude
- Format : JSON structuré

### Injection dans les prompts
Chaque appel à /api/claude commence par un système prompt qui inclut :

```
Tu es l'assistant de [PRENOM], créateur/créatrice de contenu spécialisé(e) en [NICHE].
Ton nom est [NOM_ASSISTANT].
[PRENOM] utilise [PLATEFORMES].
Profil accessibilité : [PROFIL_ACCESSIBILITE].
Projets en cours : [LISTE_PROJETS].
Mémorise et utilise ces informations dans toutes tes réponses.
Ne commence jamais par "Bonjour, comment puis-je vous aider ?"
Commence toujours par le prénom et le sujet en cours.
```

### Guide vocal pour les personnes aveugles
Quand le profil indique "aveugle" :
- Aucun bouton ne nécessite un appui aveugle
- L'assistant guide vocalement toutes les étapes
- La reconnaissance vocale est activée en permanence
- Les confirmations se font à la voix ("oui", "non", "prête")
- Le compte à rebours est vocal (un... deux... trois)
- La taille du texte est maximale pour les malvoyants

---

## LISTE DES MATÉRIELS PAR TYPE DE CONTENU

L'assistant propose une checklist adaptée selon la niche :

### Bricolage
Planches / Vis / Perceuse / Colle / Ponceuse / Peinture / Chiffon / Niveau / Règle

### Cuisine
Ingrédients listés / Ustensiles / Plan de travail propre / Éclairage / Eau disponible

### Peinture / Art
Toile / Pinceaux / Peinture / Eau / Chiffons / Protection sol / Lumière naturelle

### Musique
Instrument accordé / Micro placé / Partition / Casque / Silence ambiant / Batterie chargée

### Beauté / Coiffure
Produits préparés / Serviettes / Lumière suffisante / Fond neutre / Accessoires

### Fitness / Sport
Tenue / Espace dégagé / Eau / Tapis / Musique prête

---

## NOTE POUR LE DÉVELOPPEUR

Ce fichier de spécifications doit être lu AVANT de coder quoi que ce soit dans :
- Le bloc Podcast Visuel
- Le guide vocal de la page Profil
- Le système prompt de /api/claude

La mémoire longue est le cœur du produit. Sans elle, Or Eille AI est une IA comme les autres.


---

## MÉMOIRE LONGUE — CE QUE L'ASSISTANT SE RAPPELLE

### À chaque retour
"Bonjour Tamara. Ça fait 2 jours et 2h30 qu'on ne s'est pas vus. On reprend où on était ou on part sur autre chose ?"

### Les projets abandonnés
"Il y a 6 mois, tu avais commencé une série sur les meubles de récupération. Tu l'as laissée. Est-ce que c'est vraiment oublié, ou il a mûri ?"

### Le planning créatif
- Épisodes enregistrés
- Épisodes publiés
- Épisodes en cours
- Idées notées mais pas encore développées

### Le planning de vie
L'assistant connaît aussi le planning quotidien de la personne — pas seulement son contenu.

"Aujourd'hui c'est lundi. Tu as yoga à 10h. Il te reste 45 minutes pour finir ton épisode avant."

"Demain tu as ta réunion avec ta cliente. Tu veux qu'on prépare un résumé de ce que tu as créé ce mois-ci ?"

---

## CE QUI EST STOCKÉ

| Information | Durée de stockage |
|-------------|------------------|
| Profil (prénom, niche, plateformes) | Permanent |
| Projets en cours | Permanent |
| Projets abandonnés | Permanent — jamais supprimés sans demande |
| Planning créatif | Permanent |
| Planning vie quotidienne | Permanent |
| Dernière session | Permanent |
| Préférences d'accessibilité | Permanent |

---

## CE QUE L'ASSISTANT NE FAIT PAS

- Il ne dit jamais "Bonjour, comment puis-je vous aider ?"
- Il ne pose pas de questions génériques
- Il ne repart pas de zéro
- Il ne propose pas des choses que la personne a déjà faites
- Il ne répète pas ce qu'il a déjà dit dans la même session

