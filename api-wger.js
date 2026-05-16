// ========== WGER API SERVICE (v2 — FIXED) ==========
// Uses exerciseinfo endpoint which contains translations + images in one call
// https://wger.de/api/v2/

const WGER_BASE = 'https://wger.de/api/v2';
const WGER_CACHE_KEY = 'coachyat_wger_v2';
const WGER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

// Category → COACHYAT type mapping
const WGER_CAT = {
  8: 'legs', 9: 'legs', 10: 'push', 11: 'push',
  12: 'pull', 13: 'pull', 14: 'push', 15: 'core',
};

// Equipment ID → COACHYAT equipment key
const WGER_EQ = {
  1:'gym', 2:'gym', 3:'dumbbells', 4:'none', 5:'gym',
  6:'gym', 7:'none', 8:'gym', 9:'gym', 10:'dumbbells',
};

// Icons
const WGER_ICON = { push:['🏋️','💪','⚡'], pull:['🦍','🚣','🧗'], legs:['🦵','🚶‍♂️','🦶'], core:['🍫','🤸','🔥'] };

// Muscle ID → name (preloaded)
const MUSCLE_NAMES = {
  1:'Biceps', 2:'Deltoïde', 3:'Pectoraux', 4:'Épaules', 5:'Triceps',
  6:'Abdos', 7:'Obliques', 8:'Dorsaux', 9:'Brachial', 10:'Avant-bras',
  11:'Grand dorsal', 12:'Rhomboïde', 13:'Trapèzes', 14:'Biceps fémoral',
  15:'Quadriceps', 16:'Mollets', 17:'Fessiers', 18:'Adducteurs',
};

/**
 * Load exercises using the /exerciseinfo/ endpoint (contains names, images, muscles in ONE call)
 * Then merge with separate image fetch for broader coverage
 */
async function loadWgerExercises() {
  // Check cache
  try {
    const cached = localStorage.getItem(WGER_CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < WGER_CACHE_TTL && data.length > 10) {
        console.log('[wger] Cache hit:', data.length, 'exercises');
        return data;
      }
    }
  } catch(e) {}

  try {
    // Step 1: Fetch all exercise base data (IDs, categories, muscles, equipment)
    const exercises = [];
    let url = `${WGER_BASE}/exercise/?format=json&language=2&limit=200&offset=0`;
    for (let p = 0; p < 3; p++) {
      const r = await fetch(url);
      if (!r.ok) throw new Error('wger ' + r.status);
      const j = await r.json();
      exercises.push(...j.results);
      if (!j.next) break;
      url = j.next;
    }
    console.log('[wger] Fetched', exercises.length, 'exercise bases');

    // Step 2: Fetch all images (bulk — ~334 total)
    const imageMap = {};
    let imgUrl = `${WGER_BASE}/exerciseimage/?format=json&limit=200&is_main=true`;
    for (let p = 0; p < 2; p++) {
      try {
        const r = await fetch(imgUrl);
        if (!r.ok) break;
        const j = await r.json();
        j.results.forEach(img => {
          if (!imageMap[img.exercise]) imageMap[img.exercise] = img.image;
        });
        if (!j.next) break;
        imgUrl = j.next;
      } catch(e) { break; }
    }
    console.log('[wger] Fetched', Object.keys(imageMap).length, 'images');

    // Step 3: For names, fetch a batch of exerciseinfo (names come from translations)
    // The /exerciseinfo/ endpoint returns full details per exercise base
    // We fetch them in batches using the exercise base IDs
    const nameMap = {};
    const batchIds = exercises.slice(0, 150).map(e => e.id); // Limit to 150 for speed
    
    // Batch fetch names: use individual calls with Promise.allSettled for speed
    const BATCH = 20;
    for (let i = 0; i < Math.min(batchIds.length, 100); i += BATCH) {
      const batch = batchIds.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(id => 
          fetch(`${WGER_BASE}/exerciseinfo/${id}/?format=json`)
            .then(r => r.ok ? r.json() : null)
        )
      );
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value) {
          const info = res.value;
          const id = batch[idx];
          // Find French translation first, then English fallback
          const fr = info.translations?.find(t => t.language === 2);
          const en = info.translations?.find(t => t.language === 2) || info.translations?.[0];
          const name = fr?.name || en?.name || info.name || null;
          const desc = (fr?.description || en?.description || '').replace(/<[^>]*>/g, '').trim();
          if (name) nameMap[id] = { name, desc };
          // Also grab images from exerciseinfo if available
          if (info.images?.length > 0 && !imageMap[id]) {
            imageMap[id] = info.images[0].image;
          }
        }
      });
    }
    console.log('[wger] Fetched names for', Object.keys(nameMap).length, 'exercises');

    // Step 4: Transform into COACHYAT format
    const transformed = exercises
      .filter(ex => WGER_CAT[ex.category] && nameMap[ex.id])
      .map(ex => {
        const type = WGER_CAT[ex.category];
        const equip = ex.equipment?.length > 0 ? (WGER_EQ[ex.equipment[0]] || 'gym') : 'none';
        const icons = WGER_ICON[type];
        const info = nameMap[ex.id];
        const img = imageMap[ex.id] || null;

        return {
          id: ex.id,
          name: info.name,
          detail: type === 'core' ? '3 séries x 30 sec' : '4 séries x 10 reps',
          description: info.desc ? info.desc.substring(0, 120) : '',
          icon: icons[ex.id % icons.length],
          equip,
          type,
          muscles: ex.muscles || [],
          image: img,
        };
      });

    // Cache
    localStorage.setItem(WGER_CACHE_KEY, JSON.stringify({ data: transformed, ts: Date.now() }));
    console.log('[wger] Final:', transformed.length, 'exercises ready');
    return transformed;

  } catch(err) {
    console.error('[wger] API error:', err);
    return null;
  }
}

/**
 * Get muscle name by ID
 */
function getMuscleLabel(muscleId) {
  return MUSCLE_NAMES[muscleId] || 'Muscle';
}
