// ═══════════════════════════════════════════════════
//  SÉCURITÉ & PROTECTION DE LA VIE PRIVÉE
//  Or Eille AI — v1.0
//  Chiffrement, authentification, anti-surveillance
// ═══════════════════════════════════════════════════

const SECURITY = {
  KEY: 'moe_security',
  SALT_KEY: 'moe_salt',

  // ─── Génération clé de chiffrement ───────────
  async generateKey(passphrase) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem(this.SALT_KEY, Array.from(salt).join(','));

    const keyMaterial = await crypto.subtle.importKey(
      'raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  },

  // ─── Chiffrer des données ─────────────────────
  async encrypt(data, key) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data))
    );
    return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
  },

  // ─── Déchiffrer des données ───────────────────
  async decrypt(encryptedData, key) {
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.parse(new TextDecoder().decode(decrypted));
  },

  // ─── PIN d'accès ──────────────────────────────
  isPinSet() { return !!localStorage.getItem('moe_pin_hash'); },

  async setPin(pin) {
    const hash = await this.hashPin(pin);
    localStorage.setItem('moe_pin_hash', hash);
  },

  async hashPin(pin) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(pin + 'moe_salt_2026'));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
  },

  async verifyPin(pin) {
    const hash = await this.hashPin(pin);
    return hash === localStorage.getItem('moe_pin_hash');
  },

  // ─── Verrouillage automatique ─────────────────
  LOCK_TIMER: null,
  lastActivity: Date.now(),

  startAutoLock(minutes = 5) {
    document.addEventListener('touchstart', () => this.resetLockTimer(minutes));
    document.addEventListener('click', () => this.resetLockTimer(minutes));
    this.resetLockTimer(minutes);
  },

  resetLockTimer(minutes) {
    this.lastActivity = Date.now();
    clearTimeout(this.LOCK_TIMER);
    this.LOCK_TIMER = setTimeout(() => this.lock(), minutes * 60000);
  },

  lock() {
    if (!this.isPinSet()) return;
    this.showLockScreen();
  },

  showLockScreen() {
    const existing = document.getElementById('lockScreen');
    if (existing) return;

    const lock = document.createElement('div');
    lock.id = 'lockScreen';
    lock.style.cssText = 'position:fixed;inset:0;background:#000;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;';
    lock.innerHTML = `
      <div style="font-size:2rem">🔒</div>
      <h2 style="font-family:'Cormorant Garamond',serif;font-style:italic;color:#c9a84c;font-size:1.3rem">Or Eille AI</h2>
      <p style="font-size:.6rem;color:rgba(240,232,216,.6);letter-spacing:.1em">Entrez votre code PIN</p>
      <div style="display:flex;gap:.5rem" id="pinDots">
        ${[0,1,2,3].map(()=>'<div style="width:12px;height:12px;border-radius:50%;border:2px solid #c9a84c;background:transparent"></div>').join('')}
      </div>
      <div id="pinDisplay" style="font-size:.7rem;color:rgba(240,232,216,.4);letter-spacing:.3em;min-height:1em"></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:.5rem">
        ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(n=>`
          <button onclick="SECURITY.pinInput('${n}')" style="width:64px;height:64px;background:${n===''?'transparent':'rgba(201,168,76,.1)'};border:${n===''?'none':'1px solid rgba(201,168,76,.3)'};color:#e8d49a;font-family:'Josefin Sans',sans-serif;font-size:${n==='⌫'?'1.2rem':'.9rem'};cursor:${n===''?'default':'pointer'};border-radius:50%">${n}</button>
        `).join('')}
      </div>
      <div id="pinError" style="font-size:.56rem;color:var(--red);min-height:1em"></div>
    `;
    document.body.appendChild(lock);
    this._pinBuffer = '';
  },

  _pinBuffer: '',
  async pinInput(val) {
    if (val === '') return;
    if (val === '⌫') {
      this._pinBuffer = this._pinBuffer.slice(0,-1);
    } else {
      this._pinBuffer += val;
    }
    // Update dots
    const dots = document.querySelectorAll('#pinDots div');
    dots.forEach((d,i) => { d.style.background = i < this._pinBuffer.length ? '#c9a84c' : 'transparent'; });

    if (this._pinBuffer.length === 4) {
      const ok = await this.verifyPin(this._pinBuffer);
      if (ok) {
        document.getElementById('lockScreen')?.remove();
        this._pinBuffer = '';
      } else {
        document.getElementById('pinError').textContent = 'Code incorrect. Réessayez.';
        this._pinBuffer = '';
        document.querySelectorAll('#pinDots div').forEach(d => d.style.background = 'transparent');
        if (navigator.vibrate) navigator.vibrate([100,50,100]);
      }
    }
  },

  // ─── Politique de confidentialité ─────────────
  PRIVACY_POLICY: `PROTECTION DE LA VIE PRIVÉE — Or Eille AI

1. AUCUNE COLLECTE DE DONNÉES
Or Eille AI ne collecte, ne stocke, ne transmet et ne vend aucune donnée personnelle sur des serveurs centraux. Toutes vos données restent exclusivement sur votre appareil.

2. AUCUN TRACKING
Pas de publicités. Pas de pixels de tracking. Pas de Google Analytics. Pas de cookies tiers. Pas de profilage comportemental.

3. CONNEXIONS EXTERNES
Les seules connexions vers l'extérieur sont les APIs que vous payez avec vos propres clés (Replicate, Claude, Remove.bg). Ces connexions sont chiffrées (HTTPS). Vos créations transitent uniquement pour être générées — elles ne sont pas conservées par ces services au-delà du traitement.

4. DONNÉES MÉDICALES ET DE SÉCURITÉ
Vos données médicales et vos contacts de confiance sont stockés uniquement sur votre appareil, chiffrés. Ils ne sont jamais transmis à aucun tiers.

5. OBLIGATION LÉGALE
En cas de procédure judiciaire formelle avec mandat légal contraignant, Or Eille AI se conformera à la loi. Or Eille AI n'a cependant aucune donnée centralisée à fournir — vos données sont sur votre appareil, pas sur nos serveurs.

6. CHIFFREMENT
Toutes les données sensibles sont chiffrées avec AES-256-GCM. Sans votre code PIN personnel, elles sont illisibles.

Or Eille AI est votre espace. Pas celui de Facebook, pas celui des gouvernements, pas celui des annonceurs.`,

  // ─── Panel sécurité ───────────────────────────
  renderPanel() {
    const pinSet = this.isPinSet();
    return `
    <div style="padding:1.1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.8rem">
      <div class="sec-title">🔒 Verrouillage</div>
      ${pinSet ? `
        <p class="note" style="color:var(--green)">✓ Code PIN configuré</p>
        <button class="btn btn-ghost" onclick="SECURITY.changePin()">Changer le code PIN</button>
      ` : `
        <p class="note">Protégez votre appli avec un code PIN à 4 chiffres.</p>
        <button class="btn btn-gold" onclick="SECURITY.setupPin()">Configurer un code PIN</button>
      `}
      <button class="btn btn-ghost" onclick="SECURITY.lock()">🔒 Verrouiller maintenant</button>

      <div class="sep"></div>
      <div class="sec-title">🛡 Fiche médicale d'urgence</div>
      <p class="note">Accessible par 4 tapes sur l'écran — même verrouillé.</p>
      <div id="medicalContent" style="flex:1">${MEDICAL.renderSetupPanel()}</div>

      <div class="sep"></div>
      <div class="sec-title">🔏 Politique de confidentialité</div>
      <pre style="font-size:.5rem;color:var(--muted);line-height:1.6;white-space:pre-wrap;background:var(--dark-mid);padding:.7rem;overflow-y:auto;max-height:150px">${this.PRIVACY_POLICY}</pre>

      <div class="sep"></div>
      <div class="sec-title" style="color:var(--red)">⚠ Zone dangereuse</div>
      <button class="btn btn-ghost" style="border-color:var(--red);color:var(--red)" onclick="if(confirm('Effacer TOUTES les données ? Cette action est irréversible.'))SECURITY.wipeAll()">
        Effacer toutes les données
      </button>
    </div>`;
  },

  setupPin() {
    const pin = prompt('Choisissez un code PIN à 4 chiffres :');
    if (!pin || pin.length !== 4 || isNaN(pin)) { alert('Code invalide. 4 chiffres requis.'); return; }
    const confirm = prompt('Confirmez votre code PIN :');
    if (pin !== confirm) { alert('Les codes ne correspondent pas.'); return; }
    this.setPin(pin).then(() => {
      alert('Code PIN configuré. L\'appli se verrouillera automatiquement après 5 minutes d\'inactivité.');
      this.startAutoLock(5);
    });
  },

  changePin() {
    const old = prompt('Entrez votre ancien code PIN :');
    this.verifyPin(old).then(ok => {
      if (!ok) { alert('Code incorrect.'); return; }
      this.setupPin();
    });
  },

  wipeAll() {
    Object.keys(localStorage).filter(k => k.startsWith('moe_')).forEach(k => localStorage.removeItem(k));
    alert('Toutes les données ont été effacées.');
    location.reload();
  }
};

window.SECURITY = SECURITY;
window.addEventListener('load', () => {
  setTimeout(() => {
    if (SECURITY.isPinSet()) SECURITY.startAutoLock(5);
  }, 1000);
});
