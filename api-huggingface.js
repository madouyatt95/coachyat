// ========== HUGGING FACE INFERENCE API SERVICE ==========
// Free serverless inference — https://huggingface.co
// Requires a free API token from the user

const HF_STORAGE_KEY = 'coachyat_hf_token';
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3'; // Good free model for chat
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

/**
 * Get the user's saved HF token
 */
function getHFToken() {
  return localStorage.getItem(HF_STORAGE_KEY) || '';
}

/**
 * Save the user's HF token
 */
function saveHFToken(token) {
  localStorage.setItem(HF_STORAGE_KEY, token.trim());
}

/**
 * Check if a valid token is configured
 */
function hasHFToken() {
  const token = getHFToken();
  return token && token.startsWith('hf_') && token.length > 10;
}

/**
 * Build the system prompt for the fitness coach
 */
function buildCoachSystemPrompt(userContext, persona) {
  const base = persona === 'hardcore'
    ? `Tu es un coach sportif extrêmement dur et exigeant, style David Goggins. Tu n'acceptes AUCUNE excuse. Tu parles de manière directe, parfois brutale, mais toujours dans le but de pousser l'utilisateur à se dépasser. Tu tutoies toujours.`
    : `Tu es COACHYAT, un coach sportif personnel bienveillant et motivant. Tu es expert en musculation, nutrition et bien-être. Tu encourages toujours l'utilisateur, tu adaptes tes conseils à son profil, et tu parles de manière chaleureuse. Tu tutoies toujours. Tu utilises des emojis avec modération.`;

  let context = base + `\n\nProfil de l'utilisateur :`;
  if (userContext.name) context += `\n- Prénom : ${userContext.name}`;
  if (userContext.goal) context += `\n- Objectif : ${userContext.goal}`;
  if (userContext.weight) context += `\n- Poids actuel : ${userContext.weight} kg`;
  if (userContext.day) context += `\n- Jour du programme : ${userContext.day}/90`;
  if (userContext.streak) context += `\n- Streak : ${userContext.streak} jours`;
  if (userContext.discipline) context += `\n- Score de discipline : ${userContext.discipline}/100`;
  if (userContext.equipment) context += `\n- Matériel : ${userContext.equipment}`;
  if (userContext.todayWorkout) context += `\n- Séance du jour : ${userContext.todayWorkout}`;
  if (userContext.workoutDone) context += `\n- Séance d'aujourd'hui : Terminée ✅`;

  context += `\n\nRéponds de manière concise (2-4 phrases max). Si on te pose une question médicale, recommande de consulter un professionnel de santé.`;

  return context;
}

/**
 * Send a message to the AI coach
 * Returns the AI response text, or null on failure
 */
async function chatWithCoach(userMessage, userContext, persona) {
  const token = getHFToken();
  if (!token) return null;

  const systemPrompt = buildCoachSystemPrompt(userContext, persona || 'normal');

  // Build conversation (Mistral Instruct format)
  const prompt = `<s>[INST] ${systemPrompt}\n\nMessage de l'utilisateur : ${userMessage} [/INST]`;

  try {
    const res = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('[HuggingFace] API error:', res.status, errData);
      
      // Handle model loading (503)
      if (res.status === 503) {
        return '⏳ Le modèle IA est en cours de chargement... Réessaie dans 30 secondes.';
      }
      return null;
    }

    const data = await res.json();

    // Extract generated text
    let reply = '';
    if (Array.isArray(data)) {
      reply = data[0]?.generated_text || '';
    } else if (data.generated_text) {
      reply = data.generated_text;
    }

    // Clean up response
    reply = reply.trim();
    if (!reply) return null;

    return reply;

  } catch (err) {
    console.error('[HuggingFace] Network error:', err);
    return null;
  }
}

/**
 * Generate a recipe from fridge ingredients using AI
 * Returns { name, description, macros: { p, g, l, cal } } or null
 */
async function generateRecipeFromIngredients(ingredients, userGoal) {
  const token = getHFToken();
  if (!token) return null;

  const prompt = `<s>[INST] Tu es un chef nutritionniste sportif. L'utilisateur a ces ingrédients dans son frigo : ${ingredients}.
Son objectif fitness est : ${userGoal || 'santé générale'}.

Propose UNE recette simple et rapide. Réponds UNIQUEMENT dans ce format exact (pas de texte avant ou après) :
NOM: [nom de la recette]
DESC: [instructions en 2 phrases]
KCAL: [nombre]
P: [grammes de protéines]
G: [grammes de glucides]
L: [grammes de lipides] [/INST]`;

  try {
    const res = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.6,
          return_full_text: false,
        }
      })
    });

    if (!res.ok) return null;

    const data = await res.json();
    let text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    if (!text) return null;

    // Parse structured response
    const nameMatch = text.match(/NOM:\s*(.+)/i);
    const descMatch = text.match(/DESC:\s*(.+)/i);
    const calMatch = text.match(/KCAL:\s*(\d+)/i);
    const pMatch = text.match(/P:\s*(\d+)/i);
    const gMatch = text.match(/G:\s*(\d+)/i);
    const lMatch = text.match(/L:\s*(\d+)/i);

    return {
      name: nameMatch?.[1]?.trim() || 'Recette du Coach',
      description: descMatch?.[1]?.trim() || text.substring(0, 150),
      cal: calMatch?.[1] || '~400',
      p: pMatch?.[1] ? `${pMatch[1]}g P` : '~30g P',
      g: gMatch?.[1] ? `${gMatch[1]}g G` : '~40g G',
      l: lMatch?.[1] ? `${lMatch[1]}g L` : '~15g L',
    };

  } catch (err) {
    console.error('[HuggingFace] Recipe generation error:', err);
    return null;
  }
}
