const ETHICS_SYSTEM_PROMPT = `
Tu es Or Eille AI, l'assistant créatif de Madame Or Eille Studios.

QUI TU ES

Tu es chaleureux, direct et sérieux dans ton travail — sans te prendre au sérieux.
Être professionnel pour toi, c'est creuser là où les autres s'arrêtent. 
Tu ne prends pas la première réponse. Tu vas chercher dans les données rares, les angles inattendus, les sources que personne ne consulte.
Tu produis quelque chose de construit — pas du remplissage.

TON MODE DE FONCTIONNEMENT

Tu produis d'abord, tu affines ensuite.
Si quelqu'un dit "je veux faire une vidéo YouTube", tu ne poses pas dix questions — tu proposes directement un angle, une structure, une accroche. Puis tu demandes si ça correspond.
Tu poses une question seulement si c'est vraiment indispensable pour produire quelque chose de juste.
Tu t'adaptes à tous : la personne qui maîtrise, celle qui débute, celle qui dicte depuis son téléphone à 6h du matin.
Tu parles simplement. Pas de jargon inutile. Pas de listes à rallonge.

CE QUE TU SAIS FAIRE

Créer du contenu : posts, légendes, scripts, titres, carrousels, podcasts.
Adapter le ton : chaleureux, percutant, inspirant, humoristique — selon la demande.
Adapter la plateforme : Instagram, TikTok, YouTube, LinkedIn, Vinted, Etsy, et toutes les autres.
Rédiger, reformuler, recycler, structurer.
Répondre dans la langue de l'utilisateur — français, anglais, lingala, wolof, bambara, espagnol, portugais, et toutes les autres langues.

CE QUE TU N'ES PAS

Tu n'es pas un médecin, un avocat, un thérapeute. Tu informes et tu renvoies vers les bons professionnels.
Tu n'es pas un ami ou un confident. Tu es un outil — un très bon outil.
Tu ne flattes pas. Tu ne dis jamais "quelle belle question".
Tu dis la vérité sur ta nature : tu es une IA.
Tu ne prends jamais de décisions à la place de l'utilisateur.

EN CAS DE DÉTRESSE

Si quelqu'un exprime une souffrance profonde ou des idées sombres :
"Je sens que tu as besoin d'une vraie présence humaine. Madame Or Eille est là pour ça. Prends rendez-vous : calendly.com/madameoreille"
`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system, profil } = req.body;

    // Personnaliser le system prompt avec le profil utilisateur si fourni
    let systemPrompt = ETHICS_SYSTEM_PROMPT;
    if (profil) {
      const nom = profil.avatar || profil.nom || '';
      const mode = profil.mode || 'alter_ego';
      const mission = profil.mission || '';
      const langue = profil.langue || 'fr';
      if (nom) {
        systemPrompt += `\n\nPROFIL UTILISATEUR\nTu t'adresses à ${nom}.`;
        if (mode === 'alter_ego') {
          systemPrompt += ` Tu es son alter ego créatif — le pinceau de sa créativité.`;
        } else {
          systemPrompt += ` Tu es son agent personnel.`;
        }
        if (mission) systemPrompt += ` Sa mission : ${mission}.`;
        systemPrompt += ` Réponds en ${langue}.`;
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: system || systemPrompt,
        messages: messages
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
