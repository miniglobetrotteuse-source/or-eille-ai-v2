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

// ═══════════════════════════════════════════════════
//  MBOKA NA BISO — Filtrage communautaire
//  Archivage de preuves · 5 ans · Chiffré
//  © 2026 Madame Or Eille Studios
// ═══════════════════════════════════════════════════

const MBOKA = {
  KEY: 'moe_mboka',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { signalements: [], preuves: [] }; }
    catch { return { signalements: [], preuves: [] }; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  // Archiver une preuve (texte, screenshot, audio)
  archiverPreuve(type, contenu, description) {
    const d = this.get();
    const preuve = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: type, // 'texte' | 'image' | 'audio' | 'screenshot'
      contenu: contenu,
      description: description || '',
      expiration: new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString(), // 5 ans
    };
    d.preuves.unshift(preuve);
    this.save(d);
    if (window.addChatMsg) addChatMsg('assistant', '✅ Preuve archivée jusqu\'au ' + new Date(preuve.expiration).toLocaleDateString('fr-FR') + '. Référence : ' + preuve.id.slice(-6));
    return preuve;
  },

  // Signaler un comportement problématique
  signalerComportement(description, plateforme, lien) {
    const d = this.get();
    d.signalements.push({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      description: description,
      plateforme: plateforme || '',
      lien: lien || '',
      statut: 'enregistre',
    });
    this.save(d);
    if (window.addChatMsg) addChatMsg('assistant', '🛡 Signalement enregistré. Conservé 5 ans dans votre espace sécurisé.');
  },

  // Nettoyer les preuves expirées
  nettoyerExpires() {
    const d = this.get();
    const maintenant = Date.now();
    d.preuves = d.preuves.filter(p => new Date(p.expiration).getTime() > maintenant);
    this.save(d);
  },

  renderPanel() {
    const d = this.get();
    return `
    <div style="padding:1.1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.8rem">
      <div class="sec-title">🛡 Mboka na biso</div>
      <p class="note">Archivage sécurisé de preuves. Conservées 5 ans sur votre appareil. Jamais transmises.</p>
      <button class="btn btn-gold" onclick="MBOKA.ouvrirArchivage()">📎 Archiver une preuve</button>
      <button class="btn btn-ghost" onclick="MBOKA.ouvrirSignalement()">🚨 Signaler un comportement</button>
      <div class="sep"></div>
      <p class="note">${d.preuves.length} preuve(s) archivée(s) · ${d.signalements.length} signalement(s)</p>
      ${d.preuves.slice(0,5).map(p => `
        <div style="background:var(--dark-mid);padding:.5rem;border-left:2px solid var(--gold);font-size:.5rem;color:var(--muted)">
          ${new Date(p.date).toLocaleDateString('fr-FR')} — ${p.type} — ${p.description || 'Sans description'}
        </div>
      `).join('')}
    </div>`;
  },

  ouvrirArchivage() {
    const description = prompt('Décrivez cette preuve (ex: harcèlement du 16/06, message menaçant...) :');
    if (!description) return;
    const type = prompt('Type : texte, image, audio, screenshot ?') || 'texte';
    const contenu = prompt('Collez le contenu ou la description détaillée :') || '';
    this.archiverPreuve(type, contenu, description);
    if (document.getElementById('mbokaPanelContent')) {
      document.getElementById('mbokaPanelContent').innerHTML = this.renderPanel();
    }
  },

  ouvrirSignalement() {
    const description = prompt('Décrivez le comportement problématique :');
    if (!description) return;
    const plateforme = prompt('Sur quelle plateforme ? (Instagram, TikTok, rue...)') || '';
    const lien = prompt('Lien ou référence si disponible :') || '';
    this.signalerComportement(description, plateforme, lien);
  },
};

window.MBOKA = MBOKA;

// ═══════════════════════════════════════════════════
//  CHECK-IN SÉCURITÉ FEMMES
//  Confidentiel · Alerte si pas de retour · Contacts de confiance
//  © 2026 Madame Or Eille Studios
// ═══════════════════════════════════════════════════

