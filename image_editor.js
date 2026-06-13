// ═══════════════════════════════════════════════════
//  ÉDITEUR IMAGE — Or Eille AI v2
//  Import, texte, filtres, export + connecteur Replicate
//  © Madame Or Eille Studios — 2026
// ═══════════════════════════════════════════════════

const IMAGE_EDITOR = {

  canvas: null,
  ctx: null,
  originalImage: null,
  layers: [],        // calques texte/éléments
  history: [],       // historique pour annuler
  mode: 'da',        // 'da' ou 'libre'

  // ─── Initialisation ───────────────────────────
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
  },

  // ─── Charger une image uploadée ───────────────
  loadImage(file, onLoad) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.originalImage = img;
        this.saveHistory();
        if (onLoad) onLoad(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  // ─── Ajouter du texte ─────────────────────────
  addText(text, options = {}) {
    const layer = {
      type: 'text',
      text,
      x: options.x || this.canvas.width / 2,
      y: options.y || this.canvas.height / 2,
      font: options.font || 'Basteleur',
      size: options.size || 48,
      color: options.color || '#FFFFFF',
      align: options.align || 'center',
      bold: options.bold || false,
      italic: options.italic || false,
    };
    this.layers.push(layer);
    this.render();
    this.saveHistory();
  },

  // ─── Rendre tous les calques ──────────────────
  render() {
    if (!this.ctx || !this.originalImage) return;
    // Redessiner l'image de base
    this.ctx.drawImage(this.originalImage, 0, 0);
    // Dessiner chaque calque
    this.layers.forEach(layer => {
      if (layer.type === 'text') {
        const weight = layer.bold ? 'bold' : 'normal';
        const style = layer.italic ? 'italic' : 'normal';
        this.ctx.font = `${style} ${weight} ${layer.size}px '${layer.font}', serif`;
        this.ctx.fillStyle = layer.color;
        this.ctx.textAlign = layer.align;
        this.ctx.fillText(layer.text, layer.x, layer.y);
      }
    });
  },

  // ─── Filtres rapides ──────────────────────────
  applyFilter(type) {
    if (!this.ctx || !this.originalImage) return;
    this.ctx.drawImage(this.originalImage, 0, 0);
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    const filters = {
      chaud:    (r,g,b) => [Math.min(255,r+30), g, Math.max(0,b-20)],
      froid:    (r,g,b) => [Math.max(0,r-20), g, Math.min(255,b+30)],
      bw:       (r,g,b) => { const gr=0.299*r+0.587*g+0.114*b; return [gr,gr,gr]; },
      lumineux: (r,g,b) => [Math.min(255,r+40), Math.min(255,g+40), Math.min(255,b+40)],
      sombre:   (r,g,b) => [Math.max(0,r-40), Math.max(0,g-40), Math.max(0,b-40)],
      vif:      (r,g,b) => {
        const gr=0.299*r+0.587*g+0.114*b;
        return [Math.min(255,gr+(r-gr)*1.5), Math.min(255,gr+(g-gr)*1.5), Math.min(255,gr+(b-gr)*1.5)];
      },
    };

    const fn = filters[type];
    if (!fn) return;

    for (let i = 0; i < data.length; i += 4) {
      const [nr,ng,nb] = fn(data[i], data[i+1], data[i+2]);
      data[i]=nr; data[i+1]=ng; data[i+2]=nb;
    }
    this.ctx.putImageData(imageData, 0, 0);
    this.saveHistory();
  },

  // ─── Recadrer ────────────────────────────────
  crop(x, y, w, h) {
    const imageData = this.ctx.getImageData(x, y, w, h);
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.putImageData(imageData, 0, 0);
    this.saveHistory();
  },

  // ─── Redimensionner pour les réseaux ─────────
  FORMATS: {
    'Instagram carré':  { w: 1080, h: 1080 },
    'Instagram portrait': { w: 1080, h: 1350 },
    'Instagram paysage': { w: 1080, h: 566 },
    'Story / Reel':     { w: 1080, h: 1920 },
    'TikTok':           { w: 1080, h: 1920 },
    'YouTube miniature': { w: 1280, h: 720 },
    'Pinterest':        { w: 1000, h: 1500 },
  },

  resizeForPlatform(platformName) {
    const fmt = this.FORMATS[platformName];
    if (!fmt || !this.originalImage) return;
    this.canvas.width = fmt.w;
    this.canvas.height = fmt.h;
    this.ctx.drawImage(this.originalImage, 0, 0, fmt.w, fmt.h);
    this.saveHistory();
  },

  // ─── Historique (annuler) ─────────────────────
  saveHistory() {
    this.history.push(this.canvas.toDataURL());
    if (this.history.length > 20) this.history.shift();
  },

  undo() {
    if (this.history.length < 2) return;
    this.history.pop();
    const prev = this.history[this.history.length - 1];
    const img = new Image();
    img.onload = () => this.ctx.drawImage(img, 0, 0);
    img.src = prev;
  },

  // ─── Exporter ────────────────────────────────
  export(format = 'png', quality = 0.95) {
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = this.canvas.toDataURL(mimeType, quality);
    const link = document.createElement('a');
    link.download = `oreille-ai-creation.${format}`;
    link.href = dataUrl;
    link.click();
  },

  // ─── CONNECTEUR REPLICATE (prêt à activer) ────
  REPLICATE: {
    // Modèles recommandés
    MODELS: {
      photo_realiste:  'stability-ai/stable-diffusion-3',
      illustration:    'black-forest-labs/flux-schnell',
      portrait:        'tencentarc/photomaker',
      anime:           'lucataco/animagine-xl-3.0',
    },

    // Construire le prompt avec toutes les règles
    buildPrompt(userDescription, mode, references = []) {
      const rules = `
anatomically correct, realistic proportions, 5 fingers, aligned eyes, no distortion,
correct scale, realistic lighting, consistent style,
high quality, professional photography
      `.trim();

      if (mode === 'da' && references.length > 0) {
        return `${userDescription}. Preserve exact reference elements unchanged. ${rules}`;
      }
      return `${userDescription}. ${rules}`;
    },

    // Appel API Replicate (activer quand clé disponible)
    async generate(prompt, modelKey = 'photo_realiste') {
      const apiKey = localStorage.getItem('moe_replicate_key');
      if (!apiKey) {
        return { error: 'Clé Replicate non configurée. Activez votre abonnement Replicate pour générer des images.' };
      }

      const modelId = this.MODELS[modelKey] || this.MODELS.photo_realiste;

      try {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version: modelId,
            input: {
              prompt: prompt,
              negative_prompt: 'distorted anatomy, extra fingers, missing fingers, bad proportions, wrong scale, inconsistent style, blurry, low quality',
              num_outputs: 1,
            }
          })
        });

        const data = await response.json();
        return data;
      } catch (error) {
        return { error: error.message };
      }
    },

    // Vérifier le statut d'une génération
    async checkStatus(predictionId) {
      const apiKey = localStorage.getItem('moe_replicate_key');
      if (!apiKey) return null;

      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      return response.json();
    }
  }
};

window.IMAGE_EDITOR = IMAGE_EDITOR;
