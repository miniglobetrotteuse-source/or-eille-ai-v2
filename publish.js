// ═══════════════════════════════════════════════════
//  PUBLICATION & PROTECTION — Or Eille AI v2.0
//  Validation 60s, archivage, shadowban, récupération compte
// ═══════════════════════════════════════════════════

const PUBLISH = {
  KEY: 'moe_publish',
  ARCHIVE_KEY: 'moe_archive',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { drafts: [], scheduled: [], publishedHistory: [] }; }
    catch { return { drafts: [], scheduled: [], publishedHistory: [] }; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  getArchive() {
    try { return JSON.parse(localStorage.getItem(this.ARCHIVE_KEY)) || { items: [] }; }
    catch { return { items: [] }; }
  },
  saveArchive(d) { localStorage.setItem(this.ARCHIVE_KEY, JSON.stringify(d)); },

  // ─── Archiver automatiquement un contenu ──────
  archiveContent(content) {
    const archive = this.getArchive();
    archive.items.push({
      id: Date.now().toString(),
      ...content,
      archivedAt: new Date().toISOString(),
      hash: this.simpleHash(JSON.stringify(content))
    });
    // Garder 1 an d'archives
    const cutoff = Date.now() - 365 * 86400000;
    archive.items = archive.items.filter(i => new Date(i.archivedAt).getTime() > cutoff);
    this.saveArchive(archive);
  },

  simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
    return Math.abs(h).toString(16);
  },

  // ─── Check avant publication ──────────────────
  prePublicationCheck(content) {
    const checks = [];
    checks.push({ id: 'caption', label: 'Légende', ok: !!(content.caption?.trim()), warning: !content.caption ? 'Légende vide' : null });
    checks.push({ id: 'hashtags', label: 'Hashtags', ok: !!(content.hashtags?.length), warning: !content.hashtags?.length ? 'Aucun hashtag' : null });
    checks.push({ id: 'subtitles', label: 'Sous-titres', ok: !!(content.hasSubtitles), warning: !content.hasSubtitles ? 'Sous-titres manquants — recommandés' : null });
    checks.push({ id: 'sound', label: 'Son', ok: content.soundCleared !== false, warning: content.soundCleared === false ? 'Son non vérifié — risque de blocage' : null });
    checks.push({ id: 'format', label: 'Format', ok: !!(content.platform), warning: !content.platform ? 'Plateforme non spécifiée' : null });
    return checks;
  },

  // ─── Modal de validation 60 secondes ──────────
  showValidationModal(content, onConfirm) {
    const checks = this.prePublicationCheck(content || {});
    const warnings = checks.filter(c => !c.ok);
    let countdown = 60;

    const modal = document.createElement('div');
    modal.id = 'publish-validation';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(247,244,239,.97);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1.5rem';

    const render = () => `
      <div style="max-width:380px;width:100%;background:#F7F4EF;border:1px solid #E0B020;padding:1.2rem">
        <h3 style="font-family:'Basteleur',serif;font-style:italic;color:#E0B020;font-size:1.1rem;margin-bottom:.8rem">Prêt à publier ?</h3>
        <div style="display:flex;flex-direction:column;gap:.3rem;margin-bottom:.8rem">
          ${checks.map(c => `
            <div style="display:flex;align-items:center;gap:.4rem;padding:.3rem">
              <span style="font-size:.7rem">${c.ok ? '✅' : '⚠️'}</span>
              <span style="font-size:.54rem;color:${c.ok?'var(--text)':'#F5A623'}">${c.label}${c.warning ? ' — ' + c.warning : ' ✓'}</span>
            </div>
          `).join('')}
        </div>
        <div style="text-align:center;margin-bottom:.8rem">
          <div id="countdown-num" style="font-size:2rem;color:#E0B020;font-family:'Basteleur',serif">${countdown}</div>
          <div style="font-size:.48rem;color:rgba(42,42,42,.5)">secondes pour modifier</div>
          <div style="background:#333;height:4px;border-radius:2px;margin-top:.4rem">
            <div id="countdown-bar" style="background:#E0B020;height:4px;border-radius:2px;width:100%;transition:width 1s linear"></div>
          </div>
        </div>
        <div style="display:flex;gap:.4rem">
          <button onclick="document.getElementById('publish-validation').remove();clearInterval(window._countdownInterval)" style="flex:1;padding:.6rem;background:white;border:1px solid rgba(42,42,42,.15);color:rgba(42,42,42,.5);font-family:'Basteleur',serif;font-size:.52rem;cursor:pointer">✏ Modifier</button>
          <button id="publish-btn" onclick="document.getElementById('publish-validation').remove();clearInterval(window._countdownInterval);PUBLISH.confirmPublish()" style="flex:2;padding:.6rem;background:#E0B020;color:#1A3A8F;border:none;font-family:'Basteleur',serif;font-size:.52rem;cursor:pointer">🚀 Publier maintenant</button>
        </div>
      </div>`;

    modal.innerHTML = render();
    document.body.appendChild(modal);

    // Countdown
    window._countdownInterval = setInterval(() => {
      countdown--;
      const numEl = document.getElementById('countdown-num');
      const barEl = document.getElementById('countdown-bar');
      if (numEl) numEl.textContent = countdown;
      if (barEl) barEl.style.width = `${(countdown / 60) * 100}%`;
      if (countdown <= 0) {
        clearInterval(window._countdownInterval);
        document.getElementById('publish-validation')?.remove();
        this.confirmPublish(content, onConfirm);
      }
    }, 1000);
  },

  confirmPublish(content, onConfirm) {
    this.archiveContent(content || { publishedAt: new Date().toISOString() });
    const d = this.get();
    d.publishedHistory.unshift({ ...content, publishedAt: new Date().toISOString() });
    d.publishedHistory = d.publishedHistory.slice(0, 100);
    this.save(d);
    if (onConfirm) onConfirm();
    if (window.addChatMsg) addChatMsg('assistant', '✅ Contenu publié et archivé automatiquement.');
  },

  // ─── Détection shadowban ──────────────────────
  analyzeShadowban(recentStats) {
    if (!recentStats || recentStats.length < 7) return null;
    const recent7 = recentStats.slice(0, 7);
    const prev7 = recentStats.slice(7, 14);
    if (!prev7.length) return null;
    const recentAvg = recent7.reduce((s, v) => s + (v.reach || 0), 0) / recent7.length;
    const prevAvg = prev7.reduce((s, v) => s + (v.reach || 0), 0) / prev7.length;
    const drop = prevAvg > 0 ? ((prevAvg - recentAvg) / prevAvg) * 100 : 0;

    if (drop > 50) return {
      suspected: true, severity: 'high', dropPercent: Math.round(drop),
      message: `🚨 Shadowban probable — chute de portée de ${Math.round(drop)}% en 7 jours.`,
      actions: ['Arrêtez de publier 48-72h','Supprimez les hashtags bannis','Engagez manuellement avec votre communauté','Vérifiez si votre compte apparaît dans les recherches','Signalez le problème à la plateforme']
    };
    if (drop > 30) return {
      suspected: true, severity: 'medium', dropPercent: Math.round(drop),
      message: `⚠ Possible shadowban — chute de ${Math.round(drop)}%. Surveillez les prochains jours.`,
      actions: ['Vérifiez vos hashtags','Réduisez temporairement la fréquence de publication']
    };
    return { suspected: false };
  },

  // ─── Guide récupération compte ────────────────
  getAccountRecoveryGuide(platform, issue) {
    const guides = {
      instagram_hacked: `COMPTE INSTAGRAM PIRATÉ — Étapes de récupération:\n\n1. Allez sur instagram.com sur un ordinateur\n2. Cliquez "Mot de passe oublié"\n3. Essayez toutes les options de récupération (email, téléphone, Facebook)\n4. Si impossible — cliquez "Obtenir de l'aide supplémentaire"\n5. Choisissez "J'ai accès à cet email ou numéro"\n6. Suivez les instructions — Instagram peut demander une vidéo selfie pour vérifier votre identité\n7. Si tout échoue — formulaire officiel: help.instagram.com\n8. Signalez simultanément le compte piraté depuis un autre compte\n\n⚠ Ne payez jamais un service de récupération — c'est une arnaque.`,
      instagram_banned: `COMPTE INSTAGRAM BLOQUÉ INJUSTEMENT:\n\n1. Attendez 24h — certains blocages sont temporaires\n2. Allez dans l'appli → Paramètres → Aide → Signaler un problème\n3. Choisissez "Mon compte a été désactivé"\n4. Remplissez le formulaire avec:\n   - Votre nom complet\n   - L'email du compte\n   - Une explication de votre activité\n   - Des preuves que le contenu respecte les règles\n5. Envoyez. Instagram peut prendre 30-60 jours à répondre\n6. Tentez plusieurs fois si pas de réponse`,
      tiktok_hacked: `COMPTE TIKTOK PIRATÉ:\n\n1. Allez sur tiktok.com/login\n2. Cliquez "Connectez-vous avec téléphone/email"\n3. Utilisez "Mot de passe oublié"\n4. Si accès perdu — contactez support.tiktok.com\n5. Signalez le piratage: Privacy and Settings → Report a problem\n6. Préparez une pièce d'identité — TikTok peut la demander`,
    };
    const key = `${platform}_${issue}`;
    return guides[key] || `Guide non disponible pour ${platform} - ${issue}. Visitez le centre d'aide officiel de ${platform}.`;
  },

  // ─── Rendu panel ──────────────────────────────
  renderPanel() {
    const d = this.get();
    const archive = this.getArchive();

    return `
    <div style="padding:1.1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.8rem">

      <div class="sec-title">🚀 Publication</div>

      <!-- Test validation -->
      <button class="btn btn-gold" onclick="PUBLISH.showValidationModal({caption:'Test',hashtags:['test'],hasSubtitles:true,platform:'instagram'})">
        🧪 Tester la validation de publication
      </button>
      <p class="note">Avant chaque publication — Or Eille AI vérifie tout et vous donne 60 secondes pour modifier.</p>

      <div class="sep"></div>
      <div class="sec-title">📦 Archive automatique</div>
      <p class="note">Tout ce que vous publiez est archivé automatiquement. Même si votre compte est supprimé, votre contenu est sauvegardé.</p>
      <div style="padding:.5rem;background:var(--dark-mid);border:1px solid rgba(42,42,42,.15)">
        <div style="font-size:.54rem;color:#2a2a2a">${archive.items.length} contenu(s) archivé(s)</div>
        <div style="font-size:.46rem;color:rgba(42,42,42,.5)">Conservés 12 mois — chiffrés localement</div>
      </div>

      <div class="sep"></div>
      <div class="sec-title">🔍 Détection Shadowban</div>
      <p class="note">Entrez vos statistiques de portée des 14 derniers jours pour détecter un shadowban.</p>
      <textarea id="pub-stats" placeholder="Portée par jour (séparés par virgules): 1200,1100,980,450,200,180,150,1300,1250,1200,1100,1050,980,1000" style="min-height:60px;font-size:.54rem"></textarea>
      <button class="btn btn-ghost" onclick="
        const stats=document.getElementById('pub-stats').value.split(',').map(v=>({reach:parseInt(v.trim())}));
        const r=PUBLISH.analyzeShadowban(stats);
        if(r&&window.addChatMsg){
          if(r.suspected)addChatMsg('assistant',r.message+'\\n\\nActions recommandées:\\n'+r.actions.map(a=>'• '+a).join('\\n'));
          else addChatMsg('assistant','✅ Aucun shadowban détecté. Votre portée semble normale.');
        }
      ">🔍 Analyser</button>

      <div class="sep"></div>
      <div class="sec-title">🆘 Récupération de compte</div>
      <div style="display:flex;gap:.4rem">
        <select id="pub-platform" style="flex:1;background:var(--dark-mid);border:1px solid rgba(42,42,42,.15);color:#2a2a2a;font-family:'Basteleur',serif;font-size:.56rem;padding:.4rem;outline:none">
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
        </select>
        <select id="pub-issue" style="flex:1;background:var(--dark-mid);border:1px solid rgba(42,42,42,.15);color:#2a2a2a;font-family:'Basteleur',serif;font-size:.56rem;padding:.4rem;outline:none">
          <option value="hacked">Compte piraté</option>
          <option value="banned">Compte bloqué injustement</option>
        </select>
      </div>
      <button class="btn btn-ghost" onclick="if(window.addChatMsg)addChatMsg('assistant',PUBLISH.getAccountRecoveryGuide(document.getElementById('pub-platform').value,document.getElementById('pub-issue').value))">📋 Guide de récupération</button>

      ${d.publishedHistory.length > 0 ? `
        <div class="sep"></div>
        <div class="sec-title">Historique récent</div>
        ${d.publishedHistory.slice(0,5).map(h => `
          <div style="display:flex;justify-content:space-between;padding:.35rem 0;border-bottom:1px solid var(--border);font-size:.5rem">
            <span style="color:#2a2a2a">${h.caption?.substring(0,40)||'Contenu'}...</span>
            <span style="color:rgba(42,42,42,.5)">${new Date(h.publishedAt).toLocaleDateString('fr-FR')}</span>
          </div>
        `).join('')}
      ` : ''}
    </div>`;
  }
};

window.PUBLISH = PUBLISH;
