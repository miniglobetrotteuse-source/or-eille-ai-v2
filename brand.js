// ═══════════════════════════════════════════════════
//  MARQUES & CONTRATS — Or Eille AI v1.0
//  Brief, contrat, facturation, détection inégalités
// ═══════════════════════════════════════════════════

const BRAND = {
  KEY: 'moe_brand',

  MARKET_RATES: {
    micro: { followers: [1000, 10000], ratePerPost: [100, 500] },
    nano: { followers: [10000, 50000], ratePerPost: [500, 2000] },
    mid: { followers: [50000, 500000], ratePerPost: [2000, 10000] },
    macro: { followers: [500000, 1000000], ratePerPost: [10000, 30000] },
    mega: { followers: [1000000, Infinity], ratePerPost: [30000, 100000] }
  },

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { briefs: [], contracts: [], invoices: [], profile: {} }; }
    catch { return { briefs: [], contracts: [], invoices: [], profile: {} }; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  // ─── Évaluer la valeur marchande ──────────────
  evaluateValue(followers, engagementRate) {
    const tier = Object.entries(this.MARKET_RATES).find(([k, v]) => followers >= v.followers[0] && followers < v.followers[1]);
    if (!tier) return null;
    const [tierName, rates] = tier;
    const baseRate = (rates.ratePerPost[0] + rates.ratePerPost[1]) / 2;
    const engagementBonus = engagementRate > 5 ? 1.5 : engagementRate > 3 ? 1.2 : 1;
    const estimatedRate = Math.round(baseRate * engagementBonus);
    return {
      tier: tierName, minRate: rates.ratePerPost[0], maxRate: rates.ratePerPost[1],
      recommended: estimatedRate,
      message: `Avec ${followers.toLocaleString()} abonnés et ${engagementRate}% d'engagement, votre tarif devrait se situer entre ${rates.ratePerPost[0].toLocaleString()}€ et ${rates.ratePerPost[1].toLocaleString()}€ par post.`
    };
  },

  // ─── Analyser un contrat ──────────────────────
  async analyzeContract(contractText, claudeKey) {
    if (!claudeKey) return null;
    if (window.addChatMsg) addChatMsg('assistant', '⚖ Analyse du contrat en cours...');
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 800,
          system: 'Tu es expert en contrats pour créateurs de contenu. Tu analyses les contrats de façon objective, en identifiant les clauses abusives, les manques importants, et les éléments favorables au créateur. Tu n\'es pas avocat et tu le rappelles toujours.',
          messages: [{
            role: 'user',
            content: `Analyse ce contrat de collaboration marque-créateur:\n\n${contractText}\n\nIdentifie:\n1. Les clauses potentiellement abusives (cession droits, exclusivité excessive, etc.)\n2. Ce qui manque (conditions logistiques, clause de paiement en cas d'annulation, etc.)\n3. Ce qui est favorable au créateur\n4. Les points à négocier\n5. Une estimation si le tarif proposé est correct selon le marché\n\nNote: Tu n'es pas avocat. Pour validation légale, consulter un professionnel.`
          }]
        })
      });
      const data = await r.json();
      return data.content[0].text;
    } catch { return null; }
  },

  // ─── Générer un template de contrat ───────────
  generateContractTemplate(params) {
    const { creatorName, brandName, deliverables, payment, deadline, exclusivity, platforms } = params;
    return `CONTRAT DE COLLABORATION CRÉATEUR — MARQUE

Entre ${creatorName || '[Nom du créateur]'} (ci-après "le Créateur")
Et ${brandName || '[Nom de la marque]'} (ci-après "la Marque")

Date: ${new Date().toLocaleDateString('fr-FR')}

═══════════════════════════════════════

ARTICLE 1 — LIVRABLES
${deliverables || '[Décrire précisément les contenus attendus — nombre, format, plateforme]'}

ARTICLE 2 — RÉMUNÉRATION
Montant: ${payment || '[Montant en euros]'} € TTC
Modalités: 50% à la signature, 50% à la livraison
Délai de paiement: 30 jours après livraison

ARTICLE 3 — CLAUSE DE NON-PAIEMENT EN CAS D'ANNULATION
Si la Marque annule la collaboration après signature, le Créateur conserve l'acompte de 50%.
Si la Marque annule après livraison partielle, la rémunération est due au prorata.

ARTICLE 4 — DROITS D'UTILISATION
La Marque dispose d'une licence d'utilisation du contenu pour ${exclusivity || '6 mois'} sur ${platforms || 'ses canaux officiels uniquement'}.
Toute utilisation au-delà fait l'objet d'une rémunération supplémentaire négociée.

ARTICLE 5 — CONDITIONS LOGISTIQUES
Les conditions logistiques accordées au Créateur (transport, hébergement, restauration) 
seront équivalentes à celles accordées aux autres créateurs participant au même événement ou campaign.

ARTICLE 6 — EXCLUSIVITÉ
${exclusivity ? `Exclusivité sur ${exclusivity}` : 'Aucune exclusivité. Le Créateur reste libre de collaborer avec d\'autres marques.'}

ARTICLE 7 — DÉLAIS
Date de livraison: ${deadline || '[Date]'}
Le Créateur informera la Marque de tout retard dans les 48h.

ARTICLE 8 — RÉSILIATION
Chaque partie peut résilier avec 14 jours de préavis.
La rémunération due au prorata du travail effectué sera versée.

ARTICLE 9 — DROIT APPLICABLE
Ce contrat est soumis au droit ${params.country || 'français'}.

Signatures:
Le Créateur: _______________     La Marque: _______________
Date:                              Date:`;
  },

  // ─── Générer une facture ──────────────────────
  generateInvoice(params) {
    const { creatorName, clientName, amount, description, invoiceNumber } = params;
    const num = invoiceNumber || 'FA-' + Date.now().toString().slice(-6);
    const d = this.get();
    const invoice = {
      id: num, creatorName, clientName, amount: parseFloat(amount),
      description, issuedAt: new Date().toISOString(), paid: false,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString()
    };
    d.invoices.push(invoice);
    this.save(d);

    // Programmer une relance si non payé
    setTimeout(() => {
      const d2 = this.get();
      const inv = d2.invoices.find(i => i.id === num);
      if (inv && !inv.paid && window.addChatMsg) {
        addChatMsg('assistant', `⚠ Facture ${num} — ${amount}€ non payée par ${clientName}. Échéance dépassée. Envoyez une relance.`);
      }
    }, 30 * 24 * 3600 * 1000);

    return invoice;
  },

  // ─── Rendu panel ──────────────────────────────
  renderPanel() {
    const d = this.get();
    const unpaidInvoices = d.invoices.filter(i => !i.paid);

    return `
    <div style="padding:1.1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.8rem">

      <div class="sec-title">💼 Collaborations Marques</div>

      <!-- Évaluation valeur -->
      <div style="border:1px solid var(--border);padding:.7rem">
        <div style="font-size:.56rem;color:var(--text);margin-bottom:.5rem">📊 Connaître ma valeur marchande</div>
        <div style="display:flex;gap:.4rem">
          <input type="number" id="br-followers" placeholder="Abonnés" style="flex:1"/>
          <input type="number" id="br-engagement" placeholder="Engagement %" style="flex:1"/>
          <button onclick="const r=BRAND.evaluateValue(parseInt(document.getElementById('br-followers').value),parseFloat(document.getElementById('br-engagement').value));if(r&&window.addChatMsg)addChatMsg('assistant',r.message)" class="btn btn-gold" style="flex:1;font-size:.5rem">Évaluer</button>
        </div>
      </div>

      <!-- Analyse contrat -->
      <div class="sec-title">⚖ Analyser un contrat</div>
      <textarea id="br-contract" placeholder="Collez le texte de votre contrat ici..." style="min-height:100px"></textarea>
      <button class="btn btn-ghost" onclick="BRAND.analyzeContract(document.getElementById('br-contract').value,window.CFG?.CLAUDE_KEY).then(r=>{if(r&&window.addChatMsg)addChatMsg('assistant',r)})">⚖ Analyser</button>

      <!-- Template contrat -->
      <div class="sec-title">📄 Générer un contrat</div>
      <input type="text" id="br-brand" placeholder="Nom de la marque"/>
      <input type="text" id="br-deliverables" placeholder="Livrables (ex: 2 Reels Instagram, 1 Story)"/>
      <input type="number" id="br-payment" placeholder="Rémunération (€)"/>
      <button class="btn btn-ghost" onclick="if(window.addChatMsg)addChatMsg('assistant',BRAND.generateContractTemplate({creatorName:'[Votre nom]',brandName:document.getElementById('br-brand').value,deliverables:document.getElementById('br-deliverables').value,payment:document.getElementById('br-payment').value}))">📄 Générer le contrat</button>

      <!-- Facturation -->
      <div class="sep"></div>
      <div class="sec-title">🧾 Facturation</div>
      ${unpaidInvoices.length > 0 ? `
        <div style="background:rgba(196,153,58,.1);border:1px solid rgba(196,153,58,.3);padding:.5rem;font-size:.54rem;color:var(--gold)">
          ⚠ ${unpaidInvoices.length} facture(s) en attente — total: ${unpaidInvoices.reduce((s,i)=>s+i.amount,0).toFixed(0)}€
        </div>
      ` : ''}
      <input type="text" id="br-inv-client" placeholder="Nom du client"/>
      <input type="text" id="br-inv-desc" placeholder="Description de la prestation"/>
      <input type="number" id="br-inv-amount" placeholder="Montant (€)"/>
      <button class="btn btn-ghost" onclick="const inv=BRAND.generateInvoice({creatorName:'[Votre nom]',clientName:document.getElementById('br-inv-client').value,description:document.getElementById('br-inv-desc').value,amount:document.getElementById('br-inv-amount').value});if(window.addChatMsg)addChatMsg('assistant','✅ Facture '+inv.id+' créée — '+inv.amount+'€ due dans 30 jours.')">🧾 Créer la facture</button>

      ${d.invoices.length > 0 ? `
        <div class="sep"></div>
        <div class="sec-title">Mes factures</div>
        ${d.invoices.slice(0,5).reverse().map(inv => `
          <div style="display:flex;align-items:center;gap:.4rem;padding:.4rem 0;border-bottom:1px solid var(--border)">
            <div style="flex:1">
              <div style="font-size:.54rem;color:var(--text)">${inv.clientName} — ${inv.amount}€</div>
              <div style="font-size:.46rem;color:var(--muted)">${inv.id} · ${new Date(inv.issuedAt).toLocaleDateString('fr-FR')}</div>
            </div>
            <div style="display:flex;gap:.3rem">
              <span style="font-size:.48rem;color:${inv.paid?'#81c784':'#ef5350'}">${inv.paid?'✓ Payée':'En attente'}</span>
              ${!inv.paid ? `<button onclick="const d=BRAND.get();const i=d.invoices.find(x=>x.id==='${inv.id}');if(i){i.paid=true;BRAND.save(d);document.getElementById('brandContent').innerHTML=BRAND.renderPanel();if(window.addChatMsg)addChatMsg('assistant','✅ Facture ${inv.id} marquée comme payée.')}" style="padding:.2rem .4rem;background:rgba(129,199,132,.15);border:1px solid rgba(129,199,132,.4);color:#81c784;font-size:.44rem;cursor:pointer">Marquer payée</button>` : ''}
            </div>
          </div>
        `).join('')}
      ` : ''}
    </div>`;
  }
};

window.BRAND = BRAND;
