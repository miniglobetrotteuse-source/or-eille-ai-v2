// ═══════════════════════════════════════════════════
//  MENTIONS LÉGALES & POLITIQUE DE CONFIDENTIALITÉ
//  Or Eille AI v2 — 2026
//  © Madame Or Eille Studios — Judith
// ═══════════════════════════════════════════════════

const LEGAL = {

  MENTIONS: `
MENTIONS LÉGALES
Or Eille AI — Madame Or Eille Studios
Mise à jour : juin 2026

─────────────────────────────────────
ÉDITEUR DU SITE
─────────────────────────────────────
Or Eille AI est édité par Madame Or Eille Studios.
Propriétaire intellectuelle : Judith.
Contact : madameoreille.studio@gmail.com

─────────────────────────────────────
HÉBERGEMENT
─────────────────────────────────────
Ce site est hébergé par Vercel Inc.
340 Pine Street, Suite 701, San Francisco, CA 94104, USA.

─────────────────────────────────────
PROPRIÉTÉ INTELLECTUELLE
─────────────────────────────────────
L'ensemble du code, du concept, de l'interface, des textes
et des fonctionnalités de Or Eille AI est une création originale
de Madame Or Eille Studios (Judith), protégée par le droit d'auteur
français et international.
Preuve de création : email horodaté du 14 mai 2026 + dépôt INPI en cours.

Toute reproduction, même partielle, est interdite sans autorisation écrite.
`,

  PRIVACY: `
POLITIQUE DE CONFIDENTIALITÉ
Or Eille AI — Madame Or Eille Studios
Conforme RGPD et IA Act (UE)

─────────────────────────────────────
1. DONNÉES COLLECTÉES
─────────────────────────────────────
Or Eille AI ne collecte aucune donnée personnelle sur ses serveurs.

Toutes vos données (préférences, profil, historique de conversation)
sont stockées uniquement sur votre appareil (localStorage).
Nous n'y avons pas accès. Elles ne nous sont jamais transmises.

─────────────────────────────────────
2. CE QUE NOUS NE FAISONS JAMAIS
─────────────────────────────────────
- Nous ne vendons aucune donnée personnelle.
- Nous ne partageons aucune donnée avec des tiers.
- Nous ne profilons pas nos utilisateurs.
- Nous ne transmettons aucune information à des annonceurs.

─────────────────────────────────────
3. PROTOCOLE DE SÉCURITÉ — CAS EXCEPTIONNEL
─────────────────────────────────────
Or Eille AI intègre un système de détection bienveillante.
Si l'assistant détecte des signaux préoccupants (sons, mots, contextes
suggérant une situation de danger), des données peuvent être conservées
localement sur votre appareil — uniquement dans ce contexte précis.

Ces données :
- Restent sur votre appareil uniquement
- Ne nous sont jamais transmises
- Concernent exclusivement les échanges liés à la situation détectée
- Sont à votre disposition uniquement, jamais à la nôtre
- Sont conservées à vie, pour vous servir de preuve si vous en avez besoin

En acceptant nos CGU, vous consentez à cette conservation silencieuse,
dans le seul but de vous protéger.
Lorsque vous activez le protocole de sécurité, vous accédez à ces données
et autorisez leur utilisation, y compris de manière rétroactive,
pour les échanges liés à ce contexte spécifique.

─────────────────────────────────────
4. INTELLIGENCE ARTIFICIELLE
─────────────────────────────────────
Conformément à l'IA Act européen (en vigueur août 2026) :
Or Eille AI est un système d'intelligence artificielle.
Il ne remplace jamais un professionnel humain.
Il se présente toujours comme une IA — jamais comme un humain.

─────────────────────────────────────
5. VOS DROITS
─────────────────────────────────────
Conformément au RGPD, vous disposez d'un droit d'accès, de rectification
et de suppression de vos données.
Comme vos données sont stockées localement sur votre appareil,
vous pouvez les supprimer à tout moment depuis les paramètres de votre navigateur.

Pour toute question : madameoreille.studio@gmail.com
`,

  // Afficher la page mentions légales
  showPage(section = 'mentions') {
    const existing = document.getElementById('legalPage');
    if (existing) existing.remove();

    const content = section === 'privacy' ? this.PRIVACY : this.MENTIONS;

    const page = document.createElement('div');
    page.id = 'legalPage';
    page.style.cssText = `
      position:fixed;inset:0;background:#F7F4EF;z-index:99998;
      overflow-y:auto;padding:2rem 1rem;
    `;
    page.innerHTML = `
      <div style="max-width:640px;margin:0 auto;">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;border-bottom:1px solid rgba(196,153,58,.3);padding-bottom:1rem;">
          <img src="logo.png" style="width:40px;opacity:.8;" onerror="this.style.display='none'"/>
          <span style="font-family:'Basteleur',serif;color:#C4993A;font-size:1.1rem;">Or Eille AI</span>
          <button onclick="document.getElementById('legalPage').remove()" 
            style="margin-left:auto;background:none;border:1px solid rgba(196,153,58,.4);color:#C4993A;padding:.4rem .8rem;cursor:pointer;font-size:.7rem;letter-spacing:.1em;">
            ✕ Fermer
          </button>
        </div>
        <div style="font-family:Georgia,serif;font-size:.85rem;line-height:1.9;color:#2a2a2a;white-space:pre-wrap;">
          ${content}
        </div>
      </div>
    `;
    document.body.appendChild(page);
  }
};

window.LEGAL = LEGAL;
