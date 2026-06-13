// ═══════════════════════════════════════════════════
//  CORRECTION COLORIMÉTRIQUE LOCALISÉE
//  Mode tactile ET mode vocal pur
//  Or Eille AI — v1.0
// ═══════════════════════════════════════════════════

const COLORIZE = {

  // Zone sélectionnée (mode tactile)
  selectedZone: null,
  isSelectingZone: false,
  startX: 0, startY: 0,

  // Reconnaissance vocale pour description de zone
  zoneRecog: null,
  isListeningZone: false,

  // ─── Analyse spatiale d'une description vocale ──
  // "au niveau de la plante sur la table" → zone estimée
  parseZoneDescription(description) {
    const desc = description.toLowerCase();
    // Positions spatiales
    if (/haut.*gauche|gauche.*haut|coin.*supérieur.*gauche/.test(desc)) return { x: 0, y: 0, w: 0.4, h: 0.4 };
    if (/haut.*droite|droite.*haut|coin.*supérieur.*droit/.test(desc)) return { x: 0.6, y: 0, w: 0.4, h: 0.4 };
    if (/bas.*gauche|gauche.*bas|coin.*inférieur.*gauche/.test(desc)) return { x: 0, y: 0.6, w: 0.4, h: 0.4 };
    if (/bas.*droite|droite.*bas|coin.*inférieur.*droit/.test(desc)) return { x: 0.6, y: 0.6, w: 0.4, h: 0.4 };
    if (/haut|plafond|dessus|ciel/.test(desc)) return { x: 0, y: 0, w: 1, h: 0.35 };
    if (/bas|sol|plancher|dessous/.test(desc)) return { x: 0, y: 0.65, w: 1, h: 0.35 };
    if (/gauche/.test(desc)) return { x: 0, y: 0, w: 0.4, h: 1 };
    if (/droite/.test(desc)) return { x: 0.6, y: 0, w: 0.4, h: 1 };
    if (/centre|milieu|au milieu/.test(desc)) return { x: 0.25, y: 0.25, w: 0.5, h: 0.5 };
    if (/tout|partout|toute|ensemble|global/.test(desc)) return { x: 0, y: 0, w: 1, h: 1 };
    // Par défaut — zone centrale
    return { x: 0.2, y: 0.2, w: 0.6, h: 0.6 };
  },

  // ─── Analyse de la correction demandée ───────────
  parseCorrection(text) {
    const t = text.toLowerCase();
    const corrections = [];

    if (/plus.*lumière|rehausse|éclaircir|plus.*clair|illumin/.test(t)) corrections.push({ type: 'brightness', value: 40 });
    if (/moins.*lumière|assombrir|plus.*sombre|baisser.*lumière/.test(t)) corrections.push({ type: 'brightness', value: -40 });
    if (/plus.*chaud|plus.*orange|plus.*jaune|réchauffer/.test(t)) corrections.push({ type: 'warmth', value: 30 });
    if (/moins.*chaud|plus.*froid|bleuir|refroidir/.test(t)) corrections.push({ type: 'warmth', value: -30 });
    if (/plus.*contraste|contraster/.test(t)) corrections.push({ type: 'contrast', value: 40 });
    if (/moins.*contraste|adoucir/.test(t)) corrections.push({ type: 'contrast', value: -40 });
    if (/saturer|plus.*couleur|plus.*vif/.test(t)) corrections.push({ type: 'saturation', value: 40 });
    if (/désaturer|moins.*couleur|décolorer|noir.*blanc/.test(t)) corrections.push({ type: 'saturation', value: -80 });
    if (/éteindre|supprimer.*lumière|noir/.test(t)) corrections.push({ type: 'brightness', value: -80 });
    if (/vignette|assombrir.*bords/.test(t)) corrections.push({ type: 'vignette', value: 1 });
    if (/net|netteté|affûter/.test(t)) corrections.push({ type: 'sharpen', value: 1 });

    return corrections.length ? corrections : [{ type: 'brightness', value: 20 }];
  },

  // ─── Appliquer les corrections sur le canvas ─────
  applyCorrections(canvas, zone, corrections) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Zone en pixels
    const zx = Math.round(zone.x * W);
    const zy = Math.round(zone.y * H);
    const zw = Math.round(zone.w * W);
    const zh = Math.round(zone.h * H);

    const imageData = ctx.getImageData(zx, zy, zw, zh);
    const data = imageData.data;

    corrections.forEach(corr => {
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i+1], b = data[i+2];

        if (corr.type === 'brightness') {
          r = Math.min(255, Math.max(0, r + corr.value));
          g = Math.min(255, Math.max(0, g + corr.value));
          b = Math.min(255, Math.max(0, b + corr.value));
        }
        if (corr.type === 'warmth') {
          r = Math.min(255, Math.max(0, r + corr.value));
          b = Math.min(255, Math.max(0, b - corr.value));
        }
        if (corr.type === 'contrast') {
          const factor = (259 * (corr.value + 255)) / (255 * (259 - corr.value));
          r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
          g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
          b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
        }
        if (corr.type === 'saturation') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const sat = corr.value / 100;
          r = Math.min(255, Math.max(0, gray + (r - gray) * (1 + sat)));
          g = Math.min(255, Math.max(0, gray + (g - gray) * (1 + sat)));
          b = Math.min(255, Math.max(0, gray + (b - gray) * (1 + sat)));
        }

        data[i] = r; data[i+1] = g; data[i+2] = b;
      }
    });

    ctx.putImageData(imageData, zx, zy);
    return canvas;
  },

  // ─── Mode vocal pur ───────────────────────────────
  // "Au niveau de la plante, rehausse la lumière"
  async processVoiceCommand(fullCommand, canvas) {
    const claudeKey = localStorage.getItem('moe_api_keys') ? JSON.parse(localStorage.getItem('moe_api_keys')).claude : '';

    // D'abord essayer de parser localement
    let zone = this.parseZoneDescription(fullCommand);
    const corrections = this.parseCorrection(fullCommand);

    // Si Claude disponible — analyse plus fine
    if (claudeKey) {
      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            messages: [{
              role: 'user',
              content: `Analyse cette commande de retouche photo et retourne UNIQUEMENT un JSON :
{"zone": {"x": 0-1, "y": 0-1, "w": 0-1, "h": 0-1}, "corrections": [{"type": "brightness|warmth|contrast|saturation", "value": -100 à 100}]}

x,y = position (0=gauche/haut, 1=droite/bas), w,h = taille de la zone.

Commande: "${fullCommand}"`
            }]
          })
        });
        const d = await r.json();
        const text = d.content[0].text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(text);
        if (parsed.zone) zone = parsed.zone;
        if (parsed.corrections?.length) {
          return this.applyCorrections(canvas, zone, parsed.corrections);
        }
      } catch {}
    }

    return this.applyCorrections(canvas, zone, corrections);
  },

  // ─── Démarrer l'écoute vocale pour correction ────
  startVoiceCorrection(canvas, onDone) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Utilisez Chrome ou Safari.'); return; }

    this.zoneRecog = new SR();
    this.zoneRecog.lang = 'fr-FR';
    this.zoneRecog.continuous = false;
    this.zoneRecog.interimResults = false;
    this.isListeningZone = true;

    this.zoneRecog.onresult = async (e) => {
      const command = e.results[0][0].transcript;
      this.isListeningZone = false;

      // Essayer de comprendre la commande
      const result = await this.processVoiceCommand(command, canvas);
      if (onDone) onDone(result, command);
    };

    this.zoneRecog.onerror = () => { this.isListeningZone = false; };
    this.zoneRecog.start();

    return this.zoneRecog;
  },

  // ─── Retouche globale rapide ──────────────────────
  quickFix(canvas, type) {
    const fixes = {
      'auto': [{ type: 'brightness', value: 10 }, { type: 'contrast', value: 15 }, { type: 'saturation', value: 10 }],
      'warm': [{ type: 'warmth', value: 25 }],
      'cool': [{ type: 'warmth', value: -25 }],
      'vivid': [{ type: 'saturation', value: 40 }, { type: 'contrast', value: 20 }],
      'matte': [{ type: 'contrast', value: -20 }, { type: 'saturation', value: -15 }],
      'bw': [{ type: 'saturation', value: -100 }, { type: 'contrast', value: 20 }],
    };
    return this.applyCorrections(canvas, { x: 0, y: 0, w: 1, h: 1 }, fixes[type] || fixes.auto);
  }
};

window.COLORIZE = COLORIZE;