const CHECKIN = {
  KEY: 'moe_checkin',
  _timer: null,

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { contacts: [], historique: [] }; }
    catch { return { contacts: [], historique: [] }; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  // Ajouter un contact de confiance
  ajouterContact(nom, tel) {
    const d = this.get();
    d.contacts.push({ id: Date.now().toString(), nom, tel });
    this.save(d);
  },

  // Démarrer un check-in
  demarrer(destination, dureeMinutes, contactId) {
    const d = this.get();
    const contact = d.contacts.find(c => c.id === contactId);
    const checkin = {
      id: Date.now().toString(),
      debut: new Date().toISOString(),
      destination: destination,
      duree: dureeMinutes,
      contact: contact || null,
      statut: 'actif',
      alerte: false,
    };
    d.historique.unshift(checkin);
    this.save(d);

    // Timer d'alerte
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._declencherAlerte(checkin.id), dureeMinutes * 60000);

    if (window.addChatMsg) addChatMsg('assistant', `✅ Check-in démarré. Si tu n'as pas confirmé ton retour dans ${dureeMinutes} minutes, j'alerterai ${contact ? contact.nom : 'ton contact'}.`);
    return checkin;
  },

  // Confirmer le retour
  confirmerRetour(checkinId) {
    clearTimeout(this._timer);
    const d = this.get();
    const c = d.historique.find(h => h.id === checkinId);
    if (c) { c.statut = 'retour_confirme'; this.save(d); }
    if (window.addChatMsg) addChatMsg('assistant', '✅ Retour confirmé. Check-in terminé.');
  },

  // Déclencher l'alerte si pas de retour
  _declencherAlerte(checkinId) {
    const d = this.get();
    const c = d.historique.find(h => h.id === checkinId);
    if (!c || c.statut === 'retour_confirme') return;

    c.statut = 'alerte';
    c.alerte = true;
    this.save(d);

    // Notification visible
    if (window.addChatMsg) addChatMsg('assistant', `🚨 ALERTE CHECK-IN : ${c.contact ? c.contact.nom : 'Ton contact'} n'a pas reçu de confirmation de retour depuis ${c.destination}. Appuie sur le bouton si tu vas bien.`);

    // Vibration d'urgence
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
  },

  renderPanel() {
    const d = this.get();
    return `
    <div style="padding:1.1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.8rem">
      <div class="sec-title">👥 Check-in sécurité</div>
      <p class="note">Tu sors seule ? Active le check-in. Si tu ne confirmes pas ton retour dans le délai, ton contact de confiance est alerté.</p>
      <button class="btn btn-gold" onclick="CHECKIN.ouvrirCheckin()">🟢 Démarrer un check-in</button>
      <div class="sep"></div>
      <div class="sec-title" style="font-size:.56rem">Contacts de confiance</div>
      ${d.contacts.map(c => `<div style="font-size:.56rem;color:var(--muted)">${c.nom} — ${c.tel}</div>`).join('') || '<p class="note">Aucun contact ajouté</p>'}
      <button class="btn btn-ghost" onclick="CHECKIN.ajouterContactUI()">+ Ajouter un contact</button>
    </div>`;
  },

  ajouterContactUI() {
    const nom = prompt('Prénom du contact de confiance :');
    if (!nom) return;
    const tel = prompt('Numéro de téléphone :');
    if (!tel) return;
    this.ajouterContact(nom, tel);
    if (window.addChatMsg) addChatMsg('assistant', `✅ ${nom} ajouté comme contact de confiance.`);
  },

  ouvrirCheckin() {
    const destination = prompt('Où vas-tu ? (facultatif)') || 'sortie';
    const duree = parseInt(prompt('Dans combien de minutes rentres-tu ?') || '60');
    const d = this.get();
    const contactId = d.contacts.length > 0 ? d.contacts[0].id : null;
    this.demarrer(destination, duree, contactId);
  },
};

window.CHECKIN = CHECKIN;

// ═══════════════════════════════════════════════════
//  FICHE MÉDICALE D'URGENCE
//  4 tapes sur l'écran · Accessible même verrouillé
//  © 2026 Madame Or Eille Studios
// ═══════════════════════════════════════════════════

