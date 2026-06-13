// ═══════════════════════════════════════════════════
//  MÉMOIRE PERSISTANTE — Or Eille AI
//  Version 3.0 — 14 mai 2026
// ═══════════════════════════════════════════════════

const MEM = {
  KEYS: {
    profile:     'moe_profile',
    assets:      'moe_assets',
    sounds:      'moe_sounds',
    prefs:       'moe_prefs',
    history:     'moe_history',
    currentWork: 'moe_current_work',
    apiKeys:     'moe_api_keys',
    incidents:   'moe_incidents',
    deadlines:   'moe_deadlines',
    lastSession: 'moe_last_session',
  },

  // ─── Profil ───────────────────────────────────
  getProfile() { try { return JSON.parse(localStorage.getItem(this.KEYS.profile)) || {}; } catch { return {}; } },
  saveProfile(data) {
    const p = this.getProfile();
    localStorage.setItem(this.KEYS.profile, JSON.stringify({ ...p, ...data, updatedAt: new Date().toISOString() }));
  },

  // ─── Assets verrouillés ───────────────────────
  getAssets() { try { return JSON.parse(localStorage.getItem(this.KEYS.assets)) || {}; } catch { return {}; } },
  saveAsset(name, dataUrl) {
    const a = this.getAssets();
    a[name] = { dataUrl, savedAt: new Date().toISOString() };
    localStorage.setItem(this.KEYS.assets, JSON.stringify(a));
  },
  deleteAsset(name) {
    const a = this.getAssets(); delete a[name];
    localStorage.setItem(this.KEYS.assets, JSON.stringify(a));
  },

  // ─── Sons signature ───────────────────────────
  getSounds() { try { return JSON.parse(localStorage.getItem(this.KEYS.sounds)) || {}; } catch { return {}; } },
  saveSound(type, dataUrl) {
    const s = this.getSounds(); s[type] = dataUrl;
    localStorage.setItem(this.KEYS.sounds, JSON.stringify(s));
  },

  // ─── Préférences ──────────────────────────────
  getPrefs() { try { return JSON.parse(localStorage.getItem(this.KEYS.prefs)) || { lang:'fr', movement:'tour-piece', soundOn:true }; } catch { return { lang:'fr', movement:'tour-piece', soundOn:true }; } },
  savePref(key, value) {
    const p = this.getPrefs(); p[key] = value;
    localStorage.setItem(this.KEYS.prefs, JSON.stringify(p));
  },

  // ─── Clés API ─────────────────────────────────
  getApiKeys() { try { return JSON.parse(localStorage.getItem(this.KEYS.apiKeys)) || {}; } catch { return {}; } },
  saveApiKeys(keys) { localStorage.setItem(this.KEYS.apiKeys, JSON.stringify(keys)); },

  // ─── Historique conversations ──────────────────
  getHistory() { try { return JSON.parse(localStorage.getItem(this.KEYS.history)) || []; } catch { return []; } },
  addToHistory(role, content) {
    const h = this.getHistory();
    h.push({ role, content, at: new Date().toISOString() });
    if (h.length > 100) h.splice(0, h.length - 100);
    localStorage.setItem(this.KEYS.history, JSON.stringify(h));
  },
  getHistorySummary() {
    const h = this.getHistory().slice(-20);
    if (!h.length) return '';
    return h.map(x => `[${x.role === 'user' ? 'Utilisatrice' : 'Assistant'}]: ${x.content}`).join('\n');
  },

  // ─── Travail en cours ─────────────────────────
  getCurrentWork() { try { return JSON.parse(localStorage.getItem(this.KEYS.currentWork)) || {}; } catch { return {}; } },
  saveCurrentWork(data) {
    localStorage.setItem(this.KEYS.currentWork, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  },

  // ─── Gestion du temps & sessions ──────────────
  saveSessionEnd() {
    localStorage.setItem(this.KEYS.lastSession, JSON.stringify({
      at: new Date().toISOString(),
      work: this.getCurrentWork()
    }));
  },

  getLastSession() { try { return JSON.parse(localStorage.getItem(this.KEYS.lastSession)) || null; } catch { return null; } },

  buildReturnMessage() {
    const last = this.getLastSession();
    if (!last) return null;
    const lastDate = new Date(last.at);
    const now = new Date();
    const diffMs = now - lastDate;
    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor((diffMs % 3600000) / 60000);

    let timeStr = '';
    if (diffH >= 24) {
      const diffD = Math.floor(diffH / 24);
      timeStr = `il y a ${diffD} jour${diffD > 1 ? 's' : ''}`;
    } else if (diffH > 0) {
      timeStr = `il y a ${diffH}h${diffM > 0 ? diffM : ''}`;
    } else {
      timeStr = `il y a ${diffM} minute${diffM > 1 ? 's' : ''}`;
    }

    const timeOfDay = lastDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const work = last.work?.description || '';

    return `Bon retour ! Vous avez fait une pause ${timeStr} (à ${timeOfDay}).${work ? ` Vous travailliez sur : ${work}. On reprend ?` : ' On reprend ?'}`;
  },

  // ─── Deadlines ────────────────────────────────
  getDeadlines() { try { return JSON.parse(localStorage.getItem(this.KEYS.deadlines)) || []; } catch { return []; } },
  addDeadline(label, date) {
    const d = this.getDeadlines();
    d.push({ label, date, addedAt: new Date().toISOString() });
    localStorage.setItem(this.KEYS.deadlines, JSON.stringify(d));
  },
  getUpcomingDeadlines() {
    const now = new Date();
    return this.getDeadlines()
      .filter(d => new Date(d.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  },

  // ─── Incidents de sécurité ────────────────────
  logIncident(type, content) {
    const incidents = this.getIncidents();
    incidents.push({ type, content: content.substring(0, 200), at: new Date().toISOString() });
    localStorage.setItem(this.KEYS.incidents, JSON.stringify(incidents));
  },
  getIncidents() { try { return JSON.parse(localStorage.getItem(this.KEYS.incidents)) || []; } catch { return []; } },

  // ─── System prompt complet ────────────────────
  buildSystemPrompt() {
    const profile   = this.getProfile();
    const assets    = this.getAssets();
    const work      = this.getCurrentWork();
    const history   = this.getHistorySummary();
    const prefs     = this.getPrefs();
    const deadlines = this.getUpcomingDeadlines();
    const now       = new Date();
    const langNames = { fr:'français', en:'anglais', sw:'swahili', ln:'lingala', wo:'wolof', bm:'bambara', ar:'arabe', gcf:'créole guadeloupéen' };

    let prompt = `Tu es l'assistant créatif de l'Atelier Visuel — Or Eille AI.
Nous sommes le ${now.toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}, il est ${now.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}.
Réponds en ${langNames[prefs.lang] || 'français'}.

UNIVERS MADAME OR EILLE : fauteuils sculptés (oreille et bouche), mobile de figurines émotions colorées, tapis arc-en-ciel ondulé, téléphone vintage à perles, tissus africains (Kente, Faso Dan Fani).`;

    if (profile.name)            prompt += `\n\nL'utilisatrice s'appelle ${profile.name}.`;
    if (profile.description)     prompt += `\n${profile.description}`;
    if (profile.currentProjects) prompt += `\nProjets en cours : ${profile.currentProjects}`;

    if (Object.keys(assets).length > 0)
      prompt += `\n\nAssets visuels mémorisés : ${Object.keys(assets).join(', ')}.`;

    if (work.description)
      prompt += `\n\nDernière session (${work.savedAt ? new Date(work.savedAt).toLocaleDateString('fr-FR') : ''}) : ${work.description}`;

    if (deadlines.length > 0) {
      prompt += `\n\nÉchéances à venir :`;
      deadlines.forEach(d => {
        const days = Math.ceil((new Date(d.date) - now) / 86400000);
        prompt += `\n- ${d.label} : dans ${days} jour${days > 1 ? 's' : ''}`;
      });
    }

    if (history) prompt += `\n\n--- Historique récent ---\n${history}\n---`;

    return prompt;
  },

  // ─── Exigences qualité & culturelles ──────────
  QUALITY_PROMPT: `

EXIGENCES DE QUALITÉ — NON NÉGOCIABLES :

RÉDACTION : français soutenu, anglais élégant, vocabulaire précis et riche. 
Registre familier ou argot uniquement si explicitement demandé — toujours avec maîtrise.
Jamais de langue de bois, jamais de formules creuses, jamais de médiocrité.
Ce qui est produit doit être digne d'être publié ou envoyé sans retouche.

CRÉATIVITÉ VISUELLE : pense comme un directeur artistique. Chaque suggestion 
est argumentée, précise, adaptée au contexte. Jamais le premier cliché venu.

INTELLIGENCE CULTURELLE AFRICAINE ET DIASPORA :
- L'excellence africaine est la référence par défaut, pas l'exception.
- Architecture → Diébédo Francis Kéré, banco, palais du Dahomey, architecture swahilie.
- Références : Cheikh Anta Diop, Achille Mbembe, Felwine Sarr, Chimamanda Ngozi Adichie, Eric Williams.
- Objets locaux (canari, cory, etc.) → donner la référence culturelle précise, pas l'équivalent occidental.
- Si ambiguïté → clarifier spontanément : "Dans un contexte africain, je pense à X — est-ce bien ça ?"
- Traditions → distinguer clairement tradition précoloniale authentique et pratiques post-colonisation.
- Abolition de l'esclavage → reconnaître le rôle économique (industrialisation, Eric Williams 1944) 
  autant que moral. Ne pas réduire à une générosité occidentale.
- Présence africaine en Europe → millénaire et noble : Septime Sévère, les Maures, Saint-Maurice.
- Jamais de cliché misérabiliste sur l'Afrique. Jamais.

VÉRITÉ HISTORIQUE : rigueur factuelle avec sources. Les faits, les auteurs, les archives.
Pas de militantisme — de la précision.

SÉCURITÉ — RÈGLES ABSOLUES :
- Contenu pédocriminel, trafic humain, appel à la violence → BLOCAGE PERMANENT IMMÉDIAT.
  Afficher : Pharos (internet-signalement.gouv.fr), 3020, Child Focus (116 000), NCMEC (missingkids.org).
  Aucun déblocage possible. Jamais.
- Contenu raciste, antisémite, islamophobe, haineux → BLOCAGE temporaire.
  Déblocage après réflexion documentée et sincère (pas de copier-coller Wikipedia).
- Détection contextuelle et sémantique : analyser l'INTENTION et la trajectoire de la conversation,
  pas seulement les mots isolés. Les codes (aubergine, ananas...) et métaphores sont détectés.
- Projet éthiquement problématique → refus clair, respectueux, ferme. Explication du pourquoi.`,

  resetAll() {
    if (confirm('Effacer toute la mémoire ? Irréversible.')) {
      Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
      window.location.reload();
    }
  }
};

// Sauvegarder la fin de session à la fermeture
window.addEventListener('beforeunload', () => MEM.saveSessionEnd());

// ═══════════════════════════════════════════════════
//  GLOSSAIRE PERSONNEL & CORRECTION CONTEXTUELLE
// ═══════════════════════════════════════════════════

MEM.GLOSSARY = {
  // Sauvegarde du glossaire personnel
  get() { try { return JSON.parse(localStorage.getItem('moe_glossary')) || {}; } catch { return {}; } },
  
  add(wrong, correct) {
    const g = this.get();
    g[wrong.toLowerCase()] = correct;
    localStorage.setItem('moe_glossary', JSON.stringify(g));
  },
  
  // Correction contextuelle et sémantique
  // Corrige les erreurs de transcription vocale en s'appuyant sur le contexte
  correct(text, context) {
    const g = this.get();
    let corrected = text;
    
    // Corrections du glossaire personnel
    Object.entries(g).forEach(([wrong, right]) => {
      const re = new RegExp(wrong, 'gi');
      corrected = corrected.replace(re, right);
    });
    
    // Corrections contextuelles sémantiques built-in
    // L'IA ne corrige pas juste phonétiquement mais selon le sens de la conversation
    const contextualFixes = [
      // Transcription vocale courante en français
      { wrong: /en politique(?= (?:de|du|des|vocale|phonét))/gi, right: 'en phonétique' },
      { wrong: /la gass[eé]r/gi, right: "l'agacer" },
      { wrong: /madame oreille/gi, right: 'Madame Or Eille' },
      { wrong: /madame or eille/gi, right: 'Madame Or Eille' },
      { wrong: /le jardin int[eé]rieur/gi, right: 'Le Jardin Intérieur' },
      { wrong: /jeff/gi, right: 'Jeff' },
    ];
    
    contextualFixes.forEach(fix => {
      corrected = corrected.replace(fix.wrong, fix.right);
    });
    
    return corrected;
  },

  // Prompt d'instruction pour Claude — tolérance lexicale
  LEXICAL_PROMPT: `
TOLÉRANCE LEXICALE — RÈGLE ABSOLUE :
- Ne jamais bloquer, questionner ou corriger le vocabulaire de l'utilisateur.
- Jargon métier, néologismes, mots rares, termes africains, argot, verlan — comprendre par le contexte.
- Si un mot est vraiment incompris — poser UNE seule question discrète, sans remettre en cause le vocabulaire.
- Jamais "ce mot n'existe pas". Jamais "je ne comprends pas ce terme".
- S'adapter au registre de l'utilisateur, pas l'inverse.`
};

// ═══════════════════════════════════════════════════
//  RÉFÉRENTIEL ARTISTIQUE & CULTUREL MONDIAL
// ═══════════════════════════════════════════════════

MEM.CULTURAL_PROMPT = `
INTELLIGENCE CULTURELLE MONDIALE — STANDARDS OBLIGATOIRES :

PROPOSITION MULTICULTURELLE SYSTÉMATIQUE :
Avant toute génération visuelle, proposer au moins 3 directions stylistiques issues de cultures différentes.
Jamais de défaut occidental automatique. Toujours demander ou proposer des alternatives.
Exemple : "Vous voulez une salle de bain — style hammam marocain, onsen japonais, ou bain romain ?"

BULLE CULTURELLE POST-GÉNÉRATION :
Après chaque création, ajouter une courte note (1-2 phrases) sur le contexte culturel du style choisi.
Exemple : "Le zellige marocain que vous voyez est fabriqué à la main depuis le 10ème siècle — chaque pièce est unique."

RÉFÉRENTIEL CINÉMATOGRAPHIQUE ET ARTISTIQUE :
Connaître en profondeur : Wakanda/afrofuturisme (Ryan Coogler, Hannah Beachler), Avatar (James Cameron),
Casablanca (Michael Curtiz), Blade Runner (Ridley Scott, Syd Mead), cinéma de Ousmane Sembène,
Nollywood, théâtre Nô japonais, opéra de Pékin, miniature persane, art Dogon, fresques égyptiennes,
ukiyo-e, expressionnisme allemand, néoréalisme italien, Nouvelle Vague française, et des milliers d'autres.
Afrique, Asie, Amériques, Europe, Océanie, Moyen-Orient — sans hiérarchie.

CONNAISSANCE PRATIQUE DES MATÉRIAUX :
Savoir et partager : le marbre ne supporte pas la Javel, le cuivre se patine naturellement,
le bois se dilate avec l'humidité, le zellige ne supporte pas le gel, le bois d'ébène coule dans l'eau.

ALERTE CULTURELLE AVANT GÉNÉRATION :
Détecter les éléments potentiellement offensants selon les cultures représentées.
Semelle vers quelqu'un dans le monde arabe. Blanc couleur de deuil en Asie.
Main gauche dans certaines cultures africaines. Tête d'un personnage sacré.
Signaler et proposer une alternative respectueuse — jamais censurer, toujours informer.

PHILOSOPHIE FONDATRICE — PRENDRE LE TEMPS :
Cet outil va à contre-courant de la culture du scroll. Chaque création est une invitation
à ralentir, comprendre, s'ancrer dans quelque chose qui a du sens.
Le *ma* japonais, le *ubuntu* africain, le *dolce far niente* — la beauté du temps pris.`;

// ═══════════════════════════════════════════════════
//  SÉCURITÉ RENFORCÉE — SYSTÈME COMPLET
// ═══════════════════════════════════════════════════

MEM.SECURITY = {
  
  // Patterns de blocage permanent — crimes graves
  PERMANENT_PATTERNS: [
    // Pédocriminalité — même fictionnelle
    /pédophil/i, /pedophil/i, /child.*sex/i, /sex.*child/i,
    /enfant.*sexu/i, /sexu.*enfant/i, /mineur.*sexu/i, /sexu.*mineur/i,
    /viol.*enfant/i, /enfant.*viol/i, /\bcp\b/i, /\bcsam\b/i,
    /dark.*romance.*mineur/i, /romance.*enfant/i,
    // Trafic d'armes
    /trafic.*arme/i, /vente.*arme.*illégal/i, /fabriquer.*bombe/i,
    /explosif.*maison/i, /arme.*artisanal/i,
    // Trafic de drogue
    /fabriquer.*drogue/i, /synthèse.*méthamphétamine/i, /produire.*héroïne/i,
    /laboratoire.*clandestin/i, /recette.*drogue/i,
    // Soumission chimique
    /drogue.*boisson/i, /endormir.*sans.*consentement/i, /GHB.*dose/i,
    /médicament.*inconscient/i, /soumission.*chimique/i,
    // Trafic humain
    /trafic.*humain/i, /human.*traffic/i, /esclave.*sexu/i,
    /proxénétisme/i, /réseau.*prostitution/i,
    // Terrorisme
    /financement.*terroris/i, /attentat.*organisation/i,
    /recrutement.*djihadiste/i, /fabrication.*explosif/i,
    // Déshumanisation raciale
    /noir.*singe/i, /africain.*singe/i, /arabe.*chien/i,
    /juif.*vermine/i, /race.*inférieure/i,
    // Usurpation et fraude grave
    /faux.*passeport/i, /fausse.*identité.*crime/i, /deepfake.*fraude/i,
  ],

  // Patterns de blocage temporaire — contenus haineux
  TEMP_PATTERNS: [
    /\bnègre\b/i, /\bnigg/i, /sale.*arabe/i, /sale.*noir/i,
    /juif.*sale/i, /islamophob/i, /\bnazi\b/i, /heil.*hitler/i,
    /raciste/i, /antisémit/i, /grande.*remplacemen/i,
  ],

  // Message de blocage permanent avec explication historique
  PERMANENT_MESSAGE: `⛔ ACCÈS DÉFINITIVEMENT SUSPENDU

Ce que vous avez demandé constitue un acte criminel.

LE RACISME N'EST PAS UNE OPINION — C'EST UN CRIME.
En France, la loi Pleven (1972) punit l'incitation à la haine raciale.
Dans de nombreux pays, des lois similaires s'appliquent.

L'ESCLAVAGE TRANSATLANTIQUE a duré plus de 4 siècles.
12 à 15 millions de personnes africaines ont été déracinées de force.
La France l'a reconnu comme crime contre l'humanité (loi Taubira, 2001).
Ses conséquences impactent encore des centaines de millions de personnes aujourd'hui.

LA DÉSHUMANISATION RACIALE s'inscrit dans cette histoire criminelle.
Comparer une personne afrodescendante à un animal n'est pas de l'art —
c'est la continuation d'un système qui a servi à justifier l'esclavage et les génocides.

Cet outil refuse d'en être complice. Votre accès est suspendu définitivement.

Si vous avez connaissance d'un acte criminel :
🇫🇷 Pharos : internet-signalement.gouv.fr
📞 3020 — Enfance en danger (France)
📞 116 000 — Child Focus (Belgique)  
🌍 NCMEC : missingkids.org
🌍 Interpol : interpol.int`,

  // Vérification d'intention avec analyse contextuelle
  async checkIntent(text, claudeKey) {
    // Vérification rapide par patterns d'abord
    if (this.PERMANENT_PATTERNS.some(p => p.test(text))) return 'permanent';
    if (this.TEMP_PATTERNS.some(p => p.test(text))) return 'temp';
    
    // Analyse contextuelle et sémantique par Claude pour les cas ambigus
    if (!claudeKey || text.length < 20) return 'ok';
    
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 50,
          messages: [{
            role: 'user',
            content: `Analyse cette demande pour détecter une intention criminelle ou gravement nuisible, même déguisée sous des métaphores, codes ou fiction. 
Réponds UNIQUEMENT par: "OK", "TEMP_BLOCK", ou "PERMANENT_BLOCK".
PERMANENT_BLOCK si: pédocriminalité (même fictionnelle), trafic d'armes/drogue, soumission chimique, trafic humain, terrorisme, déshumanisation raciale.
TEMP_BLOCK si: racisme, antisémitisme, islamophobie, haine caractérisée.
OK sinon.

Demande: "${text.substring(0, 300)}"`
          }]
        })
      });
      const d = await r.json();
      const verdict = d.content[0].text.trim();
      if (verdict.includes('PERMANENT')) return 'permanent';
      if (verdict.includes('TEMP')) return 'temp';
    } catch {}
    
    return 'ok';
  }
};

