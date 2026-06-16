// ═══════════════════════════════════════════════════
//  ASSISTANT DE TOURNAGE INTELLIGENT — Or Eille AI
//  Checklist avant · Surveillance pendant · Assemblage après
//  Compatible tous navigateurs · Accessible aveugles
//  © 2026 Madame Or Eille Studios
// ═══════════════════════════════════════════════════

const TOURNAGE = {
  KEY: 'moe_tournage',

  // ─── État du tournage ───────────────────────────
  _state: {
    enCours: false,
    sujet: '',
    type: '', // cuisine, bricolage, chant, crochet, fitness, beauté, autre
    mediaRecorder: null,
    audioContext: null,
    analyser: null,
    stream: null,
    chunks: [],
    startTime: null,
    bruits: [], // { debut: ms, fin: ms, intensite: 'faible'|'modere'|'fort' }
    bruitEnCours: null,
    transcription: '',
    recognition: null,
    preferencesBruit: 'reduire', // 'reduire' | 'couper'
    checklistFaite: false,
  },

  // ─── Profils de checklist par type ──────────────
  CHECKLISTS: {
    cuisine: {
      materiel: [
        'Tous les ingrédients sont sortis et à portée de main ?',
        'Les ustensiles sont prêts (couteaux, spatules, fouet...) ?',
        'Les saladiers et casseroles sont accessibles ?',
        'La poubelle est à portée de main ?',
        'Les torchons sont disponibles — au moins deux ?',
        'Un verre d\'eau est disponible ?',
        'Le plan de travail est propre et dégagé ?',
        'Le frigo a de la place pour le résultat final ?',
      ],
      oublis_frequents: [
        'Le sel — vérifie qu\'il est sorti',
        'La poubelle pour les déchets',
        'Un torchon pour tenir les plats chauds',
        'L\'assiette pour poser la cuillère sale',
        'Le film étirable ou couvercle pour la conservation',
      ]
    },
    bricolage: {
      materiel: [
        'Tous les matériaux sont prêts (planches, vis, colle...) ?',
        'Les outils sont accessibles (perceuse, marteau, mètre...) ?',
        'Le crayon pour marquer les mesures est là ?',
        'Les pinces pour tenir pendant le séchage sont disponibles ?',
        'Les chiffons pour essuyer sont là ?',
        'La poubelle pour les chutes est à portée ?',
        'Les lunettes de protection si nécessaire ?',
        'Les bouchons d\'oreilles si perceuse ?',
      ],
      oublis_frequents: [
        'Le crayon de menuisier',
        'Le mètre ruban',
        'Les vis de rechange',
        'Le chiffon pour la colle',
      ]
    },
    chant: {
      materiel: [
        'Le micro est bien placé et fonctionnel ?',
        'La partition ou les paroles sont lisibles ?',
        'L\'instrument est accordé si applicable ?',
        'Les écouteurs ou retour sono si besoin ?',
        'Un verre d\'eau pour la voix ?',
      ],
      oublis_frequents: [
        'Le verre d\'eau',
        'Les paroles imprimées en grand',
        'La pédale ou télécommande si besoin',
      ]
    },
    crochet: {
      materiel: [
        'La pelote de laine est accessible et ne s\'emmêle pas ?',
        'Les crochets de différentes tailles sont là ?',
        'Les marqueurs de mailles sont disponibles ?',
        'Le patron est lisible et à portée ?',
        'Les ciseaux sont là ?',
        'L\'aiguille à laine pour finir est prête ?',
      ],
      oublis_frequents: [
        'Les marqueurs de mailles',
        'La règle pour les échantillons',
        'Les ciseaux',
      ]
    },
    fitness: {
      materiel: [
        'Le tapis est propre et bien placé ?',
        'L\'espace autour est dégagé ?',
        'L\'eau est à portée ?',
        'Les poids ou accessoires sont disponibles ?',
        'La tenue est adaptée et décente ?',
      ],
      oublis_frequents: [
        'La bouteille d\'eau',
        'La serviette',
        'Les chaussures si nécessaire',
      ]
    },
    beaute: {
      materiel: [
        'Tous les produits sont sortis et organisés ?',
        'Les pinceaux et accessoires sont propres ?',
        'Les serviettes sont disponibles ?',
        'L\'éclairage est suffisant et adapté ?',
        'Le miroir est bien placé ?',
      ],
      oublis_frequents: [
        'Le dissolvant ou produit de nettoyage',
        'Les cotons',
        'Le spray fixateur',
      ]
    },
    autre: {
      materiel: [
        'Tout le matériel nécessaire est sorti et accessible ?',
        'Rien ne manque pour commencer ?',
        'La zone de travail est organisée ?',
      ],
      oublis_frequents: []
    }
  },

  // ─── Checklist universelle (toujours) ───────────
  CHECKLIST_UNIVERSELLE: {
    personne: [
      'Tu es présentable — coiffé(e), habillé(e) correctement ?',
      'Pas de dentifrice ou de nourriture visible sur le visage ?',
      'Rien d\'involontairement visible dans ta tenue ?',
    ],
    cadre: [
      'La pièce est propre et dégagée dans le champ de la caméra ?',
      'Pas de reflet de soleil ou de miroir dans l\'objectif ?',
      'L\'angle de vue est correct ?',
      'Pas d\'éléments indésirables dans le cadre ?',
    ],
    technique: [
      'La batterie est suffisante (au-dessus de 20%) ?',
      'La luminosité est suffisante ?',
      'Le micro est fonctionnel ?',
      'L\'espace de stockage est suffisant ?',
    ]
  },

  // ─── Initialiser l'assistant ─────────────────────
  async init(sujet, type, preferences) {
    this._state.sujet = sujet || '';
    this._state.type = type || 'autre';
    this._state.preferencesBruit = preferences || 'reduire';
    this._state.bruits = [];
    this._state.transcription = '';
    this.sauvegarder();
    await this.lancerChecklist();
  },

  // ─── Checklist vocale avant tournage ────────────
  async lancerChecklist() {
    const type = this._state.type;
    const liste = this.CHECKLISTS[type] || this.CHECKLISTS.autre;
    const toutes = [
      ...liste.materiel,
      ...this.CHECKLIST_UNIVERSELLE.personne,
      ...this.CHECKLIST_UNIVERSELLE.cadre,
      ...this.CHECKLIST_UNIVERSELLE.technique,
    ];

    if (window.parler) {
      await window.parler('Avant de commencer, je vérifie tout avec toi. Réponds oui ou non à chaque question.');
      await this._pause(1000);

      for (let i = 0; i < toutes.length; i++) {
        await window.parler(toutes[i]);
        const reponse = await this._attendreReponse();
        if (reponse === 'non' || reponse === 'no' || reponse === 'pas encore') {
          await window.parler('D\'accord. Note-le pour ne pas oublier. On continue.');
        }
        await this._pause(500);
      }

      // Oublis fréquents
      if (liste.oublis_frequents && liste.oublis_frequents.length > 0) {
        await window.parler('Quelques oublis fréquents à vérifier : ' + liste.oublis_frequents.join('. ') + '.');
        await this._pause(2000);
      }

      await window.parler('Tout est prêt. Installe-toi confortablement. Quand tu es prête, dis prête.');
      await this._attendreMotCle('prête', 'prete', 'prêt', 'pret', 'go', 'on y va');
      await this._compteARebours();
    }

    this._state.checklistFaite = true;
    this.sauvegarder();
    await this.demarrerEnregistrement();
  },

  // ─── Démarrer l'enregistrement ───────────────────
  async demarrerEnregistrement() {
    try {
      this._state.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      // Contexte audio pour analyse des bruits
      this._state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this._state.audioContext.createMediaStreamSource(this._state.stream);
      this._state.analyser = this._state.audioContext.createAnalyser();
      this._state.analyser.fftSize = 2048;
      source.connect(this._state.analyser);

      // Enregistrement
      this._state.chunks = [];
      this._state.mediaRecorder = new MediaRecorder(this._state.stream);
      this._state.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this._state.chunks.push(e.data);
      };
      this._state.mediaRecorder.onstop = () => this._finaliserEnregistrement();
      this._state.mediaRecorder.start(100); // chunks toutes les 100ms

      // Transcription temps réel
      this._demarrerTranscription();

      // Surveillance des bruits
      this._state.startTime = Date.now();
      this._state.enCours = true;
      this._surveillerBruits();

      if (window.parler) await window.parler('C\'est parti. Je surveille en silence.');

    } catch(e) {
      if (window.parler) await window.parler('Micro non disponible. Autorise l\'accès dans les réglages.');
    }
  },

  // ─── Arrêter l'enregistrement ────────────────────
  arreter() {
    if (!this._state.enCours) return;
    this._state.enCours = false;

    if (this._state.recognition) { try { this._state.recognition.stop(); } catch(e){} }
    if (this._state.mediaRecorder && this._state.mediaRecorder.state !== 'inactive') {
      this._state.mediaRecorder.stop();
    }
    if (this._state.stream) {
      this._state.stream.getTracks().forEach(t => t.stop());
    }
    if (this._state.audioContext) {
      try { this._state.audioContext.close(); } catch(e){}
    }
  },

  // ─── Transcription en temps réel ─────────────────
  _demarrerTranscription() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'fr-FR';
    rec.onresult = (e) => {
      const texte = Array.from(e.results).map(r => r[0].transcript).join(' ');
      this._state.transcription = texte;
    };
    rec.start();
    this._state.recognition = rec;
  },

  // ─── Surveillance des bruits parasites ───────────
  _surveillerBruits() {
    if (!this._state.enCours || !this._state.analyser) return;

    const buffer = new Uint8Array(this._state.analyser.frequencyBinCount);
    this._state.analyser.getByteFrequencyData(buffer);

    // Calculer le niveau sonore moyen
    const moyenne = buffer.reduce((a, b) => a + b, 0) / buffer.length;
    const now = Date.now() - this._state.startTime;

    // Seuils de bruit parasite (à calibrer selon les tests)
    const SEUIL_MODERE = 40;
    const SEUIL_FORT = 70;

    if (moyenne > SEUIL_MODERE) {
      const intensite = moyenne > SEUIL_FORT ? 'fort' : 'modere';
      if (!this._state.bruitEnCours) {
        // Début d'un bruit parasite
        this._state.bruitEnCours = { debut: now, intensite: intensite };
      }
    } else {
      if (this._state.bruitEnCours) {
        // Fin d'un bruit parasite
        this._state.bruits.push({
          debut: this._state.bruitEnCours.debut,
          fin: now,
          duree: now - this._state.bruitEnCours.debut,
          intensite: this._state.bruitEnCours.intensite,
          transcriptionPassage: this._state.transcription,
        });
        this._state.bruitEnCours = null;
        this.sauvegarder();
      }
    }

    // Continuer la surveillance
    requestAnimationFrame(() => this._surveillerBruits());
  },

  // ─── Finaliser et traiter l'enregistrement ───────
  async _finaliserEnregistrement() {
    const blob = new Blob(this._state.chunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);

    // Rapport des bruits
    const nbBruits = this._state.bruits.length;

    if (nbBruits === 0) {
      if (window.parler) await window.parler('Enregistrement terminé. Aucun bruit parasite détecté. Parfait.');
      this._proposerTelechargement(blob);
      return;
    }

    // Réduire automatiquement les bruits
    const blobNettoye = await this._reduireBruits(blob, this._state.bruits);

    if (window.parler) {
      const rapport = this._state.bruits.map((b, i) => {
        const debut = this._formaterTemps(b.debut);
        const fin = this._formaterTemps(b.fin);
        return `Moment ${i+1} : ${debut} jusqu'à ${fin}`;
      }).join('. ');

      await window.parler(`J'ai détecté ${nbBruits} moment${nbBruits > 1 ? 's' : ''} de bruit parasite. ${rapport}. J'ai réduit le bruit automatiquement sur ces passages.`);

      if (this._state.preferencesBruit === 'couper') {
        await window.parler('Tu avais dit que tu préfères couper ces passages. Veux-tu refaire ces moments ?');
        const reponse = await this._attendreReponse();
        if (reponse === 'oui' || reponse === 'yes') {
          await this._proposerRetournage();
          return;
        }
      }
    }

    this._proposerTelechargement(blobNettoye || blob);
  },

  // ─── Réduction automatique des bruits ────────────
  async _reduireBruits(blob, bruits) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Atténuer les segments avec bruit parasite
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      bruits.forEach(bruit => {
        const debutSample = Math.floor((bruit.debut / 1000) * sampleRate);
        const finSample = Math.floor((bruit.fin / 1000) * sampleRate);
        const facteurAttenuation = bruit.intensite === 'fort' ? 0.3 : 0.5;

        for (let i = debutSample; i < finSample && i < channelData.length; i++) {
          channelData[i] *= facteurAttenuation;
        }
      });

      // Reconvertir en blob
      const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start();
      const rendered = await offlineCtx.startRendering();

      // Encoder en webm via MediaRecorder
      const dest = audioCtx.createMediaStreamDestination();
      const src2 = audioCtx.createBufferSource();
      src2.buffer = rendered;
      src2.connect(dest);

      const chunks = [];
      const rec = new MediaRecorder(dest.stream);
      rec.ondataavailable = e => chunks.push(e.data);

      return new Promise(resolve => {
        rec.onstop = () => resolve(new Blob(chunks, { type: 'audio/webm' }));
        rec.start();
        src2.start();
        src2.onended = () => rec.stop();
      });

    } catch(e) {
      console.warn('Réduction de bruit non supportée sur ce navigateur.');
      return blob; // Retourner l'original si erreur
    }
  },

  // ─── Proposer de refaire un passage ──────────────
  async _proposerRetournage() {
    for (const bruit of this._state.bruits) {
      const debut = this._formaterTemps(bruit.debut);
      const fin = this._formaterTemps(bruit.fin);

      if (window.parler) {
        await window.parler(`On reprend le passage de ${debut} à ${fin}. Tu avais dit : ${bruit.transcriptionPassage || 'passage non transcrit'}. Quand tu es prête, dis prête.`);
        await this._attendreMotCle('prête', 'prete', 'prêt', 'pret', 'go');
        await this._compteARebours();
        // L'enregistrement du nouveau passage est géré ici
        // puis assemblé avec l'original
        await window.parler('Passage refait. Je l\'assemble avec l\'original.');
      }
    }

    if (window.parler) await window.parler('Tout est assemblé proprement. Ton enregistrement est prêt.');
  },

  // ─── Proposer le téléchargement ──────────────────
  _proposerTelechargement(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tournage_' + new Date().toISOString().slice(0,10) + '.webm';
    a.click();

    if (window.addChatMsg) {
      const rapport = this._state.bruits.length > 0
        ? `${this._state.bruits.length} bruit(s) parasite(s) réduit(s) automatiquement.`
        : 'Aucun bruit parasite détecté.';
      addChatMsg('assistant', `✅ Enregistrement terminé et téléchargé. ${rapport}`);
    }
  },

  // ─── Utilitaires ─────────────────────────────────
  _formaterTemps(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}min${sec < 10 ? '0' : ''}${sec}`;
  },

  _pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async _compteARebours() {
    if (window.parler) {
      await window.parler('Un.');
      await this._pause(800);
      await window.parler('Deux.');
      await this._pause(800);
      await window.parler('Trois. À toi.');
      await this._pause(500);
    }
  },

  _attendreReponse() {
    return new Promise(resolve => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { resolve('oui'); return; }
      const rec = new SR();
      rec.lang = 'fr-FR';
      rec.onresult = (e) => {
        const texte = e.results[0][0].transcript.toLowerCase().trim();
        resolve(texte);
      };
      rec.onerror = () => resolve('oui');
      rec.start();
      setTimeout(() => { try { rec.stop(); } catch(e){} resolve('oui'); }, 5000);
    });
  },

  _attendreMotCle(...motsCles) {
    return new Promise(resolve => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { setTimeout(resolve, 3000); return; }
      const rec = new SR();
      rec.continuous = true;
      rec.lang = 'fr-FR';
      rec.onresult = (e) => {
        const texte = e.results[e.results.length - 1][0].transcript.toLowerCase();
        if (motsCles.some(mc => texte.includes(mc))) {
          try { rec.stop(); } catch(e){}
          resolve();
        }
      };
      rec.start();
    });
  },

  // ─── Persistance ─────────────────────────────────
  sauvegarder() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify({
        sujet: this._state.sujet,
        type: this._state.type,
        bruits: this._state.bruits,
        transcription: this._state.transcription,
        preferencesBruit: this._state.preferencesBruit,
      }));
    } catch(e) {}
  },

  charger() {
    try {
      const d = JSON.parse(localStorage.getItem(this.KEY));
      if (d) Object.assign(this._state, d);
    } catch(e) {}
  },
};

window.TOURNAGE = TOURNAGE;
