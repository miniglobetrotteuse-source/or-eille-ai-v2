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
  TEXT: `CONDITIONS GÉNÉRALES D'UTILISATION — Or Eille AI — Version 1.1 — Juin 2026

1. PROPRIÉTÉ INTELLECTUELLE
Or Eille AI est une création originale de Madame Or Eille Studios (Judith), protégée par le droit d'auteur français et international. Toute reproduction partielle ou totale est interdite sans autorisation écrite.

2. USAGE PERSONNEL (GRATUIT)
L'utilisation à titre personnel est gratuite. Constitue un usage personnel : toute création pour soi-même ou ses proches, sans contrepartie financière directe ou indirecte.

3. USAGE COMMERCIAL (REDEVANCE 3%)
Constitue un usage commercial toute utilisation générant des revenus : vente d'œuvres, services rémunérés, publicités, collaborations, NFTs, films, musique, publications commerciales.
L'utilisateur s'engage à : déclarer son usage dans les 30 jours suivant le premier revenu · verser une redevance de 3% des revenus générés · mentionner "Créé avec Or Eille AI". Un rappel automatique est envoyé à chaque nouveau projet créatif. En cas de non-déclaration, Or Eille AI se réserve le droit de poursuites.

4. FILIGRANE NUMÉRIQUE
Toutes les créations contiennent un filigrane numérique invisible permettant d'identifier leur origine. Ce filigrane constitue une preuve légale en cas de litige.

5. CONTENUS STRICTEMENT INTERDITS — BLOCAGE IMMÉDIAT ET PERMANENT
Sont absolument interdits, sans exception :
· Tout contenu pédocriminel, sexualisant ou impliquant des mineurs — signalement immédiat aux autorités (Pharos, 3020, CNAIP)
· Toute forme de violence sexuelle, viol, agression, soumission chimique
· Tout contenu pornographique (sauf chercheurs accrédités avec numéro officiel vérifié)
· Trafic d'armes, de drogue ou de substances illicites
· Contenu raciste, antisémite, islamophobe, homophobe, ou déshumanisant envers toute personne ou groupe
· Caricatures irrespectueuses à caractère religieux, racial ou ethnique
· Tout contenu incitant à la haine, à la violence ou à la discrimination
· Usurpation d'identité, fraude, escroquerie
· Tout contenu violant la dignité humaine, au sens de la Déclaration universelle des droits de l'homme (ONU, 1948)
· De manière générale : tout contenu ou usage illégal dans le pays depuis lequel vous utilisez Or Eille AI est strictement interdit.

6. RÈGLES DE RESPECT ENTRE UTILISATEURS
Les utilisateurs s'engagent à maintenir des échanges respectueux. Exprimer un désaccord est autorisé — à condition de rester constructif et de respecter la dignité de l'interlocuteur. Les propos insultants, dégradants ou irrespectueux entraînent un avertissement, puis un blocage.

7. SYSTÈME DE SANCTIONS
Premier écart : avertissement avec explication. Récidive : blocage temporaire (minimum 30 jours). Contenu pédocriminel ou appel à la violence : blocage permanent, signalement aux autorités. Aucun remboursement en cas de blocage. Or Eille AI se réserve le droit de poursuites en cas de violation grave des CGU.

8. DONNÉES PERSONNELLES
Vos données sont stockées uniquement sur votre appareil. Nous n'y avons pas accès. Nous ne vendons aucune donnée. Nous ne partageons aucune donnée. Jamais. Conformément au RGPD, vous pouvez les supprimer à tout moment depuis les paramètres de votre navigateur.

9. PROTOCOLE DE SÉCURITÉ
Or Eille AI intègre un système de détection bienveillante. Si l'assistant détecte des signaux préoccupants (danger, violence), des données peuvent être conservées silencieusement sur votre appareil — uniquement dans ce contexte précis, uniquement pour vous protéger. Ces données ne nous sont jamais transmises. Elles sont conservées à vie, à votre disposition. En activant le protocole de sécurité, vous autorisez leur utilisation, y compris de manière rétroactive, pour les échanges liés à ce contexte spécifique uniquement.

10. ÂGE MINIMUM
L'accès à Or Eille AI est réservé aux personnes de 18 ans et plus, ou aux mineurs avec accord parental explicite.

11. RÉSILIATION
Vous pouvez résilier votre abonnement à tout moment depuis votre espace personnel. La résiliation prend effet à la fin de la période en cours. Aucun remboursement au prorata.

12. DROIT APPLICABLE
Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français sont compétents.

13. MODIFICATION DES CGU
Or Eille AI se réserve le droit de modifier ces CGU avec un préavis de 30 jours. La poursuite de l'utilisation du service vaut acceptation des nouvelles conditions.

14. FONDEMENT — DROITS HUMAINS UNIVERSELS
Or Eille AI est fondé sur les valeurs de la Déclaration universelle des droits de l'homme (ONU, 10 décembre 1948), Article 1 : "Tous les êtres humains naissent libres et égaux en dignité et en droits. Ils sont doués de raison et de conscience et doivent agir les uns envers les autres dans un esprit de fraternité." Ces valeurs s'appliquent sans distinction de race, sexe, langue, religion, opinion politique, origine nationale ou sociale.

15. LIBERTÉ D'EXPRESSION ET PAYS SOUS RÉGIME AUTORITAIRE
Or Eille AI soutient la liberté d'expression et la liberté de la presse (Article 19 DUDH). Or Eille AI ne coopère avec aucun gouvernement, aucune autorité, aucun régime pour identifier, surveiller ou dénoncer ses utilisateurs. Jamais. Les utilisateurs dans des pays où l'accès est restreint peuvent utiliser un VPN.

En acceptant ces CGU, vous reconnaissez avoir lu, compris et accepté l'ensemble des présentes conditions.`,

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
