// ═══════════════════════════════════════════════════
//  TEMPLATES CONTENU — Or Eille AI v2.0
//  Légendes, planificateur, recyclage, titres, ebook
// ═══════════════════════════════════════════════════

const CONTENT = {
  KEY: 'moe_content',

  PLATFORM_SPECS: {
    instagram: { maxChars: 2200, hashtagLimit: 30, captionTips: 'Accroché dans les 125 premiers caractères. Call to action en fin.' },
    tiktok: { maxChars: 2200, hashtagLimit: 10, captionTips: 'Court et direct. 3-5 hashtags max. Premier mot = accroche.' },
    youtube: { maxChars: 5000, hashtagLimit: 15, captionTips: 'Optimisé SEO. Mots-clés dans les 100 premiers caractères.' },
    snapchat: { maxChars: 250, hashtagLimit: 0, captionTips: 'Très court, direct, émojis bienvenus.' },
    pinterest: { maxChars: 500, hashtagLimit: 20, captionTips: 'Descriptif et riche en mots-clés.' },
    linkedin: { maxChars: 3000, hashtagLimit: 5, captionTips: 'Professionnel. Accroche sur 2 lignes max avant "voir plus".' },
  },

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {
      calendar: [], templates: [], contentHistory: [], burnoutScore: 0
    }; } catch { return {}; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  // ─── Générer une légende ───────────────────────
  async generateCaption(params, claudeKey) {
    const { topic, platform, tone, includeHashtags, style } = params;
    if (!claudeKey) return null;
    const spec = this.PLATFORM_SPECS[platform] || this.PLATFORM_SPECS.instagram;

    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 600,
          messages: [{
            role: 'user',
            content: `Écris une légende ${platform} pour: "${topic}"
Ton: ${tone || 'chaleureux et authentique'}
${style ? 'Style: ' + style : ''}
Limite: ${spec.maxChars} caractères
Conseils plateforme: ${spec.captionTips}
${includeHashtags ? `Inclure ${spec.hashtagLimit} hashtags pertinents` : 'Sans hashtags'}

Génère UNIQUEMENT la légende — prête à copier-coller. Pas d'explication.`
          }]
        })
      });
      const data = await r.json();
      return data.content[0].text;
    } catch { return null; }
  },

  // ─── Générer des titres accrocheurs ───────────
  async generateTitles(topic, count, claudeKey) {
    if (!claudeKey) return null;
    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 400,
          messages: [{
            role: 'user',
            content: `Génère ${count || 10} titres accrocheurs pour un contenu sur: "${topic}"

Varie les approches:
- Question intrigante
- Chiffre précis
- Promesse forte
- Contre-intuition
- Urgence
- Émotion
- Mystère

Réponds UNIQUEMENT avec la liste numérotée des titres. Pas d'explication.`
          }]
        })
      });
      const data = await r.json();
      return data.content[0].text;
    } catch { return null; }
  },

  // ─── Recycler du contenu ──────────────────────
  async recycleContent(originalContent, originalFormat, targetFormat, claudeKey) {
    if (!claudeKey) return null;
    const conversions = {
      'reel-carousel': 'Transforme ce script de Reel en 7-10 slides de carrousel Instagram. Chaque slide = une idée clé.',
      'text-stories': 'Transforme ce texte en 5 stories Instagram. Chaque story = une phrase courte et percutante.',
      'video-newsletter': 'Transforme ce transcript vidéo en newsletter engageante avec intro, corps et call to action.',
      'podcast-reel': 'Extrait les 3 moments les plus forts de ce podcast pour en faire 3 scripts de Reels courts.',
      'article-twitter': 'Transforme cet article en fil Twitter/X de 10 tweets. Premier tweet = accroche forte.',
    };

    const conversionKey = `${originalFormat}-${targetFormat}`;
    const prompt = conversions[conversionKey] || `Transforme ce contenu ${originalFormat} en ${targetFormat}.`;

    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 800,
          messages: [{ role: 'user', content: `${prompt}\n\nContenu original:\n${originalContent}` }]
        })
      });
      const data = await r.json();
      return data.content[0].text;
    } catch { return null; }
  },

  // ─── Planificateur de contenu ─────────────────
  addToCalendar(content) {
    const d = this.get();
    d.calendar.push({ id: Date.now().toString(), ...content, addedAt: new Date().toISOString() });
    d.calendar.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
    this.save(d);
  },

  getUpcoming() {
    const d = this.get();
    const now = new Date();
    return d.calendar.filter(c => new Date(c.scheduledFor) > now).slice(0, 5);
  },

  checkPublishingGap() {
    const d = this.get();
    const history = d.contentHistory;
    if (!history.length) return null;
    const lastPublished = new Date(history[0].publishedAt);
    const daysSince = Math.round((Date.now() - lastPublished.getTime()) / 86400000);
    if (daysSince >= 3) {
      return { daysSince, message: `Vous n'avez pas publié depuis ${daysSince} jours. Votre communauté vous attend !` };
    }
    return null;
  },

  // ─── Détection burnout ────────────────────────
  checkBurnout(recentContent) {
    if (!recentContent?.length) return null;
    const negativeKeywords = ['épuisé', 'fatiguée', 'plus envie', 'arrêter', 'pas bien', 'difficile', 'trop dur', 'n\'en peux plus'];
    const matches = recentContent.filter(c =>
      negativeKeywords.some(kw => (c.caption || c.text || '').toLowerCase().includes(kw))
    );
    if (matches.length >= 3) {
      return {
        detected: true,
        count: matches.length,
        message: 'Je remarque que vous traversez une période difficile. Prenez soin de vous. Si vous avez besoin d\'une vraie écoute, Madame Or Eille est là.',
        madameUrl: 'https://calendly.com/madameoreille' || '#'
      };
    }
    return null;
  },

  // ─── Générer un ebook ─────────────────────────
  async generateEbook(params, claudeKey) {
    const { title, chapters, audience, style } = params;
    if (!claudeKey) return null;
    if (window.addChatMsg) addChatMsg('assistant', '📚 Génération de votre ebook en cours...');
    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Écris un ebook complet intitulé "${title}".
Audience: ${audience || 'grand public'}
Style: ${style || 'accessible et pratique'}
Chapitres souhaités: ${chapters || '5 chapitres'}

Structure:
- Page de titre
- Introduction engageante
- ${chapters || 5} chapitres complets avec contenu réel
- Conclusion avec call to action
- Bonus ou ressources

Écris TOUT le contenu — pas de placeholder. Prêt à publier.`
          }]
        })
      });
      const data = await r.json();
      const ebook = data.content[0].text;
      if (window.addChatMsg) addChatMsg('assistant', `📚 Ebook généré !\n\n${ebook.substring(0, 500)}...\n\n[Contenu complet disponible — ${ebook.length} caractères]`);
      return ebook;
    } catch { return null; }
  },

  // ─── Rendu panel ──────────────────────────────
  renderPanel() {
    const d = this.get();
    const upcoming = this.getUpcoming();
    const gap = this.checkPublishingGap();

    return `
    <div style="padding:1.1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.8rem">

      ${gap ? `<div style="background:rgba(196,153,58,.1);border:1px solid rgba(196,153,58,.3);padding:.6rem;font-size:.54rem;color:var(--gold)">⏰ ${gap.message}</div>` : ''}

      <!-- Légende -->
      <div class="sec-title">✍ Générer une légende</div>
      <input type="text" id="ct-topic" placeholder="Sujet du contenu"/>
      <button class="voice-btn" onclick="WHISPER.start(t=>document.getElementById('ct-topic').value=t)">🎙 Dicter</button>
      <div style="display:flex;gap:.4rem">
        <select id="ct-platform" style="flex:1;background:var(--dark-mid);border:1px solid var(--border);color:var(--text);font-family:'Josefin Sans',sans-serif;font-size:.58rem;padding:.45rem;outline:none">
          ${Object.keys(this.PLATFORM_SPECS).map(p => `<option value="${p}">${p.charAt(0).toUpperCase()+p.slice(1)}</option>`).join('')}
        </select>
        <button class="btn btn-gold" style="flex:2" onclick="CONTENT.generateCaption({topic:document.getElementById('ct-topic').value,platform:document.getElementById('ct-platform').value,includeHashtags:true},true).then(c=>{if(c&&window.addChatMsg)addChatMsg('assistant',c)})">Générer</button>
      </div>

      <div class="sep"></div>

      <!-- Titres -->
      <div class="sec-title">💡 Générateur de titres</div>
      <div style="display:flex;gap:.4rem">
        <input type="text" id="ct-title-topic" placeholder="Sujet" style="flex:1"/>
        <button class="btn btn-ghost" onclick="CONTENT.generateTitles(document.getElementById('ct-title-topic').value,10,true).then(t=>{if(t&&window.addChatMsg)addChatMsg('assistant',t)})">10 titres</button>
      </div>

      <div class="sep"></div>

      <!-- Recyclage -->
      <div class="sec-title">♻ Recycler du contenu</div>
      <textarea id="ct-original" placeholder="Collez votre contenu original ici..." style="min-height:80px"></textarea>
      <div style="display:flex;gap:.4rem">
        <select id="ct-from" style="flex:1;background:var(--dark-mid);border:1px solid var(--border);color:var(--text);font-family:'Josefin Sans',sans-serif;font-size:.56rem;padding:.4rem;outline:none">
          <option value="reel">Reel</option>
          <option value="text">Texte</option>
          <option value="video">Vidéo</option>
          <option value="podcast">Podcast</option>
          <option value="article">Article</option>
        </select>
        <span style="font-size:.8rem;color:var(--muted);align-self:center">→</span>
        <select id="ct-to" style="flex:1;background:var(--dark-mid);border:1px solid var(--border);color:var(--text);font-family:'Josefin Sans',sans-serif;font-size:.56rem;padding:.4rem;outline:none">
          <option value="carousel">Carrousel</option>
          <option value="stories">Stories</option>
          <option value="newsletter">Newsletter</option>
          <option value="reel">Reel</option>
          <option value="twitter">Twitter/X</option>
        </select>
      </div>
      <button class="btn btn-ghost" onclick="CONTENT.recycleContent(document.getElementById('ct-original').value,document.getElementById('ct-from').value,document.getElementById('ct-to').value,true).then(r=>{if(r&&window.addChatMsg)addChatMsg('assistant',r)})">♻ Recycler</button>

      <div class="sep"></div>

      <!-- Planificateur -->
      <div class="sec-title">📅 Planificateur</div>
      ${upcoming.length > 0 ? `
        ${upcoming.map(c => `
          <div style="display:flex;align-items:center;gap:.5rem;padding:.4rem 0;border-bottom:1px solid var(--border)">
            <div style="font-size:.5rem;color:var(--gold);min-width:50px">${new Date(c.scheduledFor).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})}</div>
            <div style="flex:1;font-size:.54rem;color:var(--text)">${c.title || 'Contenu'}</div>
            <div style="font-size:.46rem;color:var(--muted)">${c.platform||''}</div>
          </div>
        `).join('')}
      ` : '<div style="font-size:.54rem;color:var(--muted)">Aucun contenu planifié.</div>'}
      <button class="btn btn-ghost" onclick="CONTENT.addToCalendar({title:prompt('Titre du contenu:'),platform:prompt('Plateforme:'),scheduledFor:new Date(prompt('Date (YYYY-MM-DD):')).toISOString()});document.getElementById('contentContent').innerHTML=CONTENT.renderPanel()">+ Planifier</button>

      <div class="sep"></div>

      <!-- Ebook -->
      <div class="sec-title">📚 Créer un ebook</div>
      <input type="text" id="ct-ebook-title" placeholder="Titre de votre ebook"/>
      <button class="btn btn-ghost" onclick="CONTENT.generateEbook({title:document.getElementById('ct-ebook-title').value,chapters:5},true)">📚 Générer l'ebook</button>
    </div>`;
  }
};

window.CONTENT = CONTENT;

// Vérifier le gap de publication au chargement
window.addEventListener('load', () => {
  setTimeout(() => {
    const gap = CONTENT.checkPublishingGap();
    if (gap && window.addChatMsg) addChatMsg('assistant', `⏰ ${gap.message}`);
  }, 4000);
});
