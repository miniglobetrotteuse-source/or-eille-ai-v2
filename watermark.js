// ═══════════════════════════════════════════════════
//  FILIGRANE NUMÉRIQUE INVISIBLE (Stéganographie)
//  Or Eille AI — v1.0
//  Preuve de création et protection des droits
// ═══════════════════════════════════════════════════

const WATERMARK = {

  // Encoder un message dans les bits de poids faible des pixels
  encode(canvas, message) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Préparer le message avec métadonnées
    const fullMsg = `MOE|${message}|${new Date().toISOString()}|v1`;
    const binary = this.toBinary(fullMsg);

    // Stocker la longueur du message dans les 32 premiers pixels
    const lenBinary = this.toBinary(binary.length.toString().padStart(16, '0'));
    for (let i = 0; i < 32 && i < lenBinary.length; i++) {
      data[i * 4] = (data[i * 4] & 0xFE) | parseInt(lenBinary[i]);
    }

    // Encoder le message bit par bit dans le canal rouge
    for (let i = 0; i < binary.length && (i + 32) * 4 < data.length; i++) {
      const pixelIndex = (i + 32) * 4;
      data[pixelIndex] = (data[pixelIndex] & 0xFE) | parseInt(binary[i]);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  },

  // Décoder le filigrane d'un canvas
  decode(canvas) {
    try {
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // Lire la longueur
      let lenBinary = '';
      for (let i = 0; i < 32; i++) lenBinary += (data[i * 4] & 1).toString();
      const msgLen = parseInt(lenBinary, 2);

      if (msgLen <= 0 || msgLen > 100000) return null;

      // Lire le message
      let binary = '';
      for (let i = 0; i < msgLen && (i + 32) * 4 < data.length; i++) {
        binary += (data[(i + 32) * 4] & 1).toString();
      }

      const decoded = this.fromBinary(binary);
      if (decoded.startsWith('MOE|')) return decoded;
      return null;
    } catch { return null; }
  },

  // Appliquer le filigrane à une image dataUrl
  async applyToDataUrl(dataUrl, userId, projectName) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const message = `USER:${userId}|PROJECT:${projectName}|TOOL:Atelier Visuel Or Eille AI`;
        this.encode(canvas, message);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  },

  // Vérifier un fichier image
  async verify(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          const result = this.decode(canvas);
          resolve(result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  // Générer un certificat de création
  generateCertificate(userId, imageId, projectName) {
    return {
      id: `MOE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      tool: 'Or Eille AI',
      userId,
      projectName,
      imageId,
      createdAt: new Date().toISOString(),
      terms: 'Usage personnel gratuit. Usage commercial soumis à déclaration et redevance selon CGU Or Eille AI.',
      watermarked: true
    };
  },

  // Helpers binaires
  toBinary(str) {
    return str.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
  },
  fromBinary(bin) {
    const bytes = bin.match(/.{8}/g) || [];
    return bytes.map(b => String.fromCharCode(parseInt(b, 2))).join('');
  },

  // Sauvegarder le certificat
  saveCertificate(cert) {
    const certs = this.getCertificates();
    certs.push(cert);
    localStorage.setItem('moe_certificates', JSON.stringify(certs));
    return cert;
  },
  getCertificates() {
    try { return JSON.parse(localStorage.getItem('moe_certificates')) || []; }
    catch { return []; }
  }
};


// ─── Filigrane automatique sur tout ce qui sort ─
WATERMARK.autoApply = function(imageUrl, callback) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Filigrane texte
    const text = '© Madame Or Eille';
    ctx.font = 'bold ' + Math.floor(img.width * 0.03) + 'px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'right';
    ctx.fillText(text, img.width - 20, img.height - 20);

    if (callback) callback(canvas.toDataURL('image/jpeg', 0.9));
  };
  img.onerror = function() { if (callback) callback(imageUrl); };
  img.src = imageUrl;
};

window.WATERMARK = WATERMARK;
