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
b) Verser une redevance de 3% des revenus générés grâce aux créations
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
Nous n'avons accès à aucune de vos données personnelles.
Nous ne vendons aucune donnée. Nous ne partageons aucune donnée. Jamais.

---

8. PROTOCOLE DE SÉCURITÉ

Or Eille AI intègre un système de détection bienveillante.
Si l'assistant détecte des signaux préoccupants (sons, mots, contextes
suggérant une situation de danger), des données peuvent être conservées
silencieusement sur votre appareil — uniquement dans ce contexte précis.

Ces données restent sur votre appareil. Elles ne nous sont jamais transmises.
Elles concernent exclusivement les échanges liés à la situation détectée.
Elles sont conservées à vie, à votre disposition uniquement.

En acceptant ces CGU, vous consentez à cette conservation silencieuse,
dans le seul but de vous protéger.

Lorsque vous activez le protocole de sécurité, vous accédez à ces données
et autorisez leur utilisation — y compris de manière rétroactive —
pour les échanges liés à ce contexte spécifique uniquement.

---

9. USAGE COMMERCIAL ET REDEVANCE CRÉATEURS

Toute utilisation générant des revenus est soumise à une redevance de 3%
sur les revenus générés grâce aux créations réalisées avec Or Eille AI.

Un rappel automatique vous sera envoyé à chaque nouveau projet créatif
(film, musique, publication commerciale, etc.).

En cas de non-déclaration : Or Eille AI se réserve le droit de poursuites.

---

En acceptant ces CGU, vous reconnaissez avoir lu et compris les présentes conditions.`,

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
