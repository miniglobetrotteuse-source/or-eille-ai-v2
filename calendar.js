// ═══════════════════════════════════════════════════
//  CALENDRIER ÉDITORIAL — Or Eille AI v2.0
//  Planifier selon tendances, lune, events
//  © 2026 Madame Or Eille Studios
// ═══════════════════════════════════════════════════

const CALENDAR = {
  KEY: 'moe_calendar',

  MOON_PHASES: [
    'Nouvelle lune — ideal pour lancer du nouveau contenu',
    'Premier croissant — momentum, croissance, visibilite',
    'Premier quartier — action, decisif, call to action fort',
    'Gibbeuse croissante — peaufiner, affiner, details',
    'Pleine lune — maximum de visibilite, contenu fort et emotionnel',
    'Gibbeuse decroissante — partager, remercier, bilan',
    'Dernier quartier — reflechir, analyser, nettoyer',
    'Dernier croissant — se reposer, preparer, planifier',
  ],

  BEST_TIMES: {
    instagram: { weekdays: ['Mardi', 'Mercredi', 'Jeudi'], hours: ['7h-9h', '11h-13h', '17h-19h'] },
    tiktok: { weekdays: ['Mardi', 'Jeudi', 'Vendredi', 'Samedi'], hours: ['7h-9h', '15h-17h', '19h-21h'] },
    youtube: { weekdays: ['Jeudi', 'Vendredi', 'Samedi', 'Dimanche'], hours: ['12h-16h', '20h-22h'] },
    facebook: { weekdays: ['Mercredi', 'Jeudi', 'Vendredi'], hours: ['9h-10h', '12h-13h', '16h-17h'] },
    linkedin: { weekdays: ['Mardi', 'Mercredi', 'Jeudi'], hours: ['7h-8h', '12h-13h', '17h-18h'] },
    podcast: { weekdays: ['Mercredi', 'Jeudi', 'Vendredi'], hours: ['6h-8h', '17h-19h'] },
  },

  ANNUAL_EVENTS: {
    '01-01': 'Nouvel An — renouveau, resolutions, bonne annee',
    '02-14': 'Saint-Valentin — amour, partage, emotion',
    '03-08': 'Journee internationale des femmes',
    '04-01': 'Poisson d avril — humour, creativite',
    '05-01': 'Fete du travail',
    '06-21': 'Fete de la musique — en France',
    '10-31': 'Halloween — creativite, costumes',
    '12-25': 'Noel — famille, partage, bienveillance',
    '12-31': 'Reveillon — bilan, projections, merci',
  },

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { posts: [], ideas: [] }; }
    catch { return { posts: [], ideas: [] }; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  getMoonPhase() {
    const now = new Date();
    const known = new Date('2024-01-11');
    const diff = (now - known) / (1000 * 60 * 60 * 24);
    const phase = Math.floor((diff % 29.53) / 29.53 * 8);
    return this.MOON_PHASES[phase] || this.MOON_PHASES[0];
  },

  getUpcomingEvents() {
    const now = new Date();
    const month = String(now.getMonth()+1).padStart(2,'0');
    const day = String(now.getDate()).padStart(2,'0');
    const upcoming = [];
    Object.entries(this.ANNUAL_EVENTS).forEach(function(entry) {
      const key = entry[0]; const val = entry[1];
      const eventMonth = key.split('-')[0];
      const eventDay = key.split('-')[1];
      const eventDate = new Date(now.getFullYear(), parseInt(eventMonth)-1, parseInt(eventDay));
      if (eventDate >= now) {
        const daysLeft = Math.round((eventDate - now) / (1000*60*60*24));
        if (daysLeft <= 30) upcoming.push({ date: key, label: val, daysLeft });
      }
    });
    return upcoming.sort(function(a,b) { return a.daysLeft - b.daysLeft; });
  },

  addIdea(title, platform, scheduledDate) {
    const d = this.get();
    d.ideas.push({ id: Date.now().toString(), title, platform: platform||'instagram', scheduledDate: scheduledDate||'', status: 'planned', createdAt: new Date().toISOString() });
    d.ideas.sort(function(a,b) { return a.scheduledDate > b.scheduledDate ? 1 : -1; });
    this.save(d);
    if (window.addChatMsg) addChatMsg('assistant', 'Idee planifiee : "' + title + '"');
  },

  async generateIdeas(niche, platform, period, claudeKey) {
    if (!claudeKey) { if (window.addChatMsg) addChatMsg('assistant', 'Cle API requise.'); return; }
    if (window.addChatMsg) addChatMsg('assistant', 'Generation d idees de contenu pour les ' + (period||'2 prochaines semaines') + '...');
    const moon = this.getMoonPhase();
    const events = this.getUpcomingEvents().map(function(e) { return e.label + ' dans ' + e.daysLeft + ' jours'; }).join(', ');
    const bestTimes = this.BEST_TIMES[platform.toLowerCase()] || this.BEST_TIMES.instagram;

    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 1000,
          messages: [{
            role: 'user',
            content: 'Cree un calendrier editorial pour ' + (period||'2 semaines') + ' pour un createur ' + (niche||'creatif') + ' sur ' + platform + '.\n\nContexte :\n- Phase lunaire : ' + moon + '\n- Evenements proches : ' + (events||'aucun') + '\n- Meilleurs jours : ' + bestTimes.weekdays.join(', ') + '\n- Meilleures heures : ' + bestTimes.hours.join(', ') + '\n\nPropose 7 a 10 idees de contenu avec : date suggeree, sujet, angle, format (Reel/Carrousel/Story/Live). Sois inspire et concret.'
          }]
        })
      });
      const data = await r.json();
      if (window.addChatMsg) addChatMsg('assistant', data.content[0].text);
    } catch(e) {
      if (window.addChatMsg) addChatMsg('assistant', 'Erreur. Verifiez votre connexion.');
    }
  },

  renderPanel: function() {
    const d = this.get();
    const moon = this.getMoonPhase();
    const events = this.getUpcomingEvents();
    const planned = d.ideas.filter(function(i) { return i.status === 'planned'; });

    return '<div style="padding:1.1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.8rem">' +

      '<div class="sec-title">📅 Calendrier editorial</div>' +

      '<div style="background:linear-gradient(135deg,rgba(26,22,16,.98),rgba(44,35,24,.95));border:1px solid rgba(196,153,58,.3);padding:.8rem;position:relative;overflow:hidden">' +
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none"><div style="font-size:8rem;opacity:.04;color:#C4993A;transform:rotate(-15deg)">👂</div></div>' +
        '<div style="position:relative;z-index:1">' +
          '<div style="font-size:.48rem;color:rgba(196,153,58,.6);margin-bottom:.3rem">🌙 Phase lunaire actuelle</div>' +
          '<div style="font-size:.54rem;color:rgba(240,232,216,.85);line-height:1.7">' + moon + '</div>' +
        '</div>' +
        '<p style="font-size:.42rem;color:rgba(196,153,58,.4);text-align:right;margin-top:.4rem;font-style:italic;position:relative;z-index:1">— Madame Or Eille Studios</p>' +
      '</div>' +

      (events.length > 0 ? (
        '<div class="sec-title">📌 Evenements proches</div>' +
        events.slice(0,4).map(function(e) {
          return '<div style="display:flex;align-items:center;gap:.4rem;padding:.4rem;border:1px solid var(--border)">' +
            '<span style="font-size:.5rem;color:var(--gold);min-width:40px">J-' + e.daysLeft + '</span>' +
            '<span style="font-size:.52rem;color:var(--muted)">' + e.label + '</span>' +
          '</div>';
        }).join('')
      ) : '') +

      '<div class="sec-title">Generer des idees de contenu</div>' +
      '<input type="text" id="cal-niche" placeholder="Votre niche — ex: beaute naturelle, cuisine africaine..."/>' +
      '<div style="display:flex;gap:.3rem;flex-wrap:wrap">' +
        ['Instagram','TikTok','YouTube','Podcast','Newsletter'].map(function(p) {
          return '<button onclick="document.querySelectorAll(\'.cal-plat\').forEach(function(b){b.style.background=\'var(--dark-mid)\';b.style.color=\'var(--muted)\'});this.style.background=\'rgba(196,153,58,.2)\';this.style.color=\'var(--gold)\';document.getElementById(\'cal-platform\').value=\'' + p + '\'" class="cal-plat" style="flex:1;padding:.3rem .2rem;background:var(--dark-mid);border:1px solid var(--border);color:var(--muted);font-family:\'Josefin Sans\',sans-serif;font-size:.44rem;cursor:pointer">' + p + '</button>';
        }).join('') +
        '<input type="hidden" id="cal-platform" value="Instagram"/>' +
      '</div>' +
      '<button class="btn btn-gold" onclick="CALENDAR.generateIdeas(document.getElementById(\'cal-niche\').value, document.getElementById(\'cal-platform\').value, \'2 semaines\', true)">✨ Generer mon calendrier editorial</button>' +

      '<div class="sep"></div>' +
      '<div class="sec-title">Ajouter une idee planifiee</div>' +
      '<input type="text" id="cal-idea" placeholder="Titre de l idee"/>' +
      '<input type="date" id="cal-date" style="background:var(--dark-mid);border:1px solid var(--border);color:var(--text);font-family:\'Josefin Sans\',sans-serif;font-size:.56rem;padding:.45rem;outline:none;width:100%"/>' +
      '<button class="btn btn-ghost" onclick="CALENDAR.addIdea(document.getElementById(\'cal-idea\').value,\'instagram\',document.getElementById(\'cal-date\').value)">+ Planifier</button>' +

      (planned.length > 0 ? (
        '<div class="sec-title">Idees planifiees (' + planned.length + ')</div>' +
        planned.slice(0,10).map(function(i) {
          return '<div style="display:flex;align-items:center;gap:.4rem;padding:.5rem;border:1px solid var(--border)">' +
            '<div style="flex:1">' +
              '<div style="font-size:.54rem;color:var(--text)">' + i.title + '</div>' +
              (i.scheduledDate ? '<div style="font-size:.46rem;color:var(--muted)">📅 ' + i.scheduledDate + '</div>' : '') +
            '</div>' +
            '<button onclick="const d=CALENDAR.get();d.ideas=d.ideas.filter(function(x){return x.id!==\'' + i.id + '\'});CALENDAR.save(d);document.getElementById(\'calendarContent\').innerHTML=CALENDAR.renderPanel()" style="background:transparent;border:none;color:#ef5350;font-size:.8rem;cursor:pointer">×</button>' +
          '</div>';
        }).join('')
      ) : '') +

    '</div>';
  }
};

window.CALENDAR = CALENDAR;