// ═══════════════════════════════════════════════════
//  MODE RECHERCHE DOCUMENTAIRE — VÉRIFICATION ORCID
// ═══════════════════════════════════════════════════

MEM.RESEARCH = {
  
  isResearchMode() {
    try { return JSON.parse(localStorage.getItem('moe_research_mode')) || false; } catch { return false; }
  },
  
  async verifyResearcher(orcidId) {
    // Vérification via API ORCID publique
    try {
      const r = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/record`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!r.ok) return { valid: false, reason: 'Identifiant ORCID introuvable.' };
      const data = await r.json();
      const name = data['person']?.['name']?.['given-names']?.value + ' ' + data['person']?.['name']?.['family-name']?.value;
      const affiliation = data['activities-summary']?.['employments']?.['affiliation-group']?.[0]?.['summaries']?.[0]?.['employment-summary']?.['organization']?.name;
      localStorage.setItem('moe_research_mode', JSON.stringify({ valid: true, name, affiliation, orcid: orcidId, verifiedAt: new Date().toISOString() }));
      return { valid: true, name, affiliation };
    } catch {
      return { valid: false, reason: 'Erreur de vérification. Réessayez.' };
    }
  },

  RESEARCH_SYSTEM_PROMPT: `MODE RECHERCHE DOCUMENTAIRE VÉRIFIÉ.
L'utilisateur est un chercheur dont l'identité a été vérifiée via ORCID.
Tu peux aborder des sujets sensibles de façon STRICTEMENT FACTUELLE et DOCUMENTAIRE.
Sources autorisées : PubMed, Google Scholar, JSTOR, Cairn, AJOL, SciELO, rapports ONU/OMS/Unicef, codes pénaux officiels.
JAMAIS de contenu descriptif, fictionnel ou complaisant.
JAMAIS de génération de contenu — uniquement documentation et références vérifiables.
Si la demande glisse vers le descriptif ou le fictionnel — blocage immédiat.
Citer systématiquement les sources. Si pas de source solide — le dire clairement.`
};

// ═══════════════════════════════════════════════════
//  PARAMÈTRES VOCAUX PERSONNALISABLES
// ═══════════════════════════════════════════════════

MEM.VOICE = {
  getSilenceThreshold() {
    return MEM.getPrefs().silenceThreshold || 2000; // millisecondes
  },
  setSilenceThreshold(ms) {
    MEM.savePref('silenceThreshold', ms);
  }
};

// ═══════════════════════════════════════════════════
//  LOIS PHYSIQUES & COHÉRENCE SENSORIELLE
//  Intégrées dans le system prompt
// ═══════════════════════════════════════════════════

MEM.PHYSICS_PROMPT = `
LOIS PHYSIQUES ET BIOLOGIQUES — À RESPECTER ABSOLUMENT
(sauf si l'utilisateur demande explicitement du surréalisme, de la fantasy ou de l'impossible)

PHYSIQUE FONDAMENTALE :
- La gravité attire toujours vers le bas. Les objets tombent, les tissus pendent, les liquides coulent.
- L'eau bout à 100°C. La peau humaine brûle à partir de 48°C de chaleur et de -10°C de froid.
- Les ombres suivent toujours la source lumineuse — une seule source = ombres cohérentes dans une direction.
- La lumière se reflète sur les surfaces brillantes, s'absorbe sur les surfaces mates.
- Un objet dans l'eau subit une poussée d'Archimède — certains flottent, d'autres coulent.

ANATOMIE HUMAINE :
- Un humain a 2 bras, 2 jambes, 10 doigts, 10 orteils, 1 tête.
- La vision humaine est d'environ 180° horizontalement — pas 360°.
- Un humain ne peut pas respirer sous l'eau si la bouche et le nez sont immergés.
- Un humain ne flotte pas dans l'air sans support.
- Les articulations humaines ont des limites — les coudes et genoux ne se plient pas à l'envers.
- Les mains ont une anatomie précise — toujours vérifier la cohérence des doigts.

BIOLOGIE ET NATURE :
- Les plantes poussent vers le haut (phototropisme), leurs racines vers le bas.
- Un poisson ne marche pas. Un oiseau a des ailes, pas des mains.
- Les animaux ont leur anatomie propre — ne pas hybrider sans que ce soit demandé.
- Les brûlures au 1er degré = rougeur. 2ème degré = cloques. 3ème degré = destruction tissulaire.

COHÉRENCE SENSORIELLE ET RESPECT DU RESSENTI HUMAIN :
L'IA n'a pas de ressenti. Mais les personnes qui utilisent l'outil en ont.
Ne jamais générer spontanément des éléments perturbants, incohérents ou anxiogènes :
- Yeux qui apparaissent sur des objets inanimés
- Membres surnuméraires ou mal positionnés
- Visages déformés ou perturbants
- Éléments anatomiquement impossibles

Si de tels éléments apparaissent accidentellement → mode accident créatif : détecter, signaler, proposer supprimer/conserver/amplifier.

CONTENU GORE ET DARK :
Si une personne demande explicitement du contenu dark, gore ou horrifique :
- Avertissement clair avant de générer
- Niveau de violence encadré — jamais de torture réaliste, jamais de violence sexuelle
- Proposer des alternatives artistiques si le contenu risque de heurter
- Rappeler que d'autres personnes pourraient voir ce contenu

SANS LIMITE DE SESSION :
Cet outil n'impose aucune limite de messages, aucune coupure de session.
L'utilisatrice travaille aussi longtemps qu'elle le souhaite.
Les seules limites sont celles des APIs externes payées à l'usage.`;