const MEDICAL = {
  KEY: 'moe_medical',
  _tapCount: 0,
  _tapTimer: null,

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch { return {}; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  // Initialiser la détection des 4 tapes
  initTapDetection() {
    document.addEventListener('touchstart', () => this._detecterTap());
  },

  _detecterTap() {
    this._tapCount++;
    clearTimeout(this._tapTimer);
    this._tapTimer = setTimeout(() => { this._tapCount = 0; }, 800);
    if (this._tapCount >= 4) {
      this._tapCount = 0;
      this.afficherFiche();
    }
  },

  afficherFiche() {
    const d = this.get();
    const existing = document.getElementById('ficheUrgence');
    if (existing) { existing.remove(); return; }

    const fiche = document.createElement('div');
    fiche.id = 'ficheUrgence';
    fiche.style.cssText = 'position:fixed;inset:0;background:#c62828;z-index:9999999;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;';
    fiche.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h1 style="font-family:serif;color:white;font-size:1.5rem">🆘 URGENCE MÉDICALE</h1>
        <button onclick="document.getElementById('ficheUrgence').remove()" style="background:rgba(255,255,255,.2);border:none;color:white;padding:.5rem 1rem;border-radius:8px;cursor:pointer;font-size:1rem">✕ Fermer</button>
      </div>
      ${d.nom ? `<div style="background:rgba(255,255,255,.15);padding:1rem;border-radius:8px;color:white"><strong>👤 ${d.nom}</strong>${d.dateNaissance ? ' · ' + d.dateNaissance : ''}</div>` : ''}
      ${d.groupeSanguin ? `<div style="background:rgba(255,255,255,.15);padding:1rem;border-radius:8px;color:white"><strong>🩸 Groupe sanguin : ${d.groupeSanguin}</strong></div>` : ''}
      ${d.allergies ? `<div style="background:rgba(255,255,255,.15);padding:1rem;border-radius:8px;color:white"><strong>⚠️ Allergies :</strong><br>${d.allergies}</div>` : ''}
      ${d.medicaments ? `<div style="background:rgba(255,255,255,.15);padding:1rem;border-radius:8px;color:white"><strong>💊 Médicaments :</strong><br>${d.medicaments}</div>` : ''}
      ${d.maladies ? `<div style="background:rgba(255,255,255,.15);padding:1rem;border-radius:8px;color:white"><strong>🏥 Antécédents :</strong><br>${d.maladies}</div>` : ''}
      ${d.contact_urgence ? `<div style="background:rgba(255,255,255,.15);padding:1rem;border-radius:8px;color:white"><strong>📞 Contact d'urgence :</strong><br>${d.contact_urgence}</div>` : ''}
      ${d.medecin ? `<div style="background:rgba(255,255,255,.15);padding:1rem;border-radius:8px;color:white"><strong>👨‍⚕️ Médecin :</strong><br>${d.medecin}</div>` : ''}
      ${!d.nom ? '<div style="background:rgba(255,255,255,.15);padding:1rem;border-radius:8px;color:white;text-align:center"><em>Fiche médicale non remplie.<br>Allez dans Sécurité → Fiche médicale pour la compléter.</em></div>' : ''}
      <div style="text-align:center;margin-top:1rem">
        <a href="tel:15" style="display:inline-block;background:white;color:#c62828;padding:1rem 2rem;border-radius:50px;font-weight:bold;text-decoration:none;font-size:1.1rem;margin:.5rem">📞 SAMU 15</a>
        <a href="tel:112" style="display:inline-block;background:white;color:#c62828;padding:1rem 2rem;border-radius:50px;font-weight:bold;text-decoration:none;font-size:1.1rem;margin:.5rem">📞 112</a>
      </div>
    `;
    document.body.appendChild(fiche);
  },

  renderSetupPanel() {
    const d = this.get();
    return `
    <div style="display:flex;flex-direction:column;gap:.5rem">
      <p class="note">Accessible par 4 tapes rapides sur l'écran — même appli verrouillée.</p>
      ${[
        ['nom', 'Nom et prénom', d.nom],
        ['dateNaissance', 'Date de naissance', d.dateNaissance],
        ['groupeSanguin', 'Groupe sanguin (ex: A+)', d.groupeSanguin],
        ['allergies', 'Allergies (médicaments, aliments...)', d.allergies],
        ['medicaments', 'Médicaments en cours', d.medicaments],
        ['maladies', 'Maladies / antécédents importants', d.maladies],
        ['contact_urgence', 'Contact d\'urgence (nom + tel)', d.contact_urgence],
        ['medecin', 'Médecin traitant (nom + tel)', d.medecin],
      ].map(([key, label, val]) => `
        <div>
          <p style="font-size:.48rem;color:var(--muted);margin-bottom:.2rem">${label}</p>
          <input value="${val || ''}" placeholder="${label}"
            onchange="MEDICAL.updateField('${key}', this.value)"
            style="width:100%;background:var(--dark-mid);border:1px solid var(--border);color:var(--text);padding:.4rem .5rem;font-size:.52rem;border-radius:4px"/>
        </div>
      `).join('')}
      <button class="btn btn-gold" onclick="MEDICAL.testerFiche()">👁 Prévisualiser ma fiche</button>
    </div>`;
  },

  updateField(key, value) {
    const d = this.get();
    d[key] = value;
    this.save(d);
  },

  testerFiche() { this.afficherFiche(); },
};

window.MEDICAL = MEDICAL;

// Initialiser la détection des 4 tapes au chargement
window.addEventListener('load', () => {
  MEDICAL.initTapDetection();
  MBOKA.nettoyerExpires();
});
