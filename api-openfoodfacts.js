// ========== OPEN FOOD FACTS API SERVICE (v2 — FIXED) ==========
// Uses .net domain (more stable) + v2 API
// No API key needed

// Use .net (staging/stable) as primary, .org as fallback
const OFF_URLS = [
  'https://world.openfoodfacts.net',
  'https://world.openfoodfacts.org',
];

/**
 * Search food products by name
 * Returns array of { name, calories, proteins, carbs, fat, brand, image }
 */
async function searchFood(query) {
  if (!query || query.length < 2) return [];

  // Try each URL until one works
  for (const base of OFF_URLS) {
    try {
      const url = `${base}/api/v2/search?search_terms=${encodeURIComponent(query)}&page_size=10&fields=product_name,nutriments,brands,image_front_small_url&sort_by=popularity_key`;
      
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[OFF] ${base} returned ${res.status}, trying next...`);
        continue;
      }

      const json = await res.json();
      if (!json.products || json.products.length === 0) return [];

      return json.products
        .filter(p => p.product_name && p.nutriments)
        .map(p => {
          const cal = Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'] || 0);
          const prot = Math.round(p.nutriments['proteins_100g'] || p.nutriments['proteins'] || 0);
          const carb = Math.round(p.nutriments['carbohydrates_100g'] || p.nutriments['carbohydrates'] || 0);
          const fat = Math.round(p.nutriments['fat_100g'] || p.nutriments['fat'] || 0);
          
          return {
            name: p.product_name,
            brand: p.brands || '',
            image: p.image_front_small_url || null,
            calories: cal,
            proteins: prot,
            carbs: carb,
            fat: fat,
          };
        })
        // Keep items that have at least SOME nutritional data (calories OR proteins > 0)
        .filter(p => p.calories > 0 || p.proteins > 0)
        // Sort by most complete data first
        .sort((a, b) => {
          const scoreA = (a.calories > 0 ? 1 : 0) + (a.proteins > 0 ? 1 : 0) + (a.carbs > 0 ? 1 : 0) + (a.fat > 0 ? 1 : 0);
          const scoreB = (b.calories > 0 ? 1 : 0) + (b.proteins > 0 ? 1 : 0) + (b.carbs > 0 ? 1 : 0) + (b.fat > 0 ? 1 : 0);
          return scoreB - scoreA;
        })
        .slice(0, 8);

    } catch (err) {
      console.warn(`[OFF] ${base} failed:`, err.message);
      continue;
    }
  }

  console.error('[OFF] All endpoints failed');
  return [];
}

/**
 * Get product by barcode
 */
async function getProductByBarcode(barcode) {
  for (const base of OFF_URLS) {
    try {
      const res = await fetch(`${base}/api/v2/product/${barcode}?fields=product_name,nutriments,brands,image_front_small_url`);
      if (!res.ok) continue;
      const json = await res.json();
      if (!json.product) continue;

      const p = json.product;
      return {
        name: p.product_name || 'Produit inconnu',
        brand: p.brands || '',
        image: p.image_front_small_url || null,
        calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
        proteins: Math.round(p.nutriments?.proteins_100g || 0),
        carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
        fat: Math.round(p.nutriments?.fat_100g || 0),
      };
    } catch (err) {
      continue;
    }
  }
  return null;
}

// ========== AUTOCOMPLETE UI HELPER ==========
let offDebounceTimer = null;

function setupFoodAutocomplete(inputId, resultsContainerId, onSelect) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(resultsContainerId);
  if (!input || !container) return;

  input.addEventListener('input', () => {
    clearTimeout(offDebounceTimer);
    const query = input.value.trim();

    if (query.length < 2) {
      container.innerHTML = '';
      container.classList.add('hidden');
      return;
    }

    // Show loading after 300ms debounce
    offDebounceTimer = setTimeout(async () => {
      container.innerHTML = '<div class="off-loading">🔍 Recherche en cours...</div>';
      container.classList.remove('hidden');

      const results = await searchFood(query);

      if (results.length === 0) {
        container.innerHTML = '<div class="off-no-result">Aucun résultat trouvé.<br><span style="font-size:10px">Saisis les macros manuellement ci-dessous.</span></div>';
        return;
      }

      container.innerHTML = results.map((food, i) => `
        <div class="off-result-item" data-idx="${i}">
          ${food.image ? `<img src="${food.image}" class="off-result-img" alt="" onerror="this.outerHTML='<div class=\\'off-result-img off-placeholder\\'>🥗</div>'">` : '<div class="off-result-img off-placeholder">🥗</div>'}
          <div class="off-result-info">
            <div class="off-result-name">${food.name}</div>
            ${food.brand ? `<div class="off-result-brand">${food.brand}</div>` : ''}
            <div class="off-result-macros">
              <span>${food.calories} kcal</span>
              <span class="off-p">${food.proteins}g P</span>
              <span class="off-c">${food.carbs}g G</span>
              <span class="off-f">${food.fat}g L</span>
            </div>
          </div>
        </div>
      `).join('');

      // Bind clicks
      container.querySelectorAll('.off-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.idx);
          onSelect(results[idx]);
          container.innerHTML = '';
          container.classList.add('hidden');
          // Flash green on the input to confirm selection
          input.style.borderColor = 'var(--green)';
          setTimeout(() => input.style.borderColor = '', 1500);
        });
      });
    }, 400);
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && e.target !== input) {
      container.innerHTML = '';
      container.classList.add('hidden');
    }
  });
}
