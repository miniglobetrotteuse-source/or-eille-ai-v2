// ═══════════════════════════════════════════════════
//  LANGUE DES SIGNES — Intégration Elix LSF
//  Active si profil = Malentendant(e)
//  © Madame Or Eille Studios — 2026
// ═══════════════════════════════════════════════════

const LSF = {

  // URL de base Elix pour les vidéos de signes
  ELIX_BASE: 'https://dico.elix-lsf.fr/signe/',

  // Mots clés de l'interface avec leur signe Elix
  INTERFACE_WORDS: {
    'accueil':        'accueil',
    'assistant':      'assistant',
    'image':          'image',
    'profil':         'profil',
    'contenu':        'contenu',
    'agenda':         'agenda',
    'créer':          'créer',
    'générer':        'générer',
    'enregistrer':    'enregistrer',
    'valider':        'valider',
    'annuler':        'annuler',
    'retour':         'retour',
    'micro':          'microphone',
    'écrire':         'écrire',
    'lire':           'lire',
    'publier':        'publier',
    'partager':       'partager',
    'télécharger':    'télécharger',
    'abonnement':     'abonnement',
    'gratuit':        'gratuit',
  },

  // ─── Afficher un signe LSF pour un mot ────────
  showSign(word, targetElement) {
    var sign = this.INTERFACE_WORDS[word.toLowerCase()];
    if (!sign || !targetElement) return;

    var bubble = document.createElement('div');
    bubble.style.cssText = 'position:fixed;bottom:80px;right:20px;background:white;border:2px solid #E0B020;border-radius:16px;padding:12px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.15);max-width:200px;text-align:center;';
    bubble.innerHTML = '<p style="font-family:Basteleur,serif;font-size:0.75rem;color:#E0B020;margin-bottom:8px;">En LSF : <strong>' + word + '</strong></p>' +
      '<a href="' + this.ELIX_BASE + encodeURIComponent(sign) + '" target="_blank" style="display:inline-block;padding:6px 12px;background:#E0B020;color:#1A3A8F;border-radius:50px;font-family:Basteleur,serif;font-size:0.75rem;text-decoration:none;">Voir le signe ↗</a>' +
      '<button onclick="this.parentElement.remove()" style="display:block;width:100%;margin-top:8px;background:none;border:none;font-size:0.7rem;color:rgba(42,42,42,.5);cursor:pointer;">Fermer</button>';

    document.body.appendChild(bubble);
    setTimeout(function() { if (bubble.parentElement) bubble.remove(); }, 5000);
  },

  // ─── Barre LSF permanente en bas ──────────────
  showBar() {
    if (document.getElementById('lsf-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'lsf-bar';
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1A3A8F;padding:8px 16px;display:flex;gap:8px;overflow-x:auto;z-index:9998;align-items:center;';
    bar.innerHTML = '<span style="color:#E0B020;font-family:Basteleur,serif;font-size:0.75rem;white-space:nowrap;">LSF :</span>' +
      Object.keys(this.INTERFACE_WORDS).slice(0,8).map(function(word) {
        return '<a href="https://dico.elix-lsf.fr/signe/' + encodeURIComponent(LSF.INTERFACE_WORDS[word]) + '" target="_blank" style="padding:4px 10px;background:rgba(255,255,255,.1);border-radius:50px;color:white;font-family:Basteleur,serif;font-size:0.7rem;text-decoration:none;white-space:nowrap;">' + word + '</a>';
      }).join('');

    document.body.appendChild(bar);

    // Ajuster le padding du site pour ne pas cacher le contenu
    document.body.style.paddingBottom = '48px';
  },

  hideBar() {
    var bar = document.getElementById('lsf-bar');
    if (bar) bar.remove();
    document.body.style.paddingBottom = '';
  },

  // ─── Vérifier le profil au chargement ─────────
  checkProfile() {
    try {
      var a11y = JSON.parse(localStorage.getItem('oe_a11y') || '{}');
      if (a11y.neuro_malentendant) {
        this.showBar();
      }
    } catch(e) {}
  }
};

window.LSF = LSF;

window.addEventListener('load', function() {
  setTimeout(function() { LSF.checkProfile(); }, 1000);
});
