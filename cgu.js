// ═══════════════════════════════════════════════════
//  CONDITIONS GÉNÉRALES D'UTILISATION
//  + SYSTÈME DE DÉCLARATION D'USAGE COMMERCIAL
//  Or Eille AI — v1.0
// ═══════════════════════════════════════════════════

const CGU = {
  VERSION: '1.0',
  DATE: '2026-05-15',

  // ─── Vérifier si acceptées ────────────────────
  isAccepted() {
    const stored = localStorage.getItem('moe_cgu');
    if (!stored) return false;
    try {
      const d = JSON.parse(stored);
      return d.accepted && d.version === this.VERSION;
    } catch { return false; }
  },

  accept(usageType) {
    localStorage.setItem('moe_cgu', JSON.stringify({
      accepted: true,
      version: this.VERSION,
      usageType, // 'personal' | 'commercial'
      acceptedAt: new Date().toISOString(),
      userId: this.getUserId()
    }));
  },

  getUserId() {
    let id = localStorage.getItem('moe_user_id');
    if (!id) {
      id = 'MOE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem('moe_user_id', id);
    }
    return id;
  },

  getUsageType() {
    try { return JSON.parse(localStorage.getItem('moe_cgu'))?.usageType || 'personal'; }
    catch { return 'personal'; }
  },

  // Rappel semestriel de mise à jour d'usage
  checkUsageReminder() {
    const stored = localStorage.getItem('moe_cgu');
    if (!stored) return false;
    try {
      const d = JSON.parse(stored);
      const sixMonths = 6 * 30 * 24 * 3600 * 1000;
      return (Date.now() - new Date(d.acceptedAt).getTime()) > sixMonths;
    } catch { return false; }
  },

  // ─── Texte CGU complet ────────────────────────
  TEXT: `CONDITIONS GÉNÉRALES D'UTILISATION
Or Eille AI — Madame Or Eille Studios
Version 2.0 — Juin 2026

Or Eille AI est un outil créatif fondé sur des valeurs humaines claires : respect, dignité, liberté. Ces conditions définissent le cadre dans lequel chaque utilisateur est accueilli — et les limites au-delà desquelles l'accès n'est plus possible.

─────────────────────────────────────
1. PROPRIÉTÉ INTELLECTUELLE
─────────────────────────────────────
Or Eille AI est une création originale de Madame Or Eille Studios, protégée par le droit d'auteur français et international. L'ensemble du code, du concept et de l'interface constitue une oeuvre dont la reproduction, même partielle, est interdite sans autorisation écrite préalable.

─────────────────────────────────────
2. USAGE PERSONNEL
─────────────────────────────────────
L'accès à Or Eille AI est gratuit pour un usage personnel — toute création réalisée pour soi-même ou ses proches, sans contrepartie financière directe ou indirecte.

─────────────────────────────────────
3. USAGE COMMERCIAL
─────────────────────────────────────
Toute utilisation générant des revenus — vente d'oeuvres, services rémunérés, collaborations commerciales, publications, films, musique, NFTs ou autre — constitue un usage commercial soumis à une redevance de 3% des revenus générés.

La redevance de 3% ne s'applique qu'à partir de 3 000€ de revenus mensuels générés grâce aux créations Or Eille AI. En dessous de ce seuil, aucune redevance n'est due.

L'utilisateur s'engage à déclarer cet usage dans les 30 jours suivant le franchissement du seuil, à mentionner "Créé avec Or Eille AI" dans ses oeuvres, et à s'acquitter de la redevance. Un rappel automatique est envoyé à chaque nouveau projet créatif. En cas de non-déclaration, Madame Or Eille Studios se réserve le droit d'engager des poursuites.

─────────────────────────────────────
4. FILIGRANE NUMÉRIQUE
─────────────────────────────────────
Chaque création générée avec Or Eille AI contient un filigrane numérique invisible permettant d'en identifier l'origine. Ce filigrane constitue une preuve légale en cas de litige.

─────────────────────────────────────
5. CONTENUS INTERDITS
─────────────────────────────────────
Or Eille AI refuse catégoriquement tout contenu contraire à la dignité humaine, à la loi, ou aux valeurs fondatrices de ce service.

Sont interdits, sans exception : tout contenu impliquant des mineurs à caractère sexuel — signalement immédiat aux autorités (Pharos, 3020) ; toute forme de violence sexuelle ; tout contenu pornographique ; tout contenu raciste, antisémite, homophobe, islamophobe, ou portant atteinte à la dignité d'une personne ou d'un groupe ; toute caricature irrespectueuse à caractère religieux, racial ou ethnique ; tout appel à la haine, à la violence ou à la discrimination ; toute fraude, usurpation d'identité ou escroquerie ; tout trafic illicite.

De manière générale : est interdit tout usage illégal dans le pays depuis lequel vous utilisez Or Eille AI, ainsi que tout contenu contraire à l'éthique de Madame Or Eille Studios — qu'il soit explicitement listé ou non.

Sont également interdits : tout contenu filmant une personne en situation de vulnérabilité — détresse, pauvreté, maladie, migration, enfant, bénéficiaire d'un don — sans floutage de son visage et de tout élément permettant de l'identifier. Or Eille AI applique un floutage automatique dans ces situations. Cette règle n'est pas optionnelle. Elle s'applique même lorsque la personne filmée semble consentante, car une personne en situation de vulnérabilité ne dispose pas d'un consentement pleinement libre et éclairé. Tout contenu exploitant la générosité, la solidarité ou la pauvreté d'autrui à des fins personnelles — visibilité, voyage gratuit, notoriété — est également interdit.

─────────────────────────────────────
6. RESPECT ET COMMUNICATION
─────────────────────────────────────
Or Eille AI est un espace de création et d'échange. Exprimer un désaccord est possible — à condition de le faire avec respect et dans un esprit constructif. Les propos insultants ou dégradants envers quiconque ne sont pas tolérés.

─────────────────────────────────────
7. SANCTIONS
─────────────────────────────────────
Tout manquement aux présentes conditions entraîne, selon la gravité : un avertissement motivé, un blocage temporaire, ou un blocage permanent avec signalement aux autorités. Aucun remboursement n'est dû en cas de blocage. Madame Or Eille Studios se réserve le droit d'engager des poursuites en cas de violation grave.

─────────────────────────────────────
8. DONNÉES PERSONNELLES
─────────────────────────────────────
Vos données sont stockées uniquement sur votre appareil. Madame Or Eille Studios n'y a pas accès. Aucune donnée n'est vendue, partagée ou transmise à des tiers — jamais. Conformément au RGPD, vous pouvez les supprimer à tout moment depuis les paramètres de votre navigateur.

─────────────────────────────────────
9. PROTOCOLE DE SÉCURITÉ
─────────────────────────────────────
Or Eille AI intègre un système de détection bienveillante. Si l'assistant perçoit des signaux préoccupants, certaines données peuvent être conservées silencieusement sur votre appareil — uniquement dans ce contexte et uniquement pour vous protéger. Ces données ne nous sont jamais transmises. Elles restent à votre disposition, conservées à vie. En activant le protocole de sécurité, vous en autorisez l'utilisation — y compris de manière rétroactive — pour les échanges liés à cette situation spécifique.

─────────────────────────────────────
10. CONDITIONS D'ACCÈS
─────────────────────────────────────
Or Eille AI est accessible aux personnes de 18 ans et plus. Les mineurs peuvent y accéder avec l'accord explicite d'un parent ou tuteur légal.

─────────────────────────────────────
11. RÉSILIATION
─────────────────────────────────────
L'abonnement peut être résilié à tout moment depuis l'espace personnel. La résiliation prend effet à la fin de la période en cours. Aucun remboursement au prorata n'est effectué.

─────────────────────────────────────
12. RESPONSABILITÉ LIMITÉE
─────────────────────────────────────
Madame Or Eille Studios ne peut être tenue responsable des usages frauduleux, détournés ou contraires aux présentes conditions, réalisés par des tiers en violation de celles-ci.

Madame Or Eille Studios se réserve le droit d'engager des poursuites pour tout préjudice subi — qu'il soit moral, commercial ou réputationnel — causé par l'usage abusif de la plateforme ou par tout comportement portant atteinte à l'image de la marque.

─────────────────────────────────────
13. DROIT APPLICABLE
─────────────────────────────────────
Les présentes conditions sont régies par le droit français. En cas de litige, les tribunaux français sont seuls compétents.

─────────────────────────────────────
13. ÉVOLUTION DES CONDITIONS
─────────────────────────────────────
Ces conditions peuvent être mises à jour avec un préavis de 30 jours. La poursuite de l'utilisation du service vaut acceptation des nouvelles conditions.

─────────────────────────────────────
14. VALEURS FONDATRICES
─────────────────────────────────────
Or Eille AI est fondé sur les valeurs de la Déclaration universelle des droits de l'homme (ONU, 10 décembre 1948). Article 1 : "Tous les êtres humains naissent libres et égaux en dignité et en droits. Ils sont doués de raison et de conscience et doivent agir les uns envers les autres dans un esprit de fraternité."

Ces valeurs s'appliquent sans distinction de race, de sexe, de langue, de religion, d'opinion politique ou d'origine. Or Eille AI soutient la liberté d'expression et la liberté de la presse (Article 19 DUDH) et ne coopère avec aucun gouvernement pour identifier, surveiller ou dénoncer ses utilisateurs. Jamais. Les utilisateurs dans des pays où l'accès est restreint peuvent utiliser un VPN.

─────────────────────────────────────

En acceptant ces conditions, vous reconnaissez les avoir lues, comprises et acceptées dans leur intégralité.`,

  // ─── Afficher la modale CGU ───────────────────
  showModal() {
    const existing = document.getElementById('cguModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cguModal';
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(247,244,239,.97);z-index:99999;
      display:flex;align-items:center;justify-content:center;
      padding:1rem;
    `;
    modal.innerHTML = `
      <div style="max-width:560px;width:100%;background:#F7F4EF;border:1px solid rgba(196,153,58,.4);padding:2rem;max-height:92vh;display:flex;flex-direction:column;gap:1.2rem;box-shadow:0 8px 40px rgba(196,153,58,.15);">
        
        <div style="text-align:center;border-bottom:1px solid rgba(196,153,58,.25);padding-bottom:1.2rem;">
          <img src="logo.png" style="width:52px;margin-bottom:.6rem;" onerror="this.style.display='none'"/>
          <h2 style="font-family:'Basteleur',serif;color:#C4993A;font-size:1.3rem;font-weight:400;margin:0 0 .2rem;">Or Eille AI</h2>
          <p style="font-family:'Basteleur-Moonlight','Basteleur',serif;color:#1A3A8F;font-size:.75rem;letter-spacing:.12em;margin:0;font-style:italic;">Conditions d'utilisation</p>
        </div>

        <div style="overflow-y:auto;flex:1;max-height:42vh;padding-right:.5rem;">
          <div style="font-family:Georgia,serif;font-size:.78rem;color:#2a2a2a;line-height:1.9;white-space:pre-wrap;">${this.TEXT}</div>
        </div>

        <div style="border-top:1px solid rgba(196,153,58,.25);padding-top:1rem;">
          <p style="font-family:'Basteleur',serif;font-size:.75rem;color:#C4993A;margin-bottom:.8rem;">Votre usage :</p>
          <label style="display:flex;align-items:center;gap:.6rem;font-size:.78rem;color:#2a2a2a;margin-bottom:.5rem;cursor:pointer;font-family:Georgia,serif;">
            <input type="radio" name="usageType" value="personal" checked style="accent-color:#C4993A;"/> Usage personnel — gratuit
          </label>
          <label style="display:flex;align-items:center;gap:.6rem;font-size:.78rem;color:#2a2a2a;cursor:pointer;font-family:Georgia,serif;">
            <input type="radio" name="usageType" value="commercial" style="accent-color:#C4993A;"/> Usage commercial — redevance applicable
          </label>
        </div>

        <button onclick="CGU.acceptFromModal()" style="width:100%;padding:1rem;background:#C4993A;color:#F7F4EF;border:none;font-family:'Basteleur',serif;font-size:.8rem;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;">
          J'accepte les conditions
        </button>

      </div>
    `;
    document.body.appendChild(modal);
  },

  acceptFromModal() {
    const type = document.querySelector('input[name="usageType"]:checked')?.value || 'personal';
    this.accept(type);
    document.getElementById('cguModal')?.remove();
    if (window.speak) speak('Bienvenue dans l\'Atelier Visuel Or Eille AI.');
  },

  // Modale de rappel semestriel
  showReminderModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99998;display:flex;align-items:center;justify-content:center;padding:1.5rem`;
    modal.innerHTML = `
      <div style="max-width:380px;background:#2c2318;border:1px solid rgba(201,168,76,.3);padding:1.2rem">
        <p style="font-size:.62rem;color:rgba(240,232,216,.85);line-height:1.7;margin-bottom:.8rem">
          Votre usage de l'Atelier Visuel a-t-il évolué depuis votre inscription ?<br/><br/>
          Si vous avez commencé à générer des revenus grâce aux créations réalisées avec cet outil, vous avez l'obligation de déclarer un usage commercial.
        </p>
        <div style="display:flex;gap:.5rem">
          <button onclick="CGU.updateUsage('personal');this.closest('div').closest('div').remove()" style="flex:1;padding:.6rem;background:transparent;border:1px solid rgba(201,168,76,.3);color:rgba(240,232,216,.6);font-family:'Josefin Sans',sans-serif;font-size:.54rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer">Toujours personnel</button>
          <button onclick="CGU.updateUsage('commercial');this.closest('div').closest('div').remove()" style="flex:1;padding:.6rem;background:#c9a84c;color:#1a1410;border:none;font-family:'Josefin Sans',sans-serif;font-size:.54rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;font-weight:400">Déclarer commercial</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  updateUsage(type) {
    const stored = JSON.parse(localStorage.getItem('moe_cgu') || '{}');
    stored.usageType = type;
    stored.lastReminder = new Date().toISOString();
    localStorage.setItem('moe_cgu', JSON.stringify(stored));
    if (type === 'commercial' && window.speak) {
      speak('Usage commercial déclaré. Merci pour votre honnêteté. Les conditions de redevance s\'appliquent.');
    }
  },

  // Initialisation
  init() {
    if (!this.isAccepted()) {
      setTimeout(() => this.showModal(), 500);
    } else if (this.checkUsageReminder()) {
      setTimeout(() => this.showReminderModal(), 2000);
    }
  }
};

window.CGU = CGU;
// CGU désactivé en local (file://) — activer sur le serveur
// window.addEventListener('load', () => CGU.init());
