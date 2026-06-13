// ═══════════════════════════════════════════════════
//  PARTAGE CONTRÔLÉ — Or Eille AI v1.0
//  Partage un élément, une partie ou un projet
//  Lien nominatif, temporaire, non re-partageable
//  © 2026 Madame Or Eille Studios
// ═══════════════════════════════════════════════════

const SHARING = {
  KEY: 'moe_sharing',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { shares: [] }; }
    catch { return { shares: [] }; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  // ─── Créer un partage ─────────────────────────
  createShare(content, recipientName, scope, expiryHours) {
    const d = this.get();
    const shareId = 'sh_' + Date.now().toString(36) + Math.random().toString(36).substr(2,6);
    const share = {
      id: shareId,
      content,
      scope, // 'element', 'partial', 'project'
      recipientName,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (expiryHours || 48) * 3600000).toISOString(),
      accessed: [],
      active: true,
    };
    d.shares.push(share);
    this.save(d);

    // Générer le lien nominatif
    const shareUrl = `${window.location.origin}?share=${shareId}&recipient=${encodeURIComponent(recipientName)}`;
    return { share, url: shareUrl };
  },

  // ─── Vérifier un accès ────────────────────────
  checkAccess(shareId, accessorName) {
    const d = this.get();
    const share = d.shares.find(s => s.id === shareId);

    if (!share) return { allowed: false, reason: 'Ce lien n\'existe pas.' };
    if (!share.active) return { allowed: false, reason: 'Ce lien a été révoqué.' };
    if (new Date(share.expiresAt) < new Date()) return { allowed: false, reason: 'Ce lien a expiré.' };

    // Vérifier si c'est le bon destinataire
    if (accessorName && accessorName.toLowerCase() !== share.recipientName.toLowerCase()) {
      // Alerte — quelqu'un d'autre tente d'accéder
      share.accessed.push({
        name: accessorName,
        at: new Date().toISOString(),
        authorized: false
      });
      this.save(d);

      // Notifier le propriétaire
      if (window.addChatMsg) {
        addChatMsg('assistant', `⚠ Tentative d'accès non autorisée à votre partage par "${accessorName}". Ce lien était destiné à "${share.recipientName}" uniquement.`);
      }
      return { allowed: false, reason: `Ce contenu a été partagé avec ${share.recipientName} uniquement. Accès non autorisé.` };
    }

    // Enregistrer l'accès autorisé
    share.accessed.push({ name: accessorName || share.recipientName, at: new Date().toISOString(), authorized: true });
    this.save(d);
    return { allowed: true, share };
  },

  // ─── Révoquer un partage ──────────────────────
  revoke(shareId) {
    const d = this.get();
    const share = d.shares.find(s => s.id === shareId);
    if (share) { share.active = false; this.save(d); }
    if (window.addChatMsg) addChatMsg('assistant', `✓ Accès révoqué. ${share?.recipientName || 'La personne'} ne peut plus voir ce contenu.`);
  },

  // ─── Nettoyer les partages expirés ────────────
  cleanup() {
    const d = this.get();
    const now = new Date();
    d.shares = d.shares.filter(s => new Date(s.expiresAt) > now || !s.active);
    this.save(d);
  },

  // ─── Rendu panel ──────────────────────────────
  renderPanel() {
    const d = this.get();
    const active = d.shares.filter(s => s.active && new Date(s.expiresAt) > new Date());

    return `
    <div style="padding:1.1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.8rem">

      <div class="sec-title">🔗 Partager du contenu</div>
      <p class="note">Partagez un élément, une partie ou un projet avec qui vous voulez. Le lien est nominatif — il ne peut pas être re-partagé sans votre accord.</p>

      <textarea id="sh-content" placeholder="Collez le contenu à partager..." style="min-height:80px"></textarea>
      <input type="text" id="sh-recipient" placeholder="Prénom de la personne (ex: Pierre)"/>

      <div>
        <span class="klabel">Que partagez-vous ?</span>
        <div style="display:flex;gap:.3rem;margin-top:.3rem;flex-wrap:wrap">
          ${[['element','Un élément'],['partial','Une partie'],['project','Le projet entier']].map(([v,l]) => `
            <button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.style.background='var(--dark-mid)');this.style.background='rgba(196,153,58,.2)';this.dataset.selected='1';document.getElementById('sh-scope').value='${v}'" style="padding:.3rem .6rem;background:var(--dark-mid);border:1px solid var(--border);color:var(--muted);font-family:'Josefin Sans',sans-serif;font-size:.5rem;cursor:pointer">${l}</button>
          `).join('')}
        </div>
        <input type="hidden" id="sh-scope" value="element"/>
      </div>

      <div>
        <span class="klabel">Durée de validité</span>
        <select id="sh-expiry" style="width:100%;background:var(--dark-mid);border:1px solid var(--border);color:var(--text);font-family:'Josefin Sans',sans-serif;font-size:.56rem;padding:.4rem;outline:none;margin-top:.2rem">
          <option value="24">24 heures</option>
          <option value="48" selected>48 heures</option>
          <option value="168">7 jours</option>
          <option value="720">30 jours</option>
        </select>
      </div>

      <button class="btn btn-gold" onclick="
        const content = document.getElementById('sh-content').value;
        const recipient = document.getElementById('sh-recipient').value;
        const scope = document.getElementById('sh-scope').value;
        const expiry = parseInt(document.getElementById('sh-expiry').value);
        if(!content||!recipient){if(window.addChatMsg)addChatMsg('assistant','Remplissez le contenu et le prénom du destinataire.');return;}
        const result = SHARING.createShare(content,recipient,scope,expiry);
        navigator.clipboard?.writeText(result.url).then(()=>{
          if(window.addChatMsg)addChatMsg('assistant','✅ Lien copié ! Envoyez-le à '+recipient+'. Ce lien est valable '+expiry+'h et ne fonctionne que pour '+recipient+'.');
        });
        document.getElementById('sharingContent').innerHTML = SHARING.renderPanel();
      ">🔗 Créer le lien de partage</button>

      ${active.length > 0 ? `
        <div class="sep"></div>
        <div class="sec-title">Partages actifs</div>
        ${active.map(s => `
          <div style="padding:.6rem;border:1px solid var(--border);background:var(--dark-mid)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
              <span style="font-size:.56rem;color:var(--text)">Pour ${s.recipientName}</span>
              <span style="font-size:.46rem;color:var(--muted)">Expire ${new Date(s.expiresAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div style="font-size:.48rem;color:var(--muted);margin-bottom:.4rem">${s.scope === 'element' ? 'Un élément' : s.scope === 'partial' ? 'Une partie' : 'Projet entier'} · ${s.accessed.filter(a=>a.authorized).length} accès autorisé(s)</div>
            ${s.accessed.filter(a=>!a.authorized).length > 0 ? `
              <div style="font-size:.46rem;color:#ef5350;margin-bottom:.3rem">⚠ ${s.accessed.filter(a=>!a.authorized).length} tentative(s) non autorisée(s)</div>
            ` : ''}
            <button onclick="SHARING.revoke('${s.id}');document.getElementById('sharingContent').innerHTML=SHARING.renderPanel()" style="padding:.2rem .5rem;background:rgba(239,83,80,.1);border:1px solid rgba(239,83,80,.3);color:#ef5350;font-family:'Josefin Sans',sans-serif;font-size:.46rem;cursor:pointer">Révoquer l'accès</button>
          </div>
        `).join('')}
      ` : ''}
    </div>`;
  }
};

window.SHARING = SHARING;
window.addEventListener('load', () => setTimeout(() => SHARING.cleanup(), 5000));
