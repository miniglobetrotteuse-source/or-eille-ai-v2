// ═══════════════════════════════════════════════════
//  CONFIGURATEUR ACCESSIBILITÉ — Or Eille AI v2.0
//  Première ouverture guidée vocalement + LSF
//  © 2026 Madame Or Eille Studios
// ═══════════════════════════════════════════════════

const A11Y_CONFIG = {
  KEY: 'moe_a11y_config',
  DONE_KEY: 'moe_a11y_done',

  defaults() {
    return {
      fontSize: 'normal', lineHeight: 'normal',
      dyslexiaFont: false, contrast: 'normal',
      volume: 'normal', speechRate: 'normal',
      speechDelay: 5, vibration: false,
      brightness: 'normal', buttonSize: 'normal',
      colorBlind: false, signLanguage: false,
      signPosition: 'bottom-right', voiceGuide: true,
    };
  },

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || this.defaults(); }
    catch { return this.defaults(); }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },
  isConfigured() { return localStorage.getItem(this.DONE_KEY) === 'done'; },
  markConfigured() { localStorage.setItem(this.DONE_KEY, 'done'); },

  // ─── Appliquer la configuration ───────────────
  apply() {
    const d = this.get();
    const root = document.documentElement;
    const fontSizes = { small: '14px', normal: '16px', large: '20px', xlarge: '24px' };
    const lineHeights = { tight: '1.4', normal: '1.7', airy: '2.1', veryairy: '2.6' };
    const btnSizes = { normal: '.58rem', large: '.74rem', xlarge: '.9rem' };
    root.style.setProperty('--base-font', fontSizes[d.fontSize] || '16px');
    root.style.setProperty('--line-h', lineHeights[d.lineHeight] || '1.7');
    root.style.setProperty('--btn-size', btnSizes[d.buttonSize] || '.58rem');
    if (d.dyslexiaFont) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600&display=swap';
      document.head.appendChild(l);
    }
    if (d.contrast === 'high') root.style.filter = 'contrast(1.3)';
    if (d.contrast === 'max') root.style.filter = 'contrast(1.6)';
    if (d.colorBlind) root.style.filter = (root.style.filter||'') + ' grayscale(0.3)';
    if (d.signLanguage) this.initSignCorner(d.signPosition);
  },

  // ─── Parler ───────────────────────────────────
  speak(text) {
    const d = this.get();
    if (!d.voiceGuide || !window.speechSynthesis) return;
    const rates = { slow: 0.65, normal: 0.9, fast: 1.2 };
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'fr-FR';
    utt.rate = rates[d.speechRate] || 0.9;
    utt.volume = d.volume === 'low' ? 0.5 : d.volume === 'high' ? 1 : 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  },

  // ─── Avatar LSF dans le coin ──────────────────
  initSignCorner(pos) {
    const positions = {
      'bottom-right': 'bottom:70px;right:8px',
      'bottom-left': 'bottom:70px;left:8px',
      'top-right': 'top:60px;right:8px',
      'top-left': 'top:60px;left:8px',
    };
    let el = document.getElementById('sign-corner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sign-corner';
      document.body.appendChild(el);
    }
    el.style.cssText = `position:fixed;${positions[pos]||positions['bottom-right']};width:72px;height:72px;z-index:8500;background:#F7F4EF;border:2px solid #C4993A;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;animation:pulse 2s infinite`;
    el.innerHTML = '<span style="font-size:1.8rem">👐</span>';
    el.title = 'Langue des signes';
    el.onclick = () => {
      if (window.addChatMsg) addChatMsg('assistant', 'L\'avatar en langue des signes sera disponible prochainement. Nous travaillons avec des partenaires communautaires pour garantir la qualité et le respect de chaque langue des signes.');
    };
  },

  // ─── Première ouverture ───────────────────────
  showSetup() {
    const overlay = document.createElement('div');
    overlay.id = 'a11y-setup';
    overlay.style.cssText = 'position:fixed;inset:0;background:#F7F4EF;z-index:999999;overflow-y:auto';

    overlay.innerHTML = `
    <div style="max-width:420px;margin:0 auto;padding:1.5rem;min-height:100vh;display:flex;flex-direction:column">

      <!-- Logo animé -->
      <div style="text-align:center;padding:2rem 0 1rem">
        <div id="sign-logo" style="font-size:5rem;animation:pulse 2s infinite;display:inline-block">👂</div>
        <h1 style="font-family:'Basteleur',serif;font-style:italic;color:#C4993A;font-size:1.6rem;margin:.5rem 0 .2rem">Or Eille AI</h1>
        <p style="font-size:.54rem;color:rgba(42,42,42,.5);letter-spacing:.15em;text-transform:uppercase">Bienvenue dans la grande famille</p>
      </div>

      <!-- Message d'accueil -->
      <div style="background:linear-gradient(135deg,rgba(26,22,16,.98),rgba(44,35,24,.95));border:1px solid rgba(196,153,58,.4);padding:1rem;margin-bottom:1.2rem;position:relative;overflow:hidden">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none"><div style="font-size:8rem;opacity:.04;color:#C4993A;transform:rotate(-15deg)">👂</div></div>
        <p style="font-size:.58rem;color:#2a2a2a;line-height:1.9;position:relative;z-index:1">
          Nous sommes ravis de vous accueillir. Or Eille AI s'adapte à vous — pas l'inverse.<br/><br/>
          Prenez deux minutes maintenant pour configurer votre interface. <strong style="color:#C4993A">Une seule fois.</strong> Et c'est réglé pour toujours.
        </p>
        <p style="font-size:.44rem;color:rgba(196,153,58,.45);text-align:right;margin-top:.5rem;font-family:'Basteleur',serif;font-style:italic;position:relative;z-index:1">— Madame Or Eille Studios</p>
      </div>

      <!-- Section TEXTE -->
      <div class="setup-section">
        <div style="font-size:.5rem;color:#C4993A;letter-spacing:.15em;text-transform:uppercase;margin-bottom:.6rem">📝 Texte</div>

        <div class="setup-row">
          <span class="setup-label">Taille de la police</span>
          <div class="setup-options">
            ${['small:A petit','normal:A normal','large:A grand','xlarge:A très grand'].map(o => {
              const [v,l] = o.split(':');
              return `<button class="setup-opt" data-key="fontSize" data-val="${v}" onclick="A11Y_CONFIG.selectOpt(this,'fontSize','${v}')">${l}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="setup-row">
          <span class="setup-label">Espacement des lignes</span>
          <div class="setup-options">
            ${['tight:Serré','normal:Normal','airy:Aéré','veryairy:Très aéré'].map(o => {
              const [v,l] = o.split(':');
              return `<button class="setup-opt" data-key="lineHeight" data-val="${v}" onclick="A11Y_CONFIG.selectOpt(this,'lineHeight','${v}')">${l}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="setup-row">
          <span class="setup-label">Police adaptée dyslexie</span>
          <div class="setup-options">
            <button class="setup-opt" data-key="dyslexiaFont" data-val="false" onclick="A11Y_CONFIG.selectOpt(this,'dyslexiaFont',false)">Non</button>
            <button class="setup-opt" data-key="dyslexiaFont" data-val="true" onclick="A11Y_CONFIG.selectOpt(this,'dyslexiaFont',true)">Oui — Lexend</button>
          </div>
        </div>

        <div class="setup-row">
          <span class="setup-label">Contraste</span>
          <div class="setup-options">
            ${['normal:Normal','high:Renforcé','max:Maximum'].map(o => {
              const [v,l] = o.split(':');
              return `<button class="setup-opt" data-key="contrast" data-val="${v}" onclick="A11Y_CONFIG.selectOpt(this,'contrast','${v}')">${l}</button>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Section SON -->
      <div class="setup-section">
        <div style="font-size:.5rem;color:#C4993A;letter-spacing:.15em;text-transform:uppercase;margin-bottom:.6rem">🔊 Son</div>

        <div class="setup-row">
          <span class="setup-label">Guide vocal à l'écran</span>
          <div class="setup-options">
            <button class="setup-opt active" data-key="voiceGuide" data-val="true" onclick="A11Y_CONFIG.selectOpt(this,'voiceGuide',true)">Activé</button>
            <button class="setup-opt" data-key="voiceGuide" data-val="false" onclick="A11Y_CONFIG.selectOpt(this,'voiceGuide',false)">Désactivé</button>
          </div>
        </div>

        <div class="setup-row">
          <span class="setup-label">Vitesse de lecture</span>
          <div class="setup-options">
            ${['slow:Lente','normal:Normale','fast:Rapide'].map(o => {
              const [v,l] = o.split(':');
              return `<button class="setup-opt" data-key="speechRate" data-val="${v}" onclick="A11Y_CONFIG.selectOpt(this,'speechRate','${v}')">${l}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="setup-row">
          <span class="setup-label">Vibrations à la place des sons</span>
          <div class="setup-options">
            <button class="setup-opt active" data-key="vibration" data-val="false" onclick="A11Y_CONFIG.selectOpt(this,'vibration',false)">Non</button>
            <button class="setup-opt" data-key="vibration" data-val="true" onclick="A11Y_CONFIG.selectOpt(this,'vibration',true)">Oui</button>
          </div>
        </div>
      </div>

      <!-- Section VISUEL -->
      <div class="setup-section">
        <div style="font-size:.5rem;color:#C4993A;letter-spacing:.15em;text-transform:uppercase;margin-bottom:.6rem">💡 Visuel</div>

        <div class="setup-row">
          <span class="setup-label">Taille des boutons</span>
          <div class="setup-options">
            ${['normal:Normale','large:Grande','xlarge:Très grande'].map(o => {
              const [v,l] = o.split(':');
              return `<button class="setup-opt" data-key="buttonSize" data-val="${v}" onclick="A11Y_CONFIG.selectOpt(this,'buttonSize','${v}')">${l}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="setup-row">
          <span class="setup-label">Mode daltonisme</span>
          <div class="setup-options">
            <button class="setup-opt active" data-key="colorBlind" data-val="false" onclick="A11Y_CONFIG.selectOpt(this,'colorBlind',false)">Non</button>
            <button class="setup-opt" data-key="colorBlind" data-val="true" onclick="A11Y_CONFIG.selectOpt(this,'colorBlind',true)">Oui</button>
          </div>
        </div>
      </div>

      <!-- Section AVATAR LSF -->
      <div class="setup-section">
        <div style="font-size:.5rem;color:#C4993A;letter-spacing:.15em;text-transform:uppercase;margin-bottom:.6rem">👐 Langue des signes</div>

        <div class="setup-row">
          <span class="setup-label">Avatar langue des signes</span>
          <div class="setup-options">
            <button class="setup-opt active" data-key="signLanguage" data-val="false" onclick="A11Y_CONFIG.selectOpt(this,'signLanguage',false)">Non</button>
            <button class="setup-opt" data-key="signLanguage" data-val="true" onclick="A11Y_CONFIG.selectOpt(this,'signLanguage',true)">Oui</button>
          </div>
        </div>

        <div class="setup-row" id="sign-pos-row" style="display:none">
          <span class="setup-label">Position de l'avatar</span>
          <div class="setup-options">
            ${['bottom-right:Bas droite','bottom-left:Bas gauche','top-right:Haut droite','top-left:Haut gauche'].map(o => {
              const [v,l] = o.split(':');
              return `<button class="setup-opt" data-key="signPosition" data-val="${v}" onclick="A11Y_CONFIG.selectOpt(this,'signPosition','${v}')">${l}</button>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Bouton valider -->
      <button onclick="A11Y_CONFIG.finishSetup()" style="width:100%;padding:1rem;background:#C4993A;color:#0F0F0F;border:none;font-family:'Basteleur',serif;font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;margin-top:1rem;animation:pulse 2s infinite">
        ✓ C'est parti — commencer à créer
      </button>

      <button onclick="A11Y_CONFIG.skipSetup()" style="width:100%;padding:.6rem;background:transparent;border:none;color:rgba(240,232,216,.3);font-family:'Basteleur',serif;font-size:.5rem;cursor:pointer;margin-top:.4rem">
        Passer la configuration — je règlerai ça plus tard
      </button>

      <p style="text-align:center;font-size:.44rem;color:rgba(196,153,58,.35);margin-top:1rem;font-family:'Basteleur',serif;font-style:italic">
        Nous vous souhaitons de belles créations et de grands moments.<br/>
        — Madame Or Eille Studios
      </p>
    </div>

    <style>
      .setup-section { background:rgba(255,255,255,.02);border:1px solid rgba(196,153,58,.15);padding:.8rem;margin-bottom:.8rem; }
      .setup-row { margin-bottom:.6rem; }
      .setup-label { font-size:.52rem;color:rgba(240,232,216,.6);display:block;margin-bottom:.3rem;font-family:'Basteleur',serif; }
      .setup-options { display:flex;gap:.3rem;flex-wrap:wrap; }
      .setup-opt { padding:.35rem .6rem;background:rgba(255,255,255,.04);border:1px solid rgba(196,153,58,.2);color:rgba(42,42,42,.5);font-family:'Basteleur',serif;font-size:.5rem;cursor:pointer;transition:all .2s; }
      .setup-opt.active { background:rgba(196,153,58,.2);border-color:#C4993A;color:#C4993A; }
      .setup-opt:hover { border-color:rgba(196,153,58,.5);color:rgba(240,232,216,.8); }
    </style>`;

    document.body.appendChild(overlay);

    // Guide vocal d'accueil
    setTimeout(() => {
      this.speak('Bienvenue dans la grande famille Or Eille AI. Nous sommes ravis de vous accueillir. Configurez votre interface une seule fois et elle s\'en souviendra pour toujours. Appuyez sur chaque option pour choisir vos préférences.');
    }, 800);

    // Marquer les options par défaut
    setTimeout(() => {
      document.querySelectorAll('.setup-opt[data-val="normal"], .setup-opt[data-val="false"]').forEach(btn => {
        if (!btn.classList.contains('active')) btn.classList.add('active');
      });
    }, 100);
  },

  selectOpt(btn, key, val) {
    // Retirer active des autres boutons du même groupe
    document.querySelectorAll(`.setup-opt[data-key="${key}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Sauvegarder
    const d = this.get();
    if (val === 'true' || val === true) d[key] = true;
    else if (val === 'false' || val === false) d[key] = false;
    else d[key] = val;
    this.save(d);

    // Montrer position avatar si LSF activé
    if (key === 'signLanguage') {
      const row = document.getElementById('sign-pos-row');
      if (row) row.style.display = (val === true || val === 'true') ? 'block' : 'none';
    }

    // Appliquer en temps réel
    this.apply();
    this.speak(btn.textContent);
  },

  finishSetup() {
    this.markConfigured();
    const overlay = document.getElementById('a11y-setup');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .5s';
      setTimeout(() => overlay.remove(), 500);
    }
    this.apply();
    setTimeout(() => {
      this.speak('Parfait. Bienvenue dans la grande famille Or Eille AI. Nous vous souhaitons de belles créations et de grands moments.');
      if (window.WELCOME) WELCOME.showCelebration();
    }, 600);
  },

  skipSetup() {
    this.markConfigured();
    const overlay = document.getElementById('a11y-setup');
    if (overlay) overlay.remove();
    this.apply();
  },

  // ─── Init au chargement ───────────────────────
  init() {
    this.apply();
    if (!this.isConfigured()) {
      setTimeout(() => this.showSetup(), 1000);
    }
  }
};

window.A11Y_CONFIG = A11Y_CONFIG;

