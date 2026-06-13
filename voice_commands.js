// ═══════════════════════════════════════════════════
//  COMMANDE VOCALE COMPLÈTE — Or Eille AI v2
//  Active automatiquement si profil = Malvoyant(e)
//  © Madame Or Eille Studios — 2026
// ═══════════════════════════════════════════════════

const VOICE_CMD = {

  active: false,
  recognition: null,
  currentPage: '',

  // ─── Commandes par page ───────────────────────
  COMMANDS: {
    image: {
      'mode da':        () => document.getElementById('img-mode-da')?.click(),
      'mode libre':     () => document.getElementById('img-mode-libre')?.click(),
      'carré':          () => document.querySelector('[onclick*="selectOpt"][onclick*="Carré"]')?.click(),
      'portrait':       () => document.querySelector('[onclick*="selectOpt"][onclick*="Portrait"]')?.click(),
      'paysage':        () => document.querySelector('[onclick*="selectOpt"][onclick*="Paysage"]')?.click(),
      'story':          () => document.querySelector('[onclick*="selectOpt"][onclick*="Story"]')?.click(),
      'tous les formats': () => document.querySelector('[onclick*="selectOpt"][onclick*="formats"]')?.click(),
      'rond':           () => document.querySelector('[onclick*="selectOpt"][onclick*="Rond"]')?.click(),
      'rectangle':      () => document.querySelector('[onclick*="selectOpt"][onclick*="Rectangle"]')?.click(),
      'cœur':           () => document.querySelector('[onclick*="selectOpt"][onclick*="Cœur"]')?.click(),
      'étoile':         () => document.querySelector('[onclick*="selectOpt"][onclick*="Étoile"]')?.click(),
      'une image':      () => document.querySelector('[onclick*="selectOpt"][onclick*="unique"]')?.click(),
      'série':          () => document.querySelector('[onclick*="selectOpt"][onclick*="identique"]')?.click(),
      'générer':        () => document.querySelector('[onclick*="genererImage"]')?.click(),
      'dicter':         () => document.getElementById('img-mic-btn')?.click(),
      'effacer':        () => { document.getElementById('img-description').value = ''; },
    },
    redaction: {
      'post':           () => document.querySelector('[onclick*="selectFormat"][onclick*="post"]')?.click(),
      'story':          () => document.querySelector('[onclick*="selectFormat"][onclick*="story"]')?.click(),
      'reel':           () => document.querySelector('[onclick*="selectFormat"][onclick*="reel"]')?.click(),
      'carrousel':      () => document.querySelector('[onclick*="selectFormat"][onclick*="carrousel"]')?.click(),
      'instagram':      () => document.querySelector('[onclick*="togglePlat"][onclick*="instagram"]')?.click(),
      'tiktok':         () => document.querySelector('[onclick*="togglePlat"][onclick*="tiktok"]')?.click(),
      'youtube':        () => document.querySelector('[onclick*="togglePlat"][onclick*="youtube"]')?.click(),
      'créer':          () => document.querySelector('[onclick*="creerContenu"]')?.click(),
      'dicter':         () => document.querySelector('[onclick*="startRedMic"]')?.click(),
    },
    profil: {
      'sauvegarder':    () => document.querySelector('[onclick*="sauvegarderProfil"]')?.click(),
      'accessibilité':  () => window.showPage('accessibilite'),
    },
    accessibilite: {
      'normal':         () => document.querySelector('[onclick*="setA11y"][onclick*="normal"]')?.click(),
      'grand':          () => document.querySelector('[onclick*="setA11y"][onclick*="large"]')?.click(),
      'très grand':     () => document.querySelector('[onclick*="setA11y"][onclick*="xlarge"]')?.click(),
      'dyslexie':       () => document.querySelector('[onclick*="setA11y"][onclick*="true"]')?.click(),
      'enregistrer':    () => document.querySelector('[onclick*="saveA11y"]')?.click(),
    },
  },

  // Commandes globales (toutes pages)
  GLOBAL_COMMANDS: {
    'accueil':        () => window.showPage('accueil'),
    'assistant':      () => window.showPage('assistant'),
    'profil':         () => window.showPage('profil'),
    'image':          () => window.showPage('image'),
    'contenu':        () => window.showPage('redaction'),
    'agenda':         () => window.showPage('agenda'),
    'retour':         () => window.showPage('accueil'),
  },

  // ─── Démarrer l'écoute permanente ─────────────
  start(page) {
    this.currentPage = page;
    if (this.recognition) { try { this.recognition.stop(); } catch(e) {} }

    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    this.recognition = new SR();
    this.recognition.lang = 'fr-FR';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    var self = this;
    this.recognition.onresult = function(e) {
      var cmd = e.results[0][0].transcript.toLowerCase().trim();
      self.execute(cmd);
    };
    this.recognition.onend = function() {
      if (self.active) setTimeout(function() { self.start(self.currentPage); }, 300);
    };
    this.recognition.onerror = function() {
      if (self.active) setTimeout(function() { self.start(self.currentPage); }, 1000);
    };

    try { this.recognition.start(); } catch(e) {}
  },

  // ─── Exécuter une commande ────────────────────
  execute(cmd) {
    // Chercher dans les commandes globales
    for (var key in this.GLOBAL_COMMANDS) {
      if (cmd.includes(key)) {
        this.GLOBAL_COMMANDS[key]();
        this.speak('OK — ' + key);
        return;
      }
    }
    // Chercher dans les commandes de la page courante
    var pageCommands = this.COMMANDS[this.currentPage] || {};
    for (var key in pageCommands) {
      if (cmd.includes(key)) {
        pageCommands[key]();
        this.speak('OK — ' + key);
        return;
      }
    }
    // Sinon — mettre le texte dans le champ actif
    var activeInput = document.querySelector('textarea:focus, input[type="text"]:focus');
    if (activeInput) activeInput.value = cmd;
  },

  // ─── Synthèse vocale ──────────────────────────
  speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'fr-FR';
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  },

  // ─── Activer/désactiver ───────────────────────
  enable() {
    this.active = true;
    this.start(window.currentActivePage || 'accueil');
    this.speak('Mode commande vocale activé. Je vous écoute.');
  },

  disable() {
    this.active = false;
    if (this.recognition) { try { this.recognition.stop(); } catch(e) {} }
  },

  // ─── Vérifier le profil au chargement ─────────
  checkProfile() {
    try {
      var profil = JSON.parse(localStorage.getItem('oe_profile') || '{}');
      var a11y = JSON.parse(localStorage.getItem('oe_a11y') || '{}');
      if (a11y.neuro_malvoyant || profil.accessibilite === 'malvoyant') {
        this.enable();
      }
    } catch(e) {}
  }
};

window.VOICE_CMD = VOICE_CMD;

// Vérifier le profil au chargement
window.addEventListener('load', function() {
  setTimeout(function() { VOICE_CMD.checkProfile(); }, 1500);
});
