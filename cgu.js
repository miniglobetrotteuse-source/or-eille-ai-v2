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
Or Eille AI
Version 1.0 — 15 mai 2026

---

1. PROPRIÉTÉ INTELLECTUELLE

L'Atelier Visuel est une création originale de Or Eille AI (Judith).
L'ensemble du code, du concept, de l'interface et des fonctionnalités est protégé
par le droit d'auteur français et international.

Preuve de création : email horodaté du 14 mai 2026 + dépôt en cours à l'INPI.

---

2. USAGE PERSONNEL (GRATUIT)

L'utilisation de cet outil à titre personnel est autorisée gratuitement.
Constitue un usage personnel : créations pour soi-même, pour des proches,
sans contrepartie financière directe ou indirecte.

---

3. USAGE COMMERCIAL (SOUMIS À REDEVANCE)

Constitue un usage commercial toute utilisation générant des revenus directs
ou indirects : vente d'œuvres créées avec l'outil, services rémunérés,
publicités, collaborations commerciales, NFTs, etc.

En cas d'usage commercial, l'utilisateur s'engage à :
a) Déclarer son usage commercial dans les 30 jours suivant le premier revenu
b) Verser une redevance de [X]% des revenus générés grâce aux créations
c) Mentionner "Créé avec Or Eille AI" dans ses œuvres

Note : Le pourcentage exact sera défini par contrat avec un juriste spécialisé.

---

4. FILIGRANE NUMÉRIQUE

Toutes les créations générées avec cet outil contiennent un filigrane numérique
invisible permettant d'identifier l'origine de la création.
Ce filigrane constitue une preuve légale en cas de litige sur les droits d'auteur.

---

5. USAGE PROHIBÉ

Sont strictement interdits :
- Tout contenu pédocriminel (blocage permanent, signalement)
- Trafic d'armes, de drogue, soumission chimique
- Contenu raciste, antisémite, islamophobe ou déshumanisant
- Usurpation d'identité, fraude, escroquerie
- Tout contenu violant la dignité humaine

---

6. ÉVOLUTION D'USAGE

Si votre usage évolue du personnel au commercial, vous êtes tenu de le déclarer
dans les 30 jours. Un rappel vous sera envoyé tous les 6 mois.

---

7. DONNÉES PERSONNELLES

Vos données sont stockées uniquement sur votre appareil (localStorage).
Aucune donnée n'est transmise à des serveurs tiers sans votre consentement explicite.

---

En acceptant ces CGU, vous reconnaissez avoir lu et compris les présentes conditions.`,

  // ─── Afficher la modale CGU ───────────────────
  showModal() {
    const existing = document.getElementById('cguModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cguModal';
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:99999;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:1.5rem;gap:1rem;
    `;
    modal.innerHTML = `
      <div style="max-width:480px;width:100%;background:#2c2318;border:1px solid rgba(201,168,76,.3);padding:1.5rem;max-height:80vh;overflow-y:auto">
        <h2 style="font-family:'Cormorant Garamond',serif;font-style:italic;color:#c9a84c;font-size:1.2rem;margin-bottom:1rem">Conditions d'utilisation</h2>
        <pre style="font-family:'Josefin Sans',sans-serif;font-size:.54rem;color:rgba(240,232,216,.75);line-height:1.7;white-space:pre-wrap;margin-bottom:1rem">${this.TEXT}</pre>
        <div style="margin-bottom:.8rem">
          <p style="font-size:.58rem;color:#e8d49a;margin-bottom:.5rem">Quel est votre usage ?</p>
          <label style="display:flex;align-items:center;gap:.5rem;font-size:.58rem;color:rgba(240,232,216,.75);margin-bottom:.3rem;cursor:pointer">
            <input type="radio" name="usageType" value="personal" checked style="accent-color:#c9a84c"/> Usage personnel (gratuit)
          </label>
          <label style="display:flex;align-items:center;gap:.5rem;font-size:.58rem;color:rgba(240,232,216,.75);cursor:pointer">
            <input type="radio" name="usageType" value="commercial" style="accent-color:#c9a84c"/> Usage commercial (redevance applicable)
          </label>
        </div>
        <button onclick="CGU.acceptFromModal()" style="width:100%;padding:.8rem;background:#c9a84c;color:#1a1410;border:none;font-family:'Josefin Sans',sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;font-weight:400">
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
