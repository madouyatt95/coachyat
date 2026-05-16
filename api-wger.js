// ========== WGER API SERVICE ==========
// Free open-source exercise database — https://wger.de/api/v2/
// No API key required

const WGER_BASE = 'https://wger.de/api/v2';
const WGER_CACHE_KEY = 'coachyat_wger_exercises';
const WGER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Category mapping: wger category IDs → COACHYAT types
const WGER_CATEGORY_MAP = {
  8:  'legs',   // Jambes
  9:  'core',   // Mollets (core/legs)
  10: 'push',   // Pectoraux
  11: 'push',   // Épaules
  12: 'pull',   // Dos
  13: 'pull',   // Biceps
  14: 'push',   // Triceps
  15: 'core',   // Abdominaux
};

// Equipment mapping: wger equipment IDs → COACHYAT equipment keys
const WGER_EQUIP_MAP = {
  1: 'gym',        // Barbell
  2: 'gym',        // SZ-Bar
  3: 'dumbbells',  // Dumbbell
  4: 'gym',        // Gym mat
  5: 'gym',        // Swiss Ball
  6: 'gym',        // Pull-up bar
  7: 'none',       // Body weight
  8: 'gym',        // Bench
  9: 'gym',        // Incline bench
  10: 'gym',       // Kettlebell
};

// Emoji icons per category
const WGER_ICONS = {
  push: ['🏋️', '💪', '⚡', '🦋'],
  pull: ['🦍', '🚣', '🧗', '🔨'],
  legs: ['🦵', '🚶‍♂️', '🦶', '🧱'],
  core: ['🍫', '🤸', '⛰️', '🔥'],
};

/**
 * Fetch exercises from wger API, with localStorage cache (24h TTL)
 */
async function loadWgerExercises() {
  // Check cache first
  try {
    const cached = localStorage.getItem(WGER_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < WGER_CACHE_TTL && data.length > 0) {
        console.log('[wger] Loaded from cache:', data.length, 'exercises');
        return data;
      }
    }
  } catch (e) { /* cache miss */ }

  // Fetch from API (French = language 2)
  try {
    const allExercises = [];
    let url = `${WGER_BASE}/exercise/?format=json&language=2&limit=100&offset=0`;

    // Paginate (max 3 pages = 300 exercises, more than enough)
    for (let page = 0; page < 3; page++) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`wger HTTP ${res.status}`);
      const json = await res.json();
      allExercises.push(...json.results);
      if (!json.next) break;
      url = json.next;
    }

    // Fetch exercise info (names/descriptions) in French
    const infoUrl = `${WGER_BASE}/exerciseinfo/?format=json&language=2&limit=200`;
    let exerciseInfoMap = {};
    try {
      const infoRes = await fetch(infoUrl);
      if (infoRes.ok) {
        const infoJson = await infoRes.json();
        infoJson.results.forEach(info => {
          const frTranslation = info.translations?.find(t => t.language === 2);
          if (frTranslation) {
            exerciseInfoMap[info.id] = {
              name: frTranslation.name,
              description: frTranslation.description?.replace(/<[^>]*>/g, '') || '',
            };
          }
        });
      }
    } catch (e) { console.warn('[wger] Could not fetch exercise info', e); }

    // Transform into COACHYAT format
    const transformed = allExercises
      .filter(ex => WGER_CATEGORY_MAP[ex.category]) // Only known categories
      .map(ex => {
        const type = WGER_CATEGORY_MAP[ex.category] || 'core';
        const equip = ex.equipment?.length > 0
          ? (WGER_EQUIP_MAP[ex.equipment[0]] || 'gym')
          : 'none';
        const icons = WGER_ICONS[type] || ['🏋️'];
        const info = exerciseInfoMap[ex.id];

        return {
          id: ex.id,
          name: info?.name || `Exercice #${ex.id}`,
          detail: '4 séries x 10 reps',
          description: info?.description || '',
          icon: icons[Math.floor(Math.random() * icons.length)],
          equip,
          type,
          muscles: ex.muscles || [],
          musclesSecondary: ex.muscles_secondary || [],
          wgerId: ex.id,
        };
      })
      .filter(ex => ex.name && ex.name !== `Exercice #${ex.id}`); // Only named ones

    // Cache result
    localStorage.setItem(WGER_CACHE_KEY, JSON.stringify({
      data: transformed,
      timestamp: Date.now()
    }));

    console.log('[wger] Fetched and cached:', transformed.length, 'exercises');
    return transformed;

  } catch (err) {
    console.error('[wger] API error, using fallback:', err);
    return null; // Signal to use hardcoded fallback
  }
}

/**
 * Fetch exercise images from wger
 */
async function getWgerExerciseImage(exerciseId) {
  try {
    const cacheKey = `wger_img_${exerciseId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${WGER_BASE}/exerciseimage/?format=json&exercise_base=${exerciseId}&limit=1`);
    if (!res.ok) return null;
    const json = await res.json();
    const imgUrl = json.results?.[0]?.image || null;

    if (imgUrl) sessionStorage.setItem(cacheKey, imgUrl);
    return imgUrl;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch muscle names (French) for display
 */
let muscleCache = null;
async function getWgerMuscles() {
  if (muscleCache) return muscleCache;
  try {
    const res = await fetch(`${WGER_BASE}/muscle/?format=json&limit=50`);
    if (!res.ok) return {};
    const json = await res.json();
    muscleCache = {};
    json.results.forEach(m => {
      muscleCache[m.id] = m.name_en || m.name || `Muscle ${m.id}`;
    });
    return muscleCache;
  } catch (e) {
    return {};
  }
}
