// ═══════════════════════════════════════════════════
//  MEMOIRE EDITORIALE — Or Eille AI v2.0
//  La Lune se souvient de tout ce que tu as cree
//  © 2026 Madame Or Eille Studios
// ═══════════════════════════════════════════════════

const EDITORIAL = {
  KEY: 'moe_editorial',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { posts: [], topics: {} }; }
    catch { return { posts: [], topics: {} }; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  // Enregistrer un contenu publie
  addPost(title, topic, platform, angle) {
    const d = this.get();
    d.posts.unshift({
      id: Date.now().toString(),
      title: title,
      topic: topic,
      platform: platform || 'instagram',
      angle: angle || '',
      date: new Date().toISOString()
    });
    d.posts = d.posts.slice(0, 500);
    if (!d.topics[topic]) d.topics[topic] = 0;
    d.topics[topic]++;
    this.save(d);
    if (window.addChatMsg) addChatMsg('assistant', 'Memorise ! Or Eille AI s en souviendra pour vous suggerer de nouveaux angles.');
  },

  // Verifier si un sujet a deja ete traite
  async checkTopic(topic, claudeKey) {
    const d = this.get();
    const related = d.posts.filter(function(p) {
      return p.topic.toLowerCase().includes(topic.toLowerCase()) ||
             topic.toLowerCase().includes(p.topic.toLowerCase()) ||
             p.title.toLowerCase().includes(topic.toLowerCase());
    }).slice(0, 10);

    if (related.length === 0) {
      if (window.addChatMsg) addChatMsg('assistant', 'Nouveau sujet ! Vous n avez jamais traite "' + topic + '". Foncez.');
      return;
    }

    if (!claudeKey) {
      const list = related.map(function(p) { return '- ' + p.title + ' (' + new Date(p.date).toLocaleDateString('fr-FR') + ')'; }).join('\n');
      if (window.addChatMsg) addChatMsg('assistant', 'Vous avez deja traite ce sujet ' + related.length + ' fois :\n' + list);
      return;
    }

    const history = related.map(function(p) {
      return p.title + ' — ' + new Date(p.date).toLocaleDateString('fr-FR') + ' — angle: ' + (p.angle || 'non precise');
    }).join('\n');

    if (window.addChatMsg) addChatMsg('assistant', 'Analyse de votre historique sur "' + topic + '"...');

    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 800,
          messages: [{
            role: 'user',
            content: 'Cette creatrice a deja traite le sujet "' + topic + '" dans ces contenus :\n\n' + history + '\n\nPropose-lui 5 angles completement differents et frais pour aborder ce sujet a nouveau. Sois concret et inspire. Format : 1 ligne par angle, commence par un emoji.'
          }]
        })
      });
      const data = await r.json();
      if (window.addChatMsg) addChatMsg('assistant', 'Vous avez deja traite "' + topic + '" ' + related.length + ' fois. Voici 5 angles nouveaux :\n\n' + data.content[0].text);
    } catch(e) {
      if (window.addChatMsg) addChatMsg('assistant', 'Erreur. Verifiez votre connexion.');
    }
  },

  // Analyse de coherence de marque
  async checkBrandConsistency(claudeKey) {
    const d = this.get();
    if (d.posts.length < 10) {
      if (window.addChatMsg) addChatMsg('assistant', 'Ajoutez au moins 10 contenus pour analyser la coherence de votre marque.');
      return;
    }

    const recent = d.posts.slice(0, 20).map(function(p) {
      return p.title + ' (' + p.platform + ' — ' + new Date(p.date).toLocaleDateString('fr-FR') + ')';
    }).join('\n');

    if (!claudeKey) { if (window.addChatMsg) addChatMsg('assistant', 'Cle API requise.'); return; }
    if (window.addChatMsg) addChatMsg('assistant', 'Analyse de la coherence de votre marque...');

    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 1000,
          messages: [{
            role: 'user',
            content: 'Analyse ces 20 derniers contenus d une creatrice et dis-lui :\n1. Les themes recurrents de sa marque\n2. Si le ton semble coherent ou s il derive\n3. Ce qui manque ou ce qui est sur-represente\n4. Une recommandation concrete\n\nContenus :\n' + recent + '\n\nSois chaleureux et constructif. Commence par les points positifs.'
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
    const topTopics = Object.entries(d.topics || {}).sort(function(a,b) { return b[1]-a[1]; }).slice(0,5);

    return '<div style="padding:1.1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.8rem">' +

      '<div class="sec-title">🌙 Memoire editoriale</div>' +
      '<p class="note">Or Eille AI se souvient de tout ce que vous avez cree. Il vous evite les repetitions et vous propose toujours des angles frais.</p>' +

      '<div style="background:linear-gradient(135deg,rgba(26,22,16,.98),rgba(44,35,24,.95));border:1px solid rgba(196,153,58,.3);padding:.8rem;position:relative;overflow:hidden">' +
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none"><div style="font-size:8rem;opacity:.04;color:#C4993A;transform:rotate(-15deg)">👂</div></div>' +
        '<p style="font-size:.54rem;color:rgba(240,232,216,.85);line-height:1.8;position:relative;z-index:1">' +
          'Vous avez deja traite ce sujet il y a 6 mois ? Or Eille AI le sait. Il vous propose 5 angles que vous n avez jamais explores. Jamais de repetition. Toujours du contenu frais.' +
        '</p>' +
        '<p style="font-size:.42rem;color:rgba(196,153,58,.4);text-align:right;margin-top:.4rem;font-style:italic;position:relative;z-index:1">— Madame Or Eille Studios</p>' +
      '</div>' +

      '<div style="display:flex;gap:.4rem;align-items:flex-end">' +
        '<div style="flex:1"><span class="klabel">Verifier un sujet</span>' +
          '<input type="text" id="ed-topic" placeholder="Ex: soins cheveux, productivite, voyage..." style="margin-top:.2rem"/>' +
        '</div>' +
        '<button onclick="EDITORIAL.checkTopic(document.getElementById(\'ed-topic\').value, true)" style="padding:.5rem .7rem;background:var(--gold);color:var(--dark);border:none;font-size:.5rem;cursor:pointer;white-space:nowrap">Verifier</button>' +
      '</div>' +

      '<button class="btn btn-ghost" onclick="EDITORIAL.checkBrandConsistency(true)">📊 Analyser la coherence de ma marque</button>' +

      (topTopics.length > 0 ? (
        '<div class="sec-title">Vos sujets les plus traites</div>' +
        topTopics.map(function(t) {
          return '<div style="display:flex;align-items:center;gap:.4rem;padding:.4rem;border:1px solid var(--border)">' +
            '<span style="flex:1;font-size:.54rem;color:var(--text)">' + t[0] + '</span>' +
            '<span style="font-size:.5rem;color:var(--gold);border:1px solid rgba(196,153,58,.3);padding:.1rem .3rem">' + t[1] + ' fois</span>' +
          '</div>';
        }).join('')
      ) : '') +

      '<div class="sec-title">Ajouter un contenu a la memoire</div>' +
      '<input type="text" id="ed-title" placeholder="Titre du contenu"/>' +
      '<input type="text" id="ed-topic2" placeholder="Sujet principal"/>' +
      '<input type="text" id="ed-angle" placeholder="Angle choisi (optionnel)"/>' +
      '<div style="display:flex;gap:.3rem">' +
        ['instagram','tiktok','youtube','podcast','newsletter'].map(function(p) {
          return '<button onclick="document.querySelectorAll(\'.ed-plat\').forEach(function(b){b.style.background=\'var(--dark-mid)\';b.style.color=\'var(--muted)\'});this.style.background=\'rgba(196,153,58,.2)\';this.style.color=\'var(--gold)\';document.getElementById(\'ed-plat\').value=\'' + p + '\'" class="ed-plat" style="flex:1;padding:.3rem .2rem;background:var(--dark-mid);border:1px solid var(--border);color:var(--muted);font-family:\'Josefin Sans\',sans-serif;font-size:.44rem;cursor:pointer">' + p + '</button>';
        }).join('') +
        '<input type="hidden" id="ed-plat" value="instagram"/>' +
      '</div>' +
      '<button class="btn btn-gold" onclick="const t=document.getElementById(\'ed-title\').value;const tp=document.getElementById(\'ed-topic2\').value;const a=document.getElementById(\'ed-angle\').value;const p=document.getElementById(\'ed-plat\').value;if(t&&tp){EDITORIAL.addPost(t,tp,p,a);document.getElementById(\'ed-title\').value=\'\';document.getElementById(\'ed-topic2\').value=\'\';document.getElementById(\'ed-angle\').value=\'\'}">+ Memoriser ce contenu</button>' +

      '<div style="font-size:.46rem;color:var(--muted)">' + d.posts.length + ' contenu(s) en memoire</div>' +

    '</div>';
  }
};

window.EDITORIAL = EDITORIAL;
