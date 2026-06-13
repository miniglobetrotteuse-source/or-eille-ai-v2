// ═══════════════════════════════════════════════════
//  LANGUE DES SIGNES — Intégration Elix LSF
//  Active si profil = Malentendant(e)
//  Utilise les 21 000 signes du dictionnaire Elix
//  © Madame Or Eille Studios — 2026
// ═══════════════════════════════════════════════════

const LSF = {

  ELIX_BASE: 'https://dico.elix-lsf.fr/signe/',

  // ─── Chercher n'importe quel mot sur Elix ─────
  search(word) {
    window.open(this.ELIX_BASE + encodeURIComponent(word.toLowerCase()), '_blank');
  },

  // ─── Bulle LSF au survol/clic d'un mot ────────
  showBubble(word, x, y) {
    document.querySelectorAll('.lsf-bubble').forEach(function(b) { b.remove(); });

    var bubble = document.createElement('div');
    bubble.className = 'lsf-bubble';
    bubble.style.cssText = 'position:fixed;left:' + Math.min(x, window.innerWidth - 220) + 'px;top:' + (y - 80) + 'px;background:white;border:2px solid #E0B020;border-radius:12px;padding:10px 14px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.15);';
    bubble.innerHTML = '<p style="font-family:Basteleur,serif;font-size:0.8rem;color:#1A3A8F;margin-bottom:6px;">Signe LSF : <strong>' + word + '</strong></p>' +
      '<button onclick="LSF.search(\'' + word + '\')" style="padding:5px 12px;background:#E0B020;color:#1A3A8F;border:none;border-radius:50px;font-family:Basteleur,serif;font-size:0.75rem;cursor:pointer;">Voir sur Elix ↗</button>' +
      '<button onclick="this.parentElement.remove()" style="margin-left:6px;background:none;border:none;font-size:0.9rem;cursor:pointer;color:rgba(42,42,42,.4);">×</button>';

    document.body.appendChild(bubble);
    setTimeout(function() { if (bubble.parentElement) bubble.remove(); }, 6000);
  },

  // ─── Barre de recherche LSF permanente ────────
  showBar() {
    if (document.getElementById('lsf-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'lsf-bar';
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1A3A8F;padding:8px 16px;display:flex;gap:8px;align-items:center;z-index:9998;';
    bar.innerHTML = '<span style="color:#E0B020;font-family:Basteleur,serif;font-size:0.75rem;white-space:nowrap;">🤲 LSF</span>' +
      '<div style="flex:1;display:flex;gap:6px;">' +
        '<input id="lsf-search-input" type="text" placeholder="Chercher un signe..." style="flex:1;padding:6px 10px;border:none;border-radius:50px;font-size:0.8rem;outline:none;" onkeydown="if(event.key===\'Enter\') LSF.search(this.value)"/>' +
        '<button onclick="LSF.search(document.getElementById(\'lsf-search-input\').value)" style="padding:6px 14px;background:#E0B020;color:#1A3A8F;border:none;border-radius:50px;font-family:Basteleur,serif;font-size:0.75rem;cursor:pointer;">Voir</button>' +
      '</div>' +
      '<button onclick="LSF.hideBar()" style="background:none;border:none;color:rgba(255,255,255,.5);font-size:1rem;cursor:pointer;">×</button>';

    document.body.appendChild(bar);
    document.body.style.paddingBottom = '52px';
  },

  hideBar() {
    var bar = document.getElementById('lsf-bar');
    if (bar) bar.remove();
    document.body.style.paddingBottom = '';
  },

  // ─── Mode LSF complet : tous les textes cliquables ──
  enableTextClick() {
    document.querySelectorAll('p, h1, h2, h3, button, label, span, a').forEach(function(el) {
      el.style.cursor = 'help';
      el.addEventListener('click', function(e) {
        var word = el.textContent.trim().split(' ')[0].replace(/[^a-zA-ZÀ-ÿ]/g, '');
        if (word.length > 2) {
          LSF.showBubble(word, e.clientX, e.clientY);
        }
      });
    });
  },

  // ─── Vérifier le profil au chargement ─────────
  checkProfile() {
    try {
      var a11y = JSON.parse(localStorage.getItem('oe_a11y') || '{}');
      if (a11y.neuro_malentendant) {
        this.showBar();
        this.enableTextClick();
      }
    } catch(e) {}
  }
};

window.LSF = LSF;

window.addEventListener('load', function() {
  setTimeout(function() { LSF.checkProfile(); }, 1000);
});
